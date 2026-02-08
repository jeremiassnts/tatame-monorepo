"use client";

import { useState } from "react";
import { FAQ_ITEMS } from "@/lib/constants/faq";
import { SectionContainer } from "@/components/shared/section-container";
import { AnimateOnView } from "@/components/shared/animate-on-view";
import { FAQItem } from "./faq-item";

export function FAQSection() {
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <SectionContainer
      id="faq"
      paddingY="md"
      className="border-b border-border/40"
    >
      <AnimateOnView>
        <h2 className="mb-12 text-center text-4xl font-bold tracking-tight text-foreground">
          Perguntas Frequentes
        </h2>
      </AnimateOnView>
      <AnimateOnView delay={100}>
        <div className="mx-auto max-w-3xl space-y-3">
          {FAQ_ITEMS.map((item) => (
            <FAQItem
              key={item.id}
              item={item}
              isOpen={openId === item.id}
              onToggle={() =>
                setOpenId((prev) => (prev === item.id ? null : item.id))
              }
            />
          ))}
        </div>
      </AnimateOnView>
    </SectionContainer>
  );
}
