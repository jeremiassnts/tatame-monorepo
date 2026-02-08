"use client";

import type { Benefit } from "@/types/landing";
import { AppScreenshotPlaceholder } from "@/components/shared/app-screenshot-placeholder";
import { cn } from "@/lib/utils";

interface BenefitVisualProps {
  benefit: Benefit;
  className?: string;
}

export function BenefitVisual({ benefit, className }: BenefitVisualProps) {
  return (
    <figure className={cn("flex justify-center", className)}>
      <AppScreenshotPlaceholder
        variant={benefit.imagePlaceholder}
        className="max-w-[260px] md:max-w-[280px]"
      />
      <figcaption className="sr-only">{benefit.imageAlt}</figcaption>
    </figure>
  );
}
