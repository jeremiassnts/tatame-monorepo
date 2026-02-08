"use client";

import { useScrollDepth } from "@/lib/hooks/use-scroll-depth";

/**
 * Renders nothing; registers scroll depth tracking (25%, 50%, 75%, 100%) for GA4.
 */
export function ScrollDepthTracker() {
  useScrollDepth();
  return null;
}
