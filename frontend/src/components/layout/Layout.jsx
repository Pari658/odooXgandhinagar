import React from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Truck, 
  Users, 
  Milestone, 
  Fuel, 
  BarChart3 
} from 'lucide-react';

export default function Layout() {
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Vehicles', href: '/vehicles', icon: Truck },
    { name: 'Drivers', href: '/drivers', icon: Users },
    { name: 'Trips', href: '/trips', icon: Milestone },
    { name: 'Fuel & Expenses', href: '/fuel-expenses', icon: Fuel },
    { name: 'Reports & Analytics', href: '/reports', icon: BarChart3 },
  ];

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-white text-gray-900 font-sans">
      {/* Fixed Sidebar */}
      <aside className="w-[240px] flex-shrink-0 bg-[#022c22] text-white flex flex-col justify-between border-r border-[#022c22]">
        <div className="flex flex-col py-6">
          {/* Logo Brand Area */}
          <div className="px-6 mb-8 flex items-center space-x-2">
            <div className="w-8 h-8 rounded bg-[#059669] flex items-center justify-center font-bold text-white text-base">
              TO
            </div>
            <span className="font-semibold text-lg tracking-tight">TransitOps</span>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 px-4 space-y-1">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              const Icon = item.icon;

              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center px-4 py-2.5 rounded-md text-sm font-medium transition-colors duration-150 group space-x-3 ${
                    isActive
                      ? 'bg-emerald-900/60 text-white'
                      : 'text-emerald-100/80 hover:bg-emerald-900/30 hover:text-white'
                  }`}
                >
                  <Icon className={`w-4 h-4 stroke-[2] ${isActive ? 'text-emerald-400' : 'text-emerald-200/70 group-hover:text-white'}`} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer info in sidebar */}
        <div className="p-4 border-t border-emerald-900/40 text-xs text-emerald-200/50">
          TransitOps Fleet Engine v1.0
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-y-auto bg-white">
        <div className="p-6 md:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
