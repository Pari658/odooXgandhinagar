import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { SignedIn, SignedOut, SignInButton } from "@clerk/clerk-react";

import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import Drivers from './pages/Drivers';

function App() {
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
          background: '#f8fafc'
        }}>
          <div style={{
            padding: '40px', 
            background: '#ffffff', 
            borderRadius: '12px', 
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
            textAlign: 'center',
            maxWidth: '400px'
          }}>
            <h1 style={{ margin: '0 0 10px 0', fontSize: '24px', color: '#0f172a' }}>🚚 TransitOps Engine</h1>
            <p style={{ margin: '0 0 24px 0', color: '#64748b', fontSize: '14px', lineHeight: '1.5' }}>
              Access Denied. Please authenticate your terminal credentials to access the fleet routing dashboards.
            </p>
            <SignInButton mode="modal">
              <button style={{ 
                padding: '12px 24px', 
                cursor: 'pointer', 
                background: '#2563eb', 
                color: '#fff', 
                border: 'none', 
                borderRadius: '6px', 
                fontWeight: '600',
                width: '100%',
                fontSize: '15px'
              }}>
                Sign In to Platform
              </button>
            </SignInButton>
          </div>
        </div>
      </SignedOut>

      {/* 🟢 CASE 2: Terminal Authenticated -> Enable Teammate's Layout Routes */}
      <SignedIn>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="drivers" element={<Drivers />} />
            {/* Future teammate routes append dynamically here */}
          </Route>
        </Routes>
      </SignedIn>
    </>
  );
}

export default App;