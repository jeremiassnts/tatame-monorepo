"use client";

import { useEffect } from "react";
import { trackScrollDepth } from "@/lib/analytics";

const DEPTHS = [25, 50, 75, 100] as const;

/**
 * Tracks scroll depth (25%, 50%, 75%, 100%) and sends one event per threshold.
 * Optional analytics for Phase 11 (§10.5).
 */
export function useScrollDepth() {
  useEffect(() => {
    const sent = new Set<number>();
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight <= 0) return;
      const pct = Math.round((scrollTop / docHeight) * 100);
      for (const depth of DEPTHS) {
        if (pct >= depth && !sent.has(depth)) {
          sent.add(depth);
          trackScrollDepth({ depth });
        }
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
}
