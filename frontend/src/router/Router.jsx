import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';

// Layouts
import AppLayout from '../components/Layout/AppLayout';

// Pages
import Landing from '../pages/Landing';
import Login from '../pages/Login';
import Signup from '../pages/Signup';
import Dashboard from '../pages/Dashboard';
import SOS from '../pages/SOS';
import Map from '../pages/Map';
import GuardianNetwork from '../pages/GuardianNetworkPage';
import Wellness from '../pages/WellnessPage';
import News from '../pages/CurrentAffairsPage';
import Settings from '../pages/SettingsPage';
import ICCCDashboard from '../pages/ICCCDashboard';
import NotFound from '../pages/NotFound';

const PageTransition = ({ children }) => (
    <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className="h-full"
    >
        {children}
    </motion.div>
);

// Protected Route Component
const PrivateRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();

    if (loading) return (
        <div className="h-screen w-full flex items-center justify-center bg-slate-50 text-blue-600 font-headline italic animate-pulse text-2xl">
            Safeguarding...
        </div>
    );

    return isAuthenticated ? children : <Navigate to="/login" replace />;
};

export default function AppRouter() {
    return (
        <BrowserRouter>
            <AppRoutes />
        </BrowserRouter>
    );
}

function AppRoutes() {
    const location = useLocation();

    return (
        <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
                {/* Public Landing & Auth (Now using modern Sidebar AppLayout) */}
                <Route path="/" element={<AppLayout><PageTransition><Landing /></PageTransition></AppLayout>} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />

                {/* Protected Application Pages with Sidebar Layout */}
                <Route path="/dashboard" element={<PrivateRoute><AppLayout><PageTransition><Dashboard /></PageTransition></AppLayout></PrivateRoute>} />
                <Route path="/sos" element={<PrivateRoute><AppLayout><PageTransition><SOS /></PageTransition></AppLayout></PrivateRoute>} />
                <Route path="/map" element={<PrivateRoute><AppLayout><PageTransition><Map /></PageTransition></AppLayout></PrivateRoute>} />
                <Route path="/guardians" element={<PrivateRoute><AppLayout><PageTransition><GuardianNetwork /></PageTransition></AppLayout></PrivateRoute>} />
                <Route path="/wellness" element={<PrivateRoute><AppLayout><PageTransition><Wellness /></PageTransition></AppLayout></PrivateRoute>} />
                <Route path="/current-affairs" element={<PrivateRoute><AppLayout><PageTransition><News /></PageTransition></AppLayout></PrivateRoute>} />
                <Route path="/settings" element={<PrivateRoute><AppLayout><PageTransition><Settings /></PageTransition></AppLayout></PrivateRoute>} />
                <Route path="/iccc" element={<PrivateRoute><AppLayout><PageTransition><ICCCDashboard /></PageTransition></AppLayout></PrivateRoute>} />

                {/* 404 Fallback */}
                <Route path="*" element={<AppLayout><PageTransition><NotFound /></PageTransition></AppLayout>} />
            </Routes>
        </AnimatePresence>
    );
}
