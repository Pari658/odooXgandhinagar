import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { SignedIn, SignedOut, SignInButton } from "@clerk/clerk-react";

import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import Drivers from './pages/Drivers';
import Vehicles from './pages/Vehicles';
import Maintenance from './pages/Maintenance';
import Trips from './pages/Trips';
import FuelExpenses from './pages/FuelExpenses';
import Reports from './pages/Reports';

export default function App() {
  return (
    <>
      {/* 🔴 CASE 1: Terminal is Unauthenticated */}
      <SignedOut>
        <div style={{
          display: 'flex', 
          flexDirection: 'column', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh', 
          fontFamily: 'system-ui, sans-serif',
          background: '#022c22' // TransitOps branding emerald-950
        }}>
          <div style={{
            padding: '40px', 
            background: '#ffffff', 
            borderRadius: '8px', 
            border: '1px solid #e5e7eb',
            textAlign: 'center',
            maxWidth: '400px',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
          }}>
            <h1 style={{ margin: '0 0 10px 0', fontSize: '22px', color: '#111827', fontWeight: 600 }}>🚚 TransitOps Engine</h1>
            <p style={{ margin: '0 0 24px 0', color: '#6b7280', fontSize: '13px', lineHeight: '1.5' }}>
              Access Denied. Please authenticate your user credentials to access the fleet routing dashboards.
            </p>
            <SignInButton mode="modal">
              <button style={{ 
                padding: '10px 20px', 
                cursor: 'pointer', 
                background: '#059669', // TransitOps branding emerald-600
                color: '#fff', 
                border: 'none', 
                borderRadius: '6px', 
                fontWeight: '500',
                width: '100%',
                fontSize: '14px',
                transition: 'background 0.15s ease'
              }}>
                Sign In to Platform
              </button>
            </SignInButton>
          </div>
        </div>
      </SignedOut>

      {/* 🟢 CASE 2: Terminal Authenticated -> Enable Layout Routes */}
      <SignedIn>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="drivers" element={<Drivers />} />
            <Route path="vehicles" element={<Vehicles />} />
            <Route path="maintenance" element={<Maintenance />} />
            <Route path="trips" element={<Trips />} />
            <Route path="fuel" element={<FuelExpenses />} />
            <Route path="reports" element={<Reports />} />
            
            {/* Redirect unknown routes to Dashboard */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </SignedIn>
    </>
  );
}
