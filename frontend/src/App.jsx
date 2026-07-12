import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { SignedIn, SignedOut, SignIn } from '@clerk/clerk-react';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import Drivers from './pages/Drivers';
import Vehicles from './pages/Vehicles';

function App() {
  return (
    <Routes>
      <Route 
        path="/" 
        element={
          <>
            <SignedIn>
              <Layout />
            </SignedIn>
            <SignedOut>
              <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <SignIn />
              </div>
            </SignedOut>
          </>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="drivers" element={<Drivers />} />
        <Route path="vehicles" element={<Vehicles />} />
        {/* Other routes will be filled by teammates later */}
      </Route>
    </Routes>
  );
}

export default App;
