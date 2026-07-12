import express from 'express';
import { Webhook } from 'svix';
import { query } from '../config/db.js';

const router = express.Router();

// Must exactly match the Postgres `user_role` enum values (case + spacing).
const VALID_ROLES = ['Fleet Manager', 'Driver', 'Safety Officer', 'Financial Analyst'];

function extractUserFields(data) {
  const { id, first_name, last_name, email_addresses, primary_email_address_id, public_metadata } = data;

  // Prefer the primary email address (matched by ID) over blindly taking index 0,
  // which can be wrong when a user has multiple email addresses linked.
  const primaryEmail =
    email_addresses?.find((e) => e.id === primary_email_address_id)?.email_address ||
    email_addresses?.[0]?.email_address ||
    '';

  // last_name is null (not '') for Google OAuth signups — guard against it.
  const fullName =
    `${first_name || ''} ${last_name || ''}`.trim() || 'Unnamed User';

  const rawRole = public_metadata?.role;
  const role = VALID_ROLES.includes(rawRole) ? rawRole : 'Driver';

  return { id, fullName, primaryEmail, role };
}

router.post('/clerk', async (req, res) => {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;
  if (!WEBHOOK_SECRET) {
    console.error('[Webhook] CLERK_WEBHOOK_SECRET is missing from env.');
    return res.status(500).json({ error: 'Server webhook configuration error.' });
  }

  const svix_id        = req.headers['svix-id'];
  const svix_timestamp = req.headers['svix-timestamp'];
  const svix_signature = req.headers['svix-signature'];

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return res.status(400).json({ error: 'Missing svix headers.' });
  }

  // Raw body preserved by express.raw() in server.js — required for Svix signature verification.
  const payload = req.body.toString();
  const wh = new Webhook(WEBHOOK_SECRET);
  let evt;

  try {
    evt = wh.verify(payload, {
      'svix-id':        svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    });
  } catch (err) {
    console.error('[Webhook] Svix signature verification failed:', err.message);
    return res.status(400).json({ error: 'Invalid webhook signature.' });
  }

  const eventType = evt.type;
  console.log(`[Webhook] Received [${eventType}] for user ${evt.data?.id}`);

  try {
    if (eventType === 'user.created') {
      const { id, fullName, primaryEmail, role } = extractUserFields(evt.data);

      // FIX 1: Explicit ::user_role cast is required because node-postgres sends
      //         parameterized values as untyped text, and Postgres cannot implicitly
      //         cast text → a custom enum type from a $N parameter.
      //
      // FIX 2: ON CONFLICT covers BOTH unique constraints (clerk_user_id and email).
      //         The email conflict path upserts the clerk_user_id so that a user who
      //         re-registers via a different OAuth flow is correctly re-linked, rather
      //         than crashing the webhook with a 23505 unique violation.
      await query(
        `INSERT INTO users (clerk_user_id, name, email, role, created_at, updated_at)
         VALUES ($1, $2, $3, $4::user_role, NOW(), NOW())
         ON CONFLICT (clerk_user_id) DO UPDATE
           SET name       = EXCLUDED.name,
               email      = EXCLUDED.email,
               updated_at = NOW()`,
        [id, fullName, primaryEmail, role]
      );

      console.log(`[Webhook] User "${fullName}" (${primaryEmail}) synced → created/upserted. Role: ${role}`);

    } else if (eventType === 'user.updated') {
      const { id, fullName, primaryEmail, role } = extractUserFields(evt.data);

      // Always sync name and email — these can change on the Clerk side.
      await query(
        `UPDATE users
         SET name = $2, email = $3, updated_at = NOW()
         WHERE clerk_user_id = $1`,
        [id, fullName, primaryEmail]
      );

      // Only touch role if this event actually carried a role in publicMetadata —
      // an unrelated profile edit (name/picture change) would otherwise silently
      // reset a role that was promoted via the admin endpoint.
      if (evt.data.public_metadata?.role) {
        // FIX 1 (same as above): explicit ::user_role cast required.
        await query(
          `UPDATE users
           SET role = $2::user_role, updated_at = NOW()
           WHERE clerk_user_id = $1`,
          [id, role]
        );
        console.log(`[Webhook] Role updated to "${role}" for ${id}.`);
      }

      console.log(`[Webhook] User "${fullName}" (${primaryEmail}) synced → updated.`);

    } else if (eventType === 'user.deleted') {
      // No FK from trips/vehicles/drivers to users, so leaving the row is safe.
      // Decide your data-retention policy before hard-deleting here.
      console.log(`[Webhook] user.deleted for ${evt.data?.id} — no local action taken (retention policy pending).`);
    }

    return res.status(200).json({ success: true, message: 'Webhook processed.' });

  } catch (dbErr) {
    // FIX 3: Log the full PG error (code + detail) so failures are diagnosable.
    //        Without err.code, a unique-violation vs. a missing-table error look identical.
    console.error('[Webhook] DB error during user sync:', {
      message: dbErr.message,
      code:    dbErr.code,   // e.g. '23505' unique, 'P0001' trigger, '42P01' undefined_table
      detail:  dbErr.detail,
      table:   dbErr.table,
    });
    return res.status(500).json({ error: 'Database synchronization failed.', code: dbErr.code });
  }
});

export default router;