"use client";

import { FOOTER_LINKS } from "@/lib/constants/footer";
import { Logo } from "@/components/shared/logo";
import { FooterLinksComponent } from "./footer-links";

const TAGLINE = "Gerencie sua academia com eficiência";
const COPYRIGHT = "© 2026 Tatame. Todos os direitos reservados.";

export function LandingFooter() {
  const { apps } = FOOTER_LINKS;

  return (
    <footer
      role="contentinfo"
      className="border-t border-border bg-card py-8 md:py-12"
    >
      <div className="container mx-auto px-4">
        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-2">
            <Logo size="lg" className="opacity-90" />
            <p className="max-w-sm text-sm text-muted-foreground">{TAGLINE}</p>
          </div>

          <FooterLinksComponent links={FOOTER_LINKS} />

          <div className="flex flex-wrap items-center gap-4">
            <a
              href={apps.appStore}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-background/50 px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted/50 hover:text-[#A376FF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A376FF]/50"
              aria-label="Baixar na App Store"
            >
              App Store
            </a>
            <a
              href={apps.playStore}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-background/50 px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted/50 hover:text-[#A376FF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A376FF]/50"
              aria-label="Baixar no Google Play"
            >
              Play Store
            </a>
          </div>

          <div className="border-t border-border pt-6">
            <p className="text-sm text-muted-foreground/60">{COPYRIGHT}</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
