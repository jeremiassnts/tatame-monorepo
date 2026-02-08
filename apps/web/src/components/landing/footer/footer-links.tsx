"use client";

import type { FooterLinks } from "@/types/landing";
import { cn } from "@/lib/utils";

interface FooterLinksProps {
  links: FooterLinks;
  className?: string;
}

export function FooterLinksComponent({ links, className }: FooterLinksProps) {
  const linkClass =
    "text-muted-foreground text-sm transition-colors hover:text-[#A376FF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A376FF]/50 rounded";

  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-8 sm:grid-cols-3",
        className
      )}
    >
      <div>
        <h3 className="mb-3 text-sm font-semibold text-foreground">Produto</h3>
        <ul className="flex flex-col gap-2">
          {links.product.map((item) => (
            <li key={item.href}>
              <a href={item.href} className={linkClass}>
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
      <div>
        <h3 className="mb-3 text-sm font-semibold text-foreground">Legal</h3>
        <ul className="flex flex-col gap-2">
          {links.legal.map((item) => (
            <li key={item.href}>
              <a href={item.href} className={linkClass}>
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
      <div>
        <h3 className="mb-3 text-sm font-semibold text-foreground">Contato</h3>
        <p className="text-sm text-muted-foreground">
          <a
            href={`mailto:${links.contact.email}`}
            className={cn(linkClass, "inline-block")}
          >
            {links.contact.email}
          </a>
        </p>
      </div>
    </div>
  );
}
