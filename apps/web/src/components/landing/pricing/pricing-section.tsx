import { PRICING_PLANS } from "@/lib/constants/pricing";
import { SectionContainer } from "@/components/shared/section-container";
import { AnimateOnView } from "@/components/shared/animate-on-view";
import { PricingCard } from "./pricing-card";
import { cn } from "@/lib/utils";

export function PricingSection() {
  const freePlan = PRICING_PLANS.find((p) => p.id === "free")!;
  const standardPlan = PRICING_PLANS.find((p) => p.id === "standard")!;

  return (
    <SectionContainer
      id="pricing"
      paddingY="md"
      className="border-b border-border/40"
    >
      <AnimateOnView>
        <h2 className="mb-12 text-center text-4xl font-bold tracking-tight text-foreground md:mb-16">
          Escolha o plano ideal
        </h2>
      </AnimateOnView>
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 md:items-stretch md:gap-12">
        <div className={cn("order-2 md:order-1")}>
          <AnimateOnView delay={150}>
            <PricingCard plan={freePlan} />
          </AnimateOnView>
        </div>
        <div className={cn("order-1 md:order-2")}>
          <AnimateOnView delay={0}>
            <PricingCard plan={standardPlan} />
          </AnimateOnView>
        </div>
      </div>
    </SectionContainer>
  );
}
