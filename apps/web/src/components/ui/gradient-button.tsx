"use client";

import type { ComponentProps } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface GradientButtonProps
  extends Omit<ComponentProps<typeof Button>, "variant"> {
  variant?: "primary" | "secondary";
}

const gradientVariants = {
  primary:
    "bg-gradient-to-br from-[#A376FF] to-[#8B5CF6] text-white shadow-[0_4px_14px_0_rgba(163,118,255,0.25)] transition-all duration-150 ease-out hover:-translate-y-px hover:shadow-[0_6px_20px_0_rgba(163,118,255,0.4)] focus-visible:ring-[#A376FF]/50 border-0",
  secondary:
    "border border-border bg-transparent text-foreground hover:bg-muted/50 transition-all duration-150",
} as const;

export function GradientButton({
  className,
  variant = "primary",
  ...props
}: GradientButtonProps) {
  return (
    <Button
      variant="default"
      className={cn(gradientVariants[variant], "rounded-lg font-semibold", className)}
      {...props}
    />
  );
}
