import { query } from '../config/db.js';

/**
 * Get global fleet KPIs
 * GET /api/reports/kpis
 */
export const getKpis = async (req, res) => {
  try {
    // 1. Fleet Utilization
    const utilizationRes = await query("SELECT COALESCE(fleet_utilization_pct, 0.00) AS utilization FROM fleet_utilization_view;");
    const utilization = utilizationRes.rows[0]?.utilization || 0;

    // 2. Total Operational Cost
    const costRes = await query("SELECT SUM(total_operational_cost) AS total_cost FROM vehicle_operational_cost_view;");
    const totalCost = costRes.rows[0]?.total_cost || 0;

    // 3. Average Fuel Efficiency (distance per liter)
    const efficiencyRes = await query("SELECT AVG(distance_per_liter) AS avg_efficiency FROM trip_fuel_efficiency_view;");
    const avgEfficiency = efficiencyRes.rows[0]?.avg_efficiency || 0;

    // 4. Average Vehicle ROI
    const roiRes = await query("SELECT AVG(roi) * 100 AS avg_roi FROM vehicle_roi_view;");
    const avgRoi = roiRes.rows[0]?.avg_roi || 0;

    return res.status(200).json({
      success: true,
      data: {
        fleet_utilization: parseFloat(utilization),
        total_operational_cost: parseFloat(totalCost),
        avg_fuel_efficiency: parseFloat(avgEfficiency),
        avg_roi: parseFloat(avgRoi)
      }
    });
  } catch (err) {
    console.error('Error fetching KPIs:', err);
    return res.status(500).json({ success: false, message: 'Internal server error', error: err.message });
  }
};

/**
 * Get per-vehicle ROI and operational cost breakdown
 * GET /api/reports/vehicles
 */
export const getVehicleReports = async (req, res) => {
  try {
    const sql = `
      SELECT 
        v.id AS vehicle_id,
        v.registration_number,
        v.model_name,
        v.type,
        v.region,
        v.acquisition_cost,
        COALESCE(r.total_revenue, 0) AS total_revenue,
        COALESCE(oc.total_fuel_cost, 0) AS total_fuel_cost,
        COALESCE(oc.total_maintenance_cost, 0) AS total_maintenance_cost,
        COALESCE(oc.total_other_expenses, 0) AS total_other_expenses,
        COALESCE(oc.total_operational_cost, 0) AS total_operational_cost,
        COALESCE(roi.roi * 100, 0) AS roi
      FROM vehicles v
      LEFT JOIN vehicle_operational_cost_view oc ON v.id = oc.vehicle_id
      LEFT JOIN vehicle_roi_view roi ON v.id = roi.vehicle_id
      LEFT JOIN (
        SELECT vehicle_id, SUM(revenue) AS total_revenue 
        FROM trips 
        WHERE status = 'Completed' 
        GROUP BY vehicle_id
      ) r ON v.id = r.vehicle_id
      WHERE v.status <> 'Retired'
      ORDER BY roi DESC, v.registration_number;
    `;
    const result = await query(sql);

    return res.status(200).json({
      success: true,
      data: result.rows
    });
  } catch (err) {
    console.error('Error fetching vehicle reports:', err);
    return res.status(500).json({ success: false, message: 'Internal server error', error: err.message });
  }
};

/**
 * Export vehicle analytics to CSV
 * GET /api/reports/export
 */
export const exportCsv = async (req, res) => {
  try {
    const sql = `
      SELECT 
        v.id AS vehicle_id,
        v.registration_number,
        v.model_name,
        v.type,
        v.region,
        v.acquisition_cost,
        COALESCE(r.total_revenue, 0) AS total_revenue,
        COALESCE(oc.total_fuel_cost, 0) AS total_fuel_cost,
        COALESCE(oc.total_maintenance_cost, 0) AS total_maintenance_cost,
        COALESCE(oc.total_other_expenses, 0) AS total_other_expenses,
        COALESCE(oc.total_operational_cost, 0) AS total_operational_cost,
        COALESCE(roi.roi * 100, 0) AS roi
      FROM vehicles v
      LEFT JOIN vehicle_operational_cost_view oc ON v.id = oc.vehicle_id
      LEFT JOIN vehicle_roi_view roi ON v.id = roi.vehicle_id
      LEFT JOIN (
        SELECT vehicle_id, SUM(revenue) AS total_revenue 
        FROM trips 
        WHERE status = 'Completed' 
        GROUP BY vehicle_id
      ) r ON v.id = r.vehicle_id
      WHERE v.status <> 'Retired'
      ORDER BY roi DESC, v.registration_number;
    `;
    const result = await query(sql);

    // Build CSV content
    const headers = [
      'Vehicle ID',
      'Registration Number',
      'Model Name',
      'Type',
      'Region',
      'Acquisition Cost ($)',
      'Total Revenue ($)',
      'Fuel Cost ($)',
      'Maintenance Cost ($)',
      'Other Expenses ($)',
      'Total Operational Cost ($)',
      'ROI (%)'
    ];

    const rows = result.rows.map(row => [
      row.vehicle_id,
      `"${row.registration_number}"`,
      `"${row.model_name}"`,
      `"${row.type}"`,
      `"${row.region || ''}"`,
      parseFloat(row.acquisition_cost).toFixed(2),
      parseFloat(row.total_revenue).toFixed(2),
      parseFloat(row.total_fuel_cost).toFixed(2),
      parseFloat(row.total_maintenance_cost).toFixed(2),
      parseFloat(row.total_other_expenses).toFixed(2),
      parseFloat(row.total_operational_cost).toFixed(2),
      parseFloat(row.roi).toFixed(2)
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(r => r.join(','))
    ].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=transitops_fleet_report.csv');
    return res.status(200).send(csvContent);
  } catch (err) {
    console.error('Error exporting CSV:', err);
    return res.status(500).json({ success: false, message: 'Internal server error', error: err.message });
  }
};

/**
 * Get landing page dashboard statistics
 * GET /api/dashboard/stats
 */
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
