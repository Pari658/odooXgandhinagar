import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Truck, Wrench, Fuel, FileText } from 'lucide-react';

const Layout = () => {
  const location = useLocation();

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Drivers', path: '/drivers', icon: Users },
    { name: 'Vehicles', path: '/vehicles', icon: Truck },
    { name: 'Trips', path: '/trips', icon: Truck }, // Using truck for now
    { name: 'Maintenance', path: '/maintenance', icon: Wrench },
    { name: 'Fuel', path: '/fuel', icon: Fuel },
    { name: 'Reports', path: '/reports', icon: FileText },
  ];

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
      {/* Sidebar - Strictly emerald-950 as per design guidelines */}
      <aside className="w-64 bg-emerald-950 text-white flex flex-col hidden md:flex">
        <div className="p-6">
          <h1 className="text-xl font-semibold tracking-tight text-white flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-emerald-600 flex items-center justify-center">
              <Truck size={14} className="text-white" />
            </div>
            TransitOps
          </h1>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
            
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`
                  flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors
                  ${isActive 
                    ? 'bg-emerald-600 text-white' 
                    : 'text-emerald-100 hover:bg-emerald-900/50 hover:text-white'}
                `}
              >
                <Icon size={18} className={isActive ? 'text-white' : 'text-emerald-400'} />
                {item.name}
              </Link>
            );
          })}
        </nav>
        
        <div className="p-4 border-t border-emerald-900">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 rounded-full bg-emerald-800 flex items-center justify-center text-sm font-medium">
              FM
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-white">Fleet Manager</span>
              <span className="text-xs text-emerald-300">View Profile</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto">
        <div className="min-h-full">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
