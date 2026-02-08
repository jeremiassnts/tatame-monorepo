export type AppScreenshotPlaceholderVariant =
  | "financial"
  | "student-list"
  | "class-schedule"
  | "analytics";

export interface HeroContent {
  headline: string;
  description: string;
  cta: {
    primary: string;
    secondary?: string;
  };
}

export interface Benefit {
  id: string;
  title: string;
  description: string;
  features: readonly string[];
  imagePlaceholder: AppScreenshotPlaceholderVariant;
  imageAlt: string;
}

export interface PricingPlan {
  id: string;
  name: string;
  tagline: string;
  price: number;
  currency: string;
  interval: string | null;
  features: readonly string[];
  cta: string;
  highlighted: boolean;
  badge: string | null;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

export interface FooterLinkItem {
  label: string;
  href: string;
}

export interface FooterLinks {
  product: readonly FooterLinkItem[];
  legal: readonly FooterLinkItem[];
  contact: {
    email: string;
  };
  apps: {
    appStore: string;
    playStore: string;
  };
}
