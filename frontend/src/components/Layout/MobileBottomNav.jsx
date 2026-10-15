import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Map as MapIcon, ShieldAlert, Users, Settings } from 'lucide-react';

const items = [
    { path: '/dashboard', icon: Home, label: 'Home' },
    { path: '/map', icon: MapIcon, label: 'Map' },
    { path: '/sos', icon: ShieldAlert, label: 'SOS', center: true },
    { path: '/guardians', icon: Users, label: 'Guardians' },
    { path: '/settings', icon: Settings, label: 'Settings' },
];

export default function MobileBottomNav() {
    const location = useLocation();

    return (
        <nav className="fixed inset-x-0 bottom-3 z-50 mx-auto flex h-18 max-w-[96%] items-center justify-around rounded-[28px] border border-slate-200 bg-white/95 px-2 shadow-xl shadow-slate-900/5 backdrop-blur-2xl md:hidden">
            {items.map((item) => {
                const Icon = item.icon;
                const active = location.pathname === item.path;

                if (item.center) {
                    return (
                        <Link key={item.path} to={item.path} className="relative -mt-8 flex flex-col items-center">
                            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-600 text-white shadow-lg shadow-red-600/30 transition-transform hover:scale-105 active:scale-95">
                                <Icon className="h-6 w-6" />
                            </div>
                            <span className="mt-1 text-[10px] font-bold uppercase tracking-[0.22em] text-red-600">SOS</span>
                        </Link>
                    );
                }

                return (
                    <Link
                        key={item.path}
                        to={item.path}
                        className={`flex w-14 flex-col items-center gap-1 rounded-2xl py-2 transition-all ${
                            active ? 'text-blue-600 font-semibold' : 'text-slate-500 hover:text-slate-900'
                        }`}
                    >
                        <Icon className={`h-5 w-5 ${active ? 'text-blue-600' : ''}`} />
                        <span className={`text-[9px] uppercase tracking-[0.16em] ${active ? 'font-bold text-blue-600' : ''}`}>
                            {item.label}
                        </span>
                        <span className={`h-1 w-1 rounded-full bg-blue-600 transition-all ${active ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`} />
                    </Link>
                );
            })}
        </nav>
    );
}
