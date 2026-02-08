"use client";

import { AppScreenshotPlaceholder } from "@/components/shared/app-screenshot-placeholder";

/** Hero uses financial variant as the main app preview. */
export function HeroVisual() {
  return (
    <div className="flex items-center justify-center">
      <AppScreenshotPlaceholder
        variant="financial"
        className="max-w-[280px] md:max-w-[320px]"
        showDevice
      />
    </div>
  );
}
