import React from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../utils/constants';
import { ArrowRight, Shield, Sparkles, TriangleAlert } from 'lucide-react';

export default function HeroSection() {
    return (
        <section className="page-shell gradient-hero min-h-screen overflow-hidden pt-6 md:pt-10">
            <div className="absolute inset-x-0 top-20 mx-auto h-72 w-72 rounded-full bg-[#3B82F6]/10 blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-[#DBEAFE]/10 blur-3xl pointer-events-none" />

            <div className="relative z-10 mx-auto grid min-h-screen max-w-7xl items-center gap-12 px-6 py-8 md:px-8 lg:grid-cols-12">
                <div className="space-y-8 lg:col-span-6">
                    <div className="premium-chip w-fit">
                        <Shield className="h-3.5 w-3.5 text-[#2563EB]" />
                        Women-first safety platform
                    </div>

                    <div className="space-y-5">
                        <h1 className="font-headline text-5xl font-semibold tracking-tight text-[#0F172A] md:text-7xl">
                            Calm control for every journey.
                        </h1>
                        <p className="max-w-2xl text-lg leading-relaxed text-[#64748B] md:text-xl">
                            Real-time safety mapping, instant SOS workflows, and a guardian network wrapped in a premium interface built for clarity under pressure.
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-4">
                        <Link to={ROUTES.SIGNUP} className="btn-primary">
                            Get started free
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-3">
                        {[
                            { value: '10k+', label: 'Women protected' },
                            { value: '98%', label: 'SOS response rate' },
                            { value: '30 sec', label: 'Average alert time' },
                        ].map((item) => (
                            <div key={item.label} className="premium-panel p-4">
                                <p className="font-headline text-2xl font-semibold text-[#0F172A]">{item.value}</p>
                                <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#64748B]">{item.label}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="lg:col-span-6">
                    <div className="relative mx-auto max-w-[640px]">
                        <div className="grid gap-4 lg:grid-cols-[1.12fr_.88fr]">
                            <div className="premium-panel-strong overflow-hidden p-4">
                                <div className="rounded-[26px] border border-[#E2E8F0] bg-[#F1F5F9] p-5">
                                    <div className="mb-4 flex items-center justify-between">
                                        <div>
                                            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#64748B]">Command center</p>
                                            <h2 className="mt-1 font-headline text-xl font-semibold text-[#0F172A]">Dashboard preview</h2>
                                        </div>
                                        <div className="premium-chip">
                                            <TriangleAlert className="h-3.5 w-3.5 text-[#C62828]" />
                                            Active
                                        </div>
                                    </div>

                                    <div className="overflow-hidden rounded-[24px] border border-[#E2E8F0] bg-white">
                                        <img
                                            alt="Premium safety dashboard preview"
                                            src="/hero-illustration.png"
                                            className="h-[420px] w-full object-cover object-center"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4 lg:pt-6">
                                <div className="rounded-[28px] border border-[#E2E8F0] bg-white p-5 shadow-xs">
                                    <div className="flex items-center justify-between">
                                        <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#64748B]">Live status</p>
                                        <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                                    </div>
                                    <p className="mt-3 text-xl font-semibold text-[#0F172A]">Protected route in progress</p>
                                    <p className="mt-3 text-sm leading-relaxed text-[#64748B]">Location sharing, guardian ping, and route monitoring are active.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
