import { BenefitsSection } from "@/components/landing/benefits/benefits-section";
import { CTAFinalSection } from "@/components/landing/cta/cta-final-section";
import { FAQSection } from "@/components/landing/faq/faq-section";
import { LandingFooter } from "@/components/landing/footer/landing-footer";
import { HeroSection } from "@/components/landing/hero/hero-section";
import { LandingNavbar } from "@/components/landing/navbar/landing-navbar";
import { PricingSection } from "@/components/landing/pricing/pricing-section";
import { ScrollDepthTracker } from "@/components/landing/scroll-depth-tracker";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <ScrollDepthTracker />
      <a
        href="#main-content"
        className="sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:w-auto focus:h-auto focus:m-0 focus:overflow-visible focus:whitespace-normal focus:[clip:auto] focus:bg-primary focus:text-primary-foreground focus:rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
      >
        Pular para conteúdo principal
      </a>
      <LandingNavbar />
      <main id="main-content" role="main">
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
