import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  LogOut, 
  Truck, 
  Users, 
  ShieldAlert, 
  Wrench, 
  Fuel, 
  TrendingUp, 
  MapPin 
} from 'lucide-react';

export default function Home() {
  const { user, logout } = useAppAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const features = [
    {
      title: "Vehicle Registry",
      desc: "Manage the complete fleet registry tracking registration numbers, odometers, acquisition costs, and real-time statuses (Available, On Trip, In Shop, Retired).",
      icon: Truck
    },
    {
      title: "Driver Management",
      desc: "Maintain profiles, license details, expiry tracking, safety scores, and duty statuses. Enforce compliance blockages on expired or suspended drivers.",
      icon: Users
    },
    {
      title: "Trip Dispatch Engine",
      desc: "Create and dispatch trips with automatic cargo capacity check and no double-booking triggers. Capture start and end odometer automatically.",
      icon: MapPin
    },
    {
      title: "Maintenance Logs",
      desc: "Automatically push vehicles into 'In Shop' status upon service logging, removing them from the dispatch pool until maintenance records are closed.",
      icon: Wrench
    },
    {
      title: "Fuel & Expense Tracking",
      desc: "Log liters consumed, fuel costs, and miscellaneous trip expenses like tolls. Compute total operational costs per vehicle dynamically.",
      icon: Fuel
    },
    {
      title: "Reports & Fleet ROI",
      desc: "Track critical KPIs like Fleet Utilization %, Fuel Efficiency (km/L), and Vehicle ROI metrics. Export analytical charts and tables to CSV.",
      icon: TrendingUp
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-between font-sans text-gray-900">
      {/* 🧭 Top Navigation Menu */}
      <header className="bg-[#022c22] text-white py-4 px-6 md:px-12 flex items-center justify-between border-b border-emerald-950 shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded bg-[#059669] flex items-center justify-center font-bold text-white text-base">
            TO
          </div>
          <span className="font-semibold text-lg tracking-tight">TransitOps</span>
        </div>

        <div className="flex items-center space-x-4">
          <span className="hidden sm:inline-block text-xs text-emerald-200/80 font-medium">
            Welcome, <strong className="text-white">{user?.name || 'User'}</strong> ({user?.role || 'Guest'})
          </span>

          
          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 px-3 py-1.5 text-xs font-medium text-emerald-100 hover:bg-emerald-900/50 hover:text-white rounded-md border border-emerald-800 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Logout</span>
          </button>
        </div>
      </header>

      {/* 🚀 Hero Section */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-12 md:py-16">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 mb-6">
            <span>Hackathon Submission</span>
            <span>•</span>
            <span>TransitOps Fleet Engine v1.0</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900 mb-6 leading-tight">
            Digitize & Enforce Your <br />
            <span className="text-emerald-600">Transport Operations</span> in Real-Time
          </h1>
          
          <p className="text-base text-gray-500 max-w-xl mx-auto leading-relaxed mb-8">
            TransitOps is a centralized, role-based fleet management platform that bridges spreadsheet logbooks and automated database state-machines. Maintain compliance, track costs, and maximize ROI in a unified dashboard.
          </p>

          <div className="flex justify-center">
            <button
              onClick={() => navigate('/dashboard')}
              className="px-6 py-3 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-md shadow-sm transition-colors"
            >
              Enter Dashboard Console
            </button>
          </div>
        </div>

        {/* 🛠️ Platform Capabilities Grid */}
        <div className="mb-16">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest text-center mb-8">
            Platform Capabilities & Core Modules
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feat) => {
              const Icon = feat.icon;
              return (
                <div key={feat.title} className="bg-white border border-gray-200 p-6 rounded-lg shadow-sm hover:border-emerald-300 transition-colors">
                  <div className="w-10 h-10 rounded bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-semibold text-gray-900 mb-2">{feat.title}</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">{feat.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* 🏢 Company Profile Section */}
        <div className="bg-white border border-gray-200 rounded-lg p-8 shadow-sm flex flex-col md:flex-row items-center gap-8">
          <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Automated Compliance and Safety First</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              TransitOps features real-time triggers to keep your operations compliant. Expired drivers are blocked from starting new dispatch runs, cargo loads are verified against max load capacities, and active maintenance runs are auto-monitored. Rest assured that all business state transitions are enforced at both the application and database level.
            </p>
          </div>
        </div>
      </main>

      {/* 🏷️ Footer */}
      <footer className="bg-white border-t border-gray-200 py-6 text-center text-xs text-gray-400">
        TransitOps Fleet Management Platform © 2026. Built with love for modern logistics operations.
      </footer>
    </div>
  );
}
