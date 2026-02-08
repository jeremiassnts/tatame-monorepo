import { PRICING_PLANS } from "@/lib/constants/pricing";
import { SectionContainer } from "@/components/shared/section-container";
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
      <h2 className="mb-12 text-center text-4xl font-bold tracking-tight text-foreground md:mb-16">
        Escolha o plano ideal
      </h2>
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 md:items-stretch md:gap-12">
        <div className={cn("order-2 md:order-1")}>
          <PricingCard plan={freePlan} />
        </div>
        <div className={cn("order-1 md:order-2")}>
          <PricingCard plan={standardPlan} />
        </div>
      </div>
    </SectionContainer>
  );
}
