import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { SignedIn, SignedOut, SignInButton } from "@clerk/clerk-react";

import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import Drivers from './pages/Drivers';
import Vehicles from './pages/Vehicles';
import Maintenance from './pages/Maintenance';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="drivers" element={<Drivers />} />
        {/* Other routes will be filled by teammates later */}
      </Route>
    </Routes>
  );
}

export default App;