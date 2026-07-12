import React, { useState, useEffect } from 'react';
import { useApi } from '../lib/apiClient';
import StatCard from '../components/dashboard/StatCard';
import { Truck, Activity, Wrench, CheckCircle, Navigation, Users, Percent } from 'lucide-react';

const Dashboard = () => {
  const api = useApi();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/dashboard/stats');
        if (response.data.success) {
          setStats(response.data.data);
        } else {
          setError('Failed to fetch stats');
        }
      } catch (err) {
        setError(err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [api]);

  return (
    <div className="p-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Overview of your fleet operations and KPIs.</p>
      </div>

      {loading && <div className="text-sm text-gray-500">Loading dashboard data...</div>}
      {error && <div className="text-sm text-red-600 bg-red-50 p-4 rounded-md border border-red-100">{error}</div>}

      {!loading && !error && stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
            title="Fleet Utilization" 
            value={`${stats.fleet_utilization}%`} 
            icon={Percent} 
          />
          <StatCard 
            title="Active Vehicles" 
            value={stats.active_vehicles} 
            icon={Activity} 
          />
          <StatCard 
            title="Available Vehicles" 
            value={stats.available_vehicles} 
            icon={CheckCircle} 
          />
          <StatCard 
            title="Vehicles In Shop" 
            value={stats.in_shop_vehicles} 
            icon={Wrench} 
          />
          <StatCard 
            title="Active Trips" 
            value={stats.active_trips} 
            icon={Navigation} 
          />
          <StatCard 
            title="Pending Trips" 
            value={stats.pending_trips} 
            icon={Truck} 
          />
          <StatCard 
            title="Drivers On Duty" 
            value={stats.drivers_on_duty} 
            icon={Users} 
          />
        </div>
      )}
    </div>
  );
};

export default Dashboard;
