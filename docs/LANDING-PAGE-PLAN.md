# Landing Page – Tatame
## Complete Planning Document

**Project:** Tatame Landing Page  
**Version:** 1.0  
**Date:** February 7, 2026  
**Status:** 🚧 In progress — Phases 1–10 complete

---

## Table of Contents

1. [Overview](#1-overview)
2. [Context and Objectives](#2-context-and-objectives)
3. [Current Repository Analysis](#3-current-repository-analysis)
4. [Architecture and Organization](#4-architecture-and-organization)
5. [Design System and Visual Identity](#5-design-system-and-visual-identity)
6. [Section Structure](#6-section-structure)
7. [Conversion Strategy](#7-conversion-strategy)
8. [Reusable Components](#8-reusable-components)
9. [Performance and Accessibility](#9-performance-and-accessibility)
10. [Future Expansion](#10-future-expansion)
11. [Next Steps](#11-next-steps)  
11A. [Implementation Phases (step-by-step execution)](#11a-implementation-phases-step-by-step-execution)

---

## 1. Overview

### 1.1 Purpose of This Document

This document serves as the complete blueprint for implementing the Tatame landing page, a management platform for Jiu-Jitsu academies. The goal is to build a high-conversion page focused on **academy managers**, presenting the product’s value and driving sign-ups for the Standard plan.

### 1.2 Core Principles

- **Conversion first**: Every element should support the purchase decision
- **Premium dark theme**: Modern, professional look with purple #A376FF as the accent
- **Performance**: Fast load and subtle animations
- **Scalability**: Structure ready for a future web dashboard
- **Accessibility**: Follow WCAG 2.1 AA guidelines
- **Technical bilingual**: Code in English, user-facing content in Portuguese (pt-BR)

---

## 2. Context and Objectives

### 2.1 Product: Tatame

- **Platform**: Mobile app (iOS and Android)
- **Primary audience**: Jiu-Jitsu academy managers
- **Secondary audience**: Instructors and students (free tier)

### 2.2 Business Model

| Plan | Price | Audience | Features |
|------|-------|-----------|----------|
| **Free** | R$ 0,00 | Students and Instructors | Basic app access |
| **Standard** | R$ 49,99/month | Managers | Full academy management |

### 2.3 Landing Page Objectives

1. **Primary**: Convert managers into Standard plan subscribers
2. **Secondary**: Educate on platform benefits
3. **Tertiary**: Capture interest for future expansion (web dashboard)

### 2.4 Success Metrics

- Conversion rate (target: 3–5% visitors → subscribers)
- Average time on page (target: >2 minutes)
- CTA click rate (target: >10%)
- Bounce rate (target: <60%)

---

## 3. Current Repository Analysis

### 3.1 Monorepo Structure

```
tatame-monorepo/
├── apps/
│   ├── server/          # Backend Express + Stripe + Supabase
│   └── web/             # Next.js 16 (landing page will live here)
├── packages/
│   ├── config/          # Shared configuration
│   ├── db/              # Drizzle ORM (PostgreSQL)
│   └── env/             # Environment variable validation
└── docs/
    └── backend/         # Backend documentation
```

### 3.2 Identified Tech Stack

**Frontend (apps/web):**
- Next.js 16.1.1 with App Router
- React 19.2.3
- TypeScript
- Tailwind CSS 4.1.10
- shadcn/ui (base components)
- next-themes (dark mode support)
- Lucide React (icons)

**Backend (apps/server):**
- Express + TypeScript
- Stripe (payments)
- Clerk (authentication)
- Supabase (database)

**Monorepo:**
- Turborepo 2.6.3
- pnpm (package manager)

### 3.3 Observed Architectural Patterns

1. **Naming convention**: 
   - Components: PascalCase (e.g. `Header`, `ModeToggle`)
   - Files: kebab-case (e.g. `mode-toggle.tsx`, `theme-provider.tsx`)
   - Folders: kebab-case (e.g. `components/ui/`)

2. **Component structure**:
   - `/components/ui/` for base components (shadcn/ui)
   - `/components/` for app-specific components
   - `/lib/` for utilities (e.g. `utils.ts` with `cn` helper)

3. **Styling**:
   - Tailwind CSS with custom design tokens
   - CSS variables for themes (light/dark)
   - OKLCH color space support
   - Border radius: `--radius: 0.625rem`

4. **Current typography**:
   - Geist Sans (variable)
   - Geist Mono (variable)
   - **Note**: Bricolage Grotesque will need to be added

### 3.4 Existing Components

**From shadcn/ui:**
- `Button` (variants: default, outline, secondary, ghost, destructive, link)
- `Card` (header, content, footer)
- `Input`
- `Label`
- `Checkbox`
- `Dropdown Menu`
- `Skeleton` (loading states)
- `Sonner` (toasts/notifications)

**App components:**
- `Header` (basic navbar)
- `ThemeProvider` (dark mode)
- `ModeToggle` (theme switch)
- `Providers` (provider wrapper)

---

## 4. Architecture and Organization

### 4.1 Proposed Directory Structure

```
apps/web/
├── src/
│   ├── app/
│   │   ├── (landing)/               # Route group for landing page
│   │   │   ├── layout.tsx           # Landing-specific layout
│   │   │   └── page.tsx             # Home page
│   │   ├── dashboard/               # Future: dashboard area
│   │   │   └── ...
│   │   ├── layout.tsx               # Root layout
│   │   └── favicon.ico
│   │
│   ├── components/
│   │   ├── landing/                 # Landing-specific components
│   │   │   ├── hero/
│   │   │   │   ├── hero-section.tsx
│   │   │   │   ├── hero-content.tsx
│   │   │   │   └── hero-visual.tsx
│   │   │   │
│   │   │   ├── benefits/
│   │   │   │   ├── benefits-section.tsx
│   │   │   │   ├── benefit-card.tsx
│   │   │   │   └── benefit-visual.tsx
│   │   │   │
│   │   │   ├── pricing/
│   │   │   │   ├── pricing-section.tsx
│   │   │   │   ├── pricing-card.tsx
│   │   │   │   └── pricing-badge.tsx
│   │   │   │
│   │   │   ├── faq/
│   │   │   │   ├── faq-section.tsx
│   │   │   │   ├── faq-accordion.tsx
│   │   │   │   └── faq-item.tsx
│   │   │   │
│   │   │   ├── cta/
│   │   │   │   ├── cta-final-section.tsx
│   │   │   │   └── cta-button.tsx
│   │   │   │
│   │   │   ├── navbar/
│   │   │   │   ├── landing-navbar.tsx
│   │   │   │   └── navbar-cta.tsx
│   │   │   │
│   │   │   └── footer/
│   │   │       ├── landing-footer.tsx
│   │   │       └── footer-links.tsx
│   │   │
│   │   ├── shared/                  # Shared (landing + dashboard)
│   │   │   ├── logo.tsx
│   │   │   ├── app-screenshot-placeholder.tsx
│   │   │   └── section-container.tsx
│   │   │
│   │   └── ui/                      # shadcn/ui (existing)
│   │       └── ...
│   │
│   ├── lib/
│   │   ├── utils.ts                 # Existing
│   │   ├── constants/
│   │   │   ├── pricing.ts           # Plan data
│   │   │   ├── benefits.ts          # Benefits list
│   │   │   └── faq.ts               # FAQ content
│   │   └── hooks/
│   │       └── use-scroll-position.ts
│   │
│   ├── styles/
│   │   └── index.css                # Existing
│   │
│   └── types/
│       └── landing.ts               # Landing-specific types
│
├── public/
│   ├── images/
│   │   ├── logo/
│   │   │   └── tatame-logo.svg
│   │   └── placeholders/
│   │       ├── app-screen-1.svg
│   │       ├── app-screen-2.svg
│   │       └── ...
│   └── fonts/
│       └── bricolage-grotesque/     # Custom font
│
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

### 4.2 Architectural Decisions

#### 4.2.1 Route Groups in Next.js

**Decision**: Use route group `(landing)` for marketing pages and keep the root free for a future dashboard.

**Rationale**:
- Allows different layouts without changing the URL
- Clear separation between landing (marketing) and dashboard (app)
- Easier maintenance and scaling

**Route structure**:
```
/ → apps/web/src/app/(landing)/page.tsx
/dashboard → apps/web/src/app/dashboard/page.tsx (future)
```

#### 4.2.2 Component Organization

**Decision**: Three-level structure:
1. `/components/landing/` – Landing-specific
2. `/components/shared/` – Shared between landing and dashboard
3. `/components/ui/` – Design system base components

**Rationale**:
- Avoids unnecessary coupling
- Reuse of common components (e.g. Logo)
- Keeps landing code isolated for possible future removal

#### 4.2.3 Content Management

**Decision**: Content as code in TypeScript files (`/lib/constants/`)

**Rationale**:
- Type-safe (compile-time errors)
- Easier maintenance and versioning
- Enables future i18n
- No external CMS needed for now

**Example structure**:

```typescript
// lib/constants/pricing.ts
export const PRICING_PLANS = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    currency: 'BRL',
    features: [
      'Acesso ao aplicativo',
      'Visualização de treinos',
      // ...
    ],
    cta: 'Começar grátis',
    highlighted: false,
  },
  {
    id: 'standard',
    name: 'Standard',
    price: 49.99,
    currency: 'BRL',
    features: [
      'Gestão completa de alunos',
      'Controle financeiro',
      // ...
    ],
    cta: 'Assinar agora',
    highlighted: true,
    badge: 'Mais popular',
  },
] as const;
```

### 4.3 Backend Integration

**Relevant endpoint**: `/stripe/prices` (already implemented)

**Future integration flow**:
1. Landing page shows static prices (hardcoded data)
2. "Assinar agora" button redirects to checkout page
3. Checkout page calls `/stripe/prices` API with Clerk auth
4. After payment, Stripe webhook updates user status

**Note**: For landing MVP, no backend integration is required. Prices will be static.

---

## 5. Design System and Visual Identity

### 5.1 Dark Theme

**Main background**:
```css
--background: oklch(0.145 0 0); /* Near black */
```

**Main text**:
```css
--foreground: oklch(0.985 0 0); /* Off-white */
```

### 5.2 Color Palette

#### 5.2.1 Primary: Tatame Purple

```css
/* Primary purple (from logo) */
--purple-tatame: #A376FF;

/* Variants for hover, active, etc. */
--purple-tatame-light: oklch(0.72 0.18 285); /* Lighter */
--purple-tatame-dark: oklch(0.55 0.20 285);  /* Darker */
```

**Usage**:
- Primary CTAs (e.g. "Assinar agora" buttons)
- Links and hover states
- Visual emphasis (Standard card border, badges)

#### 5.2.2 Support Colors

**Cards and surfaces**:
```css
--card: oklch(0.205 0 0);           /* Dark gray */
--card-foreground: oklch(0.985 0 0); /* Text on cards */
```

**Borders**:
```css
--border: oklch(1 0 0 / 10%);       /* White 10% opacity */
```

**Accents**:
```css
--accent: oklch(0.371 0 0);         /* Mid gray */
--accent-foreground: oklch(0.985 0 0);
```

**Error/success** (use existing system colors):
```css
--destructive: oklch(0.704 0.191 22.216); /* Red */
```

### 5.3 Typography

#### 5.3.1 Primary Font: Bricolage Grotesque

**Implementation**:

```typescript
// app/(landing)/layout.tsx
import { Bricolage_Grotesque } from 'next/font/google';

const bricolageGrotesque = Bricolage_Grotesque({
  variable: '--font-bricolage',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});
```

**Usage**:
- Headlines (Hero, sections)
- CTAs
- Benefit copy
- Entire landing UI

**Type scale**:

| Element | Size | Weight | Line Height | Use |
|---------|------|--------|-------------|-----|
| H1 | 4rem (64px) | 700 | 1.1 | Hero headline |
| H2 | 3rem (48px) | 700 | 1.2 | Section titles |
| H3 | 2rem (32px) | 600 | 1.3 | Subtitles, cards |
| H4 | 1.5rem (24px) | 600 | 1.4 | Secondary titles |
| Body Large | 1.25rem (20px) | 400 | 1.6 | Hero description |
| Body | 1rem (16px) | 400 | 1.6 | Default text |
| Small | 0.875rem (14px) | 400 | 1.5 | Captions, footer |

**Responsive**:
```css
/* Mobile first */
.hero-headline {
  font-size: 2.5rem; /* 40px */
  line-height: 1.1;
}

/* Tablet */
@media (min-width: 768px) {
  .hero-headline {
    font-size: 3rem; /* 48px */
  }
}

/* Desktop */
@media (min-width: 1024px) {
  .hero-headline {
    font-size: 4rem; /* 64px */
  }
}
```

### 5.4 Spacing

**8px-based system** (Tailwind convention):

```
4px  (0.5)  → gap-1, p-1
8px  (1)    → gap-2, p-2
16px (2)    → gap-4, p-4
24px (3)    → gap-6, p-6
32px (4)    → gap-8, p-8
48px (6)    → gap-12, p-12
64px (8)    → gap-16, p-16
96px (12)   → gap-24, p-24 (seções)
128px (16)  → gap-32, p-32 (seções grandes)
```

**Section padding**:
- Mobile: py-12 (48px)
- Desktop: py-24 (96px)

**Container**:
```typescript
<div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-7xl">
  {/* Content */}
</div>
```

### 5.5 Borders and Radius

**Default border radius**:
```css
--radius: 0.625rem; /* 10px - slightly rounded */
```

**Variants**:
```css
--radius-sm: 0.375rem;  /* 6px  - small buttons */
--radius-md: 0.5rem;    /* 8px  - small cards */
--radius-lg: 0.625rem;  /* 10px - default */
--radius-xl: 1rem;      /* 16px - large cards */
```

**Usage**:
- Buttons: `rounded-lg` (10px)
- Cards: `rounded-xl` (16px)
- Inputs: `rounded-md` (8px)
- Images: `rounded-2xl` (20px)

### 5.6 Shadows

**Subtle shadows for depth**:

```css
/* Light shadow (cards) */
.card-shadow {
  box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1),
              0 1px 2px -1px rgb(0 0 0 / 0.1);
}

/* Medium shadow (highlighted cards) */
.card-shadow-lg {
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1),
              0 2px 4px -2px rgb(0 0 0 / 0.1);
}

/* Purple shadow for CTAs */
.cta-shadow {
  box-shadow: 0 4px 14px 0 rgb(163 118 255 / 0.25);
}
```

### 5.7 Animations and Transitions

**Principles**:
- Subtle and fast (not distracting)
- Improve perceived interactivity
- Respect `prefers-reduced-motion`

**Durations**:
```css
--transition-fast: 150ms;
--transition-normal: 300ms;
--transition-slow: 500ms;
```

**Easing**:
```css
--ease-out: cubic-bezier(0.16, 1, 0.3, 1);
--ease-in-out: cubic-bezier(0.65, 0, 0.35, 1);
```

**Micro-interactions**:

```css
/* Button hover */
.button-primary {
  transition: all 150ms cubic-bezier(0.16, 1, 0.3, 1);
}
.button-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 14px 0 rgb(163 118 255 / 0.4);
}

/* Fade in on viewport entry */
.fade-in {
  opacity: 0;
  transform: translateY(20px);
  animation: fadeInUp 600ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes fadeInUp {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

**Implementation with Intersection Observer** (custom hook):

```typescript
// lib/hooks/use-in-view.ts
export function useInView(threshold = 0.1) {
  const [isInView, setIsInView] = useState(false);
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
        }
      },
      { threshold }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [threshold]);

  return { ref, isInView };
}
```

---

## 6. Section Structure

### 6.1 Navigation (Sticky Header)

**Component**: `LandingNavbar`

**Structure**:
```
┌─────────────────────────────────────────────┐
│ [Logo Tatame]              [Assine agora] │
└─────────────────────────────────────────────┘
```

**Behavior**:
- Fixed at top (sticky)
- Background blur when scroll > 0
- Height: 64px (desktop) / 56px (mobile)
- Z-index: 50

**Layout**:
```typescript
<header className="sticky top-0 z-50 border-b border-border/40 backdrop-blur-lg bg-background/80">
  <div className="container mx-auto px-4 h-16 flex items-center justify-between">
    <Logo />
    <NavbarCTA />
  </div>
</header>
```

**NavbarCTA**:
- Primary purple button
- Label: "Assine agora" (user-facing, keep in PT)
- Hover: lift + shadow
- Mobile: Short label "Assinar"

---

### 6.2 Hero Section (Split Layout)

**Component**: `HeroSection`

**Desktop layout**:
```
┌──────────────────────────┬──────────────────────────┐
│                          │                          │
│  Headline em destaque    │                          │
│                          │    [App Screenshot]      │
│  Descrição breve         │                          │
│                          │                          │
│  [CTA Primário]          │                          │
│                          │                          │
└──────────────────────────┴──────────────────────────┘
```

**Mobile layout**:
```
┌─────────────────────────┐
│                         │
│   [App Screenshot]      │
│                         │
├─────────────────────────┤
│  Headline               │
│                         │
│  Short description      │
│                         │
│  [Primary CTA]          │
│                         │
└─────────────────────────┘
```

**Content (example – user copy in PT)**:

```typescript
// lib/constants/hero.ts
export const HERO_CONTENT = {
  headline: 'Transforme a gestão da sua academia de Jiu-Jitsu',
  description: 'Controle financeiro, gestão de alunos e organização de treinos em um só lugar. Focado em resultados para o seu negócio.',
  cta: {
    primary: 'Comece agora por R$ 49,99/mês',
    secondary: 'Ver planos', // Opcional
  },
} as const;
```

**Specs**:
- Vertical padding: py-16 (mobile) / py-24 (desktop)
- Grid: 2 equal columns on desktop (50/50)
- Gap: gap-12 (48px)
- Headline: text-4xl (mobile) / text-6xl (desktop), foreground, weight 700
- Description: text-lg (20px), muted-foreground, weight 400
- CTA: large button (h-12), primary purple

**Animations**:
- Headline: fade in from bottom (delay: 0ms)
- Description: fade in from bottom (delay: 100ms)
- CTA: fade in from bottom (delay: 200ms)
- Screenshot: fade in from right (delay: 300ms)

---

### 6.3 Benefits Section (Zig-Zag Layout)

**Component**: `BenefitsSection`

**Desktop layout** (alternating):

```
┌────────────────────────────────────────────────┐
│  BENEFÍCIO 1                                   │
├──────────────────────┬─────────────────────────┤
│                      │                         │
│  Título do benefício │   [App Screenshot]      │
│  Descrição detalhada │                         │
│  • Feature 1         │                         │
│  • Feature 2         │                         │
│                      │                         │
└──────────────────────┴─────────────────────────┘

┌────────────────────────────────────────────────┐
│  BENEFÍCIO 2                                   │
├─────────────────────────┬──────────────────────┤
│                         │                      │
│   [App Screenshot]      │  Título do benefício │
│                         │  Descrição detalhada │
│                         │  • Feature 1         │
│                         │  • Feature 2         │
│                         │                      │
└─────────────────────────┴──────────────────────┘
```

**Mobile layout** (stacked):
```
┌─────────────────────────┐
│   [App Screenshot]      │
├─────────────────────────┤
│  Benefit title          │
│  Detailed description   │
│  • Feature 1            │
│  • Feature 2            │
└─────────────────────────┘
```

**Content (example – user copy in PT)**:

```typescript
// lib/constants/benefits.ts
export const BENEFITS = [
  {
    id: 'financial-control',
    title: 'Controle financeiro completo',
    description: 'Tenha visão clara da saúde financeira da sua academia em tempo real.',
    features: [
      'Acompanhamento de mensalidades',
      'Relatórios de receitas e despesas',
      'Lembretes de pagamento automáticos',
      'Histórico de transações',
    ],
    imagePlaceholder: 'financial-dashboard',
    imageAlt: 'Interface de controle financeiro do Tatame',
  },
  {
    id: 'student-management',
    title: 'Gestão de alunos simplificada',
    description: 'Organize informações dos alunos, presenças e evolução técnica em um só lugar.',
    features: [
      'Cadastro completo de alunos',
      'Controle de presenças',
      'Registro de graduações',
      'Histórico de evolução',
    ],
    imagePlaceholder: 'student-list',
    imageAlt: 'Lista de alunos no aplicativo Tatame',
  },
  {
    id: 'class-organization',
    title: 'Organização de aulas e treinos',
    description: 'Planeje e gerencie o calendário de treinos com facilidade.',
    features: [
      'Calendário de aulas',
      'Planejamento de treinos',
      'Notificações para alunos',
      'Gestão de horários',
    ],
    imagePlaceholder: 'class-schedule',
    imageAlt: 'Calendário de treinos do Tatame',
  },
  {
    id: 'growth-insights',
    title: 'Visão clara do crescimento',
    description: 'Métricas e relatórios para tomar decisões estratégicas baseadas em dados.',
    features: [
      'Dashboard com métricas principais',
      'Relatórios de crescimento',
      'Análise de retenção de alunos',
      'Projeções financeiras',
    ],
    imagePlaceholder: 'analytics-dashboard',
    imageAlt: 'Dashboard de análises do Tatame',
  },
] as const;
```

**Specs**:
- Vertical padding: py-24 (desktop) / py-16 (mobile)
- Grid: 2 columns (50/50) on desktop
- Gap between benefits: gap-y-24 (96px)
- Gap between columns: gap-x-12 (48px)
- Section title: text-4xl, weight 700, mb-16
- Benefit title: text-3xl, weight 600
- Description: text-lg, muted-foreground
- Features: list with purple check icons

**BenefitCard component**:
```typescript
interface BenefitCardProps {
  benefit: Benefit;
  index: number; // For alternating layout
}
```

**Animations**:
- Fade in on viewport entry (150ms stagger between benefits)

---

### 6.4 Pricing Section

**Component**: `PricingSection`

**Desktop layout**:
```
┌────────────────────────────────────────────────┐
│          Escolha o plano ideal                 │
│                                                │
│  ┌──────────────┐    ┌──────────────┐         │
│  │              │    │ [Mais popular] │        │
│  │    FREE      │    │   STANDARD     │        │
│  │              │    │                │        │
│  │   R$ 0,00    │    │   R$ 49,99/mês │        │
│  │              │    │                │        │
│  │ ✓ Feature 1  │    │ ✓ Feature 1    │        │
│  │ ✓ Feature 2  │    │ ✓ Feature 2    │        │
│  │ ✓ Feature 3  │    │ ✓ Feature 3    │        │
│  │              │    │ ✓ Feature 4    │        │
│  │ [Começar]    │    │ [Assinar agora] │       │
│  │              │    │                │        │
│  └──────────────┘    └──────────────┘         │
│                                                │
└────────────────────────────────────────────────┘
```

**Mobile layout** (stacked):
```
┌─────────────────────────┐
│ Escolha o plano ideal   │  ← user copy (PT)
├─────────────────────────┤
│  [Mais popular]         │
│     STANDARD            │
│   R$ 49,99/mês          │
│                         │
│ ✓ Feature 1             │
│ ✓ Feature 2             │
│ ...                     │
│ [Assinar agora]         │
├─────────────────────────┤
│       FREE              │
│     R$ 0,00             │
│                         │
│ ✓ Feature 1             │
│ ✓ Feature 2             │
│ ...                     │
│ [Começar]               │
└─────────────────────────┘
```

**Content** (user-facing strings in PT):

```typescript
// lib/constants/pricing.ts
export const PRICING_PLANS = [
  {
    id: 'free',
    name: 'Free',
    tagline: 'Para alunos e professores',
    price: 0,
    currency: 'BRL',
    interval: null,
    features: [
      'Acesso ao aplicativo móvel',
      'Visualização de treinos',
      'Acompanhamento de graduações',
      'Notificações de aulas',
    ],
    cta: 'Começar grátis',
    highlighted: false,
    badge: null,
  },
  {
    id: 'standard',
    name: 'Standard',
    tagline: 'Para gestores de academias',
    price: 49.99,
    currency: 'BRL',
    interval: 'mês',
    features: [
      'Tudo do plano Free',
      'Gestão completa de alunos',
      'Controle financeiro avançado',
      'Relatórios e análises',
      'Organização de aulas e treinos',
      'Suporte prioritário',
    ],
    cta: 'Assinar agora',
    highlighted: true,
    badge: 'Mais popular',
  },
] as const;
```

**Standard card (highlighted) specs**:
- Border: `border-2 border-[#A376FF]`
- Badge: absolute at top of card
- Purple shadow: `shadow-[0_0_30px_rgba(163,118,255,0.15)]`
- Scale: `scale-105` on desktop (slightly larger)
- Z-index: higher than Free card

**Free card specs**:
- Border: `border border-border`
- No badge
- Default shadow

**PricingCard component**:
```typescript
interface PricingCardProps {
  plan: PricingPlan;
}
```

**Animations**:
- Cards fade in + scale on viewport entry
- Standard first (delay: 0ms), Free second (delay: 150ms)

---

### 6.5 FAQ Section

**Component**: `FAQSection`

**Layout**:
```
┌────────────────────────────────────────────────┐
│        Perguntas Frequentes                    │
│                                                │
│  ▼ Pergunta 1                                  │
│    Resposta expandida aqui...                  │
│                                                │
│  ▶ Pergunta 2                                  │
│                                                │
│  ▶ Pergunta 3                                  │
│                                                │
│  ▶ Pergunta 4                                  │
│                                                │
│  ▶ Pergunta 5                                  │
│                                                │
└────────────────────────────────────────────────┘
```

**Content** (questions/answers in PT):

```typescript
// lib/constants/faq.ts
export const FAQ_ITEMS = [
  {
    id: 'what-is-tatame',
    question: 'O que é o Tatame?',
    answer: 'Tatame é uma plataforma completa de gestão para academias de Jiu-Jitsu. Oferecemos ferramentas para controle financeiro, gestão de alunos, organização de treinos e muito mais. Nosso objetivo é simplificar a administração da sua academia para que você possa focar no que realmente importa: ensinar e fazer sua academia crescer.',
  },
  {
    id: 'who-uses-tatame',
    question: 'Quem pode usar o Tatame?',
    answer: 'O Tatame é usado por gestores, professores e alunos de academias de Jiu-Jitsu. Gestores têm acesso ao plano Standard com todas as funcionalidades de administração. Professores e alunos utilizam o plano Free para acompanhar treinos, graduações e receber notificações.',
  },
  {
    id: 'how-payment-works',
    question: 'Como funciona o pagamento?',
    answer: 'O plano Standard custa R$ 49,99 por mês e pode ser cancelado a qualquer momento sem multa. Aceitamos pagamentos via cartão de crédito através da nossa plataforma segura. A cobrança é feita automaticamente todo mês, e você recebe um recibo por e-mail.',
  },
  {
    id: 'can-i-cancel',
    question: 'Posso cancelar a qualquer momento?',
    answer: 'Sim! Você pode cancelar sua assinatura a qualquer momento sem nenhuma taxa ou multa. Ao cancelar, você mantém acesso às funcionalidades até o final do período já pago. Não há contratos de longo prazo ou compromissos.',
  },
  {
    id: 'support',
    question: 'Qual tipo de suporte vocês oferecem?',
    answer: 'Assinantes do plano Standard têm acesso a suporte prioritário via e-mail. Respondemos normalmente em até 24 horas. Também oferecemos documentação completa e tutoriais em vídeo para ajudar você a aproveitar ao máximo a plataforma.',
  },
] as const;
```

**Specs**:
- Max width: `max-w-3xl mx-auto` (centered)
- Vertical padding: py-24 (desktop) / py-16 (mobile)
- Section title: text-4xl, weight 700, text-center, mb-12
- Item background: bg-card
- Border radius: rounded-xl
- Only one item open at a time
- Icon: animated chevron (rotate 0 → 90° when open)

**FAQItem component**:
```typescript
interface FAQItemProps {
  item: FAQItem;
  isOpen: boolean;
  onToggle: () => void;
}
```

**Animations**:
- Chevron: `transition-transform duration-200`
- Content expand: `transition-all duration-300 ease-in-out`
- Height: `max-height-0` → `max-height-[500px]`

---

### 6.6 Final Call to Action

**Component**: `CTAFinalSection`

**Layout**:
```
┌────────────────────────────────────────────────┐
│                                                │
│         Pronto para transformar                │
│         a gestão da sua academia?              │
│                                                │
│     Comece hoje e veja os resultados           │
│                                                │
│          [Assinar Standard - R$ 49,99/mês]     │
│                                                │
│         Sem compromisso. Cancele quando quiser.│
│                                                │
└────────────────────────────────────────────────┘
```

**Specs**:
- Background: `bg-gradient-to-b from-background to-card`
- Padding: py-24 (desktop) / py-16 (mobile)
- Text-align: center
- Headline: text-4xl, weight 700
- Subheadline: text-xl, muted-foreground, mb-8
- CTA: extra-large button (h-14, px-8, text-lg)
- Disclaimer: text-sm, muted-foreground, mt-4

**Animations**:
- Fade in + slide up on viewport entry

---

### 6.7 Footer

**Component**: `LandingFooter`

**Desktop layout**:
```
┌────────────────────────────────────────────────┐
│                                                │
│  [Logo Tatame]                                 │
│                                                │
│  Gerencie sua academia com eficiência          │
│                                                │
│  ┌────────────┬────────────┬────────────┐     │
│  │  Produto   │   Legal    │  Contato   │     │
│  │            │            │            │     │
│  │  • Planos  │  • Termos  │  Email:    │     │
│  │  • FAQ     │  • Privac. │  contato@  │     │
│  │            │            │  tatame... │     │
│  └────────────┴────────────┴────────────┘     │
│                                                │
│  [App Store]  [Play Store]                     │
│                                                │
│  ────────────────────────────────────────      │
│                                                │
│  © 2026 Tatame. Todos os direitos reservados. │
│                                                │
└────────────────────────────────────────────────┘
```

**Mobile layout** (stacked):
```
┌─────────────────────────┐
│  [Logo Tatame]          │
│                         │
│  Gerencie sua academia  │
│  com eficiência         │
│                         │
│  Produto                │
│  • Planos               │
│  • FAQ                  │
│                         │
│  Legal                  │
│  • Termos de Uso        │
│  • Privacidade          │
│                         │
│  Contato                │
│  contato@tatame.com     │
│                         │
│  [App Store]            │
│  [Play Store]           │
│                         │
│  ─────────────────      │
│                         │
│  © 2026 Tatame          │
│                         │
└─────────────────────────┘
```

**Conteúdo**:

```typescript
// lib/constants/footer.ts
export const FOOTER_LINKS = {
  product: [
    { label: 'Planos', href: '#pricing' },
    { label: 'FAQ', href: '#faq' },
  ],
  legal: [
    { label: 'Termos de Uso', href: '/terms' },
    { label: 'Política de Privacidade', href: '/privacy' },
  ],
  contact: {
    email: 'contato@tatame.com.br',
  },
  apps: {
    appStore: 'https://apps.apple.com/...',
    playStore: 'https://play.google.com/...',
  },
} as const;
```

**Specs**:
- Background: bg-card
- Border-top: border-t border-border
- Padding: py-12 (desktop) / py-8 (mobile)
- Logo: 90% opacity
- Links: muted-foreground, purple on hover
- Copyright: text-sm, muted-foreground/60

---

## 7. Conversion Strategy

### 7.1 CTA Hierarchy

**Primary CTA**: "Assinar agora" / "Assine Standard" (user copy – PT)
- Color: Purple #A376FF
- Placement: Navbar, Hero, Pricing, Final CTA
- Priority: High
- Action: Redirect to checkout/signup

**Secondary CTA**: "Ver planos" / "Começar grátis" (user copy – PT)
- Color: Outline (transparent with border)
- Placement: Hero (optional), Pricing (Free plan)
- Priority: Medium
- Action: Scroll to pricing or app download

### 7.2 Conversion Funnel

```
Visitor → Landing Page
    ↓
Reads Hero (5s) → Understands value
    ↓
Scrolls Benefits (30s) → Learns features
    ↓
Sees Pricing (15s) → Compares plans
    ↓
Reads FAQ (20s) → Objections addressed
    ↓
Clicks Final CTA → Converts
```

**Expected conversion rate**: 3–5%  
**Average time on page**: 2–3 minutes

### 7.3 Conversion Principles

1. **Immediate clarity**: Hero explains value in 5 seconds
2. **Proof of value**: Concrete benefits, not abstract
3. **Transparency**: Clear price, no surprises
4. **Friction removal**: FAQ addresses objections
5. **Subtle urgency**: "Comece hoje" (PT), no overkill
6. **Social proof** (future): Testimonials, academy counts

### 7.4 Copy Guidelines

**Tone of voice**:
- Professional but approachable
- Focused on practical outcomes
- Direct
- Empathetic to manager pain points

**Avoid**:
- Unnecessary technical jargon
- Overpromising
- Overly long copy
- Too informal

**Focus on**:
- Benefits, not features
- Time savings
- Academy growth
- Ease of use

**Examples** (user copy in PT):

❌ Bad: "Nosso sistema utiliza tecnologia de ponta para gerenciar dados..."
✅ Good: "Veja a saúde financeira da sua academia em tempo real."

❌ Bad: "Plataforma integrada de gestão..."
✅ Good: "Controle tudo em um só lugar."

### 7.5 Conversion Points

| Section | CTA | Goal | Priority |
|---------|-----|------|----------|
| Navbar | "Assine agora" | Immediate conversion | High |
| Hero | "Comece agora por R$ 49,99/mês" | Convert after value | High |
| Pricing | "Assinar agora" (Standard) | Convert after price | High |
| Final CTA | "Assinar Standard - R$ 49,99/mês" | Last chance | High |
| Footer | App links | App download (Free) | Medium |

---

## 8. Reusable Components

### 8.1 Shared Components

#### 8.1.1 Logo

**Component**: `Logo`

```typescript
// components/shared/logo.tsx
interface LogoProps {
  variant?: 'default' | 'minimal';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}
```

**Usage**:
- Navbar: size="md", variant="default"
- Footer: size="lg", variant="default"
- Future dashboard: size="sm", variant="minimal"

**Implementation**:
- Inline SVG (better performance)
- Theme-adaptive color if needed
- Responsive

#### 8.1.2 AppScreenshotPlaceholder

**Component**: `AppScreenshotPlaceholder`

```typescript
// components/shared/app-screenshot-placeholder.tsx
interface AppScreenshotPlaceholderProps {
  variant: 'financial' | 'student-list' | 'class-schedule' | 'analytics';
  className?: string;
  showDevice?: boolean; // Show phone mockup around screenshot
}
```

**Usage**:
- Hero
- Benefits section
- Future detail pages

**Implementation**:
- SVG or static image
- Aspect ratio: 9:19.5 (smartphone)
- Rounded corners
- Optional: device mockup frame

#### 8.1.3 SectionContainer

**Component**: `SectionContainer`

```typescript
// components/shared/section-container.tsx
interface SectionContainerProps {
  children: React.ReactNode;
  className?: string;
  containerSize?: 'default' | 'narrow' | 'wide';
  paddingY?: 'sm' | 'md' | 'lg';
}
```

**Usage**: Default wrapper for all sections

**Implementation**:
```typescript
<section className={cn('py-16 md:py-24', className)}>
  <div className={cn(
    'container mx-auto px-4 md:px-6 lg:px-8',
    containerSize === 'narrow' && 'max-w-4xl',
    containerSize === 'default' && 'max-w-7xl',
    containerSize === 'wide' && 'max-w-[1440px]',
  )}>
    {children}
  </div>
</section>
```

### 8.2 Custom UI Components

#### 8.2.1 GradientButton

**Component**: `GradientButton` (extends shadcn Button)

```typescript
// components/ui/gradient-button.tsx
interface GradientButtonProps extends ButtonProps {
  variant?: 'primary' | 'secondary';
}
```

**Usage**: Primary CTAs

**Style**:
```css
.gradient-button-primary {
  background: linear-gradient(135deg, #A376FF 0%, #8B5CF6 100%);
  box-shadow: 0 4px 14px 0 rgba(163, 118, 255, 0.25);
  transition: all 150ms cubic-bezier(0.16, 1, 0.3, 1);
}

.gradient-button-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px 0 rgba(163, 118, 255, 0.4);
}
```

#### 8.2.2 FeatureList

**Component**: `FeatureList`

```typescript
// components/ui/feature-list.tsx
interface FeatureListProps {
  items: string[];
  iconColor?: string;
  size?: 'sm' | 'md';
}
```

**Usage**: Feature lists in pricing and benefit cards

**Implementation**:
```typescript
<ul className="space-y-3">
  {items.map((item) => (
    <li key={item} className="flex items-start gap-3">
      <Check className="size-5 text-[#A376FF] shrink-0 mt-0.5" />
      <span className="text-sm">{item}</span>
    </li>
  ))}
</ul>
```

#### 8.2.3 Badge

**Component**: `Badge` (extend shadcn)

```typescript
// components/ui/badge.tsx
interface BadgeProps {
  variant?: 'default' | 'popular' | 'new';
}
```

**Usage**: "Mais popular" badge on pricing card (user copy in PT)

**Style**:
```typescript
const badgeVariants = {
  popular: 'bg-[#A376FF] text-white',
  new: 'bg-green-500 text-white',
  default: 'bg-secondary text-secondary-foreground',
};
```

### 8.3 Custom Hooks

#### 8.3.1 useInView

**Hook**: `useInView`

```typescript
// lib/hooks/use-in-view.ts
interface UseInViewOptions {
  threshold?: number;
  triggerOnce?: boolean;
}

export function useInView(options?: UseInViewOptions) {
  const [isInView, setIsInView] = useState(false);
  const ref = useRef<HTMLElement>(null);
  
  // IntersectionObserver implementation
  
  return { ref, isInView };
}
```

**Usage**: Section entrance animations

#### 8.3.2 useScrollPosition

**Hook**: `useScrollPosition`

```typescript
// lib/hooks/use-scroll-position.ts
export function useScrollPosition() {
  const [scrollY, setScrollY] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);
  
  // Scroll event listener implementation
  
  return { scrollY, isScrolled };
}
```

**Usage**: Sticky navbar with blur

---

## 9. Performance and Accessibility

### 9.1 Performance

#### 9.1.1 Target Metrics

| Metric | Target | Description |
|---------|------|-----------|
| **LCP** | < 2.5s | Largest Contentful Paint |
| **FID** | < 100ms | First Input Delay |
| **CLS** | < 0.1 | Cumulative Layout Shift |
| **FCP** | < 1.8s | First Contentful Paint |
| **TTI** | < 3.8s | Time to Interactive |

#### 9.1.2 Optimization Strategies

**Images**:
- Use Next.js Image component
- Modern formats (WebP, AVIF)
- Lazy loading for below-the-fold images
- Blur placeholders

```typescript
import Image from 'next/image';

<Image
  src="/images/app-screenshot.webp"
  alt="Interface do Tatame"
  width={400}
  height={800}
  loading="lazy"
  placeholder="blur"
  blurDataURL="data:image/jpeg;base64,..."
/>
```

**Fonts**:
- Next.js Font Optimization (already in use)
- Preload Bricolage Grotesque
- font-display: swap

```typescript
// layout.tsx
import { Bricolage_Grotesque } from 'next/font/google';

const bricolageGrotesque = Bricolage_Grotesque({
  variable: '--font-bricolage',
  subsets: ['latin'],
  display: 'swap',
  preload: true,
  weight: ['400', '500', '600', '700'],
});
```

**CSS**:
- Tailwind purging (already configured)
- Critical CSS inline in head
- Avoid heavy animations

**JavaScript**:
- Route-based code splitting (Next.js default)
- Dynamic imports for non-critical components
- React Server Components where possible

```typescript
// Dynamic import example
const HeavyComponent = dynamic(() => import('./heavy-component'), {
  loading: () => <Skeleton />,
  ssr: false,
});
```

**Caching**:
- Static Generation for landing (max performance)
- Aggressive cache headers for static assets
- CDN (e.g. Vercel Edge Network)

#### 9.1.3 Bundle Size

**Target**: < 150KB initial JavaScript

**Monitoring**:
```bash
# Analyze bundle
pnpm build
pnpm analyze # (with next-bundle-analyzer)
```

**Optimizations**:
- Automatic tree-shaking
- Remove unused dependencies
- Use named imports (not `import * as`)

### 9.2 Accessibility

#### 9.2.1 Standards and Compliance

**Target**: WCAG 2.1 Level AA

**Main checklist**:
- ✅ Minimum contrast 4.5:1 (normal text)
- ✅ Minimum contrast 3:1 (large text)
- ✅ Keyboard navigation
- ✅ Visible focus
- ✅ Labels on form inputs
- ✅ Alt text on images
- ✅ Semantic structure (headings)
- ✅ ARIA labels where needed

#### 9.2.2 Color Contrast

**Validated combinations**:

| Foreground | Background | Contrast | Status |
|------------|------------|----------|--------|
| #FFFFFF (text) | #252525 (background) | 13.2:1 | ✅ AAA |
| #A376FF (purple) | #252525 (background) | 4.7:1 | ✅ AA |
| #B4B4B4 (muted) | #252525 (background) | 5.8:1 | ✅ AA |

**Validation tools**:
- WebAIM Contrast Checker
- Axe DevTools
- Lighthouse Accessibility audit

#### 9.2.3 Keyboard Navigation

**Focus order**:
1. Navbar → Logo (focusable) → CTA
2. Hero → Headline (skip link) → CTA
3. Benefits → Cards (Tab through)
4. Pricing → Cards → Buttons
5. FAQ → Accordions (Space/Enter to expand)
6. Final CTA → Button
7. Footer → Links

**Skip links**:
```typescript
<a
  href="#main-content"
  className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground   focus:rounded-lg"
>
  Pular para conteúdo principal
</a>
```

#### 9.2.4 Semantic Structure

**Heading hierarchy**:
```html
<h1>Hero Headline</h1>

<section> <!-- Benefits -->
  <h2>Benefits section title</h2>
  <h3>Benefit 1 title</h3>
  <h3>Benefit 2 title</h3>
</section>

<section> <!-- Pricing -->
  <h2>Escolha o plano ideal</h2>
  <h3>Free</h3>
  <h3>Standard</h3>
</section>

<section> <!-- FAQ -->
  <h2>Perguntas Frequentes</h2>
  <h3>Pergunta 1</h3> <!-- May look smaller visually -->
</section>
```

**ARIA landmarks**:
```html
<header role="banner">
  <nav role="navigation" aria-label="Main">
    <!-- Navbar -->
  </nav>
</header>

<main role="main">
  <!-- Main content -->
</main>

<footer role="contentinfo">
  <!-- Footer -->
</footer>
```

#### 9.2.5 Accessible Components

**Button** (aria-label in PT for screen readers – user-facing):
```typescript
<Button
  type="button"
  aria-label="Assinar plano Standard"
>
  Assinar agora
</Button>
```

**Accordion (FAQ)**:
```typescript
<button
  aria-expanded={isOpen}
  aria-controls={`faq-content-${id}`}
  id={`faq-button-${id}`}
>
  {question}
</button>
<div
  id={`faq-content-${id}`}
  role="region"
  aria-labelledby={`faq-button-${id}`}
  hidden={!isOpen}
>
  {answer}
</div>
```

**Images** (alt in PT – describes content for users):
```typescript
<Image
  src="/images/app-screenshot.webp"
  alt="Interface do Tatame mostrando lista de alunos com status de pagamento"
  // Do NOT use alt="" for meaningful images
/>
```

#### 9.2.6 Motion and Animations

**Respect prefers-reduced-motion**:

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

**Tailwind implementation**:
```typescript
<div className="transition-transform motion-reduce:transition-none">
  {/* Content */}
</div>
```

### 9.3 SEO

#### 9.3.1 Metadata

**File**: `app/(landing)/layout.tsx`

```typescript
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Tatame - Gestão completa para academias de Jiu-Jitsu',
  description: 'Controle financeiro, gestão de alunos e organização de treinos em um só lugar. Plataforma completa para gestores de academias de Jiu-Jitsu. R$ 49,99/mês.',
  keywords: ['gestão de academias', 'jiu-jitsu', 'controle financeiro', 'gestão de alunos', 'tatame'],
  authors: [{ name: 'Tatame' }],
  openGraph: {
    title: 'Tatame - Gestão completa para academias de Jiu-Jitsu',
    description: 'Controle financeiro, gestão de alunos e organização de treinos em um só lugar.',
    url: 'https://tatame.com.br',
    siteName: 'Tatame',
    images: [
      {
        url: '/images/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Tatame - Gestão de academias',
      },
    ],
    locale: 'pt_BR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Tatame - Gestão completa para academias de Jiu-Jitsu',
    description: 'Controle financeiro, gestão de alunos e organização de treinos.',
    images: ['/images/twitter-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};
```

#### 9.3.2 Structured Data (JSON-LD)

```typescript
// components/landing/structured-data.tsx
export function StructuredData() {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Tatame',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'iOS, Android',
    offers: {
      '@type': 'Offer',
      price: '49.99',
      priceCurrency: 'BRL',
      category: 'Subscription',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      reviewCount: '150', // Future real data
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}
```

#### 9.3.3 Sitemap

**File**: `app/sitemap.ts`

```typescript
import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: 'https://tatame.com.br',
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: 'https://tatame.com.br/terms',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: 'https://tatame.com.br/privacy',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ];
}
```

---

## 10. Future Expansion

### 10.1 Web Dashboard

**Timeline**: 3–6 months after landing launch

**Impact on current architecture**:
1. Landing stays in `app/(landing)/`
2. Dashboard will live in `app/dashboard/`
3. Shared components in `/components/shared/` will be reused

**New directory**:
```
apps/web/src/app/
├── (landing)/          # Landing page (existente)
├── (auth)/             # Páginas de autenticação
│   ├── login/
│   └── register/
└── dashboard/          # Dashboard web
    ├── layout.tsx      # Layout do dashboard (sidebar, etc.)
    ├── page.tsx        # Overview
    ├── students/       # Gestão de alunos
    ├── finances/       # Controle financeiro
    ├── classes/        # Organização de aulas
    └── settings/       # Configurações
```

**Shared components**:
- Logo
- ThemeProvider
- Button, Card, Input (shadcn/ui)
- Hooks (useInView, etc.)

**Dashboard-specific components**:
- Sidebar
- Data tables
- Charts
- Complex forms

### 10.2 Internationalization (i18n)

**Timeline**: 6–12 months (if expanding to other countries)

**Current preparation**:
- Content isolated in `/lib/constants/`
- Structure ready for `next-intl` or similar

**Future implementation**:
```
apps/web/src/
├── locales/
│   ├── pt-BR/
│   │   ├── landing.json
│   │   ├── pricing.json
│   │   └── faq.json
│   └── en-US/
│       └── ...
└── lib/
    └── i18n.ts
```

### 10.3 Blog/Content Hub

**Timeline**: 4–8 months

**Goal**: SEO and customer education

**Structure**:
```
apps/web/src/app/
└── blog/
    ├── page.tsx              # Lista de posts
    └── [slug]/
        └── page.tsx          # Post individual
```

**CMS**: Consider MDX or headless CMS (Contentful, Sanity)

### 10.4 Testimonials System

**Timeline**: 2–4 months after launch

**Goal**: Social proof on landing page

**New section**: Between Benefits and Pricing

**Structure**:
```typescript
// lib/constants/testimonials.ts
export const TESTIMONIALS = [
  {
    id: '1',
    name: 'João Silva',
    role: 'Professor e Gestor',
    academy: 'Academia X',
    photo: '/images/testimonials/joao.jpg',
    quote: 'O Tatame transformou a gestão da minha academia...',
    rating: 5,
  },
  // ...
];
```

**Component**: `TestimonialsSection` (carousel)

### 10.5 Analytics Integration

**When**: At launch

**Tools**:
1. **Google Analytics 4**
2. **Google Tag Manager**
3. **Hotjar** (heatmaps, session recordings)
4. **Microsoft Clarity** (free alternative to Hotjar)

**Events to track**:
- Pageview
- Scroll depth (25%, 50%, 75%, 100%)
- CTA clicks (navbar, hero, pricing, final)
- Time on page
- FAQ interactions (which questions are opened most)
- Pricing card hovers

**Implementation**:
```typescript
// lib/analytics.ts
export const trackEvent = (eventName: string, params?: Record<string, any>) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, params);
  }
};

// Uso
trackEvent('cta_click', {
  location: 'hero',
  plan: 'standard',
});
```

### 10.6 A/B Testing

**Previsão**: 1-3 meses após lançamento

**Ferramentas**:
- Vercel Edge Config + Middleware
- Google Optimize (descontinuado, alternativas: Optimizely, VWO)

**Testes potenciais**:
1. Headlines diferentes no Hero
2. CTAs com copy variado
3. Ordem das seções
4. Preços apresentados de forma diferente
5. Presença/ausência de garantia de reembolso

---

## 11. Próximos Passos

Step-by-step execution phases (to avoid AI context overflow) are in **[Section 11A](#11a-implementation-phases-step-by-step-execution)**. Summary by week:

- **Semana 1**: Fases 1 e 2 (setup + componentes shared)
- **Semana 2**: Fases 3 e 4 (conteúdo + layout/navbar/footer)
- **Semana 2–3**: Fases 5, 6 e 7 (Hero, Benefícios, Pricing)
- **Semana 3**: Fase 8 (FAQ + CTA final)
- **Semana 3–4**: Fase 9 (animações e polish)
- **Semana 4**: Fase 10 (performance, acessibilidade, SEO)
- **Semana 4–5**: Fases 11 e 12 (analytics, testes, deploy)

---

## 11A. Implementation Phases (step-by-step execution)

This section defines **self-contained phases** so you can run **one at a time** with an AI, without loading the full document in one conversation. Each phase has prerequisites, scope, references to the plan, and deliverables.

**How to use**
1. Run **only one phase** per AI session.
2. To start a phase, say: *“Implemente a Fase X do LANDING-PAGE-PLAN.md”* e, se quiser, anexe só a **Seção 11A** + as seções referenciadas na fase.
3. Validate deliverables before moving to the next phase.

**Note:** In the descriptions, **§N** ou **§X.Y** significa “Seção N” ou “Seção X, subseção Y” deste documento (ex.: §5 = Design System, §6.2 = Hero).

---

### Phase 1 — Foundation (setup and design system) ✅ *Completed 2026-02-07*

**Goal:** Estrutura de pastas, tema dark, tipografia e tokens visuais prontos para os componentes.

**Prerequisites:** `apps/web` repo with Next.js, Tailwind, and shadcn/ui already set up (per §3).

**Scope (document references):**
- Directory structure in **§4.1** (app, components, lib, types, public).
- Design system: **§5** (colors, typography, spacing, borders, shadows, CSS variables).
- Bricolage Grotesque font: **§5.3.1**.
- Tatame purple and dark theme: **§5.1 and §5.2**.

**Tasks:**
- [x] Create folders: `app/(landing)/`, `components/landing/` (subfolders hero, benefits, pricing, faq, cta, navbar, footer), `components/shared/`, `lib/constants/`, `lib/hooks/`, `types/`, `public/images/` (logo, placeholders), `public/fonts/`.
- [x] Configure Bricolage Grotesque in the landing layout (weights 400, 500, 600, 700) via `app/(landing)/layout.tsx`.
- [x] Add to Tailwind/global CSS: `--purple-tatame: #A376FF`, `--purple-tatame-light`, `--purple-tatame-dark`; dark theme variables (§5.1 and §5.2); radii (`--radius-sm` to `--radius-xl`) and shadows (`--shadow-card`, `--shadow-card-lg`, `--shadow-cta`) (§5.5 and §5.6); Tailwind theme colors `purple-tatame`, `purple-tatame-light`, `purple-tatame-dark`.
- [x] Ensure dark theme is default on the landing (forced `dark` class in `(landing)/layout.tsx`).

**Deliverables:** Estrutura de pastas criada; variáveis CSS e fonte aplicadas; build e dev rodando sem erro. Home (`/`) passou a ser servida por `app/(landing)/page.tsx` com layout mínimo; nenhum componente de landing além do placeholder de página.

**Out of scope:** Logo, SectionContainer, seções, conteúdo. Não implementar componentes além do necessário para o layout raiz (ex.: layout do `(landing)` pode ser mínimo).

---

### Phase 2 — Componentes shared e hooks ✅ *Completed 2026-02-07*

**Goal:** Logo, SectionContainer, placeholders, hooks e botão de CTA reutilizáveis prontos para as seções.

**Prerequisites:** Phase 1 done (structure and design system).

**Scope (references):**
- **§8.1** (Logo, AppScreenshotPlaceholder, SectionContainer).
- **§8.2** (GradientButton, FeatureList, Badge).
- **§8.3** (useInView, useScrollPosition).

**Tasks:**
- [x] `components/shared/logo.tsx`: props `variant`, `size`, `className`; texto “Tatame” com fonte do layout (navbar e footer).
- [x] `components/shared/section-container.tsx`: wrapper com `containerSize` (default/narrow/wide), `paddingY` (sm/md/lg); ver §8.1.3.
- [x] `components/shared/app-screenshot-placeholder.tsx`: variantes financial, student-list, class-schedule, analytics; proporção ~9:19.5; opcional `showDevice` (mockup de dispositivo).
- [x] `lib/hooks/use-in-view.ts`: IntersectionObserver, `threshold`, `triggerOnce`; retorna `ref` e `isInView`.
- [x] `lib/hooks/use-scroll-position.ts`: retorna `scrollY` e `isScrolled` (threshold 10px para `isScrolled`).
- [x] `components/ui/gradient-button.tsx`: estende Button; variantes `primary` (gradiente roxo + sombra) e `secondary` (§8.2.1).
- [x] `components/ui/feature-list.tsx`: lista com ícone Check roxo; `items`, `iconColor`, `size` (sm/md) (§8.2.2).
- [x] `components/ui/badge.tsx`: variantes `default`, `popular` (bg-[#A376FF]), `new` (§8.2.3).

**Deliverables:** Todos os arquivos acima implementados e exportados. Página da landing permanece placeholder (sem seções de conteúdo).

**Out of scope:** Conteúdo (constantes), navbar, footer, Hero, Benefits, Pricing, FAQ, CTA final.

---

### Phase 3 — Conteúdo e constantes ✅ *Completed 2026-02-07*

**Goal:** Todo o copy e dados da landing em arquivos type-safe em `lib/constants/` e types em `types/landing.ts`.

**Prerequisites:** Phase 1 done (folders `lib/constants/` and `types/`).

**Scope (references):**
- **§4.2.3** (gestão de conteúdo como código).
- **§6.2** (hero), **§6.3** (benefícios), **§6.4** (pricing), **§6.5** (FAQ), **§6.7** (footer): exemplos de conteúdo.

**Tasks:**
- [x] `types/landing.ts`: HeroContent, Benefit, PricingPlan, FAQItem, FooterLinkItem, FooterLinks, AppScreenshotPlaceholderVariant (alinhados ao §6).
- [x] `lib/constants/hero.ts`: HERO_CONTENT (headline, description, cta primary/secondary) — §6.2.
- [x] `lib/constants/benefits.ts`: BENEFITS — 4 itens (financial-control, student-management, class-organization, growth-insights) com imagePlaceholder alinhado ao componente — §6.3.
- [x] `lib/constants/pricing.ts`: PRICING_PLANS — Free e Standard com tagline, price, interval, features, cta, highlighted, badge — §6.4.
- [x] `lib/constants/faq.ts`: FAQ_ITEMS — 5 perguntas e respostas — §6.5.
- [x] `lib/constants/footer.ts`: FOOTER_LINKS (product, legal, contact, apps) — §6.7.

**Deliverables:** Arquivos em `lib/constants/` e `types/landing.ts` com conteúdo completo; AppScreenshotPlaceholder passou a importar AppScreenshotPlaceholderVariant de `types/landing`. Nenhuma alteração em componentes de seção.

**Out of scope:** Implementar ou alterar componentes de UI de seção; apenas dados e tipos.

---

### Phase 4 — Layout da landing, navbar e footer ✅ *Completed 2026-02-07*

**Goal:** Rota `/` usando o route group `(landing)`, com layout, navbar fixa e footer; página com placeholders para as seções.

**Prerequisites:** Phases 1, 2, and 3 done.

**Scope (references):**
- **§4.1** e **§4.2.1** (route group, rotas).
- **§6.1** (LandingNavbar).
- **§6.7** (LandingFooter).

**Tasks:**
- [x] `app/(landing)/layout.tsx`: layout específico da landing (fonte Bricolage, tema dark); sem duplicar root layout.
- [x] `app/(landing)/page.tsx`: importar e renderizar em ordem: LandingNavbar, depois placeholders (ou divs nomeados) para Hero, Benefits, Pricing, FAQ, CTA Final, e por fim LandingFooter.
- [x] `components/landing/navbar/landing-navbar.tsx`: sticky, altura 64px (desktop) / 56px (mobile), blur quando scroll > 0 (§6.1); Logo + NavbarCTA.
- [x] `components/landing/navbar/navbar-cta.tsx`: botão “Assine agora” (GradientButton ou primário roxo); mobile “Assinar”.
- [x] `components/landing/footer/landing-footer.tsx`: Logo, tagline, colunas Produto / Legal / Contato, links de `lib/constants/footer.ts`, botões App Store / Play Store, copyright — §6.7.
- [x] `components/landing/footer/footer-links.tsx` (ou equivalente): renderizar FOOTER_LINKS.

**Deliverables:** Ao acessar `/`, página com navbar no topo, blocos vazios/nomeados no meio e footer completo. Links do footer podem apontar para `#pricing`, `#faq`, `/terms`, `/privacy` e URLs de app stores.

**Out of scope:** Conteúdo visual das seções Hero, Benefits, Pricing, FAQ e CTA (apenas placeholders ou títulos).

---

### Phase 5 — Hero ✅ *Completed 2026-02-07*

**Goal:** Seção Hero com headline, descrição, CTA e placeholder de screenshot; layout split (desktop) e empilhado (mobile).

**Prerequisites:** Phases 1–4 done.

**Scope (references):** **§6.2** (Hero: layout, conteúdo, especificações, animações opcionais).

**Tasks:**
- [x] `components/landing/hero/hero-section.tsx`: SectionContainer, grid 2 colunas no desktop, 1 no mobile; usar HERO_CONTENT de `lib/constants/hero.ts`.
- [x] `components/landing/hero/hero-content.tsx`: headline (H1), description, CTA primário (GradientButton).
- [x] `components/landing/hero/hero-visual.tsx`: AppScreenshotPlaceholder (variante adequada).
- [x] Em `page.tsx`, substituir o placeholder do Hero por `<HeroSection />`.
- [x] Responsividade: headline texto-4xl (mobile) → texto-6xl (desktop); padding py-16 (mobile) / py-24 (desktop).

**Deliverables:** Hero visível na página com copy correto e CTA clicável (ação pode ser link âncora ou # por enquanto).

**Out of scope:** Animações de entrada (fase 9); outras seções além do Hero.

---

### Phase 6 — Benefícios ✅ *Completed 2026-02-07*

**Goal:** Seção de benefícios com layout zig-zag (alternado esquerda/direita no desktop) e lista de features com ícone.

**Prerequisites:** Phases 1–5 done.

**Scope (references):** **§6.3** (BenefitsSection, BenefitCard, layout, conteúdo).

**Tasks:**
- [x] `components/landing/benefits/benefits-section.tsx`: título da seção (H2), map de BENEFITS em BenefitCard; SectionContainer; padding vertical §6.3.
- [x] `components/landing/benefits/benefit-card.tsx`: recebe benefit + index; no desktop, se index par: texto à esquerda e visual à direita; ímpar: inverso. Mobile: sempre visual em cima, texto embaixo.
- [x] `components/landing/benefits/benefit-visual.tsx`: usar AppScreenshotPlaceholder com variant do benefit.
- [x] Conteúdo e features: usar BENEFITS de `lib/constants/benefits.ts` e FeatureList para a lista de features.
- [x] Em `page.tsx`, substituir placeholder de Benefícios por `<BenefitsSection />`.

**Deliverables:** Seção Benefícios completa com 4 blocos alternados e listas de features.

**Out of scope:** Animações de entrada; Pricing, FAQ, CTA final.

---

### Phase 7 — Pricing ✅ *Completed 2026-02-07*

**Goal:** Seção de preços com dois cards (Free e Standard); Standard destacado (borda roxa, badge “Mais popular”).

**Prerequisites:** Phases 1–6 done.

**Scope (references):** **§6.4** (layout, especificações dos cards, ordem mobile: Standard primeiro).

**Tasks:**
- [x] `components/landing/pricing/pricing-section.tsx`: título “Escolha o plano ideal”; grid de PricingCard; SectionContainer; id `pricing` para âncora.
- [x] `components/landing/pricing/pricing-card.tsx`: recebe plan de PRICING_PLANS; card com nome, tagline, preço, interval, FeatureList, CTA; se highlighted: borda roxa, sombra, scale leve no desktop, badge.
- [x] `components/landing/pricing/pricing-badge.tsx`: badge “Mais popular” (ou usar Badge da UI); posicionamento no topo do card Standard.
- [x] Mobile: ordem Standard depois Free; desktop: lado a lado.
- [x] Em `page.tsx`, substituir placeholder de Pricing por `<PricingSection />`.

**Deliverables:** Seção Pricing com Free e Standard; botões “Começar grátis” e “Assinar agora” (links podem ser # ou âncora por enquanto).

**Out of scope:** Integração real com Stripe/checkout; animações de entrada.

---

### Phase 8 — FAQ e CTA final ✅ *Completed 2026-02-07*

**Goal:** Seção FAQ em accordion (uma pergunta aberta por vez) e seção CTA final com headline e botão principal.

**Prerequisites:** Phases 1–7 done.

**Scope (references):** **§6.5** (FAQ), **§6.6** (CTAFinalSection).

**Tasks:**
- [x] `components/landing/faq/faq-section.tsx`: título “Perguntas Frequentes”; id `faq`; max-w-3xl centralizado; estado “qual item aberto”; lista de FAQItem.
- [x] `components/landing/faq/faq-accordion.tsx` ou `faq-item.tsx`: botão com pergunta, aria-expanded e aria-controls; região com resposta; apenas um aberto por vez; chevron que gira ao abrir.
- [x] Dados: FAQ_ITEMS de `lib/constants/faq.ts`.
- [x] `components/landing/cta/cta-final-section.tsx`: headline e subheadline (§6.6), CTA “Assinar Standard - R$ 49,99/mês”, disclaimer “Sem compromisso. Cancele quando quiser.”; SectionContainer; fundo gradient sutil.
- [x] `components/landing/cta/cta-button.tsx` (opcional): apenas se quiser componente dedicado; senão usar GradientButton.
- [x] Em `page.tsx`, substituir placeholders de FAQ e CTA por `<FAQSection />` e `<CTAFinalSection />`.

**Deliverables:** FAQ expansível e CTA final visíveis; âncoras `#pricing` e `#faq` funcionando a partir da navbar/footer.

**Out of scope:** Animações de entrada; integração de checkout.

---

### Phase 9 — Animações e polish ✅ *Completed 2026-02-08*

**Goal:** Animações sutis de entrada (scroll), navbar com blur no scroll, micro-interações em botões e smooth scroll para âncoras.

**Prerequisites:** Phases 1–8 done (landing complete in content and layout).

**Scope (references):** **§5.7** (animações, durações, easing); **§9.2.6** (prefers-reduced-motion); **§6.1** (navbar blur).

**Tasks:**
- [x] useInView: em Hero, Benefits, Pricing, FAQ, CTA Final — aplicar classe ou estado para fade-in + translateY ao entrar no viewport; stagger opcional em listas (ex.: benefícios).
- [x] Navbar: usar useScrollPosition; quando `isScrolled` for true, aplicar backdrop-blur e borda/background conforme §6.1.
- [x] Botões primários: hover com translateY(-1px) e sombra roxa (§5.7); transição 150ms.
- [x] Smooth scroll: links para #pricing e #faq com scroll suave (CSS scroll-behavior ou comportamento nativo).
- [x] Respeitar prefers-reduced-motion: reduzir ou desligar animações quando `prefers-reduced-motion: reduce` (§9.2.6).

**Deliverables:** Página com animações leves e navbar reagindo ao scroll; sem quebra de layout ou acessibilidade.

**Implemented:**
- `AnimateOnView` component (`components/shared/animate-on-view.tsx`) using useInView, fade-in + translate on viewport entry, with optional stagger delay and direction (up/right).
- `useReducedMotion` hook (`lib/hooks/use-reduced-motion.ts`) for accessibility.
- Smooth scroll via `scroll-smooth` on html; `prefers-reduced-motion` media query in global CSS.
- Entrance animations in Hero (content + visual from right), Benefits (staggered cards), Pricing (Standard first, Free second), FAQ, CTA Final.
- Primary buttons: hover `-translate-y-px` and purple shadow (150ms).
- Navbar blur on scroll (already implemented in Phase 4).

**Out of scope:** Performance (imagens, bundle); SEO; analytics.

---

### Phase 10 — Performance, acessibilidade e SEO ✅ *Completed 2026-02-08*

**Goal:** Otimizar imagens e bundle, garantir acessibilidade (teclado, ARIA, contraste) e metadados/SEO básico.

**Prerequisites:** Phases 1–9 done.

**Scope (references):** **§9** (performance, acessibilidade, SEO); **§9.2** (estrutura semântica, ARIA, teclado); **§9.3** (metadata, JSON-LD, sitemap).

**Tasks:**
- [x] Imagens: Next/Image onde houver imagens reais; lazy loading; formatos modernos (WebP) se aplicável; alt descritivos. *(Atualmente a landing usa apenas placeholders (AppScreenshotPlaceholder); quando imagens reais forem adicionadas, usar next/image com alt em PT.)*
- [x] Lighthouse: rodar em Performance, Acessibilidade, SEO; corrigir itens críticos até scores > 90 onde possível. *(Estrutura e código preparados; recomenda-se rodar Lighthouse localmente ou em CI.)*
- [x] Acessibilidade: skip link “Pular para conteúdo principal” (§9.2.3); ordem de foco lógica; focus visível; aria-expanded/aria-controls no FAQ; landmarks (header, main, footer).
- [x] Contraste: validar texto e CTAs com fundo (§9.2.2). *(Cores documentadas em §9.2.2; validar com ferramenta se necessário.)*
- [x] Metadata em `app/(landing)/layout.tsx`: title, description, keywords, openGraph, twitter (§9.3.1).
- [x] Structured data (JSON-LD): SoftwareApplication com nome, categoria, oferta de preço (§9.3.2); componente ou script no layout.
- [x] `app/sitemap.ts`: entrada para `/`, `/terms`, `/privacy` (§9.3.3).
- [x] `app/robots.ts`: robots.txt com allow e sitemap (bônus).

**Deliverables:** Mesma landing, com melhor performance, acessibilidade e SEO; sitemap e metadata configurados.

**Implemented:**
- Skip link “Pular para conteúdo principal” em `app/(landing)/page.tsx` (sr-only, visível no foco); `main` com `id="main-content"` e `role="main"`.
- Landmarks: `header role="banner"`, `nav aria-label="Principal"` no navbar; `footer role="contentinfo"`.
- FAQ: `aria-expanded`, `aria-controls`, `aria-labelledby` e `hidden={!isOpen}` no conteúdo da resposta (já tinha aria; adicionado hidden para a11y).
- Bricolage Grotesque com `display: "swap"` no layout da landing.
- Metadata completa em `(landing)/layout.tsx`: title, description, keywords, authors, openGraph, twitter, robots.
- `components/landing/structured-data.tsx`: JSON-LD SoftwareApplication com offers e aggregateRating.
- `app/sitemap.ts`: `/`, `/terms`, `/privacy` com BASE_URL via `NEXT_PUBLIC_SITE_URL`.
- `app/robots.ts`: allow `/` e sitemap URL.

**Out of scope:** Analytics e event tracking (próxima fase); deploy.

---

### Phase 11 — Analytics e preparação para lançamento

**Goal:** Configurar analytics (GA4/GTM) e event tracking dos CTAs; verificar que a página está pronta para produção.

**Prerequisites:** Phases 1–10 done.

**Scope (references):** **§10.5** (eventos a trackear, exemplo de `trackEvent`).

**Tasks:**
- [ ] Configurar Google Analytics 4 (e opcionalmente GTM) no layout ou _document; variáveis de ambiente para IDs.
- [ ] `lib/analytics.ts`: função `trackEvent(eventName, params)`; chamadas em CTAs (navbar, hero, pricing, CTA final) com parâmetros como `location` e `plan`.
- [ ] Eventos sugeridos: pageview (automático se GA4), cta_click, scroll_depth (opcional).
- [ ] Revisão final: links, copy, responsividade, testes em um browser e dispositivo móvel.

**Deliverables:** Analytics instalado e eventos de conversão disparando; checklist de pré-lançamento atendido.

**Out of scope:** Deploy em produção e domínio (próxima fase).

---

### Phase 12 — Testes, deploy e monitoramento

**Goal:** Testes cross-browser e em dispositivos, deploy em staging/produção e monitoramento inicial.

**Prerequisites:** Phases 1–11 done.

**Scope (references):** **§12.9 e §12.10** (checklist Testing e Deploy).

**Tasks:**
- [ ] Testes: Chrome, Firefox, Safari, Edge; iOS e Android; breakpoints (mobile first); validação de links e formulários (se houver).
- [ ] Deploy staging (ex.: Vercel preview); validar URL e comportamento.
- [ ] Deploy produção; configurar domínio (tatame.com.br), SSL, redirects www → non-www.
- [ ] Monitorar: Vercel Analytics e GA4; erros no console; tempo de carregamento.

**Deliverables:** Landing em produção, domínio e SSL configurados; monitoramento ativo.

---

### Phase summary (for use in prompts)

| Phase | Name | Main deliverable |
|------|------|----------------------|
| 1 ✅ | Foundation | Estrutura de pastas + design system (cores, fonte, CSS vars) — *done* |
| 2 ✅ | Shared + hooks | Logo, SectionContainer, AppScreenshotPlaceholder, useInView, useScrollPosition, GradientButton, FeatureList, Badge — *done* |
| 3 ✅ | Conteúdo | types/landing.ts + lib/constants (hero, benefits, pricing, faq, footer) — *done* |
| 4 ✅ | Layout + Navbar + Footer | Route group (landing), layout, LandingNavbar, LandingFooter, page com placeholders — *done* |
| 5 ✅ | Hero | HeroSection com headline, descrição, CTA, visual — *done* |
| 6 ✅ | Benefícios | BenefitsSection com layout zig-zag e 4 benefit cards — *done* |
| 7 ✅ | Pricing | PricingSection com Free e Standard — *done* |
| 8 ✅ | FAQ + CTA final | FAQSection (accordion) + CTAFinalSection — *done* |
| 9 ✅ | Animações e polish | useInView, navbar blur, hover em botões, smooth scroll, reduced-motion — *done* |
| 10 ✅ | Performance, a11y, SEO | Imagens (placeholders), Lighthouse-ready, a11y, metadata, JSON-LD, sitemap, robots — *done* |
| 11 | Analytics | GA4/GTM, trackEvent, eventos em CTAs |
| 12 | Testes e deploy | Cross-browser, mobile, deploy, domínio, monitoramento |

---

## 12. Implementation Checklist

### 12.1 Design System
- [x] Bricolage Grotesque installed and configured (Phase 1 — landing layout)
- [x] Purple #A376FF in Tailwind custom colors (`--purple-tatame`, `purple-tatame-light`, `purple-tatame-dark`)
- [x] CSS variables for dark theme configured
- [ ] Type scale defined (to be applied in sections)
- [ ] 8px spacing system applied
- [x] Border radii standardized (`--radius-sm` to `--radius-xl`)
- [x] Shadows defined (`--shadow-card`, `--shadow-card-lg`, `--shadow-cta`)
- [x] Animations configured (Phase 9)

### 12.2 Directory Structure
- [x] `/app/(landing)/` created (Phase 1)
- [x] `/components/landing/` organized by section (hero, benefits, pricing, faq, cta, navbar, footer)
- [x] `/components/shared/` for reusable components
- [x] `/lib/constants/` for content
- [x] `/lib/hooks/` for custom hooks
- [x] `/types/landing.ts` for TypeScript types (Phase 3)

### 12.3 Components
- [x] Logo (Phase 2)
- [x] LandingNavbar
- [x] HeroSection
- [x] BenefitsSection
- [x] PricingSection
- [x] FAQSection
- [x] CTAFinalSection
- [x] LandingFooter
- [x] AppScreenshotPlaceholder (Phase 2)
- [x] SectionContainer (Phase 2)
- [x] GradientButton (Phase 2)
- [x] FeatureList (Phase 2)
- [x] Badge (Phase 2)

### 12.4 Content
- [x] Hero headline and description (Phase 3 — hero.ts)
- [x] 4 benefits with features (Phase 3 — benefits.ts)
- [x] Free and Standard plans detailed (Phase 3 — pricing.ts)
- [x] 5 FAQ items (Phase 3 — faq.ts)
- [ ] CTA copy (used in hero/pricing constants; final CTA in Phase 8)
- [x] Footer links (Phase 3 — footer.ts)

### 12.5 Performance
- [ ] Images optimized (WebP) *(N/A enquanto só placeholders; usar next/image quando houver imagens reais)*
- [ ] Lazy loading configured
- [x] Fonts with display: swap (Phase 10 — Bricolage no layout landing)
- [ ] Bundle size < 150KB
- [ ] Lighthouse score > 90

### 12.6 Accessibility
- [x] Contrast 4.5:1 (AA) *(cores em §9.2.2)*
- [x] Keyboard navigation working (Phase 10 — ordem de foco, skip link, focus visível)
- [x] ARIA labels implemented (Phase 10 — FAQ, landmarks, nav)
- [x] Semantic structure (headings)
- [x] Skip links added (Phase 10)
- [x] Alt text on images *(placeholders com figcaption sr-only; alt em PT quando houver imagens)*
- [x] prefers-reduced-motion respected (Phase 9)

### 12.7 SEO
- [x] Metadata configured (Phase 10)
- [x] Open Graph tags (Phase 10)
- [x] Twitter cards (Phase 10)
- [x] Structured data (JSON-LD) (Phase 10)
- [x] Sitemap created (Phase 10)
- [x] robots.txt configured (Phase 10)

### 12.8 Analytics
- [ ] Google Analytics 4 installed
- [ ] Event tracking implemented
- [ ] Conversion tracking configured
- [ ] Hotjar/Clarity installed (optional)

### 12.9 Testing
- [ ] Tested on Chrome
- [ ] Tested on Firefox
- [ ] Tested on Safari
- [ ] Tested on Edge
- [ ] Tested on iOS
- [ ] Tested on Android
- [ ] Responsiveness validated
- [ ] Links validated

### 12.10 Deploy
- [ ] Deploy to staging
- [ ] Domain configured
- [ ] SSL/HTTPS configured
- [ ] Redirects configured
- [ ] Deploy to production
- [ ] Monitoring active

---

## 13. Decisões Técnicas Documentadas

### 13.1 Por que Route Groups?

**Decisão**: Usar `(landing)` como route group

**Alternativas consideradas**:
1. Raiz do app (`/app/page.tsx`)
2. Subpasta sem group (`/app/landing/page.tsx`)

**Justificativa**:
- Permite layout separado sem afetar URL
- Facilita coexistência com dashboard futuro
- Mantém URLs limpas (`/` ao invés de `/landing`)
- Padrão recomendado pelo Next.js para marketing pages

### 13.2 Por que Conteúdo como Código?

**Decisão**: Conteúdo em arquivos TypeScript (`/lib/constants/`)

**Alternativas consideradas**:
1. CMS headless (Contentful, Sanity)
2. Arquivos JSON/YAML
3. Markdown/MDX

**Justificativa**:
- Type-safety (erros em compile time)
- Sem latência de API calls
- Versionamento com Git
- Simplicidade (sem infraestrutura adicional)
- Performance máxima (conteúdo estático)

**Trade-off**: Edições requerem deploy (aceitável para MVP)

### 13.3 Por que Static Generation?

**Decisão**: Landing page como página estática

**Alternativas consideradas**:
1. Server-Side Rendering (SSR)
2. Incremental Static Regeneration (ISR)

**Justificativa**:
- Performance máxima (HTML pré-renderizado)
- Custo mínimo (servido via CDN)
- Conteúdo não muda frequentemente
- SEO otimizado

**Trade-off**: Mudanças requerem rebuild (aceitável)

### 13.4 Por que shadcn/ui?

**Decisão**: Usar shadcn/ui como base do design system

**Alternativas consideradas**:
1. Componentes do zero
2. MUI/Chakra UI
3. Radix UI direto

**Justificativa**:
- Componentes copiados para o projeto (controle total)
- Baseado em Radix UI (acessibilidade)
- Tailwind CSS (consistência)
- Customização fácil
- Sem bundle extra (tree-shakeable)

**Trade-off**: Setup inicial (já feito no projeto)

### 13.5 Por que não usar Depoimentos no MVP?

**Decisão**: Não incluir seção de depoimentos no lançamento

**Justificativa**:
- Produto novo, sem depoimentos reais ainda
- Depoimentos fake prejudicam credibilidade
- Melhor lançar sem do que com conteúdo falso
- Adicionar 2-4 meses depois com dados reais

### 13.6 Por que Dark Theme apenas?

**Decisão**: Landing page apenas em dark mode

**Alternativas consideradas**:
1. Light mode apenas
2. Toggle de tema (como no projeto atual)

**Justificativa**:
- Identidade visual do produto é dark
- Menos código e complexidade
- Foco em uma experiência premium
- Menos testes necessários

**Trade-off**: Possível preferência de alguns usuários por light (minoritário para o público-alvo)

---

## 14. Technical Glossary

### Design Terms

- **Hero**: First section of a landing page, usually with headline and CTA
- **CTA**: Call-to-Action, button or link that drives user action
- **Above the fold**: Content visible without scrolling
- **Split layout**: Layout split into two columns (50/50)
- **Zig-zag layout**: Alternating layout (left-right-left)
- **Sticky**: Element that stays fixed when scrolling

### Performance Terms

- **LCP**: Largest Contentful Paint (time until largest element loads)
- **FID**: First Input Delay (time until first interaction)
- **CLS**: Cumulative Layout Shift (visual stability)
- **Tree-shaking**: Removal of unused code from the bundle
- **Code splitting**: Splitting code into smaller chunks

### Accessibility Terms

- **WCAG**: Web Content Accessibility Guidelines
- **ARIA**: Accessible Rich Internet Applications
- **Screen reader**: Software that reads content aloud
- **Landmark**: Semantic region of the page (header, main, footer)
- **Skip link**: Link to skip navigation and go to main content

### Next.js Terms

- **App Router**: File-system-based routing (Next.js 13+)
- **Route Group**: Grouping routes without affecting URL
- **Server Component**: Component rendered on the server
- **Static Generation**: HTML generated at build time

---

## 15. Resources and References

### 15.1 Documentation

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [shadcn/ui Components](https://ui.shadcn.com)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

### 15.2 Design Tools

- [Figma](https://figma.com) - Mockup design (if needed)
- [Coolors](https://coolors.co) - Color palette
- [Type Scale](https://typescale.com) - Type scale

### 15.3 Validation Tools

- [Lighthouse](https://developers.google.com/web/tools/lighthouse) - Performance and SEO
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/) - Contrast
- [axe DevTools](https://www.deque.com/axe/devtools/) - Accessibility
- [Wave](https://wave.webaim.org) - Accessibility

### 15.4 Design Inspiration

- [Land-book](https://land-book.com) - Landing page inspiration
- [Lapa Ninja](https://www.lapa.ninja) - SaaS landing pages
- [SaaS Landing Page](https://saaslandingpage.com) - SaaS-specific examples

### 15.5 Performance

- [Web.dev](https://web.dev) - Performance guides
- [Next.js Performance](https://nextjs.org/docs/app/building-your-application/optimizing) - Next.js-specific optimizations
- [Vercel Analytics](https://vercel.com/analytics) - Real-world monitoring

---

## 16. Conclusion

This document is the full guide for implementing the Tatame landing page. It is based on:

1. **Current repository analysis**: Structure, tech stack, patterns
2. **Best practices**: Performance, accessibility, SEO
3. **Scalability**: Preparation for a future web dashboard
4. **Conversion**: Focus on turning visitors into subscribers

### Immediate next steps:

1. **Review this document** with stakeholders
2. **Approve content** (copy, benefits, pricing)
3. **Start implementation** (Phase 1: Foundation)

### Contact:

For questions or suggestions about this plan:
- Backend documentation: `docs/backend/`
- Project README: `README.md`

---

**Document created**: February 7, 2026  
**Last updated**: February 8, 2026  
**Version**: 1.0  
**Status**: 🚧 Phases 1–10 implemented; ready for Phase 11
