import React from 'react';

export default function Reports() {
  return (
    <div>
      <div className="flex items-center space-x-2 text-sm text-gray-500 mb-2">
        <span>TransitOps</span>
        <span>/</span>
        <span>Reports & Analytics</span>
      </div>
      <h1 className="text-2xl font-semibold tracking-tight text-gray-900">Reports & Analytics</h1>
      <div className="mt-6 border border-dashed border-gray-200 rounded-lg p-12 text-center bg-gray-50/50">
        <p className="text-sm font-medium text-gray-900">Reports & Analytics Loading...</p>
        <p className="mt-1 text-sm text-gray-500">This module will be completed in the next phase.</p>
      </div>
    </div>
  );
}
