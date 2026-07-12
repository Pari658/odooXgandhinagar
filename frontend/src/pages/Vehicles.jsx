import React, { useState, useEffect } from 'react';

export default function Vehicles() {
  const [vehicles, setVehicles] = useState([]);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({
    registration_number: '',
    model_name: '',
    type: 'Van',
    region: '', // Matches your custom schema column
    max_load_capacity: '',
    odometer: '',
    acquisition_cost: '',
    status: 'Available'
  });

  // Base API endpoint URL referencing your Express server port instance
  const API_URL = 'http://localhost:5001/api/vehicles';

  // Fetch live master registry assets on mount
  const fetchVehicles = async () => {
    try {
      const res = await fetch(API_URL);
      if (!res.ok) throw new Error('Failed to retrieve fleet master logs.');
      const data = await res.json();
      setVehicles(data.vehicles);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          max_load_capacity: Number(form.max_load_capacity),
          odometer: Number(form.odometer),
          acquisition_cost: Number(form.acquisition_cost)
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to register vehicle entry.');
      }

      // Prepend newly added asset directly into current viewport array layout
      setVehicles([data, ...vehicles]);
      
      // Clear form inputs except defaults
      setForm({
        registration_number: '',
        model_name: '',
        type: 'Van',
        region: '',
        max_load_capacity: '',
        odometer: '',
        acquisition_cost: '',
        status: 'Available'
      });
    } catch (err) {
      setError(err.message);
    }
  };

  const getStatusDotClass = (status) => {
    switch (status) {
      case 'Available': return 'bg-emerald-500';
      case 'On Trip': return 'bg-blue-500';
      case 'In Shop': return 'bg-amber-500';
      case 'Retired': return 'bg-red-500';
      default: return 'bg-gray-400';
    }
  };

  return (
    <div className="bg-white min-h-screen p-8 font-sans text-[14px] text-gray-900 antialiased">
      {/* Hierarchy Header */}
      <div className="mb-6">
        <div className="text-[12px] text-gray-500 mb-1">Fleet Management / Operations</div>
        <h1 className="text-xl font-medium text-gray-900">Vehicle Registry</h1>
      </div>

      {/* Error Alert Bar Panel */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-500 rounded-md text-[13px] font-mono">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Registration Input Form */}
        <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
          <div className="mb-4">
            <h2 className="font-medium text-gray-900 text-[14px]">Register New Asset</h2>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[12px] font-medium text-gray-500 mb-1">Registration Number</label>
              <input 
                type="text" required placeholder="e.g. VAN-05" 
                className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-600 bg-white text-gray-900 text-[13px]"
                value={form.registration_number} 
                onChange={e => setForm({...form, registration_number: e.target.value})} 
              />
            </div>

            <div>
              <label className="block text-[12px] font-medium text-gray-500 mb-1">Model Name / Description</label>
              <input 
                type="text" required placeholder="e.g. Ford Transit" 
                className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-600 bg-white text-gray-900 text-[13px]"
                value={form.model_name} 
                onChange={e => setForm({...form, model_name: e.target.value})} 
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[12px] font-medium text-gray-500 mb-1">Vehicle Type</label>
                <select 
                  className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-600 bg-white text-gray-900 text-[13px]"
                  value={form.type} onChange={e => setForm({...form, type: e.target.value})}
                >
                  <option value="Van">Van</option>
                  <option value="Truck">Truck</option>
                  <option value="Prime Mover">Prime Mover</option>
                </select>
              </div>
              <div>
                <label className="block text-[12px] font-medium text-gray-500 mb-1">Operational Region</label>
                <input 
                  type="text" placeholder="e.g. North-East" 
                  className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-600 bg-white text-gray-900 text-[13px]"
                  value={form.region} 
                  onChange={e => setForm({...form, region: e.target.value})} 
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[12px] font-medium text-gray-500 mb-1">Status State</label>
                <select 
                  className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-600 bg-white text-gray-900 text-[13px]"
                  value={form.status} onChange={e => setForm({...form, status: e.target.value})}
                >
                  <option value="Available">Available</option>
                  <option value="On Trip">On Trip</option>
                  <option value="In Shop">In Shop</option>
                  <option value="Retired">Retired</option>
                </select>
              </div>
              <div>
                <label className="block text-[12px] font-medium text-gray-500 mb-1">Max Load (kg)</label>
                <input 
                  type="number" required placeholder="500" 
                  className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-600 bg-white text-gray-900 text-[13px]"
                  value={form.max_load_capacity} 
                  onChange={e => setForm({...form, max_load_capacity: e.target.value})} 
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[12px] font-medium text-gray-500 mb-1">Odometer (km)</label>
                <input 
                  type="number" required placeholder="0" 
                  className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-600 bg-white text-gray-900 text-[13px]"
                  value={form.odometer} 
                  onChange={e => setForm({...form, odometer: e.target.value})} 
                />
              </div>
              <div>
                <label className="block text-[12px] font-medium text-gray-500 mb-1">Cost ($)</label>
                <input 
                  type="number" required placeholder="32000" 
                  className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-600 bg-white text-gray-900 text-[13px]"
                  value={form.acquisition_cost} 
                  onChange={e => setForm({...form, acquisition_cost: e.target.value})} 
                />
              </div>
            </div>

            <button 
              type="submit" 
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 px-4 rounded-md transition duration-150 text-[13px] text-center"
            >
              Add Vehicle Entry
            </button>
          </form>
        </div>

        {/* Master Directory Table Display */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm lg:col-span-2 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
            <h2 className="font-medium text-gray-900">Master Fleet Directory</h2>
            <span className="text-[12px] text-gray-500 font-mono">Total Count: {vehicles.length}</span>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-[13px]">
              <thead>
                <tr className="border-b border-gray-200 text-gray-500 font-medium bg-white">
                  <th className="py-3 px-4 font-medium">Registration</th>
                  <th className="py-3 px-4 font-medium">Model / Class</th>
                  <th className="py-3 px-4 font-medium">Region</th>
                  <th className="py-3 px-4 font-medium text-right">Max Load</th>
                  <th className="py-3 px-4 font-medium text-right">Odometer</th>
                  <th className="py-3 px-4 font-medium text-right">Cost</th>
                  <th className="py-3 px-4 font-medium pl-6">Status</th>
                </tr>
              </thead>
              <tbody>
                {vehicles.map((v) => (
                  <tr key={v.id} className="border-b border-gray-200 hover:bg-gray-50 text-gray-900 transition-colors">
                    <td className="py-3.5 px-4 font-medium font-mono text-emerald-700">{v.registration_number}</td>
                    <td className="py-3.5 px-4">
                      <div className="text-gray-900">{v.model_name}</div>
                      <div className="text-[11px] text-gray-500 font-normal">{v.type}</div>
                    </td>
                    <td className="py-3.5 px-4 text-gray-500 font-normal">{v.region || '—'}</td>
                    <td className="py-3.5 px-4 text-right text-gray-600 font-mono">{Number(v.max_load_capacity).toLocaleString()} kg</td>
                    <td className="py-3.5 px-4 text-right text-gray-600 font-mono">{Number(v.odometer).toLocaleString()} km</td>
                    <td className="py-3.5 px-4 text-right text-gray-600 font-mono">${Number(v.acquisition_cost).toLocaleString()}</td>
                    <td className="py-3.5 px-4 pl-6">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${getStatusDotClass(v.status)}`} />
                        <span className="text-gray-900 font-normal text-[13px]">{v.status}</span>
                      </div>
                    </td>
                  </tr>
                ))}
                {vehicles.length === 0 && (
                  <tr>
                    <td colSpan="7" className="py-8 text-center text-gray-400 font-normal">
                      No vehicles loaded from Supabase directory registry.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}