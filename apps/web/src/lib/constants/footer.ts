import type { FooterLinks } from "@/types/landing";

export const FOOTER_LINKS: FooterLinks = {
  product: [
    { label: "Planos", href: "#pricing" },
    { label: "FAQ", href: "#faq" },
  ],
  legal: [
    { label: "Termos de Uso", href: "/terms" },
    { label: "Política de Privacidade", href: "/privacy" },
  ],
  contact: {
    email: "contato@tatame.com.br",
  },
  apps: {
    appStore: "https://apps.apple.com/",
    playStore: "https://play.google.com/",
  },
} as const;
