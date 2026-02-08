import { HeroSection } from "@/components/landing/hero/hero-section";
import { BenefitsSection } from "@/components/landing/benefits/benefits-section";
import { PricingSection } from "@/components/landing/pricing/pricing-section";
import { FAQSection } from "@/components/landing/faq/faq-section";
import { CTAFinalSection } from "@/components/landing/cta/cta-final-section";
import { LandingNavbar } from "@/components/landing/navbar/landing-navbar";
import { LandingFooter } from "@/components/landing/footer/landing-footer";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <LandingNavbar />

      <main>
        <HeroSection />

        <BenefitsSection />

        <PricingSection />

        <FAQSection />

        <CTAFinalSection />
      </main>

      <LandingFooter />
    </div>
  );
}
