import React from 'react';

export default function PlaceCard({ poi }) {
    const getIcon = (type) => {
        switch (type) {
            case 'police': return 'shield';
            case 'hospital': return 'local_hospital';
            default: return 'home';
        }
    };

    const getColors = (type) => {
        switch (type) {
            case 'police': return 'bg-[#F8FAFC] text-[#2563EB]';
            case 'hospital': return 'bg-[#C62828]/15 text-[#C62828]';
            default: return 'bg-[#F8FAFC] text-[#2563EB]';
        }
    };

    return (
        <div className="rounded-[22px] border border-[#E2E8F0] bg-[#F1F5F9] p-4 transition hover:bg-white shadow-sm">
            <div className="flex items-center space-x-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${getColors(poi.type)}`}>
                    <span className="material-symbols-outlined">{getIcon(poi.type)}</span>
                </div>
                <div>
                    <h3 className="font-semibold text-sm text-[#0F172A] line-clamp-1">{poi.name}</h3>
                    <p className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-[#64748B]">{poi.type}</p>
                </div>
            </div>
        </div>
    );
}
