import { BENEFITS } from "@/lib/constants/benefits";
import { SectionContainer } from "@/components/shared/section-container";
import { BenefitCard } from "./benefit-card";

export function BenefitsSection() {
  return (
    <SectionContainer
      id="benefits"
      paddingY="md"
      className="border-b border-border/40"
    >
      <h2 className="mb-16 text-4xl font-bold tracking-tight text-foreground">
        Benefícios
      </h2>
      <div className="flex flex-col gap-y-24">
        {BENEFITS.map((benefit, index) => (
          <BenefitCard key={benefit.id} benefit={benefit} index={index} />
        ))}
      </div>
    </SectionContainer>
  );
}
