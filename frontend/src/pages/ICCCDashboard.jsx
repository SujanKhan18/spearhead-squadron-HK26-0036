import React, { useState, useEffect } from 'react';
import { Shield, MapPin, AlertTriangle, Clock, CheckCircle2, Phone, Filter, Search, Eye, Radio, Lock, Key, Users, ArrowUpRight, Check, ShieldAlert, ExternalLink, MessageSquare, RefreshCw } from 'lucide-react';
import CustomMapContainer from '../components/Map/MapContainer';
import { API_BASE_URL } from '../utils/constants';
import io from 'socket.io-client';

export default function ICCCDashboard() {
  // Operator Access Control State
  const [passcode, setPasscode] = useState('');
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [authError, setAuthError] = useState(null);

  // Incidents Data State
  const [incidents, setIncidents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState('ALL'); // ALL, ACTIVE, HIGH_THREAT, RESPONDING, RESOLVED
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [operatorNote, setOperatorNote] = useState('');
  const [toastMessage, setToastMessage] = useState(null);

  // Initial Auth Check & Passcode verification
  const handleAuthorize = (inputPasscode) => {
    const code = inputPasscode || passcode;
    const validCodes = ['COMMAND112', 'OPERATOR2026', 'SAFEERA2026'];
    
    if (validCodes.includes(code.trim())) {
      setIsAuthorized(true);
      setAuthError(null);
      localStorage.setItem('iccc_passcode', code.trim());
      fetchIncidents(code.trim());
    } else {
      setAuthError('Invalid operator passcode. Try COMMAND112 or OPERATOR2026.');
    }
  };

  useEffect(() => {
    const savedCode = localStorage.getItem('iccc_passcode');
    if (savedCode) {
      handleAuthorize(savedCode);
    }
  }, []);

  // Fetch Incidents from Backend API
  const fetchIncidents = async (authCode) => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('authToken') || localStorage.getItem('token') || localStorage.getItem('accessToken');
      const res = await fetch(`${API_BASE_URL}/api/sos/iccc/incidents`, {
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
          'x-iccc-passcode': authCode || passcode || localStorage.getItem('iccc_passcode') || 'COMMAND112',
          'x-demo-operator': 'true'
        }
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.incidents)) {
        setIncidents(data.incidents);
      }
    } catch (err) {
      console.warn('Backend ICCC fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Setup Socket Connection for Real-Time Updates + 4-sec interval polling
  useEffect(() => {
    if (!isAuthorized) return;

    const token = localStorage.getItem('authToken') || localStorage.getItem('token') || localStorage.getItem('accessToken');
    const operatorCode = passcode || localStorage.getItem('iccc_passcode') || 'COMMAND112';

    const newSocket = io(API_BASE_URL || window.location.origin, {
      auth: { token, passcode: operatorCode },
      transports: ['websocket', 'polling']
    });

    newSocket.on('connect', () => {
      newSocket.emit('joinICCC', { passcode: operatorCode });
    });

    newSocket.on('iccc-new-incident', (newIncident) => {
      const formatted = {
        ...newIncident,
        _id: newIncident._id || newIncident.alertId,
        userId: newIncident.userId && typeof newIncident.userId === 'object'
          ? newIncident.userId
          : { name: newIncident.userName, phone: newIncident.userPhone, email: newIncident.userEmail }
      };

      setIncidents((prev) => {
        const exists = prev.some((inc) => inc._id === formatted._id);
        if (exists) {
          return prev.map((inc) => (inc._id === formatted._id ? { ...inc, ...formatted } : inc));
        }
        return [formatted, ...prev];
      });

      showToast(`🚨 NEW EMERGENCY ALERT: ${formatted.userId?.name || formatted.userName || 'Citizen'} (${formatted.triggerSource || 'SOS'})`);
    });

    newSocket.on('iccc-incident-updated', (updated) => {
      setIncidents((prev) =>
        prev.map((inc) => (inc._id === updated.alertId ? { ...inc, ...updated } : inc))
      );
    });

    // Auto-poll every 4 seconds as rock-solid backup
    const pollInterval = setInterval(() => {
      fetchIncidents(operatorCode);
    }, 4000);

    return () => {
      clearInterval(pollInterval);
      newSocket.disconnect();
    };
  }, [isAuthorized, passcode]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Direct 1-tap Status Update Handler with instant optimistic UI update
  const updateIncidentStatus = async (e, incidentId, newStatus) => {
    if (e) {
      if (e.preventDefault) e.preventDefault();
      if (e.stopPropagation) e.stopPropagation();
    }

    // 1. Instant optimistic UI update
    setIncidents((prev) =>
      prev.map((inc) =>
        inc._id === incidentId
          ? {
              ...inc,
              icccStatus: newStatus,
              status: newStatus === 'resolved' ? 'resolved' : inc.status,
              icccOperatorNote: operatorNote || inc.icccOperatorNote
            }
          : inc
      )
    );

    if (selectedIncident && selectedIncident._id === incidentId) {
      setSelectedIncident((prev) => ({
        ...prev,
        icccStatus: newStatus,
        status: newStatus === 'resolved' ? 'resolved' : prev.status,
        icccOperatorNote: operatorNote || prev.icccOperatorNote
      }));
    }

    showToast(`Incident Marked as ${newStatus.toUpperCase()}`);

    // 2. Asynchronous API sync to backend
    try {
      const token = localStorage.getItem('authToken') || localStorage.getItem('token') || localStorage.getItem('accessToken');
      await fetch(`${API_BASE_URL}/api/sos/iccc/incidents/${incidentId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
          'x-iccc-passcode': passcode || localStorage.getItem('iccc_passcode') || 'COMMAND112',
          'x-demo-operator': 'true'
        },
        body: JSON.stringify({ icccStatus: newStatus, note: operatorNote })
      });
    } catch (err) {
      console.warn('API sync error (optimistic state maintained):', err);
    }
  };

  // Map markers from real incidents
  const mapCenter = incidents.length > 0 && incidents[0].latitude && incidents[0].longitude
    ? [incidents[0].latitude, incidents[0].longitude]
    : [26.9425, 80.9269];

  const pois = incidents
    .filter((inc) => inc.latitude && inc.longitude)
    .map((inc) => ({
      id: inc._id,
      name: `${inc.userId?.name || inc.userName || 'Citizen'} (${inc.triggerSource || 'SOS'})`,
      lat: inc.latitude,
      lon: inc.longitude,
      type: inc.status === 'active' ? 'sos' : inc.icccStatus === 'responding' ? 'police' : 'hospital'
    }));

  // Filtering Logic
  const filteredIncidents = incidents.filter((inc) => {
    const victimName = inc.userId?.name || inc.userName || '';
    const msg = inc.message || '';
    const matchesSearch =
      victimName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      msg.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (activeFilter === 'ACTIVE') return inc.status === 'active' && inc.icccStatus !== 'resolved';
    if (activeFilter === 'HIGH_THREAT') return (inc.threatScore || 0) >= 75 || inc.triggerSource === 'threat_detection';
    if (activeFilter === 'RESPONDING') return inc.icccStatus === 'responding';
    if (activeFilter === 'RESOLVED') return inc.icccStatus === 'resolved' || inc.status === 'resolved';

    return true;
  });

  // Calculate Header Summary Stats
  const activeCount = incidents.filter((i) => i.status === 'active' && i.icccStatus !== 'resolved').length;
  const highThreatCount = incidents.filter((i) => (i.threatScore || 0) >= 75 && i.status === 'active').length;
  const respondingCount = incidents.filter((i) => i.icccStatus === 'responding').length;

  // Passcode Auth Gate
  if (!isAuthorized) {
    return (
      <div className="page-shell min-h-[85vh] flex items-center justify-center px-4 py-20">
        <div className="max-w-md w-full rounded-3xl border border-[#E2E8F0] bg-white p-8 text-center shadow-xl space-y-6">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE]">
            <Lock className="h-8 w-8" />
          </div>

          <div>
            <span className="px-3 py-1 rounded-full bg-[#EFF6FF] text-[#2563EB] text-[10px] font-bold uppercase tracking-wider border border-[#BFDBFE]">
              Authority Access Only
            </span>
            <h2 className="font-headline text-3xl font-extrabold text-[#0F172A] mt-2">
              ICCC Command Room
            </h2>
            <p className="text-xs text-[#64748B] mt-1">
              Restricted dashboard for Police Control Room 112 &amp; Emergency Dispatchers.
            </p>
          </div>

          {authError && (
            <div className="p-3 rounded-2xl bg-[#DC2626]/10 border border-[#DC2626]/30 text-[#DC2626] text-xs">
              {authError}
            </div>
          )}

          <div className="space-y-4 text-left">
            <label className="text-xs font-semibold uppercase tracking-wider text-[#0F172A]">
              Enter Operator Passcode
            </label>
            <div className="relative">
              <Key className="absolute left-4 top-3.5 h-4 w-4 text-[#64748B]" />
              <input
                type="password"
                placeholder="Passcode (e.g. COMMAND112)"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                className="w-full rounded-2xl border border-[#E2E8F0] bg-[#F1F5F9] pl-11 pr-4 py-3 text-sm text-[#0F172A] placeholder-[#94A3B8] focus:border-[#2563EB] focus:outline-none"
              />
            </div>

            <button
              onClick={() => handleAuthorize()}
              className="w-full btn-primary justify-center py-3.5 cursor-pointer"
            >
              Access Command Center
            </button>

            {/* Quick 1-tap Demo Login */}
            <div className="pt-2 border-t border-[#E2E8F0] space-y-2">
              <p className="text-[10px] text-[#64748B] uppercase font-bold tracking-wider text-center">
                Instant 1-Tap Demo Access
              </p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setPasscode('COMMAND112');
                    handleAuthorize('COMMAND112');
                  }}
                  className="py-2.5 px-3 rounded-xl bg-[#EFF6FF] hover:bg-[#DBEAFE] text-[#1E40AF] text-xs font-bold border border-[#BFDBFE] transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  🚨 112 Control Room
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPasscode('OPERATOR2026');
                    handleAuthorize('OPERATOR2026');
                  }}
                  className="py-2.5 px-3 rounded-xl bg-[#EFF6FF] hover:bg-[#DBEAFE] text-[#1E40AF] text-xs font-bold border border-[#BFDBFE] transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  👮 Police Dispatcher
                </button>
              </div>
            </div>
          </div>

          <p className="text-[11px] text-[#64748B] italic">
            Demo passcodes: <code className="text-[#2563EB] font-semibold">COMMAND112</code> or <code className="text-[#2563EB] font-semibold">OPERATOR2026</code>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-shell min-h-screen pt-28 pb-12 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full border border-[#E2E8F0] bg-white px-6 py-3.5 text-sm text-[#0F172A] shadow-2xl backdrop-blur-xl animate-in slide-in-from-bottom-4">
          <span className="inline-flex items-center gap-2 font-medium">
            <CheckCircle2 className="h-4 w-4 text-[#10B981]" />
            {toastMessage}
          </span>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-[#E2E8F0]">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#DC2626]/15 text-[#DC2626] border border-[#DC2626]/30">
              <Radio className="h-5 w-5 animate-pulse" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#DC2626]">
                LIVE AUTHORITY CONTROL ROOM
              </p>
              <h1 className="font-headline text-3xl font-extrabold text-[#0F172A] sm:text-4xl">
                ICCC Command Center
              </h1>
            </div>
          </div>
          <p className="text-xs text-[#64748B] mt-2 max-w-2xl">
            Real-time bird's-eye monitoring feed of all citizen emergency alerts, AI threat escalations, and dispatch management.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchIncidents()}
            disabled={isLoading}
            className="flex items-center gap-2 rounded-2xl bg-white border border-[#E2E8F0] px-4 py-2 text-xs font-semibold text-[#0F172A] hover:bg-[#F8FAFC] shadow-sm cursor-pointer"
          >
            <RefreshCw className={`h-3.5 w-3.5 text-[#2563EB] ${isLoading ? 'animate-spin' : ''}`} />
            Refresh Feed
          </button>
          <div className="flex items-center gap-2 rounded-2xl bg-[#10B981]/15 border border-[#10B981]/30 px-4 py-2 text-xs font-semibold text-[#10B981]">
            <span className="h-2 w-2 rounded-full bg-[#10B981] animate-ping" />
            Live WebSocket Stream Active
          </div>
        </div>
      </div>

      {/* Top Telemetry Metric Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card-premium bg-white border border-[#E2E8F0] shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">Active Alerts</p>
              <p className="mt-2 text-3xl font-extrabold font-mono text-[#DC2626]">{activeCount}</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#DC2626]/15 text-[#DC2626]">
              <AlertTriangle className="h-6 w-6" />
            </div>
          </div>
        </div>

        <div className="card-premium bg-white border border-[#E2E8F0] shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">High Threat Escalations</p>
              <p className="mt-2 text-3xl font-extrabold font-mono text-[#D97706]">{highThreatCount}</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#D97706]/15 text-[#D97706]">
              <ShieldAlert className="h-6 w-6" />
            </div>
          </div>
        </div>

        <div className="card-premium bg-white border border-[#E2E8F0] shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">PCR Units Dispatched</p>
              <p className="mt-2 text-3xl font-extrabold font-mono text-[#2563EB]">{respondingCount}</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#2563EB]/15 text-[#2563EB]">
              <Users className="h-6 w-6" />
            </div>
          </div>
        </div>

        <div className="card-premium bg-white border border-[#E2E8F0] shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">Total Incidents Logged</p>
              <p className="mt-2 text-3xl font-extrabold font-mono text-[#10B981]">{incidents.length}</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#10B981]/15 text-[#10B981]">
              <Clock className="h-6 w-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Map & Incident List */}
      <div className="grid gap-6 lg:grid-cols-[1.2fr_1.1fr]">
        {/* Reused Map Container */}
        <div className="card-premium overflow-hidden p-0 relative min-h-[460px] bg-white border border-[#E2E8F0] shadow-sm rounded-3xl">
          <div className="flex items-center justify-between border-b border-[#E2E8F0] px-6 py-4 bg-[#F1F5F9] z-10 relative">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">Live Geo-Location Feed</p>
              <h3 className="font-headline text-lg font-bold text-[#0F172A]">Bird's-Eye Incident Map</h3>
            </div>
            <span className="text-[11px] text-[#64748B] font-mono">{pois.length} incidents mapped</span>
          </div>

          <div className="h-[400px] relative">
            <CustomMapContainer location={mapCenter} pois={pois} />
          </div>
        </div>

        {/* Filters & Incident Stream */}
        <div className="space-y-4 flex flex-col">
          {/* Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-3 h-4 w-4 text-[#64748B]" />
              <input
                type="text"
                placeholder="Search citizen name or message..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-2xl border border-[#E2E8F0] bg-white pl-10 pr-4 py-2.5 text-xs text-[#0F172A] placeholder-[#94A3B8] focus:outline-none shadow-sm"
              />
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap gap-1.5">
            {['ALL', 'ACTIVE', 'HIGH_THREAT', 'RESPONDING', 'RESOLVED'].map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  activeFilter === filter
                    ? 'bg-[#2563EB] text-white shadow-sm'
                    : 'bg-white text-[#64748B] border border-[#E2E8F0] hover:bg-[#F8FAFC]'
                }`}
              >
                {filter.replace('_', ' ')}
              </button>
            ))}
          </div>

          {/* Incident Stream Cards */}
          <div className="space-y-3.5 max-h-[460px] overflow-y-auto pr-1">
            {filteredIncidents.length === 0 ? (
              <div className="p-12 text-center rounded-3xl border border-[#E2E8F0] bg-[#F8FAFC] text-[#64748B] text-xs space-y-2">
                <CheckCircle2 className="h-8 w-8 text-[#10B981] mx-auto opacity-60" />
                <p className="font-semibold text-sm text-[#0F172A]">All Clear — No Incidents in Current Filter</p>
                <p className="text-[11px]">When a citizen presses SOS or triggers threat detection, their alert will appear here in real-time.</p>
              </div>
            ) : (
              filteredIncidents.map((inc) => {
                const victimName = inc.userId?.name || inc.userName || 'Citizen Emergency';
                const victimPhone = inc.userId?.phone || inc.userPhone || 'No contact';
                const isHighThreat = (inc.threatScore || 0) >= 75;

                return (
                  <div
                    key={inc._id}
                    onClick={() => setSelectedIncident(inc)}
                    className={`p-5 rounded-2xl border transition-all cursor-pointer space-y-3 shadow-sm ${
                      inc.status === 'active' && isHighThreat
                        ? 'border-[#DC2626]/50 bg-red-50/50 hover:bg-red-50'
                        : inc.status === 'active'
                        ? 'border-amber-300 bg-amber-50/40 hover:bg-amber-50/70'
                        : inc.icccStatus === 'responding'
                        ? 'border-blue-300 bg-blue-50/40 hover:bg-blue-50/70'
                        : 'border-[#E2E8F0] bg-white hover:bg-[#F8FAFC]'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-[#0F172A] text-sm">
                            {victimName}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                              inc.status === 'active'
                                ? 'bg-red-100 text-red-700 border border-red-300 animate-pulse'
                                : 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {inc.status || 'Active'}
                          </span>
                          <span className="text-[9px] px-2 py-0.5 rounded-full bg-[#EFF6FF] text-[#2563EB] font-bold uppercase">
                            {inc.triggerSource?.replace('_', ' ') || 'SOS'}
                          </span>
                        </div>
                        <p className="text-xs text-[#64748B] mt-1 line-clamp-1">{inc.message}</p>
                      </div>

                      <div className="text-right shrink-0">
                        <span
                          className={`font-mono text-sm font-extrabold px-2 py-1 rounded-lg ${
                            isHighThreat
                              ? 'bg-red-100 text-red-700 border border-red-300'
                              : 'bg-[#EFF6FF] text-[#2563EB]'
                          }`}
                        >
                          {inc.threatScore || 0}%
                        </span>
                        <p className="text-[10px] text-[#64748B] font-mono mt-1">
                          {inc.createdAt ? new Date(inc.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                        </p>
                      </div>
                    </div>

                    {/* Incident Action Buttons */}
                    <div className="pt-3 border-t border-[#E2E8F0] flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 text-[11px] text-[#64748B]">
                        <Phone className="h-3.5 w-3.5 text-[#2563EB]" />
                        <span>{victimPhone}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={(e) => updateIncidentStatus(e, inc._id, 'responding')}
                          className={`px-3 py-1.5 rounded-xl text-[10px] font-extrabold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer shadow-sm ${
                            inc.icccStatus === 'responding'
                              ? 'bg-blue-600 text-white'
                              : 'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200'
                          }`}
                        >
                          <Users className="h-3 w-3" />
                          {inc.icccStatus === 'responding' ? 'Responding ✓' : 'Dispatch PCR'}
                        </button>

                        <button
                          type="button"
                          onClick={(e) => updateIncidentStatus(e, inc._id, 'resolved')}
                          className={`px-3 py-1.5 rounded-xl text-[10px] font-extrabold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer shadow-sm ${
                            inc.icccStatus === 'resolved' || inc.status === 'resolved'
                              ? 'bg-green-600 text-white'
                              : 'bg-green-50 text-green-700 hover:bg-green-100 border border-green-200'
                          }`}
                        >
                          <Check className="h-3 w-3" />
                          {inc.icccStatus === 'resolved' ? 'Resolved ✓' : 'Mark Resolved'}
                        </button>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedIncident(inc);
                          }}
                          className="p-1.5 rounded-xl bg-[#F8FAFC] text-[#0F172A] hover:bg-[#EFF6FF] border border-[#E2E8F0] cursor-pointer"
                          title="Inspect Signal Details"
                        >
                          <Eye className="h-3.5 w-3.5 text-[#2563EB]" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Inspect Incident Details Modal */}
      {selectedIncident && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-md">
          <div className="max-w-lg w-full rounded-3xl border border-[#E2E8F0] bg-white p-6 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-4">
              <div>
                <span className="px-2.5 py-0.5 rounded-full bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE] text-[10px] font-bold uppercase">
                  Incident ID: {selectedIncident._id}
                </span>
                <h3 className="font-headline text-2xl font-bold text-[#0F172A] mt-1">
                  {selectedIncident.userId?.name || selectedIncident.userName || 'Citizen Emergency Alert'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedIncident(null)}
                className="h-8 w-8 rounded-full bg-[#F1F5F9] flex items-center justify-center text-[#64748B] hover:text-[#0F172A] cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0]">
                <span className="text-[#64748B] block text-[10px] uppercase tracking-wider font-semibold">Trigger Mode</span>
                <p className="font-bold text-[#0F172A] mt-1 uppercase text-sm">{selectedIncident.triggerSource || 'SOS Button'}</p>
              </div>
              <div className="p-3.5 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0]">
                <span className="text-[#64748B] block text-[10px] uppercase tracking-wider font-semibold">Threat Risk Meter</span>
                <p className="font-extrabold text-[#2563EB] mt-1 font-mono text-sm">{selectedIncident.threatScore || 0}%</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-2 text-xs">
              <p className="font-bold text-[#0F172A]">Incident Information:</p>
              <div className="flex justify-between text-[#64748B]">
                <span>Status:</span>
                <span className="font-mono font-bold text-[#0F172A] uppercase">{selectedIncident.status || 'Active'}</span>
              </div>
              <div className="flex justify-between text-[#64748B]">
                <span>GPS Coordinates:</span>
                <span className="font-mono font-semibold text-[#0F172A]">{selectedIncident.latitude}, {selectedIncident.longitude}</span>
              </div>
              <div className="flex justify-between text-[#64748B]">
                <span>Logged At:</span>
                <span className="font-mono text-[#0F172A]">{selectedIncident.createdAt ? new Date(selectedIncident.createdAt).toLocaleString() : 'Recent'}</span>
              </div>
            </div>

            <div className="flex gap-2">
              {(selectedIncident.userId?.phone || selectedIncident.userPhone) && (
                <a
                  href={`tel:${selectedIncident.userId?.phone || selectedIncident.userPhone}`}
                  className="btn-secondary text-xs flex-1 justify-center py-2.5"
                >
                  <Phone className="h-3.5 w-3.5 text-[#10B981]" /> Call {selectedIncident.userId?.phone || selectedIncident.userPhone}
                </a>
              )}
              {selectedIncident.latitude && selectedIncident.longitude && (
                <a
                  href={`https://maps.google.com/?q=${selectedIncident.latitude},${selectedIncident.longitude}`}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-secondary text-xs flex-1 justify-center py-2.5"
                >
                  <ExternalLink className="h-3.5 w-3.5 text-[#2563EB]" /> Live GPS Map
                </a>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-[#0F172A]">Operator Response Note</label>
              <textarea
                rows={2}
                placeholder="Enter dispatch notes (e.g. PCR Unit 4 dispatched to location)..."
                value={operatorNote}
                onChange={(e) => setOperatorNote(e.target.value)}
                className="w-full rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-3 text-xs text-[#0F172A] focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={(e) => updateIncidentStatus(e, selectedIncident._id, 'responding')}
                className={`py-3.5 rounded-2xl text-xs font-extrabold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-all ${
                  selectedIncident.icccStatus === 'responding'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100'
                }`}
              >
                <Users className="h-4 w-4" /> {selectedIncident.icccStatus === 'responding' ? 'Status: Responding ✓' : 'Dispatch PCR'}
              </button>
              <button
                type="button"
                onClick={(e) => updateIncidentStatus(e, selectedIncident._id, 'resolved')}
                className={`py-3.5 rounded-2xl text-xs font-extrabold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-all ${
                  selectedIncident.icccStatus === 'resolved' || selectedIncident.status === 'resolved'
                    ? 'bg-green-600 text-white shadow-md'
                    : 'bg-green-50 text-green-700 border border-green-200 hover:bg-green-100'
                }`}
              >
                <Check className="h-4 w-4" /> {selectedIncident.icccStatus === 'resolved' ? 'Status: Resolved ✓' : 'Mark Resolved'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
