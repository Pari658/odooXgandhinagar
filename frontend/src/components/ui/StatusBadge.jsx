import React from 'react';

const StatusBadge = ({ status }) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'Available':
        return { color: 'bg-emerald-500', text: 'text-emerald-700', bg: 'bg-emerald-50' };
      case 'On Trip':
      case 'Dispatched':
        return { color: 'bg-amber-500', text: 'text-amber-700', bg: 'bg-amber-50' };
      case 'In Shop':
        return { color: 'bg-blue-500', text: 'text-blue-700', bg: 'bg-blue-50' };
      case 'Suspended':
      case 'Retired':
      case 'Cancelled':
        return { color: 'bg-red-500', text: 'text-red-700', bg: 'bg-red-50' };
      case 'Draft':
      case 'Off Duty':
        return { color: 'bg-gray-400', text: 'text-gray-700', bg: 'bg-gray-100' };
      default:
        return { color: 'bg-gray-400', text: 'text-gray-700', bg: 'bg-gray-100' };
    }
  };

  const config = getStatusConfig();

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border border-gray-200 shadow-sm ${config.bg} ${config.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.color}`}></span>
      {status}
    </span>
  );
};

export default StatusBadge;
