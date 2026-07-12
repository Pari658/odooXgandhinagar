import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ClerkProvider } from '@clerk/clerk-react';

import App from './App.jsx';
import './index.css'; // Preserves your global design tokens and styling rules

// 🔑 Retrieve the public cryptographic key from Vite environment configurations
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error("❌ Critical Configuration Error: Missing VITE_CLERK_PUBLISHABLE_KEY in frontend env variables!");
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* 🌍 1. Clerk Provider must sit at the absolute root to manage user states globally */}
    <ClerkProvider publishableKey={PUBLISHABLE_KEY} afterSignOutUrl="/">
      {/* 🧭 2. Browser Router wraps the app to provide navigation context to your teammate's routes */}
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ClerkProvider>
  </React.StrictMode>,
);