import React from 'react';
import HeroSection from '../components/Landing/HeroSection';
import FeaturesSection from '../components/Landing/FeaturesSection';
import HowItWorksSection from '../components/Landing/HowItWorksSection';
import SafeEraFAQ from '../components/ui/faq-accordion';
import AppDownloadSection from '../components/Landing/AppDownloadSection';
import NewsletterSection from '../components/Landing/NewsletterSection';
import Footer from '../components/Common/Footer';

export default function Landing() {
    return (
        <div className="flex flex-col min-h-screen bg-slate-50">
            <HeroSection />
            <FeaturesSection />
            <HowItWorksSection />
            <SafeEraFAQ />
            <AppDownloadSection />
            <NewsletterSection />
            <Footer />
        </div>
    );
}
