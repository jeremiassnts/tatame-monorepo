import { BENEFITS } from "@/lib/constants/benefits";
import { SectionContainer } from "@/components/shared/section-container";
import { AnimateOnView } from "@/components/shared/animate-on-view";
import { BenefitCard } from "./benefit-card";

export function BenefitsSection() {
  return (
    <SectionContainer
      id="benefits"
      paddingY="md"
      className="border-b border-border/40"
    >
      <AnimateOnView>
        <h2 className="mb-16 text-4xl font-bold tracking-tight text-foreground">
          Benefícios
        </h2>
      </AnimateOnView>
      <div className="flex flex-col gap-y-24">
        {BENEFITS.map((benefit, index) => (
          <AnimateOnView key={benefit.id} delay={index * 100}>
            <BenefitCard benefit={benefit} index={index} />
          </AnimateOnView>
        ))}
      </div>
    </SectionContainer>
  );
}
