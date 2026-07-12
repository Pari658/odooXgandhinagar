import express from 'express';
import { Webhook } from 'svix';
import { query } from '../config/db.js';

const router = express.Router();

// Must exactly match the Postgres `user_role` enum values (case + spacing).
const VALID_ROLES = ['Fleet Manager', 'Driver', 'Safety Officer', 'Financial Analyst'];

function extractUserFields(data) {
  const { id, first_name, last_name, email_addresses, public_metadata } = data;
  const primaryEmail = email_addresses?.[0]?.email_address || '';
  const fullName = `${first_name || ''} ${last_name || ''}`.trim() || 'Unnamed User';
  const rawRole = public_metadata?.role;
  const role = VALID_ROLES.includes(rawRole) ? rawRole : 'Driver'; 
  return { id, fullName, primaryEmail, role };
}

router.post('/clerk', async (req, res) => {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;
  if (!WEBHOOK_SECRET) {
    console.error('Missing CLERK_WEBHOOK_SECRET in env variables.');
    return res.status(500).json({ error: 'Server webhook configuration error.' });
  }

  const svix_id = req.headers['svix-id'];
  const svix_timestamp = req.headers['svix-timestamp'];
  const svix_signature = req.headers['svix-signature'];

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return res.status(400).json({ error: 'Missing svix headers.' });
  }

  // Raw body, preserved by express.raw() in server.js — required for signature verification.
  const payload = req.body.toString();
  const wh = new Webhook(WEBHOOK_SECRET);
  let evt;

  try {
    evt = wh.verify(payload, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    });
  } catch (err) {
    console.error('Webhook verification failed:', err.message);
    return res.status(400).json({ error: 'Invalid webhook signature.' });
  }

  const eventType = evt.type;
  console.log(`Received Clerk webhook [${eventType}] for user ${evt.data?.id}`);

  try {
    if (eventType === 'user.created') {
      const { id, fullName, primaryEmail, role } = extractUserFields(evt.data);
      // ON CONFLICT DO NOTHING makes this safe against svix's automatic retries.
      await query(
        `INSERT INTO users (clerk_user_id, name, email, role, created_at, updated_at)
         VALUES ($1, $2, $3, $4, NOW(), NOW())
         ON CONFLICT (clerk_user_id) DO NOTHING;`,
        [id, fullName, primaryEmail, role]
      );
      console.log(`User ${fullName} synced to database (created).`);
    } else if (eventType === 'user.updated') {
      const { id, fullName, primaryEmail, role } = extractUserFields(evt.data);

      // Always keep name/email in sync.
      await query(
        `UPDATE users SET name = $2, email = $3, updated_at = NOW() WHERE clerk_user_id = $1;`,
        [id, fullName, primaryEmail]
      );

      // Only touch role if this event actually carried a role in metadata —
      // otherwise an unrelated profile edit could silently reset a role
      // that was set through some other path.
      if (evt.data.public_metadata?.role) {
        await query(
          `UPDATE users SET role = $2, updated_at = NOW() WHERE clerk_user_id = $1;`,
          [id, role]
        );
      }
      console.log(`User ${fullName} synced to database (updated).`);
    } else if (eventType === 'user.deleted') {
      // No FK from trips/vehicles to users, so nothing else breaks if you
      // leave this row in place. Decide your retention policy (hard delete
      // vs. a status column) before acting on this — logging only for now.
      console.log(`User ${evt.data?.id} deleted in Clerk — no local action taken.`);
    }

    return res.status(200).json({ success: true, message: 'Webhook processed successfully.' });
  } catch (dbErr) {
    console.error('Error syncing user to database:', dbErr.message);
    return res.status(500).json({ error: 'Database synchronization failed.' });
  }
});

export default router;