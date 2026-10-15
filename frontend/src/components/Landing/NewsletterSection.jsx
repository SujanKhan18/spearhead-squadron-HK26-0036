import React, { useState } from 'react';

export default function NewsletterSection() {
    const [email, setEmail] = useState('');
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!email.trim()) return;
        setSubmitted(true);
        setEmail('');
    };

    return (
        <section className="py-24">
            <div className="mx-auto max-w-3xl px-6 text-center md:px-8">
                <div className="premium-panel-strong p-8 md:p-10">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#2563EB]">Updates</p>
                    <h2 className="mt-3 font-headline text-3xl font-semibold text-[#0F172A] md:text-4xl">Stay informed on product and safety updates</h2>
                    <p className="mx-auto mt-4 max-w-xl text-[#64748B]">
                        Get periodic product updates, safety guidance, and feature releases without clutter.
                    </p>

                    {submitted ? (
                        <div className="mt-8 rounded-2xl border border-[#10B981]/30 bg-[#10B981]/10 px-5 py-4 text-sm text-[#10B981] font-medium">
                            Subscribed successfully.
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-3 sm:flex-row">
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Enter your email"
                                className="premium-input flex-1"
                            />
                            <button className="btn-primary" type="submit">Subscribe</button>
                        </form>
                    )}
                </div>
            </div>
        </section>
    );
}
