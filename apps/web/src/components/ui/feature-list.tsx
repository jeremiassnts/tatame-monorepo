import { Check } from "lucide-react";

import { cn } from "@/lib/utils";

export interface FeatureListProps {
  items: string[];
  iconColor?: string;
  size?: "sm" | "md";
  className?: string;
}

const iconSizeClasses = { sm: "size-4", md: "size-5" } as const;
const textSizeClasses = { sm: "text-sm", md: "text-base" } as const;
const gapClasses = { sm: "gap-2", md: "gap-3" } as const;

export function FeatureList({
  items,
  iconColor = "text-[#A376FF]",
  size = "md",
  className,
}: FeatureListProps) {
  return (
    <ul className={cn("space-y-3 list-none p-0 m-0", className)}>
      {items.map((item) => (
        <li key={item} className={cn("flex items-start", gapClasses[size])}>
          <Check className={cn("shrink-0 mt-0.5", iconSizeClasses[size], iconColor)} aria-hidden />
          <span className={textSizeClasses[size]}>{item}</span>
        </li>
      ))}
    </ul>
  );
}
