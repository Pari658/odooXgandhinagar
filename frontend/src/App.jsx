import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Drivers from './pages/Drivers.jsx';
import Vehicles from './pages/Vehicles.jsx';
import FuelExpenses from './pages/FuelExpenses.jsx';
import Reports from './pages/Reports.jsx';

const Placeholder = ({ title }) => (
  <div className="p-8">
    <div className="flex items-center space-x-2 text-sm text-gray-500 mb-2">
      <span>TransitOps</span>
      <span>/</span>
      <span>{title}</span>
    </div>
    <h1 className="text-2xl font-semibold tracking-tight text-gray-900">{title}</h1>
    <div className="mt-6 border border-dashed border-gray-200 rounded-lg p-12 text-center bg-gray-50/50">
      <p className="text-sm font-medium text-gray-900">Module under construction</p>
      <p className="mt-1 text-sm text-gray-500">The {title} dashboard is being integrated by another team.</p>
    </div>
  </div>
);

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        {/* Actual completed views */}
        <Route index element={<Dashboard />} />
        <Route path="drivers" element={<Drivers />} />
        <Route path="vehicles" element={<Vehicles />} />
        <Route path="fuel" element={<FuelExpenses />} />
        <Route path="reports" element={<Reports />} />

        {/* Placeholders for pending features */}
        <Route path="trips" element={<Placeholder title="Trips" />} />
        <Route path="maintenance" element={<Placeholder title="Maintenance" />} />

        {/* Redirect unknown routes to Dashboard */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
