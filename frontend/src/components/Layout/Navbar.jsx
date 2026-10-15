import React, { useEffect, useState } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
    LayoutDashboard,
    Map as MapIcon,
    AlertTriangle,
    Users,
    Leaf,
    Newspaper,
    Menu,
    X,
    Bell,
    Settings,
    LogOut,
    Shield,
    Sparkles,
    Radio,
} from 'lucide-react';
import { ROUTES } from '../../utils/constants';
import { useAuth } from '../../hooks/useAuth';

const navLinks = [
    { name: 'Dashboard', path: ROUTES.DASHBOARD, icon: LayoutDashboard },
    { name: 'Map', path: ROUTES.MAP, icon: MapIcon },
    { name: 'SOS', path: ROUTES.SOS, icon: AlertTriangle },
    { name: 'Guardians', path: ROUTES.GUARDIANS, icon: Users },
    { name: 'ICCC Command', path: ROUTES.ICCC, icon: Radio },
    { name: 'Wellness', path: ROUTES.WELLNESS, icon: Leaf },
    { name: 'News', path: ROUTES.NEWS, icon: Newspaper },
];

export default function Navbar() {
    const [open, setOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const { isAuthenticated, user, logout } = useAuth();
    const location = useLocation();

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 10);
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    useEffect(() => {
        setOpen(false);
    }, [location.pathname]);

    return (
        <header
            className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
                scrolled ? 'bg-white/95 backdrop-blur-2xl border-b border-slate-200 shadow-sm' : 'bg-transparent'
            }`}
        >
            <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                <Link to={ROUTES.HOME} className="flex items-center gap-3 group">
                    <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-50 p-1 border border-slate-200 shadow-xs transition-transform group-hover:scale-105">
                        <img src="/logo.png" alt="SafeSphere Logo" className="h-full w-full object-contain rounded-xl" />
                    </div>
                    <div className="leading-tight">
                        <div className="font-headline text-lg font-bold tracking-tight text-slate-900">SafeSphere</div>
                        <div className="text-[10px] font-semibold uppercase tracking-[0.24em] text-blue-600">Guardian network</div>
                    </div>
                </Link>

                <nav className="hidden items-center gap-1 rounded-full border border-slate-200 bg-white/80 p-1.5 shadow-2xs lg:flex">
                    {navLinks.map(({ name, path, icon: Icon }) => (
                        <NavLink
                            key={path}
                            to={path}
                            className={({ isActive }) =>
                                `inline-flex items-center gap-2 rounded-full px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] transition-all duration-200 ${
                                    isActive
                                        ? 'bg-blue-600 text-white shadow-sm'
                                        : 'text-slate-600 hover:bg-slate-100 hover:text-blue-600'
                                }`
                            }
                        >
                            <Icon className="h-3.5 w-3.5" />
                            {name}
                        </NavLink>
                    ))}
                </nav>

                <div className="hidden items-center gap-3 lg:flex">
                    {isAuthenticated ? (
                        <>
                            <Link to={ROUTES.SETTINGS} className="rounded-2xl border border-slate-200 bg-white p-3 text-slate-600 transition hover:bg-slate-50 hover:text-blue-600 focus-ring" aria-label="Settings">
                                <Settings className="h-4 w-4" />
                            </Link>
                            <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-2 shadow-2xs">
                                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white shadow-xs">
                                    {(user?.name || 'U').charAt(0).toUpperCase()}
                                </div>
                                <div className="hidden xl:block text-left">
                                    <p className="text-xs font-bold text-slate-800">{user?.name || 'User'}</p>
                                    <p className="text-[10px] uppercase tracking-[0.2em] text-blue-600 font-semibold">Protected</p>
                                </div>
                            </div>
                            <button onClick={logout} className="btn-outlined py-2.5 px-4 text-xs font-bold">
                                <LogOut className="h-4 w-4 text-slate-500" />
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to={ROUTES.LOGIN} className="btn-outlined py-2.5 px-4 text-xs font-bold">Log in</Link>
                            <Link to={ROUTES.SIGNUP} className="btn-primary py-2.5 px-4 text-xs font-bold">
                                <Sparkles className="h-4 w-4" />
                                Get started
                            </Link>
                        </>
                    )}
                </div>

                <button
                    type="button"
                    onClick={() => setOpen((value) => !value)}
                    className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white p-3 text-slate-700 lg:hidden focus-ring"
                    aria-label="Toggle navigation"
                >
                    {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </button>
            </div>

            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, y: -12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -12 }}
                        transition={{ duration: 0.2 }}
                        className="border-t border-slate-200 bg-white/98 px-4 py-4 shadow-xl backdrop-blur-2xl lg:hidden"
                    >
                        <div className="mx-auto flex max-w-7xl flex-col gap-2">
                            {navLinks.map(({ name, path, icon: Icon }) => (
                                <NavLink
                                    key={path}
                                    to={path}
                                    className={({ isActive }) =>
                                        `flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition-all ${
                                            isActive ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-700 hover:bg-slate-50 hover:text-blue-600'
                                        }`
                                    }
                                >
                                    <Icon className="h-4 w-4" />
                                    {name}
                                </NavLink>
                            ))}
                            <div className="mt-2 grid gap-2 border-t border-slate-200 pt-3">
                                {!isAuthenticated ? (
                                    <>
                                        <Link to={ROUTES.LOGIN} className="btn-outlined justify-center">Log in</Link>
                                        <Link to={ROUTES.SIGNUP} className="btn-primary justify-center">Get started</Link>
                                    </>
                                ) : (
                                    <button onClick={logout} className="btn-danger justify-center">
                                        <LogOut className="h-4 w-4" />
                                        Logout
                                    </button>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
}
