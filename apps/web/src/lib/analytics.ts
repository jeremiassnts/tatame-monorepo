/**
 * Analytics helpers for GA4 (§10.5, Phase 11).
 * trackEvent is a no-op when GA is not loaded (e.g. NEXT_PUBLIC_GA_MEASUREMENT_ID unset).
 */

declare global {
  interface Window {
    gtag?: (
      command: "event" | "config" | "js",
      targetId: string,
      config?: Record<string, unknown>
    ) => void;
  }
}

export type CtaClickParams = {
  location: "navbar" | "hero" | "pricing" | "cta_final";
  plan?: "free" | "standard";
  label?: string;
};

export type ScrollDepthParams = {
  depth: 25 | 50 | 75 | 100;
};

/**
 * Send a custom event to GA4. Safe to call when gtag is not loaded (no-op).
 */
export function trackEvent(
  eventName: string,
  params?: Record<string, string | number | boolean | undefined>
): void {
  if (typeof window === "undefined" || !window.gtag) return;
  window.gtag("event", eventName, params as Record<string, unknown>);
}

/**
 * Track CTA click with location and optional plan. Use on all primary conversion buttons.
 */
export function trackCtaClick(params: CtaClickParams): void {
  trackEvent("cta_click", {
    location: params.location,
    ...(params.plan && { plan: params.plan }),
    ...(params.label && { label: params.label }),
  });
}

/**
 * Track scroll depth (25%, 50%, 75%, 100%). Call from a scroll listener or hook.
 */
export function trackScrollDepth(params: ScrollDepthParams): void {
  trackEvent("scroll_depth", { depth: params.depth });
}
