import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Package, 
  FileText, 
  LogOut, 
  Menu, 
  X 
} from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { Badge } from './ui/Badge';

export const Layout: React.FC = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/customers', icon: Users, label: 'Customers' },
    { to: '/products', icon: Package, label: 'Products' },
    { to: '/challans', icon: FileText, label: 'Sales Challans' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 flex">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 w-64 glass-sidebar transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:flex lg:flex-col ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between p-6 h-20 border-b border-slate-800/50">
          <h1 className="text-xl font-bold text-gradient">Mini ERP + CRM</h1>
          <button 
            className="lg:hidden text-slate-400 hover:text-white"
            onClick={() => setIsSidebarOpen(false)}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setIsSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'bg-indigo-500/10 text-indigo-400'
                    : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                }`
              }
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800/50 bg-slate-900/20">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-indigo-500/20">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium text-slate-200 truncate">{user?.name}</p>
              <Badge color="blue" className="mt-1 text-[10px] uppercase">
                {user?.role}
              </Badge>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-2.5 text-sm font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Mobile Header */}
        <header className="lg:hidden h-16 border-b border-slate-800/50 bg-slate-950/80 backdrop-blur-md flex items-center justify-between px-4 z-30">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="text-slate-400 hover:text-white p-1"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-lg font-bold text-gradient">Mini ERP</h1>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
