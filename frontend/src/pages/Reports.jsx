import React, { useState, useEffect } from 'react';
import { Download, TrendingUp, DollarSign, Fuel, Activity, Search } from 'lucide-react';

export default function Reports() {
  const [kpis, setKpis] = useState({
    fleet_utilization: 0,
    total_operational_cost: 0,
    avg_fuel_efficiency: 0,
    avg_roi: 0
  });
  const [vehicleReports, setVehicleReports] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [regionFilter, setRegionFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  const fetchReportsData = async () => {
    setLoading(true);
    try {
      const [kpiRes, vehicleRes] = await Promise.all([
        fetch('/api/reports/kpis'),
        fetch('/api/reports/vehicles')
      ]);

      const [kpiData, vehicleData] = await Promise.all([
        kpiRes.json(),
        vehicleRes.json()
      ]);

      if (kpiData.success) setKpis(kpiData.data);
      if (vehicleData.success) setVehicleReports(vehicleData.data);
    } catch (err) {
      console.error('Error fetching reports data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportsData();
  }, []);

  // Filter logic
  const filteredVehicles = vehicleReports.filter(v => {
    const matchesSearch = v.registration_number.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          v.model_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRegion = regionFilter === '' || v.region === regionFilter;
    const matchesType = typeFilter === '' || v.type === typeFilter;
    return matchesSearch && matchesRegion && matchesType;
  });

  // Extract unique regions and types for filter dropdowns
  const regions = [...new Set(vehicleReports.map(v => v.region).filter(Boolean))];
  const types = [...new Set(vehicleReports.map(v => v.type).filter(Boolean))];

  return (
    <div className="w-full p-8">
      {/* Header and Download Button */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 pb-5 border-b border-gray-200">
        <div>
          <div className="flex items-center space-x-2 text-xs text-gray-500 mb-1">
            <span>TransitOps</span>
            <span>/</span>
            <span className="text-gray-900 font-medium">Reports & Analytics</span>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900">Reports & Analytics</h1>
        </div>
        <div className="mt-4 md:mt-0">
          <a
            href="/api/reports/export"
            className="inline-flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-600 transition-colors"
          >
            <Download className="w-4 h-4 stroke-[2]" />
            <span>Export CSV</span>
          </a>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Utilization */}
        <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Fleet Utilization</span>
            <Activity className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-2xl font-semibold text-gray-900">{kpis.fleet_utilization.toFixed(1)}%</span>
            <span className="flex items-center space-x-1">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 inline-block"></span>
              <span className="text-[10px] text-gray-400 font-medium">Active</span>
            </span>
          </div>
        </div>

        {/* Operational Cost */}
        <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Operational Cost</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2">
            <span className="text-2xl font-semibold text-gray-900">
              ${kpis.total_operational_cost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* Avg Fuel Efficiency */}
        <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Fuel Efficiency</span>
            <Fuel className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2 flex items-baseline space-x-1">
            <span className="text-2xl font-semibold text-gray-900">{kpis.avg_fuel_efficiency.toFixed(2)}</span>
            <span className="text-xs text-gray-500 font-medium">km / L</span>
          </div>
        </div>

        {/* Avg Vehicle ROI */}
        <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Average ROI</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2 flex items-baseline space-x-1">
            <span className="text-2xl font-semibold text-gray-900">{kpis.avg_roi.toFixed(2)}%</span>
          </div>
        </div>
      </div>

      {/* Filters Area */}
      <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6 p-4 bg-gray-50/50 border border-gray-200 rounded-lg">
        {/* Search */}
        <div className="flex-1 relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by registration or model..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 bg-white border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
          />
        </div>

        {/* Region Filter */}
        <div className="w-full md:w-[180px]">
          <select
            value={regionFilter}
            onChange={(e) => setRegionFilter(e.target.value)}
            className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
          >
            <option value="">All Regions</option>
            {regions.map(r => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>

        {/* Vehicle Type Filter */}
        <div className="w-full md:w-[180px]">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
          >
            <option value="">All Types</option>
            {types.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table Container */}
      {loading ? (
        <div className="py-12 text-center text-sm text-gray-500">Loading reports...</div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
          {filteredVehicles.length === 0 ? (
            <div className="p-8 text-center text-sm text-gray-500">No vehicles match the selected criteria.</div>
          ) : (
            <table className="w-full text-left border-collapse text-[13px]">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 font-medium">
                  <th className="py-3 px-4">Vehicle</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Region</th>
                  <th className="py-3 px-4 text-right">Acquisition</th>
                  <th className="py-3 px-4 text-right">Revenue</th>
                  <th className="py-3 px-4 text-right">Fuel Cost</th>
                  <th className="py-3 px-4 text-right">Maintenance</th>
                  <th className="py-3 px-4 text-right">Other Exp.</th>
                  <th className="py-3 px-4 text-right">Total Op. Cost</th>
                  <th className="py-3 px-4 text-right">ROI</th>
                </tr>
              </thead>
              <tbody>
                {filteredVehicles.map((v) => {
                  const roiVal = parseFloat(v.roi);
                  const isPositive = roiVal > 0;
                  return (
                    <tr key={v.vehicle_id} className="border-b border-gray-200 hover:bg-gray-50/50">
                      {/* Vehicle detail */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-gray-900">{v.registration_number}</div>
                        <div className="text-[11px] text-gray-400">{v.model_name}</div>
                      </td>
                      <td className="py-3.5 px-4 text-gray-600">{v.type}</td>
                      <td className="py-3.5 px-4 text-gray-600">
                        {v.region ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-normal bg-gray-100 text-gray-700">
                            {v.region}
                          </span>
                        ) : (
                          <span className="text-gray-300 font-normal">—</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono">${parseFloat(v.acquisition_cost).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                      <td className="py-3.5 px-4 text-right font-mono text-emerald-600 font-medium">${parseFloat(v.total_revenue).toFixed(2)}</td>
                      <td className="py-3.5 px-4 text-right font-mono text-gray-500">${parseFloat(v.total_fuel_cost).toFixed(2)}</td>
                      <td className="py-3.5 px-4 text-right font-mono text-gray-500">${parseFloat(v.total_maintenance_cost).toFixed(2)}</td>
                      <td className="py-3.5 px-4 text-right font-mono text-gray-500">${parseFloat(v.total_other_expenses).toFixed(2)}</td>
                      <td className="py-3.5 px-4 text-right font-mono text-gray-950 font-medium">${parseFloat(v.total_operational_cost).toFixed(2)}</td>
                      
                      {/* ROI Badge */}
                      <td className="py-3.5 px-4 text-right">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                          isPositive 
                            ? 'bg-emerald-50 text-emerald-800' 
                            : 'bg-red-50 text-red-800'
                        }`}>
                          {isPositive ? '+' : ''}{roiVal.toFixed(2)}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
