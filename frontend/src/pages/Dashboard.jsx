import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowUpRight,
  Bell,
  CheckCircle2,
  Clock,
  Leaf,
  MapPin,
  Shield,
  TrendingUp,
  Users,
  AlertTriangle,
  PhoneCall,
  Activity,
  Mic,
  Navigation,
  Share2,
  ShieldAlert,
  Hospital,
  Flame
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import CustomMapContainer from '../components/Map/MapContainer';
import StatusCard from '../components/Dashboard/StatusCard';
import { ROUTES } from '../utils/constants';

const MetricCard = ({ label, value, subtext, icon: Icon, tone, badge }) => (
  <div className="card-premium relative overflow-hidden">
    <div className="flex items-start justify-between gap-3">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">{label}</p>
        <p className="mt-2 font-headline text-3xl font-bold text-slate-900 tracking-tight">{value}</p>
        {subtext && <p className="mt-1 text-xs text-slate-500 font-medium">{subtext}</p>}
      </div>
      <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${tone}`}>
        <Icon className="h-6 w-6" />
      </div>
    </div>
    {badge && (
      <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
        <span className="text-slate-500">{badge.text}</span>
        <span className="font-bold text-emerald-600 flex items-center gap-1">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
          {badge.status}
        </span>
      </div>
    )}
  </div>
);

export default function Dashboard() {
  const { user } = useAuth();
  const [isSafe, setIsSafe] = useState(true);
  const [mapLocation, setMapLocation] = useState([28.6139, 77.2090]);

  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => setMapLocation([position.coords.latitude, position.coords.longitude]),
        () => {
          fetch('https://ipwho.is/')
            .then(res => res.json())
            .then(data => {
              if (data && data.latitude && data.longitude) {
                setMapLocation([data.latitude, data.longitude]);
              }
            })
            .catch(() => void 0);
        },
        { enableHighAccuracy: true, timeout: 6000 }
      );
    }
  }, []);

  const emergencyHelplines = [
    { title: 'National Emergency', number: '112', desc: 'Police, Fire & Medical dispatch', icon: PhoneCall, color: 'bg-red-50 text-red-600 border-red-200' },
    { title: 'Women Helpline', number: '1091', desc: '24/7 dedicated women distress', icon: Shield, color: 'bg-blue-50 text-blue-600 border-blue-200' },
    { title: 'Cyber Crime', number: '1930', desc: 'Financial fraud & cyber stalking', icon: ShieldAlert, color: 'bg-amber-50 text-amber-600 border-amber-200' },
    { title: 'Ambulance', number: '108', desc: 'Direct emergency medical care', icon: Hospital, color: 'bg-emerald-50 text-emerald-600 border-emerald-200' },
  ];

  const recentEvents = [
    { title: 'Safe route completed', time: '2 hours ago', location: 'Banjara Hills, Hyderabad', tag: 'Normal' },
    { title: 'Safety check-in ping', time: 'Yesterday, 8:40 PM', location: 'Begumpet Metro', tag: 'Verified' },
    { title: 'Guardian circle sync', time: '2 days ago', location: 'Cloud Gateway', tag: 'System' },
  ];

  return (
    <div className="page-shell mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      {/* Top Banner & Quick Controls */}
      <div className="mb-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-xs flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700 border border-blue-100">
              <span className="h-2 w-2 rounded-full bg-blue-600 animate-pulse"></span>
              Live Shield Protection Active
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs text-slate-500 font-medium">India ERSS-112 Protocol</span>
          </div>

          <h1 className="font-headline text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Welcome back, {user?.name || 'Protected User'}
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            All AI threat sensors, audio distress detectors, and guardian sync channels are active.
          </p>
        </div>

        {/* Action Button Cluster */}
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <Link
            to={ROUTES.SOS}
            className="inline-flex items-center gap-2 rounded-2xl bg-red-600 px-5 py-3 text-sm font-bold text-white shadow-md shadow-red-600/25 hover:bg-red-700 transition"
          >
            <AlertTriangle className="h-4 w-4" />
            Instant SOS Mode
          </Link>

          <Link
            to={ROUTES.MAP}
            className="btn-outlined text-sm font-bold"
          >
            <Share2 className="h-4 w-4 text-slate-600" />
            Share Live Trip
          </Link>

          <button
            onClick={() => setIsSafe((v) => !v)}
            className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs font-bold text-slate-700 hover:bg-slate-100 transition"
          >
            {isSafe ? 'Demo: Trigger Alert' : 'Demo: Reset Safe'}
          </button>
        </div>
      </div>

      {/* Status Card Alert */}
      <div className="mb-8">
        <StatusCard isSafe={isSafe} />
      </div>

      {/* 4 Metric Cards Grid */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <MetricCard
          label="Days Protected"
          value="42"
          subtext="Consecutive safe journeys"
          icon={Shield}
          tone="bg-blue-50 text-blue-600 border border-blue-100"
          badge={{ text: 'Security Record', status: 'Optimal' }}
        />
        <MetricCard
          label="AI Threat Score"
          value="0 / 100"
          subtext="Motion, Audio & GPS steady"
          icon={Activity}
          tone="bg-emerald-50 text-emerald-600 border border-emerald-100"
          badge={{ text: 'Sensor Status', status: 'Calibrated' }}
        />
        <MetricCard
          label="Trusted Guardians"
          value="3"
          subtext="Direct SMS & Map access"
          icon={Users}
          tone="bg-sky-50 text-sky-600 border border-sky-100"
          badge={{ text: 'Circle Sync', status: 'Connected' }}
        />
        <MetricCard
          label="Nearby Havens"
          value="8"
          subtext="Police & 24/7 hospitals in 3km"
          icon={MapPin}
          tone="bg-indigo-50 text-indigo-600 border border-indigo-100"
          badge={{ text: 'Radius Scan', status: 'Mapped' }}
        />
      </div>

      {/* Main 2-Column Core Arrangement */}
      <div className="grid gap-8 lg:grid-cols-12">
        {/* Left Column (8 cols): Map + Helplines */}
        <div className="lg:col-span-8 space-y-8">
          {/* Live Safety Map */}
          <div className="card-premium overflow-hidden p-0">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white shadow-xs">
                  <Navigation className="h-4 w-4" />
                </div>
                <div>
                  <h2 className="font-headline text-lg font-bold text-slate-900">Live Safety Map</h2>
                  <p className="text-xs text-slate-500">Real-time GPS coordinate anchor with verified safe zones</p>
                </div>
              </div>
              <Link
                to={ROUTES.MAP}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 transition bg-blue-50 px-3 py-1.5 rounded-xl border border-blue-100"
              >
                Expand View <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="h-[420px] w-full">
              <CustomMapContainer location={mapLocation} pois={[]} />
            </div>
          </div>

          {/* National Helplines Grid */}
          <div className="card-premium">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="font-headline text-lg font-bold text-slate-900">Emergency Hotlines & Dispatch</h3>
                <p className="text-xs text-slate-500">One-tap direct dial to government and emergency dispatch centers</p>
              </div>
            </div>

            <div className="grid gap-3.5 sm:grid-cols-2">
              {emergencyHelplines.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.number}
                    className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50/60 p-4 transition hover:bg-slate-50 hover:border-slate-300"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border ${item.color}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900">{item.title}</p>
                        <p className="text-xs text-slate-500">{item.desc}</p>
                      </div>
                    </div>
                    <a
                      href={`tel:${item.number}`}
                      className="rounded-xl bg-slate-900 px-3 py-1.5 text-xs font-bold text-white hover:bg-blue-600 transition shadow-xs"
                    >
                      {item.number}
                    </a>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column (4 cols): AI Monitor + Activity Stream */}
        <div className="lg:col-span-4 space-y-8">
          {/* AI Threat Multi-Signal Monitor Card */}
          <div className="card-premium border-blue-100 bg-gradient-to-b from-blue-50/40 to-white">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white">
                  <Activity className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-headline text-base font-bold text-slate-900">AI Threat Monitor</h3>
                  <p className="text-[11px] text-slate-500">Autonomous multi-sensor watch</p>
                </div>
              </div>
              <span className="rounded-md bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                ACTIVE
              </span>
            </div>

            <div className="space-y-3.5">
              <div className="rounded-xl border border-slate-200/80 bg-white p-3">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                    <Mic className="h-3.5 w-3.5 text-blue-600" />
                    Audio Distress Gauge
                  </span>
                  <span className="font-bold text-slate-900">38 dB (Quiet)</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full w-[24%]" />
                </div>
              </div>

              <div className="rounded-xl border border-slate-200/80 bg-white p-3">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                    <Flame className="h-3.5 w-3.5 text-amber-500" />
                    Motion Jolt / Fall Sensor
                  </span>
                  <span className="font-bold text-emerald-600">Stable</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div className="bg-emerald-500 h-2 rounded-full w-[10%]" />
                </div>
              </div>

              <div className="rounded-xl border border-slate-200/80 bg-white p-3">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                    <Navigation className="h-3.5 w-3.5 text-indigo-600" />
                    GPS Corridor Tracking
                  </span>
                  <span className="font-bold text-emerald-600">On Track</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div className="bg-indigo-600 h-2 rounded-full w-[5%]" />
                </div>
              </div>
            </div>

            <Link
              to={ROUTES.SOS}
              className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-blue-50 py-2.5 text-xs font-bold text-blue-700 hover:bg-blue-100 transition border border-blue-200/60"
            >
              Configure Sensor Thresholds <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/* Recent Safety Activity Feed */}
          <div className="card-premium">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Clock className="h-4 w-4 text-blue-600" />
                <h3 className="font-headline text-base font-bold text-slate-900">Recent Activity</h3>
              </div>
              <span className="text-[11px] font-semibold text-slate-400">Live Sync</span>
            </div>

            <div className="space-y-3">
              {recentEvents.map((evt) => (
                <div key={evt.title} className="rounded-xl border border-slate-200 bg-slate-50/70 p-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-slate-900">{evt.title}</p>
                    <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                      {evt.tag}
                    </span>
                  </div>
                  <p className="mt-1 text-[11px] text-slate-500 font-medium">{evt.time}</p>
                  <div className="mt-2 inline-flex items-center gap-1 text-[11px] text-slate-600 font-medium">
                    <MapPin className="h-3 w-3 text-slate-400" />
                    {evt.location}
                  </div>
                </div>
              ))}
            </div>

            <Link
              to={ROUTES.GUARDIANS}
              className="btn-outlined mt-4 w-full justify-center text-xs font-bold"
            >
              Manage Guardian Circle
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
