"use client";

import type { Benefit } from "@/types/landing";
import { FeatureList } from "@/components/ui/feature-list";
import { BenefitVisual } from "./benefit-visual";
import { cn } from "@/lib/utils";

interface BenefitCardProps {
  benefit: Benefit;
  index: number;
}

export function BenefitCard({ benefit, index }: BenefitCardProps) {
  const isEven = index % 2 === 0;

  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-x-12 gap-y-8 md:grid-cols-2 md:items-center",
        !isEven && "md:[direction:rtl] md:[&>*]:[direction:ltr]"
      )}
    >
      <div className="flex flex-col gap-4">
        <h3 className="text-3xl font-semibold tracking-tight text-foreground">
          {benefit.title}
        </h3>
        <p className="text-lg text-muted-foreground">{benefit.description}</p>
        <FeatureList items={[...benefit.features]} size="md" />
      </div>
      <div>
        <BenefitVisual benefit={benefit} />
      </div>
    </div>
  );
}
