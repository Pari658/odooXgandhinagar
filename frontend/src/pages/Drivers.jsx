import React, { useState, useEffect } from 'react';
import { useApi } from '../lib/apiClient';
import DataTable from '../components/tables/DataTable';
import StatusBadge from '../components/ui/StatusBadge';
import DriverFormModal from '../components/drivers/DriverFormModal';
import { Plus, Search } from 'lucide-react';

const Drivers = () => {
  const api = useApi();
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState(null);

  useEffect(() => {
    fetchDrivers();
  }, [api]);

  const fetchDrivers = async () => {
    try {
      const response = await api.get('/drivers');
      if (response.data.success) {
        setDrivers(response.data.data);
      } else {
        setError('Failed to fetch drivers');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch drivers');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { header: 'Driver Name', accessor: 'name', render: (row) => <span className="font-medium text-gray-900">{row.name}</span> },
    { header: 'License Number', accessor: 'license_number' },
    { header: 'Category', accessor: 'license_category' },
    { 
      header: 'Expiry Date', 
      accessor: 'license_expiry_date',
      render: (row) => {
        if (!row.license_expiry_date) return <span className="text-gray-400">N/A</span>;
        const date = new Date(row.license_expiry_date);
        return isNaN(date) ? 'Invalid Date' : date.toLocaleDateString();
      }
    },
    { header: 'Contact', accessor: 'contact_number' },
    { 
      header: 'Safety Score', 
      accessor: 'safety_score',
      render: (row) => (
        <span className={row.safety_score < 3 ? 'text-red-600 font-medium' : 'text-gray-900'}>
          {row.safety_score} / 5.0
        </span>
      )
    },
    { 
      header: 'Status', 
      accessor: 'status',
      render: (row) => <StatusBadge status={row.status} />
    }
  ];

  const filteredDrivers = (drivers || []).filter(driver => {
    const safeName = driver.name || '';
    const safeLicense = driver.license_number || '';
    return safeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
           safeLicense.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="p-8 h-full flex flex-col">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Drivers</h1>
          <p className="text-sm text-gray-500 mt-1">Manage fleet drivers, licenses, and availability.</p>
        </div>
        <button 
          className="inline-flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-emerald-700 transition-colors shadow-sm"
          onClick={() => {
            setSelectedDriver(null);
            setIsModalOpen(true);
          }}
        >
          <Plus size={16} />
          Register Driver
        </button>
      </div>

      {error && <div className="mb-4 text-sm text-red-600 bg-red-50 p-4 rounded-md border border-red-100">{error}</div>}

      <div className="mb-6 flex items-center max-w-md">
        <div className="relative w-full">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={16} className="text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-md text-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
            placeholder="Search by name or license..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        {loading ? (
          <div className="text-sm text-gray-500">Loading drivers...</div>
        ) : (
          <DataTable 
            columns={columns} 
            data={filteredDrivers} 
            onRowClick={(row) => {
              setSelectedDriver(row);
              setIsModalOpen(true);
            }}
          />
        )}
      </div>

      <DriverFormModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        driver={selectedDriver}
        onSuccess={fetchDrivers}
      />
    </div>
  );
};

export default Drivers;
