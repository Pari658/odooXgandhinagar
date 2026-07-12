import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAppAuth } from '../../context/AuthContext';
import { LayoutDashboard, Users, Truck, Wrench, Fuel, FileText, Navigation, LogOut, Shield } from 'lucide-react';

const Layout = () => {
  const location = useLocation();
  const { user, role, logout } = useAppAuth();

  const initials = user?.name
    ? user.name
        .split(' ')
        .map((part) => part.charAt(0))
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : '??';

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Drivers', path: '/dashboard/drivers', icon: Users },
    { name: 'Vehicles', path: '/dashboard/vehicles', icon: Truck },
    { name: 'Trips', path: '/dashboard/trips', icon: Navigation },
    { name: 'Maintenance', path: '/dashboard/maintenance', icon: Wrench },
    { name: 'Fuel', path: '/dashboard/fuel', icon: Fuel },
    { name: 'Reports', path: '/dashboard/reports', icon: FileText },
  ];

  if (role === 'Fleet Manager') {
    navItems.push({ name: 'User Admin', path: '/dashboard/admin/users', icon: Shield });
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
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
            const isActive = location.pathname === item.path || (item.path !== '/dashboard' && location.pathname.startsWith(item.path));

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

        <div className="p-4 border-t border-emerald-900 space-y-3">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 rounded-full bg-emerald-800 flex items-center justify-center text-sm font-medium">
              {initials}
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-white">{user?.name || 'User'}</span>
              <span className="text-xs text-emerald-300">{role || 'Unknown Role'}</span>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-emerald-100 hover:bg-emerald-900/50 hover:text-white transition-colors"
            title="Sign out"
          >
            <LogOut size={18} className="text-emerald-400" />
            Sign Out
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <div className="min-h-full">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
