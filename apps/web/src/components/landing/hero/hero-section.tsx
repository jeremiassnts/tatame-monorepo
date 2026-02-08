import { HERO_CONTENT } from "@/lib/constants/hero";
import { SectionContainer } from "@/components/shared/section-container";
import { AnimateOnView } from "@/components/shared/animate-on-view";
import { HeroContent } from "./hero-content";
import { HeroVisual } from "./hero-visual";

export function HeroSection() {
  return (
    <SectionContainer id="hero" paddingY="md" className="border-b border-border/40">
      <div className="grid grid-cols-1 gap-12 md:grid-cols-2 md:items-center">
        <div className="order-2 md:order-1">
          <AnimateOnView delay={0}>
            <HeroContent content={HERO_CONTENT} />
          </AnimateOnView>
        </div>
        <div className="order-1 md:order-2">
          <AnimateOnView delay={300} direction="right">
            <HeroVisual />
          </AnimateOnView>
        </div>
      </div>
    </SectionContainer>
  );
}
