import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Map as MapIcon,
  AlertTriangle,
  Users,
  Radio,
  Leaf,
  Newspaper,
  Settings,
  Shield,
  LogOut,
  PhoneCall
} from 'lucide-react';
import { ROUTES } from '../utils/constants';
import { useAuth } from '../hooks/useAuth';

const navItems = [
  { name: 'Dashboard', path: ROUTES.DASHBOARD, icon: LayoutDashboard },
  { name: 'Safety Map', path: ROUTES.MAP, icon: MapIcon },
  { name: 'SOS Alerts', path: ROUTES.SOS, icon: AlertTriangle, badge: 'Active', badgeColor: 'bg-red-500' },
  { name: 'Guardian Network', path: ROUTES.GUARDIANS, icon: Users },
  { name: 'ICCC Command', path: ROUTES.ICCC, icon: Radio, badge: '112 Live', badgeColor: 'bg-blue-600' },
  { name: 'Wellness', path: ROUTES.WELLNESS, icon: Leaf },
  { name: 'News & Advisory', path: ROUTES.NEWS, icon: Newspaper },
  { name: 'Settings', path: ROUTES.SETTINGS, icon: Settings },
];

export default function Sidebar() {
  const location = useLocation();
  const { user, logout, isAuthenticated } = useAuth();

  return (
    <aside className="fixed left-0 top-0 z-40 hidden h-screen w-72 border-r border-slate-200 bg-white px-5 py-6 shadow-xs md:flex md:flex-col">
      {/* Brand Header */}
      <div className="mb-6 flex items-center gap-3 px-2">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-md shadow-blue-500/25">
          <Shield className="h-6 w-6" />
        </div>
        <div>
          <h2 className="font-headline text-lg font-bold text-slate-900">Safe-Era</h2>
          <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-blue-600">Guardian Network</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = location.pathname === item.path;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all ${
                active
                  ? 'bg-blue-600 text-white font-semibold shadow-sm shadow-blue-500/20'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`h-4 w-4 ${active ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.name}</span>
              </div>
              {item.badge && (
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold text-white ${active ? 'bg-white/20' : item.badgeColor}`}>
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Emergency Call Box */}
      <div className="mt-4 rounded-2xl border border-red-100 bg-red-50/70 p-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PhoneCall className="h-4 w-4 text-red-600" />
            <span className="text-xs font-bold text-red-900">Direct 112 Help</span>
          </div>
          <a href="tel:112" className="rounded-lg bg-red-600 px-2 py-1 text-xs font-bold text-white hover:bg-red-700 transition">
            Call
          </a>
        </div>
      </div>

      {/* Footer Profile */}
      {isAuthenticated && (
        <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-xs font-bold text-white shadow-2xs">
              {(user?.name || 'U').charAt(0).toUpperCase()}
            </div>
            <div className="truncate">
              <p className="truncate text-xs font-bold text-slate-800">{user?.name || 'User'}</p>
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Protected</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600 transition"
            title="Log out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      )}
    </aside>
  );
}
