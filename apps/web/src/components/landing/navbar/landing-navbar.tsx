"use client";

import { cn } from "@/lib/utils";
import { useScrollPosition } from "@/lib/hooks/use-scroll-position";

import { Logo } from "@/components/shared/logo";
import { NavbarCTA } from "./navbar-cta";

export function LandingNavbar() {
  const { isScrolled } = useScrollPosition();

  return (
    <header
      role="banner"
      className={cn(
        "sticky top-0 z-50 border-b transition-all duration-200",
        "h-14 md:h-16",
        isScrolled
          ? "border-border/40 bg-background/80 backdrop-blur-lg"
          : "border-transparent bg-transparent"
      )}
    >
      <nav
        className="container mx-auto flex h-full items-center justify-between px-4"
        aria-label="Principal"
      >
        <Logo size="md" />
        <NavbarCTA />
      </nav>
    </header>
  );
}
