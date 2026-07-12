import { query } from '../config/db.js';

export const getDashboardStats = async (req, res) => {
  try {
    const statsQuery = `
      SELECT 
          (SELECT COUNT(*) FROM vehicles WHERE status = 'Available') as available_vehicles,
          (SELECT COUNT(*) FROM vehicles WHERE status = 'On Trip') as active_vehicles,
          (SELECT COUNT(*) FROM vehicles WHERE status = 'In Shop') as in_shop_vehicles,
          (SELECT COUNT(*) FROM trips WHERE status = 'Dispatched') as active_trips,
          (SELECT COUNT(*) FROM trips WHERE status = 'Draft') as pending_trips,
          (SELECT COUNT(*) FROM drivers WHERE status = 'On Trip') as drivers_on_duty,
          COALESCE((SELECT fleet_utilization_pct FROM fleet_utilization_view), 0) as fleet_utilization
    `;
    const result = await query(statsQuery);
    
    // We convert string counts to numbers for the frontend
    const raw = result.rows[0];
    const stats = {
      available_vehicles: parseInt(raw.available_vehicles, 10),
      active_vehicles: parseInt(raw.active_vehicles, 10),
      in_shop_vehicles: parseInt(raw.in_shop_vehicles, 10),
      active_trips: parseInt(raw.active_trips, 10),
      pending_trips: parseInt(raw.pending_trips, 10),
      drivers_on_duty: parseInt(raw.drivers_on_duty, 10),
      fleet_utilization: parseFloat(raw.fleet_utilization)
    };

    return res.status(200).json({ success: true, data: stats });
  } catch (err) {
    console.error('Error fetching dashboard stats:', err.message);
    return res.status(500).json({ success: false, error: 'Failed to fetch dashboard stats' });
  }
};
