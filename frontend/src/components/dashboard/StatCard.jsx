import React from 'react';

const StatCard = ({ title, value, icon: Icon, trend }) => {
  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-500">{title}</h3>
        {Icon && (
          <div className="p-2 bg-gray-50 rounded-md border border-gray-100">
            <Icon size={18} className="text-emerald-600" />
          </div>
        )}
      </div>
      <div className="flex items-baseline gap-2">
        <p className="text-3xl font-semibold text-gray-900">{value}</p>
        {trend && (
          <span className={`text-sm font-medium ${trend >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
            {trend > 0 ? '+' : ''}{trend}%
          </span>
        )}
      </div>
    </div>
  );
};

export default StatCard;
