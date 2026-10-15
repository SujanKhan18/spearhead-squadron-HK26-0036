import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import UPIForm from '../components/Payment/UPIForm';
import CardForm from '../components/Payment/CardForm';
import SecurityBadges from '../components/Payment/SecurityBadges';
import Button from '../components/Common/Button';
import { ShieldCheck } from 'lucide-react';

export default function Payment() {
  const [method, setMethod] = useState('upi');
  const navigate = useNavigate();

  const handlePayment = (e) => {
    e.preventDefault();
    alert('Payment Successful!');
    navigate('/dashboard');
  };

  return (
    <div className="page-shell mx-auto flex min-h-screen max-w-5xl items-center px-4 py-10 sm:px-6 lg:px-8">
      <div className="premium-panel-strong w-full overflow-hidden">
        <div className="border-b border-[#E2E8F0] bg-[#F8FAFC] p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#2563EB]">Checkout</p>
              <h1 className="mt-2 font-headline text-3xl font-semibold text-[#0F172A]">Upgrade to Premium</h1>
            </div>
            <div className="premium-chip">
              <ShieldCheck className="h-3.5 w-3.5 text-[#2563EB]" />
              Secure payment
            </div>
          </div>
        </div>

        <div className="grid gap-0 lg:grid-cols-[1.1fr_.9fr]">
          <div className="border-b border-[#E2E8F0] p-6 lg:border-b-0 lg:border-r">
            <div className="rounded-[22px] border border-[#E2E8F0] bg-[#F1F5F9] p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-[#0F172A]">Premium Guardian Plan</p>
                  <p className="mt-1 text-sm text-[#64748B]">Billed monthly</p>
                </div>
                <p className="font-headline text-4xl font-semibold text-[#0F172A]">₹199</p>
              </div>
            </div>

            <div className="mt-6 flex gap-2 rounded-2xl border border-[#E2E8F0] bg-[#F1F5F9] p-1">
              {['upi', 'card'].map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setMethod(item)}
                  className={`flex-1 rounded-2xl px-4 py-3 text-sm font-semibold capitalize transition ${
                    method === item ? 'bg-[#2563EB] text-white shadow-sm' : 'text-[#64748B] hover:bg-white'
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>

            <form onSubmit={handlePayment} className="mt-6 space-y-6">
              {method === 'upi' ? <UPIForm /> : <CardForm />}
              <Button type="submit" variant="primary" className="w-full justify-center">
                Pay securely
              </Button>
            </form>
          </div>

          <div className="p-6">
            <div className="premium-panel h-full p-6">
              <h2 className="font-headline text-2xl font-semibold text-[#0F172A]">What you get</h2>
              <ul className="mt-6 space-y-4 text-sm text-[#64748B]">
                {[
                  'Live location sharing',
                  'Priority SOS routing',
                  'Unlimited guardians',
                  'Offline map access',
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-[#2563EB]">check_circle</span>
                    {item}
                  </li>
                ))}
              </ul>
              <SecurityBadges />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
