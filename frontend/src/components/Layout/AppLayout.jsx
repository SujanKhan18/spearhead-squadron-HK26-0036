import React, { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Menu, Bell, PhoneCall, AlertTriangle } from 'lucide-react';
import AppSidebar from '../Sidebar/AppSidebar';
import MobileBottomNav from './MobileBottomNav';
import { ROUTES } from '../../utils/constants';
import { useAuth } from '../../hooks/useAuth';

export default function AppLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();

  const getPageTitle = (pathname) => {
    switch (pathname) {
      case ROUTES.HOME:
        return 'SafeSphere Home';
      case ROUTES.DASHBOARD:
        return 'Command Dashboard';
      case ROUTES.MAP:
        return 'Live Safety Map';
      case ROUTES.SOS:
        return 'Emergency SOS Center';
      case ROUTES.GUARDIANS:
        return 'Guardian Safety Network';
      case ROUTES.ICCC:
        return 'ICCC Command Control';
      case ROUTES.WELLNESS:
        return 'Wellness & Helplines';
      case ROUTES.NEWS:
        return 'Safety Advisory & News';
      case ROUTES.SETTINGS:
        return 'Security Settings';
      default:
        return 'SafeSphere Platform';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-body">
      {/* Desktop & Mobile App Sidebar */}
      <AppSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col md:pl-72 transition-all duration-300">
        {/* Top Header Bar */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white/95 px-4 sm:px-6 lg:px-8 backdrop-blur-md">
          {/* Left: Mobile hamburger & Logo & Page Title */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-slate-900 md:hidden"
              aria-label="Open sidebar menu"
            >
              <Menu className="h-5 w-5" />
            </button>

            <Link to={ROUTES.HOME} className="flex items-center gap-2 md:hidden">
              <img src="/logo.png" alt="SafeSphere" className="h-9 w-9 object-contain rounded-xl" />
              <span className="font-headline font-bold text-slate-900 text-base">SafeSphere</span>
            </Link>

            <div className="hidden md:block">
              <h1 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
                {getPageTitle(location.pathname)}
              </h1>
              <div className="flex items-center gap-2 text-[11px] text-slate-500 font-medium">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>Multi-Signal AI Threat Guard Standing By</span>
              </div>
            </div>
          </div>

          {/* Right: Quick actions (Emergency 112, Notifications, User) */}
          <div className="flex items-center gap-2 sm:gap-3">
            <a
              href="tel:112"
              className="hidden sm:inline-flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-bold text-red-700 hover:bg-red-100 transition shadow-2xs"
            >
              <PhoneCall className="h-3.5 w-3.5 text-red-600" />
              <span>SOS 112</span>
            </a>

            <Link
              to={ROUTES.SOS}
              className="inline-flex items-center gap-1.5 rounded-xl bg-red-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-red-700 transition shadow-xs"
            >
              <AlertTriangle className="h-3.5 w-3.5" />
              <span className="hidden xs:inline">Emergency SOS</span>
            </Link>

            {isAuthenticated ? (
              <>
                <Link
                  to={ROUTES.SETTINGS}
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-blue-600 transition"
                  aria-label="Notifications"
                >
                  <Bell className="h-4 w-4" />
                </Link>

                <div className="hidden md:flex items-center gap-2.5 pl-2 border-l border-slate-200">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-xs font-bold text-white shadow-2xs">
                    {(user?.name || 'U').charAt(0).toUpperCase()}
                  </div>
                  <span className="text-xs font-semibold text-slate-800 hidden lg:inline">
                    {user?.name || 'User'}
                  </span>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                <Link
                  to={ROUTES.LOGIN}
                  className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                >
                  Sign In
                </Link>
                <Link
                  to={ROUTES.SIGNUP}
                  className="rounded-xl bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 transition shadow-2xs"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </header>

        {/* Page Children Content */}
        <main className="flex-1 pb-24 md:pb-8">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <MobileBottomNav />
    </div>
  );
}
