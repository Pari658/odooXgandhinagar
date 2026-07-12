import React, { useState, useEffect } from 'react';
import { useApi } from '../lib/apiClient';

const FuelExpenses = () => {
  const api = useApi();
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchFuelExpenses();
  }, [api]);

  const fetchFuelExpenses = async () => {
    try {
      const response = await api.get('/fuel');
      if (response.data.success) {
        setExpenses(response.data.expenses || []);
      } else {
        setError('Failed to fetch fuel expenses');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch fuel expenses');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 bg-white min-h-screen">
      <p className="text-sm text-gray-500 mb-2">
        Fleet Management / Operations
      </p>

      <h1 className="text-3xl font-semibold text-gray-900 mb-8">
        Fuel Expenses
      </h1>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Loading fuel expenses...</p>
        </div>
      ) : expenses.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No fuel expenses recorded yet</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-100 border-b">
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Date</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Vehicle</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Amount</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Quantity</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((expense) => (
                <tr key={expense.id} className="border-b hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-700">{expense.date || 'N/A'}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{expense.vehicle || 'N/A'}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">₹{expense.amount || 0}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{expense.quantity || 0}L</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default FuelExpenses;
