import { cn } from "@/lib/utils";
import Image from "next/image";

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
    <div className="flex items-center gap-3 justify-start">
      <Image src="/images/logo/logo.webp" alt="Tatame" width={22} height={22} />
      <span
        className={cn(
          "inline-flex items-center font-bold tracking-tight text-foreground",
          sizeClasses[size],
          className
        )}
        aria-label="Tatame"
      >
        TATAME
      </span>
    </div>
  );
}
