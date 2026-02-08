import { cn } from "@/lib/utils";

export interface SectionContainerProps {
  children: React.ReactNode;
  className?: string;
  containerSize?: "default" | "narrow" | "wide";
  paddingY?: "sm" | "md" | "lg";
  id?: string;
}

const containerSizeClasses = {
  narrow: "max-w-4xl",
  default: "max-w-7xl",
  wide: "max-w-[1440px]",
} as const;

const paddingYClasses = {
  sm: "py-12 md:py-16",
  md: "py-16 md:py-24",
  lg: "py-20 md:py-32",
} as const;

export function SectionContainer({
  children,
  className,
  containerSize = "default",
  paddingY = "md",
  id,
}: SectionContainerProps) {
  return (
    <section id={id} className={cn(paddingYClasses[paddingY], className)}>
      <div
        className={cn(
          "container mx-auto px-4 md:px-6 lg:px-8",
          containerSizeClasses[containerSize]
        )}
      >
        {children}
      </div>
    </section>
  );
}
