import React, { useState, useEffect, useCallback } from 'react';
import { Users, ChevronDown, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';
import apiClient from '../lib/apiClient';

const VALID_ROLES = ['Fleet Manager', 'Driver', 'Safety Officer', 'Financial Analyst'];

const ROLE_BADGE_STYLES = {
  'Fleet Manager':      'bg-emerald-50 text-emerald-700',
  'Driver':             'bg-gray-100 text-gray-600',
  'Safety Officer':     'bg-blue-50 text-blue-700',
  'Financial Analyst':  'bg-amber-50 text-amber-700',
};

const Toast = ({ message, type, onDismiss }) => {
  useEffect(() => {
    const t = setTimeout(onDismiss, 4000);
    return () => clearTimeout(t);
  }, [onDismiss]);

  const styles = type === 'success'
    ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
    : 'border-red-200 bg-red-50 text-red-800';

  const Icon = type === 'success' ? CheckCircle2 : AlertCircle;

  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-lg border text-sm font-medium shadow-sm ${styles}`}>
      <Icon size={16} />
      {message}
    </div>
  );
};

const AdminUsers = () => {
  const [users, setUsers]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const [updating, setUpdating] = useState({});
  const [toast, setToast]       = useState(null);

  const showToast = (message, type = 'success') => setToast({ message, type });
  const dismissToast = useCallback(() => setToast(null), []);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await apiClient.get('/auth/users');
      setUsers(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load users.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleRoleChange = async (userId, newRole) => {
    setUpdating((prev) => ({ ...prev, [userId]: true }));
    try {
      const res = await apiClient.patch(`/auth/users/${userId}/role`, { role: newRole });
      setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, role: newRole } : u));
      showToast(res.data.message || 'Role updated.', 'success');
    } catch (err) {
      showToast(err.response?.data?.message || err.message || 'Update failed.', 'error');
    } finally {
      setUpdating((prev) => ({ ...prev, [userId]: false }));
    }
  };

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">User Management</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Assign roles to platform users. Role changes take effect on their next page load.
          </p>
        </div>
        <button
          onClick={fetchUsers}
          disabled={loading}
          className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-md hover:bg-gray-50 disabled:opacity-50 transition-colors"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 px-4 py-3 mb-6 rounded-lg border border-red-100 bg-red-50 text-sm text-red-700">
          <AlertCircle size={15} />
          {error}
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-200 flex items-center gap-2">
          <Users size={16} className="text-gray-400" />
          <span className="text-sm font-medium text-gray-700">
            {loading ? 'Loading...' : `${users.length} user${users.length !== 1 ? 's' : ''}`}
          </span>
        </div>

        {loading ? (
          <div className="py-16 text-center text-sm text-gray-400">Loading users...</div>
        ) : users.length === 0 ? (
          <div className="py-16 text-center text-sm text-gray-400">No users found.</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Name</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Email</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Current Role</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Assign Role</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-7 h-7 rounded-full bg-emerald-100 text-xs font-semibold text-emerald-700">
                        {u.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-medium text-gray-900">{u.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-gray-500">{u.email}</td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${ROLE_BADGE_STYLES[u.role] || 'bg-gray-100 text-gray-600'}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="relative inline-block">
                      <select
                        value={u.role}
                        disabled={updating[u.id]}
                        onChange={(e) => handleRoleChange(u.id, e.target.value)}
                        className="appearance-none pl-3 pr-8 py-1.5 text-sm border border-gray-200 rounded-md bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                      >
                        {VALID_ROLES.map((r) => (
                          <option key={r} value={r}>{r}</option>
                        ))}
                      </select>
                      <ChevronDown size={13} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onDismiss={dismissToast} />}
    </div>
  );
};

export default AdminUsers;
