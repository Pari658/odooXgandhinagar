import React, { useState, useEffect } from 'react';
import { Fuel, Plus, Info, FileText, Calendar, DollarSign, ArrowRight } from 'lucide-react';

export default function FuelExpenses() {
  const [activeTab, setActiveTab] = useState('fuel'); // 'fuel' or 'expenses'
  const [fuelLogs, setFuelLogs] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal States
  const [showFuelModal, setShowFuelModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);

  // Form States - Fuel
  const [fuelForm, setFuelForm] = useState({
    vehicle_id: '',
    trip_id: '',
    liters: '',
    cost: '',
    logged_date: new Date().toISOString().split('T')[0]
  });

  // Form States - Expense
  const [expenseForm, setExpenseForm] = useState({
    vehicle_id: '',
    trip_id: '',
    expense_type: '',
    cost: '',
    logged_date: new Date().toISOString().split('T')[0]
  });

  const [formError, setFormError] = useState('');

  // Fetch Data
  const fetchData = async () => {
    setLoading(true);
    try {
      const [fuelRes, expenseRes, vehicleRes, tripRes] = await Promise.all([
        fetch('/api/fuel'),
        fetch('/api/expenses'),
        fetch('/api/vehicles'),
        fetch('/api/trips')
      ]);

      const [fuelData, expenseData, vehicleData, tripData] = await Promise.all([
        fuelRes.json(),
        expenseRes.json(),
        vehicleRes.json(),
        tripRes.json()
      ]);

      if (fuelData.success) setFuelLogs(fuelData.data);
      if (expenseData.success) setExpenses(expenseData.data);
      if (vehicleData.success) setVehicles(vehicleData.data);
      if (tripData.success) setTrips(tripData.data);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filter trips for selected vehicle in forms
  const getFilteredTrips = (vehicleId) => {
    if (!vehicleId) return [];
    return trips.filter(t => t.vehicle_id === parseInt(vehicleId));
  };

  // Submit Fuel Log
  const handleFuelSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    const { vehicle_id, trip_id, liters, cost, logged_date } = fuelForm;

    if (!vehicle_id) return setFormError('Please select a vehicle.');
    if (!liters || parseFloat(liters) <= 0) return setFormError('Liters must be greater than 0.');
    if (!cost || parseFloat(cost) < 0) return setFormError('Cost must be greater than or equal to 0.');

    try {
      const res = await fetch('/api/fuel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vehicle_id: parseInt(vehicle_id),
          trip_id: trip_id ? parseInt(trip_id) : null,
          liters: parseFloat(liters),
          cost: parseFloat(cost),
          logged_date
        })
      });

      const data = await res.json();
      if (data.success) {
        setShowFuelModal(false);
        setFuelForm({
          vehicle_id: '',
          trip_id: '',
          liters: '',
          cost: '',
          logged_date: new Date().toISOString().split('T')[0]
        });
        fetchData();
      } else {
        setFormError(data.message || 'Failed to submit fuel log.');
      }
    } catch (err) {
      setFormError('Server error. Please try again.');
    }
  };

  // Submit Expense Log
  const handleExpenseSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    const { vehicle_id, trip_id, expense_type, cost, logged_date } = expenseForm;

    if (!vehicle_id) return setFormError('Please select a vehicle.');
    if (!expense_type.trim()) return setFormError('Please enter an expense type.');
    if (!cost || parseFloat(cost) < 0) return setFormError('Cost must be greater than or equal to 0.');

    try {
      const res = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vehicle_id: parseInt(vehicle_id),
          trip_id: trip_id ? parseInt(trip_id) : null,
          expense_type: expense_type.trim(),
          cost: parseFloat(cost),
          logged_date
        })
      });

      const data = await res.json();
      if (data.success) {
        setShowExpenseModal(false);
        setExpenseForm({
          vehicle_id: '',
          trip_id: '',
          expense_type: '',
          cost: '',
          logged_date: new Date().toISOString().split('T')[0]
        });
        fetchData();
      } else {
        setFormError(data.message || 'Failed to submit expense log.');
      }
    } catch (err) {
      setFormError('Server error. Please try again.');
    }
  };

  // Metrics Calculations
  const totalFuelCost = fuelLogs.reduce((acc, log) => acc + parseFloat(log.cost), 0);
  const totalLiters = fuelLogs.reduce((acc, log) => acc + parseFloat(log.liters), 0);
  const totalOtherCost = expenses.reduce((acc, log) => acc + parseFloat(log.cost), 0);
  const avgFuelPrice = totalLiters > 0 ? (totalFuelCost / totalLiters).toFixed(2) : '0.00';

  return (
    <div className="w-full">
      {/* Breadcrumb & Title */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 pb-5 border-b border-gray-200">
        <div>
          <div className="flex items-center space-x-2 text-xs text-gray-500 mb-1">
            <span>TransitOps</span>
            <span>/</span>
            <span className="text-gray-900 font-medium">Fuel & Expenses</span>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900">Fuel & Expense Management</h1>
        </div>
        <div className="flex items-center space-x-3 mt-4 md:mt-0">
          <button
            onClick={() => { setShowExpenseModal(true); setFormError(''); }}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-600 transition-colors"
          >
            Record Expense
          </button>
          <button
            onClick={() => { setShowFuelModal(true); setFormError(''); }}
            className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-600 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Log Fuel</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Fuel Cost</span>
            <Fuel className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-2xl font-semibold text-gray-900">${totalFuelCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            <span className="text-xs text-gray-500">for {totalLiters.toFixed(1)}L</span>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Other Expenses</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2">
            <span className="text-2xl font-semibold text-gray-900">${totalOtherCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Avg Fuel Cost / Liter</span>
            <Info className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2">
            <span className="text-2xl font-semibold text-gray-900">${avgFuelPrice}/L</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6">
        <button
          onClick={() => setActiveTab('fuel')}
          className={`py-3 px-6 text-sm font-medium border-b-2 transition-colors -mb-[2px] ${
            activeTab === 'fuel'
              ? 'border-emerald-600 text-emerald-600'
              : 'border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-200'
          }`}
        >
          Fuel Logs
        </button>
        <button
          onClick={() => setActiveTab('expenses')}
          className={`py-3 px-6 text-sm font-medium border-b-2 transition-colors -mb-[2px] ${
            activeTab === 'expenses'
              ? 'border-emerald-600 text-emerald-600'
              : 'border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-200'
          }`}
        >
          Other Expenses
        </button>
      </div>

      {/* Loading state */}
      {loading ? (
        <div className="py-12 text-center text-sm text-gray-500">Loading records...</div>
      ) : activeTab === 'fuel' ? (
        /* FUEL LOGS TABLE */
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
          {fuelLogs.length === 0 ? (
            <div className="p-8 text-center text-sm text-gray-500">No fuel records logged yet.</div>
          ) : (
            <table className="w-full text-left border-collapse text-[13px]">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 font-medium">
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Vehicle</th>
                  <th className="py-3 px-4">Associated Trip</th>
                  <th className="py-3 px-4 text-right">Liters</th>
                  <th className="py-3 px-4 text-right">Cost / Liter</th>
                  <th className="py-3 px-4 text-right">Total Cost</th>
                </tr>
              </thead>
              <tbody>
                {fuelLogs.map((log) => {
                  const liters = parseFloat(log.liters);
                  const cost = parseFloat(log.cost);
                  const pricePerLiter = liters > 0 ? (cost / liters).toFixed(2) : '0.00';
                  return (
                    <tr key={log.id} className="border-b border-gray-200 hover:bg-gray-50/50">
                      <td className="py-3.5 px-4 text-gray-500 font-mono">{log.logged_date}</td>
                      <td className="py-3.5 px-4 font-medium text-gray-900">
                        {log.registration_number} <span className="text-gray-400 font-normal">({log.model_name})</span>
                      </td>
                      <td className="py-3.5 px-4 text-gray-600">
                        {log.trip_id ? (
                          <span className="flex items-center space-x-1">
                            <span>#{log.trip_id}</span>
                            <span className="text-gray-400">{log.source}</span>
                            <ArrowRight className="w-3 h-3 text-gray-300" />
                            <span className="text-gray-400">{log.destination}</span>
                          </span>
                        ) : (
                          <span className="text-gray-400 font-normal">—</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono">{liters.toFixed(1)} L</td>
                      <td className="py-3.5 px-4 text-right font-mono">${pricePerLiter}</td>
                      <td className="py-3.5 px-4 text-right font-semibold text-gray-900">${cost.toFixed(2)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      ) : (
        /* EXPENSES TABLE */
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
          {expenses.length === 0 ? (
            <div className="p-8 text-center text-sm text-gray-500">No other expenses recorded yet.</div>
          ) : (
            <table className="w-full text-left border-collapse text-[13px]">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 font-medium">
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Vehicle</th>
                  <th className="py-3 px-4">Associated Trip</th>
                  <th className="py-3 px-4">Expense Type</th>
                  <th className="py-3 px-4 text-right">Cost</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((exp) => (
                  <tr key={exp.id} className="border-b border-gray-200 hover:bg-gray-50/50">
                    <td className="py-3.5 px-4 text-gray-500 font-mono">{exp.logged_date}</td>
                    <td className="py-3.5 px-4 font-medium text-gray-900">
                      {exp.registration_number} <span className="text-gray-400 font-normal">({exp.model_name})</span>
                    </td>
                    <td className="py-3.5 px-4 text-gray-600">
                      {exp.trip_id ? (
                        <span className="flex items-center space-x-1">
                          <span>#{exp.trip_id}</span>
                          <span className="text-gray-400">{exp.source}</span>
                          <ArrowRight className="w-3 h-3 text-gray-300" />
                          <span className="text-gray-400">{exp.destination}</span>
                        </span>
                      ) : (
                        <span className="text-gray-400 font-normal">—</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {exp.expense_type}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-semibold text-gray-900">${parseFloat(exp.cost).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* FUEL MODAL */}
      {showFuelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm">
          <div className="bg-white border border-gray-200 rounded-lg shadow-lg max-w-md w-full p-6 relative">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <Fuel className="w-5 h-5 text-emerald-600" />
              <span>Log Fuel Purchased</span>
            </h2>

            {formError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-100 text-red-600 text-xs rounded-md">
                {formError}
              </div>
            )}

            <form onSubmit={handleFuelSubmit} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">Select Vehicle</label>
                <select
                  value={fuelForm.vehicle_id}
                  onChange={(e) => setFuelForm({ ...fuelForm, vehicle_id: e.target.value, trip_id: '' })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  required
                >
                  <option value="">-- Choose a Vehicle --</option>
                  {vehicles.map(v => (
                    <option key={v.id} value={v.id}>{v.registration_number} - {v.model_name} ({v.status})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">Link to active Trip (Optional)</label>
                <select
                  value={fuelForm.trip_id}
                  onChange={(e) => setFuelForm({ ...fuelForm, trip_id: e.target.value })}
                  disabled={!fuelForm.vehicle_id}
                  className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-600 disabled:bg-gray-50 disabled:text-gray-400"
                >
                  <option value="">-- Not Linked to Trip --</option>
                  {getFilteredTrips(fuelForm.vehicle_id).map(t => (
                    <option key={t.id} value={t.id}>Trip #{t.id}: {t.source} → {t.destination}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">Liters</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="e.g. 45.5"
                    value={fuelForm.liters}
                    onChange={(e) => setFuelForm({ ...fuelForm, liters: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-600"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">Total Cost ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="e.g. 95.00"
                    value={fuelForm.cost}
                    onChange={(e) => setFuelForm({ ...fuelForm, cost: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-600"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">Date Logged</label>
                <input
                  type="date"
                  value={fuelForm.logged_date}
                  onChange={(e) => setFuelForm({ ...fuelForm, logged_date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  required
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowFuelModal(false)}
                  className="px-4 py-2 border border-gray-200 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-600"
                >
                  Save Log
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EXPENSE MODAL */}
      {showExpenseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm">
          <div className="bg-white border border-gray-200 rounded-lg shadow-lg max-w-md w-full p-6 relative">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <FileText className="w-5 h-5 text-emerald-600" />
              <span>Record Operational Expense</span>
            </h2>

            {formError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-100 text-red-600 text-xs rounded-md">
                {formError}
              </div>
            )}

            <form onSubmit={handleExpenseSubmit} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">Select Vehicle</label>
                <select
                  value={expenseForm.vehicle_id}
                  onChange={(e) => setExpenseForm({ ...expenseForm, vehicle_id: e.target.value, trip_id: '' })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  required
                >
                  <option value="">-- Choose a Vehicle --</option>
                  {vehicles.map(v => (
                    <option key={v.id} value={v.id}>{v.registration_number} - {v.model_name} ({v.status})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">Link to active Trip (Optional)</label>
                <select
                  value={expenseForm.trip_id}
                  onChange={(e) => setExpenseForm({ ...expenseForm, trip_id: e.target.value })}
                  disabled={!expenseForm.vehicle_id}
                  className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-600 disabled:bg-gray-50 disabled:text-gray-400"
                >
                  <option value="">-- Not Linked to Trip --</option>
                  {getFilteredTrips(expenseForm.vehicle_id).map(t => (
                    <option key={t.id} value={t.id}>Trip #{t.id}: {t.source} → {t.destination}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">Expense Type</label>
                  <input
                    type="text"
                    placeholder="e.g. Toll, Permit, Wash"
                    value={expenseForm.expense_type}
                    onChange={(e) => setExpenseForm({ ...expenseForm, expense_type: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-600"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">Cost ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="e.g. 25.00"
                    value={expenseForm.cost}
                    onChange={(e) => setExpenseForm({ ...expenseForm, cost: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-600"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">Date Logged</label>
                <input
                  type="date"
                  value={expenseForm.logged_date}
                  onChange={(e) => setExpenseForm({ ...expenseForm, logged_date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  required
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowExpenseModal(false)}
                  className="px-4 py-2 border border-gray-200 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-600"
                >
                  Save Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
