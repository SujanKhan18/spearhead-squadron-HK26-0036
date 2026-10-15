import React from 'react';

export default function SecurityBadges() {
    return (
        <div className="mt-8 grid gap-3 border-t border-[#E2E8F0] pt-6 sm:grid-cols-3">
            <div className="flex flex-col items-center rounded-2xl border border-[#E2E8F0] bg-[#F1F5F9] p-4 text-center">
                <span className="material-symbols-outlined mb-1 text-3xl text-[#2563EB]">lock</span>
                <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#64748B]">256-bit AES</span>
            </div>
            <div className="flex flex-col items-center rounded-2xl border border-[#E2E8F0] bg-[#F1F5F9] p-4 text-center">
                <span className="material-symbols-outlined mb-1 text-3xl text-[#2563EB]">verified_user</span>
                <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#64748B]">RBI compliant</span>
            </div>
            <div className="flex flex-col items-center rounded-2xl border border-[#E2E8F0] bg-[#F1F5F9] p-4 text-center">
                <span className="material-symbols-outlined mb-1 text-3xl text-[#2563EB]">credit_card</span>
                <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#64748B]">PCI-DSS Level 1</span>
            </div>
        </div>
    );
}
