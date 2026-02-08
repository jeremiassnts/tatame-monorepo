"use client";

import type { PricingPlan } from "@/types/landing";
import { FeatureList } from "@/components/ui/feature-list";
import { trackCtaClick } from "@/lib/analytics";
import { cn } from "@/lib/utils";
import { PricingBadge } from "./pricing-badge";

interface PricingCardProps {
  plan: PricingPlan;
  className?: string;
}

function formatPrice(price: number, currency: string): string {
  if (currency === "BRL") {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price);
  }
  return String(price);
}

export function PricingCard({ plan, className }: PricingCardProps) {
  return (
    <article
      className={cn(
        "relative flex flex-col rounded-xl border bg-card p-6 shadow-sm transition-transform md:p-8",
        plan.highlighted
          ? "z-10 border-2 border-[#A376FF] shadow-[0_0_30px_rgba(163,118,255,0.15)] md:scale-105"
          : "border-border"
      )}
    >
      {plan.badge && <PricingBadge />}
      <div className="flex flex-col gap-4">
        <div>
          <h3 className="text-xl font-semibold text-foreground md:text-2xl">
            {plan.name}
          </h3>
          <p className="text-sm text-muted-foreground">{plan.tagline}</p>
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            {formatPrice(plan.price, plan.currency)}
          </span>
          {plan.interval && (
            <span className="text-muted-foreground">/{plan.interval}</span>
          )}
        </div>
        <FeatureList items={[...plan.features]} size="sm" className="flex-1" />
        <a
          href="#pricing"
          className={cn(
            "mt-4 inline-flex h-11 items-center justify-center rounded-lg font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A376FF]/50",
            plan.highlighted
              ? "bg-gradient-to-br from-[#A376FF] to-[#8B5CF6] text-white shadow-[0_4px_14px_0_rgba(163,118,255,0.25)] hover:-translate-y-px hover:shadow-[0_6px_20px_0_rgba(163,118,255,0.4)]"
              : "border border-border bg-transparent text-foreground hover:bg-muted/50"
          )}
          onClick={() =>
            trackCtaClick({
              location: "pricing",
              plan: plan.id as "free" | "standard",
            })
          }
        >
          {plan.cta}
        </a>
      </div>
    </article>
  );
}
