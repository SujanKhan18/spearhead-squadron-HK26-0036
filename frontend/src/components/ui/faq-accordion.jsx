import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Minus, Shield, MapPin, Bell, Lock, Users, CreditCard } from "lucide-react";
import { Link } from "react-router-dom";

const items = [
  { id: "1", icon: Shield, title: "Is SafeSphere free to use?", content: "Yes. The core safety experience remains free, including the map, SOS alerts, and a limited guardian set." },
  { id: "2", icon: Bell, title: "How does SOS work?", content: "A single tap sends your location and emergency state to the trusted network with no extra steps." },
  { id: "3", icon: Users, title: "What is the Guardian Network?", content: "It is a private list of trusted contacts who receive alerts and journey visibility when you need it." },
  { id: "4", icon: MapPin, title: "How accurate is the map?", content: "The map is built to surface verified points and nearby support locations with a clean, real-time presentation." },
  { id: "5", icon: Lock, title: "Is my data private?", content: "Yes. Location and identity data stay protected and only share when a user explicitly triggers a safety flow." },
  { id: "6", icon: CreditCard, title: "Can I cancel Premium anytime?", content: "Yes. Billing changes are handled through the existing flow and do not change any backend integration." },
];

export default function SafeEraFAQ() {
  const [openItem, setOpenItem] = useState(null);

  return (
    <section className="py-24">
      <div className="mx-auto max-w-4xl px-6 md:px-8">
        <div className="mb-12 text-center">
          <div className="premium-chip mx-auto w-fit">
            <Shield className="h-3.5 w-3.5 text-[#2563EB]" />
            Safety first
          </div>
          <h2 className="mt-4 font-headline text-3xl font-semibold text-[#0F172A] md:text-5xl">Frequently asked questions</h2>
          <p className="mx-auto mt-4 max-w-2xl text-[#64748B]">The redesigned information architecture keeps the important answers easy to scan.</p>
        </div>

        <div className="space-y-3">
          {items.map(({ id, icon: Icon, title, content }) => {
            const open = openItem === id;
            return (
              <div key={id} className="premium-panel overflow-hidden">
                <button
                  onClick={() => setOpenItem((current) => (current === id ? null : id))}
                  aria-expanded={open}
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left focus-ring"
                >
                  <div className="flex items-center gap-3">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-2xl border ${open ? 'border-[#2563EB] bg-[#F8FAFC] text-[#2563EB]' : 'border-[#E2E8F0] bg-[#F1F5F9] text-[#64748B]'}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <span className="font-semibold text-[#0F172A]">{title}</span>
                  </div>
                  <div className="relative h-5 w-5">
                    <Plus className={`absolute inset-0 transition-all ${open ? 'rotate-90 opacity-0' : 'rotate-0 opacity-100'} text-[#64748B]`} />
                    <Minus className={`absolute inset-0 transition-all ${open ? 'rotate-0 opacity-100' : '-rotate-90 opacity-0'} text-[#2563EB]`} />
                  </div>
                </button>

                <motion.div
                  initial={false}
                  animate={{ height: open ? 'auto' : 0, opacity: open ? 1 : 0 }}
                  transition={{ duration: 0.28 }}
                  style={{ overflow: 'hidden' }}
                >
                  <div className="border-t border-[#E2E8F0] px-5 py-4 text-sm leading-relaxed text-[#64748B]">
                    {content}
                  </div>
                </motion.div>
              </div>
            );
          })}
        </div>

        <p className="mt-8 text-center text-sm text-[#64748B]">
          Need more help? <Link to="/support" className="text-[#2563EB] underline-offset-4 hover:underline">Contact support</Link>
        </p>
      </div>
    </section>
  );
}
