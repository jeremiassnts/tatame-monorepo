import { HeroSection } from "@/components/landing/hero/hero-section";
import { BenefitsSection } from "@/components/landing/benefits/benefits-section";
import { LandingNavbar } from "@/components/landing/navbar/landing-navbar";
import { LandingFooter } from "@/components/landing/footer/landing-footer";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <LandingNavbar />

      <main>
        <HeroSection />

        <BenefitsSection />

        <section
          id="pricing"
          className="min-h-[30vh] border-b border-border/40 py-16 md:py-24"
          aria-label="Planos"
        >
          <div className="container mx-auto px-4">
            <p className="text-muted-foreground">Pricing (placeholder)</p>
          </div>
        </section>

        <section
          id="faq"
          className="min-h-[30vh] border-b border-border/40 py-16 md:py-24"
          aria-label="Perguntas frequentes"
        >
          <div className="container mx-auto px-4">
            <p className="text-muted-foreground">FAQ (placeholder)</p>
          </div>
        </section>

        <section
          id="cta-final"
          className="min-h-[30vh] py-16 md:py-24"
          aria-label="Chamada para ação"
        >
          <div className="container mx-auto px-4">
            <p className="text-muted-foreground">CTA Final (placeholder)</p>
          </div>
        </section>
      </main>

      <LandingFooter />
    </div>
  );
}
