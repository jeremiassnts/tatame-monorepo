import { cn } from "@/lib/utils";
import type { AppScreenshotPlaceholderVariant } from "@/types/landing";
import Image from "next/image";

export type { AppScreenshotPlaceholderVariant };

export interface AppScreenshotPlaceholderProps {
  variant: AppScreenshotPlaceholderVariant;
  className?: string;
  showDevice?: boolean;
  imageSrc?: string;
}

const variantLabels: Record<AppScreenshotPlaceholderVariant, string> = {
  financial: "Financeiro",
  "student-list": "Lista de alunos",
  "class-schedule": "Grade de aulas",
  analytics: "Analytics",
};

/** Smartphone aspect ratio ~9:19.5 */
const aspectClass = "aspect-[9/19.5]";

export function AppScreenshotPlaceholder({
  variant,
  className,
  showDevice = false,
  imageSrc,
}: AppScreenshotPlaceholderProps) {
  const content = (
    <div
      className={cn(
        aspectClass,
        "w-full min-w-0 overflow-hidden rounded-xl bg-card border border-border flex flex-col",
        !showDevice && "rounded-2xl",
        className
      )}
    >
      <div className="flex-1 flex items-center justify-center p-6 text-center">
        <div className="space-y-2">
          <div className="h-3 w-3/4 mx-auto rounded bg-muted" />
          <div className="h-2 w-1/2 mx-auto rounded bg-muted/70" />
          <div className="h-2 w-2/3 mx-auto rounded bg-muted/50 mt-4" />
          <div className="h-2 w-full mx-auto rounded bg-muted/40" />
          <div className="h-2 w-5/6 mx-auto rounded bg-muted/40" />
          {imageSrc && <Image src={imageSrc} alt="App Screenshot" layout="fill" className="rounded-[2rem]" />}
          {!imageSrc && <p className="text-xs text-muted-foreground pt-4">
            {variantLabels[variant]}
          </p>}
        </div>
      </div>
    </div>
  );

  if (showDevice) {
    return (
      <div className="relative inline-flex justify-center">
        <div
          className={cn(
            "relative rounded-[2rem] p-2 border-2 border-border bg-muted/30",
            "shadow-lg"
          )}
          style={{ width: "min(280px, 90vw)" }}
        >
          <div className="rounded-[1.25rem] overflow-hidden bg-background">
            {content}
          </div>
          <div className="absolute top-4 left-1/2 -translate-x-1/2 w-16 h-5 rounded-full bg-muted-foreground/20" />
        </div>
      </div>
    );
  }

  return content;
}
