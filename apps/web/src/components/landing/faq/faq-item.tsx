"use client";

import type { FAQItem as FAQItemType } from "@/types/landing";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface FAQItemProps {
  item: FAQItemType;
  isOpen: boolean;
  onToggle: () => void;
}

export function FAQItem({ item, isOpen, onToggle }: FAQItemProps) {
  const answerId = `faq-answer-${item.id}`;

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <button
        type="button"
        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left font-medium text-foreground transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A376FF]/50 focus-visible:ring-inset"
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-controls={answerId}
        id={`faq-question-${item.id}`}
      >
        <span>{item.question}</span>
        <ChevronRight
          className={cn(
            "size-5 shrink-0 text-muted-foreground transition-transform duration-200",
            isOpen && "rotate-90"
          )}
          aria-hidden
        />
      </button>
      <div
        id={answerId}
        role="region"
        aria-labelledby={`faq-question-${item.id}`}
        className={cn(
          "grid transition-[grid-template-rows] duration-300 ease-in-out",
          isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        )}
      >
        <div className="overflow-hidden">
          <p className="border-t border-border px-5 py-4 text-muted-foreground">
            {item.answer}
          </p>
        </div>
      </div>
    </div>
  );
}
