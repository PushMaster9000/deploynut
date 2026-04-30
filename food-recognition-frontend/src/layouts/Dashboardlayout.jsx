import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate, Navigate } from 'react-router-dom'; 
import { LayoutDashboard, ScanLine, ChefHat, History, User, LogOut, Wand2, Users, UtensilsCrossed, Menu, X } from 'lucide-react';
import { useUser } from '../context/UserContext'; 

export default function DashboardLayout() {
  const navigate = useNavigate();
  const { user, logout } = useUser(); 
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  if (!user) {
      return <Navigate to="/login" replace />;
  }

  // Extra safety check so React doesn't crash on name parsing
  const initials = user?.name && user.name.length > 0 ? user.name[0].toUpperCase() : 'U';

  // CLEANED UP: The reusable template for links
  const NavItem = ({ to, icon: Icon, label, end = false }) => (
    <NavLink 
      to={to} 
      end={end} 
      onClick={() => setIsMobileMenuOpen(false)} // Close menu on click on mobile
      className={({ isActive }) => `
        flex items-center gap-3 px-4 py-3 rounded-xl transition-all mb-1 font-medium
        ${isActive 
          ? 'bg-brand-green/10 text-brand-green shadow-[inset_3px_0_0_0_#10b981]' 
          : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5'
        }
      `}
    >
      <Icon size={20} />
      <span>{label}</span>
    </NavLink>
  );

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-dark-bg text-gray-900 dark:text-white font-sans transition-colors duration-300">
      
      {/* MOBILE TOP BAR */}
      <div className="lg:hidden fixed top-0 w-full bg-white dark:bg-dark-bg border-b border-gray-200 dark:border-gray-800 z-50 flex items-center justify-between p-4">
        <div className="flex items-center gap-2">
           <div className="bg-brand-green p-1.5 rounded-lg">
             <ChefHat size={20} className="text-white" />
           </div>
           <span className="font-bold text-lg tracking-tight">NutriVision</span>
        </div>
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
        >
          {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* MOBILE OVERLAY */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden" 
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar (Desktop & Mobile Drawer) */}
      <aside className={`
        fixed h-full bg-white dark:bg-dark-bg z-50 flex-col p-6 transition-transform duration-300 w-64 border-r border-gray-200 dark:border-gray-800
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} 
        lg:translate-x-0 lg:flex
      `}>
        <div className="flex items-center gap-3 mb-10 px-2 hidden lg:flex">
           <div className="bg-brand-green p-1.5 rounded-lg">
             <ChefHat size={20} className="text-white" />
           </div>
           <span className="font-bold text-xl tracking-tight text-gray-900 dark:text-white">NutriVision</span>
        </div>

        {/* User Card */}
        <div className="flex items-center gap-3 mb-8 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-800 mt-12 lg:mt-0">
          <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center font-bold text-sm text-gray-500 overflow-hidden border border-gray-200 dark:border-gray-700 shrink-0">
            {user.photo ? (
                 <img src={user.photo} alt="User" className="w-full h-full object-cover" />
            ) : (
                 <span className="text-brand-green">{initials}</span>
            )}
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-bold truncate text-gray-900 dark:text-white">{user.name}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto">
          <NavItem to="/dashboard" icon={LayoutDashboard} label="Dashboard" end={true} />
          <NavItem to="/dashboard/scan" icon={ScanLine} label="Scan Image" />
          <NavItem to="/dashboard/generate-recipes" icon={Wand2} label="Generate Recipes" />
          <NavItem to="/dashboard/my-recipes" icon={UtensilsCrossed} label="My Recipes" />
          <NavItem to="/dashboard/community" icon={Users} label="Community" />
          <NavItem to="/dashboard/history" icon={History} label="Scan History" />
          <NavItem to="/dashboard/profile" icon={User} label="Profile" />
        </nav>

        <button 
          onClick={logout} 
          className="flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition mt-auto font-medium"
        >
          <LogOut size={20} /> Log Out
        </button>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 lg:ml-64 p-4 md:p-8 pt-20 lg:pt-8 bg-gray-50 dark:bg-dark-bg min-h-screen transition-colors duration-300 overflow-x-hidden">
        <Outlet />
      </main>
    </div>
  );
}