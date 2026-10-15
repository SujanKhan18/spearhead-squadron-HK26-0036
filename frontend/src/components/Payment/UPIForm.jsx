import React from 'react';
import FormInput from '../Auth/FormInput';

export default function UPIForm() {
    return (
        <div className="space-y-4">
            <div className="rounded-[22px] border border-[#E2E8F0] bg-[#F1F5F9] p-5 text-center">
                <span className="material-symbols-outlined mb-2 text-4xl text-[#2563EB]">qr_code_2</span>
                <p className="text-sm text-[#64748B]">Scan QR or enter UPI ID below</p>
            </div>
            <FormInput id="upi" label="UPI ID" placeholder="name@upi" />
        </div>
    );
}
