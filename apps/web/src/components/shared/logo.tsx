import { cn } from "@/lib/utils";

export interface LogoProps {
  variant?: "default" | "minimal";
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeClasses = {
  sm: "text-lg",
  md: "text-xl",
  lg: "text-2xl",
} as const;

export function Logo({ variant = "default", size = "md", className }: LogoProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center font-bold tracking-tight text-foreground",
        sizeClasses[size],
        className
      )}
      aria-label="Tatame"
    >
      Tatame
    </span>
  );
}
