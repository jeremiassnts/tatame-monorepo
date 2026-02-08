"use client";

import type { HeroContent as HeroContentType } from "@/types/landing";
import { trackCtaClick } from "@/lib/analytics";

interface HeroContentProps {
  content: HeroContentType;
}

export function HeroContent({ content }: HeroContentProps) {
  return (
    <div className="flex flex-col justify-center gap-6">
      <h1 className="text-4xl font-bold tracking-tight text-foreground md:text-6xl">
        {content.headline}
      </h1>
      <p className="max-w-xl text-lg font-normal text-muted-foreground">
        {content.description}
      </p>
      <div className="flex flex-wrap items-center gap-4">
        <a
          href="#pricing"
          className="inline-flex h-12 items-center justify-center rounded-lg px-6 font-semibold text-white bg-gradient-to-br from-[#A376FF] to-[#8B5CF6] shadow-[0_4px_14px_0_rgba(163,118,255,0.25)] transition-all duration-150 ease-out hover:-translate-y-px hover:shadow-[0_6px_20px_0_rgba(163,118,255,0.4)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A376FF]/50"
          onClick={() => trackCtaClick({ location: "hero", plan: "standard" })}
        >
          {content.cta.primary}
        </a>
        {content.cta.secondary && (
          <a
            href="#pricing"
            className="inline-flex h-12 items-center justify-center rounded-lg border border-border bg-transparent px-6 font-semibold text-foreground transition-all duration-150 hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A376FF]/50"
            onClick={() => trackCtaClick({ location: "hero" })}
          >
            {content.cta.secondary}
          </a>
        )}
      </div>
    </div>
  );
}
