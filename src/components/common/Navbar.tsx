import React from 'react';
import { PathfinderLogo } from './PathfinderLogo';
import { useAuth } from '../../context/AuthContext';
import { LogOut, LayoutDashboard, Shield, User } from 'lucide-react';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string, extra?: any) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, onNavigate }) => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-18">
          {/* Zone 1: Original Pathfinder Logo & Brand Wordmark */}
          <div
            onClick={() => onNavigate('landing')}
            className="flex items-center gap-3 cursor-pointer select-none shrink-0"
          >
            <PathfinderLogo size={42} />
            <div className="flex flex-col">
              <span className="text-xl font-extrabold tracking-tight text-[#0B2147] leading-tight">
                PATHFINDER
              </span>
              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest hidden sm:block">
                Learning Portal
              </span>
            </div>
          </div>

          {/* Zone 2: Navigation Links */}
          <nav className="flex items-center gap-6 text-sm font-semibold text-slate-600">
            <button
              onClick={() => onNavigate('landing')}
              className={`transition-colors whitespace-nowrap shrink-0 hover:text-[#0B2147] ${
                currentView === 'landing' ? 'text-[#0B2147] underline underline-offset-8 decoration-2 decoration-blue-600' : ''
              }`}
            >
              Home
            </button>
            {isAuthenticated && !isAdmin && (
              <button
                onClick={() => onNavigate('dashboard')}
                className={`transition-colors whitespace-nowrap shrink-0 hover:text-[#0B2147] ${
                  currentView === 'dashboard' ? 'text-[#0B2147] underline underline-offset-8 decoration-2 decoration-blue-600' : ''
                }`}
              >
                My Courses
              </button>
            )}
            {isAuthenticated && isAdmin && (
              <button
                onClick={() => onNavigate('admin')}
                className={`transition-colors whitespace-nowrap shrink-0 hover:text-[#0B2147] ${
                  currentView === 'admin' ? 'text-[#0B2147] underline underline-offset-8 decoration-2 decoration-blue-600' : ''
                }`}
              >
                Admin Panel
              </button>
            )}
          </nav>

          {/* Zone 3: Primary Action */}
          <div className="flex items-center gap-3 shrink-0">
            {isAuthenticated && user ? (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => onNavigate(isAdmin ? 'admin' : 'dashboard')}
                  className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 hover:bg-slate-50 transition-colors"
                >
                  <User className="w-3.5 h-3.5 text-blue-700" />
                  <span className="max-w-32 truncate">{user.name}</span>
                </button>
                <button
                  onClick={() => {
                    logout();
                    onNavigate('landing');
                  }}
                  className="px-3.5 py-1.5 rounded-xl border border-slate-200 hover:bg-rose-50 text-slate-600 hover:text-rose-700 text-xs font-semibold transition-colors flex items-center gap-1.5"
                  title="Sign Out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Sign Out</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => onNavigate('student-login')}
                className="px-5 py-2.5 text-xs font-bold text-white bg-[#0B2147] hover:bg-[#153463] rounded-xl transition-all shadow-xs hover:shadow-md whitespace-nowrap shrink-0"
              >
                Student Login
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
