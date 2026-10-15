import React from 'react';

export default function StatsCard({ title, value, icon, color = 'primary' }) {
  const colorMap = {
    primary: 'bg-[#3B82F6]/25 text-[#2563EB]',
    secondary: 'bg-[#DBEAFE]/30 text-[#0F172A]',
    accent: 'bg-[#94A3B8]/25 text-[#0F172A]',
    error: 'bg-[#C62828]/15 text-[#C62828]',
  };

  return (
    <div className="premium-panel flex items-start gap-4 p-5">
      <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${colorMap[color]}`}>
        <span className="material-symbols-outlined">{icon}</span>
      </div>
      <div>
        <p className="text-sm text-[#64748B]">{title}</p>
        <p className="mt-1 font-headline text-2xl font-semibold text-[#0F172A]">{value}</p>
      </div>
    </div>
  );
}
