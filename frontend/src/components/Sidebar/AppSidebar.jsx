import React from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import {
  Home,
  LayoutDashboard,
  Map as MapIcon,
  AlertTriangle,
  Users,
  Radio,
  Leaf,
  Newspaper,
  Settings,
  LogOut,
  PhoneCall,
  X,
  Sparkles,
  ShieldCheck,
  Activity
} from 'lucide-react';
import { ROUTES } from '../../utils/constants';
import { useAuth } from '../../hooks/useAuth';

const navSections = [
  {
    title: 'Command & Monitoring',
    items: [
      { name: 'Home Overview', path: ROUTES.HOME, icon: Home },
      { name: 'Dashboard', path: ROUTES.DASHBOARD, icon: LayoutDashboard },
      { name: 'Live Safety Map', path: ROUTES.MAP, icon: MapIcon },
      { name: 'ICCC Control Room', path: ROUTES.ICCC, icon: Radio, badge: '112 Live', badgeColor: 'bg-blue-600' },
    ]
  },
  {
    title: 'Emergency & Protection',
    items: [
      { name: 'SOS Emergency', path: ROUTES.SOS, icon: AlertTriangle, badge: 'SOS', badgeColor: 'bg-red-600 animate-pulse' },
      { name: 'Guardian Network', path: ROUTES.GUARDIANS, icon: Users },
    ]
  },
  {
    title: 'Resources & Assistance',
    items: [
      { name: 'Wellness & Helplines', path: ROUTES.WELLNESS, icon: Leaf },
      { name: 'Safety Advisory & News', path: ROUTES.NEWS, icon: Newspaper },
    ]
  },
  {
    title: 'Account',
    items: [
      { name: 'Settings & Security', path: ROUTES.SETTINGS, icon: Settings },
    ]
  }
];

export default function AppSidebar({ isOpen, onClose }) {
  const location = useLocation();
  const { user, logout, isAuthenticated } = useAuth();

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs transition-opacity md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Main Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex w-72 flex-col border-r border-slate-200 bg-white transition-transform duration-300 ease-in-out md:translate-x-0 ${
          isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full md:shadow-none'
        }`}
      >
        {/* Brand Header with SafeSphere Logo */}
        <div className="flex h-20 items-center justify-between border-b border-slate-100 px-5">
          <Link to={ROUTES.HOME} className="flex items-center gap-3 group" onClick={onClose}>
            <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-50 p-1 border border-slate-200/80 shadow-xs transition-transform group-hover:scale-105">
              <img
                src="/logo.png"
                alt="SafeSphere Logo"
                className="h-full w-full object-contain rounded-xl"
              />
            </div>
            <div className="leading-tight">
              <div className="font-headline text-lg font-bold tracking-tight text-slate-900 flex items-center gap-1.5">
                SafeSphere
                <span className="flex h-2 w-2 rounded-full bg-blue-600"></span>
              </div>
              <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-600">
                Guardian Network
              </div>
            </div>
          </Link>

          {/* Mobile close button */}
          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700 md:hidden"
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Live System Indicator Badge */}
        <div className="px-5 pt-3.5 pb-2">
          <div className="flex items-center justify-between rounded-xl border border-blue-100 bg-blue-50/70 px-3 py-2 text-xs font-semibold text-blue-900">
            <span className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
              </span>
              Shield Active
            </span>
            <span className="text-[10px] uppercase tracking-wider text-blue-700 bg-white/80 px-2 py-0.5 rounded-md font-bold shadow-2xs">
              ERSS 112
            </span>
          </div>
        </div>

        {/* Navigation Sections */}
        <div className="flex-1 overflow-y-auto px-3.5 py-2 space-y-4">
          {navSections.map((section) => (
            <div key={section.title} className="space-y-1">
              <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                {section.title}
              </div>

              {section.items.map((item) => {
                const Icon = item.icon;

                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end={item.path === ROUTES.HOME}
                    onClick={onClose}
                    className={({ isActive: active }) =>
                      `group flex items-center justify-between rounded-xl px-3 py-2.5 text-xs font-medium transition-all ${
                        active
                          ? 'bg-blue-600 text-white font-bold shadow-sm shadow-blue-500/25'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      }`
                    }
                  >
                    {({ isActive: active }) => (
                      <>
                        <div className="flex items-center gap-3">
                          <Icon
                            className={`h-4 w-4 transition-colors ${
                              active ? 'text-white' : 'text-slate-400 group-hover:text-blue-600'
                            }`}
                          />
                          <span>{item.name}</span>
                        </div>

                        {item.badge && (
                          <span
                            className={`rounded-full px-2 py-0.5 text-[9px] font-bold text-white shadow-2xs ${
                              active ? 'bg-white/25 text-white' : item.badgeColor
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </>
                    )}
                  </NavLink>
                );
              })}
            </div>
          ))}
        </div>

        {/* Emergency SOS Quick Card */}
        <div className="p-3.5 border-t border-slate-100 bg-slate-50/40">
          <div className="rounded-2xl border border-red-200 bg-white p-3 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-600 text-white shadow-2xs">
                  <PhoneCall className="h-3.5 w-3.5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">National Helpline</p>
                  <p className="text-[10px] text-red-600 font-semibold">Toll-Free 24/7</p>
                </div>
              </div>
              <a
                href="tel:112"
                className="rounded-lg bg-red-600 px-2.5 py-1 text-xs font-bold text-white hover:bg-red-700 transition shadow-2xs"
              >
                112
              </a>
            </div>

            <Link
              to={ROUTES.SOS}
              onClick={onClose}
              className="mt-2.5 flex w-full items-center justify-center gap-1.5 rounded-xl bg-red-600 px-3 py-2 text-xs font-bold text-white shadow-xs hover:bg-red-700 transition"
            >
              <AlertTriangle className="h-3.5 w-3.5" />
              Instant SOS Mode
            </Link>
          </div>
        </div>

        {/* User Account / Footer */}
        <div className="border-t border-slate-100 bg-white p-3.5">
          {isAuthenticated ? (
            <div className="flex items-center justify-between gap-2.5">
              <Link
                to={ROUTES.SETTINGS}
                onClick={onClose}
                className="flex items-center gap-2.5 overflow-hidden group flex-1"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-xs font-bold text-white shadow-2xs">
                  {(user?.name || 'U').charAt(0).toUpperCase()}
                </div>
                <div className="truncate">
                  <p className="truncate text-xs font-bold text-slate-900 group-hover:text-blue-600 transition">
                    {user?.name || 'Protected User'}
                  </p>
                  <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                    {user?.plan === 'premium' ? '👑 Premium' : 'Free Shield'}
                  </p>
                </div>
              </Link>

              <button
                onClick={logout}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600 transition"
                title="Log out"
                aria-label="Log out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to={ROUTES.LOGIN}
                onClick={onClose}
                className="flex-1 rounded-xl border border-slate-200 bg-white py-2 text-center text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
              >
                Sign In
              </Link>
              <Link
                to={ROUTES.SIGNUP}
                onClick={onClose}
                className="flex-1 rounded-xl bg-blue-600 py-2 text-center text-xs font-semibold text-white hover:bg-blue-700 transition"
              >
                Join
              </Link>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
