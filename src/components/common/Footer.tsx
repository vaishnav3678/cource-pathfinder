import React from 'react';
import { PathfinderLogo } from './PathfinderLogo';
import { Lock } from 'lucide-react';

interface FooterProps {
  onNavigate: (view: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="bg-white border-t border-slate-200 mt-auto py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          {/* Logo & Tagline */}
          <div className="flex items-center gap-3">
            <PathfinderLogo size={32} />
            <span className="font-bold text-[#0B2147]">Pathfinder Learning Portal</span>
            <span aria-hidden="true" className="text-slate-300">·</span>
            <span className="text-[11px] text-slate-400">Learn • Build • Test • Deploy • Grow</span>
          </div>

          {/* Copyright & Discreet Admin Login Link */}
          <div className="flex items-center gap-6 text-xs">
            <span>© {new Date().getFullYear()} Pathfinder. All rights reserved.</span>

            {/* Small unobtrusive Admin Login link */}
            <button
              onClick={() => onNavigate('admin-login')}
              className="text-slate-400 hover:text-slate-700 transition-colors inline-flex items-center gap-1 text-[11px]"
              title="Administrator Sign In"
            >
              <Lock className="w-3 h-3 text-slate-400" />
              <span>Admin Access</span>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
