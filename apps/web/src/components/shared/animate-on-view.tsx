"use client";

import { cn } from "@/lib/utils";
import { useInView } from "@/lib/hooks/use-in-view";
import { useReducedMotion } from "@/lib/hooks/use-reduced-motion";

export interface AnimateOnViewProps {
  children: React.ReactNode;
  className?: string;
  /** Delay in ms before animation starts (for stagger effect) */
  delay?: number;
  /** Animation direction: 'up' fades in from below, 'right' from left */
  direction?: "up" | "right";
}

/**
 * Wraps content and animates fade-in + translate on viewport entry.
 * Respects prefers-reduced-motion (§9.2.6) by skipping animation.
 */
export function AnimateOnView({
  children,
  className,
  delay = 0,
  direction = "up",
}: AnimateOnViewProps) {
  const { ref, isInView } = useInView({ threshold: 0.1, triggerOnce: true });
  const prefersReducedMotion = useReducedMotion();

  const isVisible = isInView || prefersReducedMotion;

  const hiddenClasses =
    direction === "up"
      ? "opacity-0 translate-y-5"
      : "opacity-0 -translate-x-5";

  return (
    <div
      ref={ref as React.RefObject<HTMLDivElement>}
      className={cn(
        "transition-all duration-500 ease-out motion-reduce:duration-0",
        isVisible ? "opacity-100 translate-y-0 translate-x-0" : hiddenClasses,
        prefersReducedMotion && "opacity-100 translate-y-0 translate-x-0",
        className
      )}
      style={
        delay > 0 && !prefersReducedMotion
          ? { transitionDelay: isVisible ? `${delay}ms` : "0ms" }
          : undefined
      }
    >
      {children}
    </div>
  );
}
