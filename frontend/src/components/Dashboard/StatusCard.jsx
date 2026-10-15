import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, AlertTriangle, ArrowRight } from 'lucide-react';

export default function StatusCard({ isSafe = true }) {
  return (
    <div className={`premium-panel-strong p-6 md:p-8 ${isSafe ? 'border-slate-200 bg-white' : 'border-red-200 bg-red-50/70'}`}>
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-4">
          <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${isSafe ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-red-100 text-red-600 border border-red-200'}`}>
            {isSafe ? <ShieldCheck className="h-7 w-7" /> : <AlertTriangle className="h-7 w-7" />}
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-slate-500">
              {isSafe ? 'Protected State' : 'Emergency State'}
            </p>
            <h2 className="mt-1 font-headline text-2xl font-bold text-slate-900">
              {isSafe ? 'You are within a safe zone.' : 'SOS Alert Broadcast Active!'}
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">
              {isSafe
                ? 'Continuous multi-signal threat detection is enabled. Location updates and accelerometer monitors are standing by.'
                : 'Emergency beacons and live coordinates are transmitting to your guardian circle and the ICCC control room.'}
            </p>
          </div>
        </div>

        <Link
          to="/sos"
          className={`shrink-0 ${isSafe ? 'btn-primary' : 'btn-danger'}`}
        >
          {isSafe ? 'Emergency Center' : 'Review Active SOS'}
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
