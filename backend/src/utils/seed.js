import { query } from '../config/db.js';

async function seed() {
  try {
    console.log("⚡ Starting database seeding...");

    // 1. Clean existing records
    console.log("🧹 Truncating existing tables...");
    await query("TRUNCATE fuel_logs, expenses, maintenance_logs, trips, drivers, vehicles, users CASCADE;");

    // 2. Insert mock users
    console.log("👤 Seeding users...");
    await query(`
      INSERT INTO users (clerk_user_id, email, name, role) VALUES
      ('user_1', 'manager@transitops.com', 'Alice Manager', 'Fleet Manager'),
      ('user_2', 'driver1@transitops.com', 'John Driver', 'Driver'),
      ('user_3', 'officer@transitops.com', 'Charlie Safety', 'Safety Officer'),
      ('user_4', 'analyst@transitops.com', 'Diana Analyst', 'Financial Analyst');
    `);

    // 3. Insert mock vehicles (initially set to Available)
    console.log("🚚 Seeding vehicles...");
    const vResult = await query(`
      INSERT INTO vehicles (registration_number, model_name, type, region, max_load_capacity, odometer, acquisition_cost, status) VALUES
      ('REG-001', 'Tesla Semi', 'Semi-Truck', 'West', 15000.00, 5000.00, 150000.00, 'Available'),
      ('REG-002', 'Ford Transit', 'Cargo Van', 'East', 2500.00, 12000.00, 45000.00, 'Available'),
      ('REG-003', 'Volvo FH16', 'Heavy Duty Truck', 'North', 20000.00, 75000.00, 180000.00, 'Available'),
      ('REG-004', 'Mercedes Sprinter', 'Cargo Van', 'South', 3000.00, 8000.00, 55000.00, 'Available')
      RETURNING id, registration_number;
    `);
    const vehicles = vResult.rows;

    // 4. Insert mock drivers
    console.log("👤 Seeding drivers...");
    const dResult = await query(`
      INSERT INTO drivers (name, license_number, license_category, license_expiry_date, contact_number, safety_score, status) VALUES
      ('John Doe', 'LIC-001', 'Class A', CURRENT_DATE + INTERVAL '1 year', '+15550101', 4.80, 'Available'),
      ('Jane Smith', 'LIC-002', 'Class B', CURRENT_DATE + INTERVAL '6 months', '+15550102', 4.50, 'Available'),
      ('Bob Johnson', 'LIC-003', 'Class A', CURRENT_DATE + INTERVAL '2 years', '+15550103', 3.90, 'Available'),
      ('Expired Ed', 'LIC-004', 'Class C', CURRENT_DATE - INTERVAL '10 days', '+15550104', 3.20, 'Available'),
      ('Suspended Sam', 'LIC-005', 'Class B', CURRENT_DATE + INTERVAL '1 year', '+15550105', 2.10, 'Suspended')
      RETURNING id, name;
    `);
    const drivers = dResult.rows;

    // 5. Seed trips using the state machine path to avoid DB trigger constraint violations.
    console.log("✈️ Seeding trips (via status transitions)...");
    
    // Find matching IDs
    const teslaId = vehicles.find(v => v.registration_number === 'REG-001').id;
    const fordId = vehicles.find(v => v.registration_number === 'REG-002').id;
    const volvoId = vehicles.find(v => v.registration_number === 'REG-003').id;

    const johnId = drivers.find(d => d.name === 'John Doe').id;
    const janeId = drivers.find(d => d.name === 'Jane Smith').id;
    const bobId = drivers.find(d => d.name === 'Bob Johnson').id;

    // TRIP 1: Available -> Draft -> Dispatched -> Completed
    console.log("  - Creating and dispatching Trip 1 (Tesla)...");
    const t1Draft = await query(`
      INSERT INTO trips (source, destination, vehicle_id, driver_id, cargo_weight, planned_distance, revenue, status)
      VALUES ('Seattle, WA', 'Los Angeles, CA', $1, $2, 12000.00, 1135.00, 3200.00, 'Draft')
      RETURNING id;
    `, [teslaId, johnId]);
    const t1Id = t1Draft.rows[0].id;

    await query(`UPDATE trips SET status = 'Dispatched' WHERE id = $1;`, [t1Id]);
    await query(`UPDATE trips SET status = 'Completed', end_odometer = 6140.00 WHERE id = $1;`, [t1Id]);

    // TRIP 2: Available -> Draft -> Dispatched -> Completed
    console.log("  - Creating and dispatching Trip 2 (Ford Transit)...");
    const t2Draft = await query(`
      INSERT INTO trips (source, destination, vehicle_id, driver_id, cargo_weight, planned_distance, revenue, status)
      VALUES ('New York, NY', 'Boston, MA', $1, $2, 1800.00, 215.00, 750.00, 'Draft')
      RETURNING id;
    `, [fordId, janeId]);
    const t2Id = t2Draft.rows[0].id;

    await query(`UPDATE trips SET status = 'Dispatched' WHERE id = $1;`, [t2Id]);
    await query(`UPDATE trips SET status = 'Completed', end_odometer = 12220.00 WHERE id = $1;`, [t2Id]);

    // TRIP 3: Available -> Draft -> Dispatched (Ongoing / Active trip)
    console.log("  - Creating and dispatching Trip 3 (Volvo - Active)...");
    const t3Draft = await query(`
      INSERT INTO trips (source, destination, vehicle_id, driver_id, cargo_weight, planned_distance, revenue, status)
      VALUES ('Chicago, IL', 'Denver, CO', $1, $2, 15000.00, 1000.00, 2500.00, 'Draft')
      RETURNING id;
    `, [volvoId, bobId]);
    const t3Id = t3Draft.rows[0].id;

    await query(`UPDATE trips SET status = 'Dispatched' WHERE id = $1;`, [t3Id]);

    console.log("🎉 Database seeding complete!");
  } catch (err) {
    console.error("❌ Seeding failed:", err.message);
  } finally {
    process.exit(0);
  }
}

seed();
