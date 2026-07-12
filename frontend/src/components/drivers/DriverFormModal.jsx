import React, { useState, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { X } from 'lucide-react';

const DriverFormModal = ({ isOpen, onClose, driver, onSuccess }) => {
  const { getToken } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    license_number: '',
    license_category: 'LMV',
    license_expiry_date: '',
    contact_number: '',
    status: 'Available',
    safety_score: 5.0
  });

  // Populate form if we are editing an existing driver
  useEffect(() => {
    if (driver) {
      setFormData({
        ...driver,
        // Format date for HTML input type="date"
        license_expiry_date: driver.license_expiry_date ? driver.license_expiry_date.split('T')[0] : ''
      });
    } else {
      setFormData({
        name: '',
        license_number: '',
        license_category: 'LMV',
        license_expiry_date: '',
        contact_number: '',
        status: 'Available',
        safety_score: 5.0
      });
    }
    setError(null);
  }, [driver, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const token = await getToken();
      const isEditing = !!driver;
      const url = isEditing 
        ? `http://localhost:5000/api/drivers/${driver.id}` 
        : `http://localhost:5000/api/drivers`;
      
      const response = await fetch(url, {
        method: isEditing ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to save driver');
      }

      onSuccess(); // Refresh table
      onClose();   // Close modal
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm">
      <div className="bg-white w-full max-w-lg rounded-xl shadow-xl overflow-hidden border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gray-50/50">
          <h2 className="text-lg font-semibold text-gray-900">
            {driver ? 'Edit Driver' : 'Register New Driver'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-100 p-3 rounded-md">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input 
                type="text" name="name" required
                value={formData.name} onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">License Number</label>
                <input 
                  type="text" name="license_number" required placeholder="e.g. MH1420210001234"
                  value={formData.license_number} onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm uppercase"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select 
                  name="license_category" required
                  value={formData.license_category} onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                >
                  <option value="LMV">LMV (Light Motor Vehicle)</option>
                  <option value="HMV">HMV (Heavy Motor Vehicle)</option>
                  <option value="HGMV">HGMV (Heavy Goods)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                <input 
                  type="date" name="license_expiry_date" required
                  value={formData.license_expiry_date} onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contact Number</label>
                <input 
                  type="text" name="contact_number" required
                  value={formData.contact_number} onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                />
              </div>
            </div>

            {driver && (
              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-100">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select 
                    name="status" required
                    value={formData.status} onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                  >
                    <option value="Available">Available</option>
                    <option value="On Trip">On Trip</option>
                    <option value="Suspended">Suspended</option>
                    <option value="Off Duty">Off Duty</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Safety Score</label>
                  <input 
                    type="number" step="0.1" min="0" max="5" name="safety_score" required
                    value={formData.safety_score} onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="mt-8 flex justify-end gap-3">
            <button 
              type="button" onClick={onClose}
              className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 shadow-sm"
            >
              Cancel
            </button>
            <button 
              type="submit" disabled={loading}
              className="px-4 py-2 bg-emerald-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-emerald-700 shadow-sm disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Driver'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DriverFormModal;
