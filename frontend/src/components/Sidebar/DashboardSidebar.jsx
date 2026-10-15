import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const links = [
    { name: 'Dashboard', path: '/dashboard', icon: 'dashboard' },
    { name: 'Safety Map', path: '/map', icon: 'map' },
    { name: 'SOS Alerts', path: '/sos', icon: 'emergency' },
    { name: 'Guardians', path: '/guardians', icon: 'group' },
    { name: 'Wellness', path: '/wellness', icon: 'self_improvement' },
    { name: 'Current Affairs', path: '/current-affairs', icon: 'newspaper' },
    { name: 'Settings', path: '/settings', icon: 'settings' },
];

export default function DashboardSidebar() {
    const location = useLocation();

    return (
        <aside className="hidden h-full w-72 shrink-0 border-r border-[#E2E8F0] bg-white/95 p-4 backdrop-blur-2xl md:block">
            <nav className="space-y-2">
                {links.map((link) => {
                    const active = location.pathname === link.path;
                    return (
                        <Link
                            key={link.path}
                            to={link.path}
                            className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-all ${
                                active ? 'bg-[#3B82F6]/30 text-[#0F172A] border border-[#3B82F6]/50 font-semibold shadow-sm' : 'text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#0F172A]'
                            }`}
                        >
                            <span className={`material-symbols-outlined ${active ? 'text-[#2563EB]' : 'text-[#3B82F6]'}`}>{link.icon}</span>
                            {link.name}
                        </Link>
                    );
                })}
            </nav>
        </aside>
    );
}
