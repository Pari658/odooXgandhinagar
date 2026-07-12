import React, { useState, useEffect } from 'react';
import { useClerkAxios } from '../lib/apiClient';
import DataTable from '../components/tables/DataTable';
import StatusBadge from '../components/ui/StatusBadge';
import { Plus, Edit2, Trash2, CheckCircle, AlertCircle, Send, X } from 'lucide-react';

const Trips = () => {
  const apiClient = useClerkAxios();
  const [trips, setTrips] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    source: '',
    destination: '',
    vehicle_id: '',
    driver_id: '',
    cargo_weight: '',
    planned_distance: '',
  });

  // Fetch data on mount
  useEffect(() => {
    fetchTrips();
    fetchVehicles();
    fetchDrivers();
  }, [apiClient]);

  /**
   * Fetch all trips
   */
  const fetchTrips = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/trips');
      if (response.data.success) {
        setTrips(response.data.trips);
      } else {
        setError('Failed to fetch trips');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch trips');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Fetch available vehicles
   */
  const fetchVehicles = async () => {
    try {
      const response = await apiClient.get('/vehicles');
      if (response.data.success) {
        setVehicles(response.data.vehicles);
      }
    } catch (err) {
      console.error('Failed to fetch vehicles:', err);
    }
  };

  /**
   * Fetch available drivers
   */
  const fetchDrivers = async () => {
    try {
      const response = await apiClient.get('/drivers');
      if (response.data.success) {
        setDrivers(response.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch drivers:', err);
    }
  };

  /**
   * Create a new trip
   */
  const handleCreateTrip = async (e) => {
    e.preventDefault();
    setError(null);

    // Validate form
    if (!formData.source || !formData.destination || !formData.vehicle_id || !formData.driver_id || !formData.cargo_weight || !formData.planned_distance) {
      setError('All fields are required');
      return;
    }

    try {
      const payload = {
        ...formData,
        vehicle_id: parseInt(formData.vehicle_id),
        driver_id: parseInt(formData.driver_id),
        cargo_weight: parseFloat(formData.cargo_weight),
        planned_distance: parseFloat(formData.planned_distance),
      };

      const response = await apiClient.post('/trips', payload);

      if (response.data.success) {
        setTrips([response.data.trip, ...trips]);
        setFormData({
          source: '',
          destination: '',
          vehicle_id: '',
          driver_id: '',
          cargo_weight: '',
          planned_distance: '',
        });
        setIsCreateModalOpen(false);
      } else {
        setError(response.data.message || 'Failed to create trip');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create trip');
    }
  };

  /**
   * Update trip status
   */
  const handleUpdateTripStatus = async (tripId, newStatus) => {
    try {
      setError(null);
      const response = await apiClient.put(`/trips/${tripId}/status`, { status: newStatus });

      if (response.data.success) {
        // Update trip in local state
        setTrips(trips.map(t => t.id === tripId ? response.data.trip : t));
      } else {
        setError(response.data.message || 'Failed to update trip status');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update trip status');
    }
  };

  /**
   * Delete a trip (only Draft trips)
   */
  const handleDeleteTrip = async (tripId) => {
    if (!confirm('Are you sure you want to delete this trip?')) return;

    try {
      setError(null);
      const response = await apiClient.delete(`/trips/${tripId}`);

      if (response.data.success) {
        setTrips(trips.filter(t => t.id !== tripId));
      } else {
        setError(response.data.message || 'Failed to delete trip');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete trip');
    }
  };

  /**
   * Get vehicle name by ID
   */
  const getVehicleName = (vehicleId) => {
    const vehicle = vehicles.find(v => v.id === vehicleId);
    return vehicle ? vehicle.registration_number : `Vehicle #${vehicleId}`;
  };

  /**
   * Get driver name by ID
   */
  const getDriverName = (driverId) => {
    const driver = drivers.find(d => d.id === driverId);
    return driver ? driver.name : `Driver #${driverId}`;
  };

  /**
   * Get status color for trip status
   */
  const getStatusColor = (status) => {
    switch (status) {
      case 'Draft':
        return 'bg-gray-100 text-gray-800';
      case 'Dispatched':
        return 'bg-blue-100 text-blue-800';
      case 'Completed':
        return 'bg-green-100 text-green-800';
      case 'Cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Filter trips based on search and status
  const filteredTrips = (trips || []).filter(trip => {
    const matchesSearch =
      trip.source.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trip.destination.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getVehicleName(trip.vehicle_id).toLowerCase().includes(searchTerm.toLowerCase()) ||
      getDriverName(trip.driver_id).toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = !statusFilter || trip.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Table columns configuration
  const columns = [
    {
      header: 'Trip ID',
      accessor: 'id',
      render: (row) => <span className="font-mono text-sm text-gray-500">#{row.id}</span>,
    },
    {
      header: 'Route',
      accessor: 'source',
      render: (row) => (
        <div className="text-sm">
          <div className="font-medium text-gray-900">{row.source}</div>
          <div className="text-gray-500">→ {row.destination}</div>
        </div>
      ),
    },
    {
      header: 'Vehicle',
      accessor: 'vehicle_id',
      render: (row) => <span className="text-gray-900">{getVehicleName(row.vehicle_id)}</span>,
    },
    {
      header: 'Driver',
      accessor: 'driver_id',
      render: (row) => <span className="text-gray-900">{getDriverName(row.driver_id)}</span>,
    },
    {
      header: 'Cargo Weight',
      accessor: 'cargo_weight',
      render: (row) => <span className="text-gray-900">{row.cargo_weight} kg</span>,
    },
    {
      header: 'Distance',
      accessor: 'planned_distance',
      render: (row) => <span className="text-gray-900">{row.planned_distance} km</span>,
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (row) => (
        <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(row.status)}`}>
          {row.status}
        </span>
      ),
    },
    {
      header: 'Actions',
      accessor: 'id',
      render: (row) => (
        <div className="flex items-center gap-2">
          {row.status === 'Draft' && (
            <>
              <button
                onClick={() => handleUpdateTripStatus(row.id, 'Dispatched')}
                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition"
                title="Dispatch Trip"
              >
                <Send size={16} />
              </button>
              <button
                onClick={() => handleDeleteTrip(row.id)}
                className="p-1.5 text-red-600 hover:bg-red-50 rounded transition"
                title="Delete Trip"
              >
                <Trash2 size={16} />
              </button>
            </>
          )}
          {row.status === 'Dispatched' && (
            <>
              <button
                onClick={() => handleUpdateTripStatus(row.id, 'Completed')}
                className="p-1.5 text-green-600 hover:bg-green-50 rounded transition"
                title="Mark Completed"
              >
                <CheckCircle size={16} />
              </button>
              <button
                onClick={() => handleUpdateTripStatus(row.id, 'Cancelled')}
                className="p-1.5 text-red-600 hover:bg-red-50 rounded transition"
                title="Cancel Trip"
              >
                <X size={16} />
              </button>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="p-8 h-full flex flex-col">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Trips Management</h1>
          <p className="text-sm text-gray-500 mt-1">Create, track, and manage fleet trips.</p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          <Plus size={20} />
          Create Trip
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-center gap-2">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="mb-6 flex gap-4 items-center">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search by route, vehicle, or driver..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Statuses</option>
          <option value="Draft">Draft</option>
          <option value="Dispatched">Dispatched</option>
          <option value="Completed">Completed</option>
          <option value="Cancelled">Cancelled</option>
        </select>
      </div>

      {/* Loading State */}
      {loading && <div className="text-center text-gray-500 py-8">Loading trips...</div>}

      {/* Empty State */}
      {!loading && filteredTrips.length === 0 && (
        <div className="text-center text-gray-500 py-12">
          <p className="mb-2">No trips found</p>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="text-blue-600 hover:underline text-sm"
          >
            Create your first trip
          </button>
        </div>
      )}

      {/* Trips Table */}
      {!loading && filteredTrips.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {columns.map((col) => (
                  <th
                    key={col.header}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wide"
                  >
                    {col.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredTrips.map((trip) => (
                <tr key={trip.id} className="hover:bg-gray-50 transition">
                  {columns.map((col) => (
                    <td
                      key={`${trip.id}-${col.accessor}`}
                      className="px-6 py-4 text-sm text-gray-900"
                    >
                      {col.render ? col.render(trip) : trip[col.accessor]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Trip Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Create New Trip</h2>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateTrip} className="p-6 space-y-4">
              {/* Source */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Source
                </label>
                <input
                  type="text"
                  value={formData.source}
                  onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                  placeholder="Starting location"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Destination */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Destination
                </label>
                <input
                  type="text"
                  value={formData.destination}
                  onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                  placeholder="Ending location"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Vehicle Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Vehicle
                </label>
                <select
                  value={formData.vehicle_id}
                  onChange={(e) => setFormData({ ...formData, vehicle_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select a vehicle</option>
                  {vehicles
                    .filter((v) => v.status === 'Available')
                    .map((vehicle) => (
                      <option key={vehicle.id} value={vehicle.id}>
                        {vehicle.registration_number} ({vehicle.type})
                      </option>
                    ))}
                </select>
              </div>

              {/* Driver Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Driver
                </label>
                <select
                  value={formData.driver_id}
                  onChange={(e) => setFormData({ ...formData, driver_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select a driver</option>
                  {drivers
                    .filter((d) => d.status === 'Available')
                    .map((driver) => (
                      <option key={driver.id} value={driver.id}>
                        {driver.name}
                      </option>
                    ))}
                </select>
              </div>

              {/* Cargo Weight */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cargo Weight (kg)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.cargo_weight}
                  onChange={(e) => setFormData({ ...formData, cargo_weight: e.target.value })}
                  placeholder="e.g., 1500"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Planned Distance */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Planned Distance (km)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.planned_distance}
                  onChange={(e) => setFormData({ ...formData, planned_distance: e.target.value })}
                  placeholder="e.g., 250"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                >
                  Create Trip
                </button>
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Trips;
