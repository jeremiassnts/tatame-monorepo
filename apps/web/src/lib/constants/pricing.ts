import type { PricingPlan } from "@/types/landing";

export const PRICING_PLANS: readonly PricingPlan[] = [
  {
    id: "free",
    name: "Free",
    tagline: "Para alunos e professores",
    price: 0,
    currency: "BRL",
    interval: null,
    features: [
      "Acesso ao aplicativo móvel",
      "Visualização de treinos",
      "Acompanhamento de graduações",
      "Notificações de aulas",
    ],
    cta: "Começar grátis",
    highlighted: false,
    badge: null,
  },
  {
    id: "standard",
    name: "Standard",
    tagline: "Para gestores de academias",
    price: 49.99,
    currency: "BRL",
    interval: "mês",
    features: [
      "Tudo do plano Free",
      "Gestão completa de alunos",
      "Controle financeiro avançado",
      "Relatórios e análises",
      "Organização de aulas e treinos",
      "Suporte prioritário",
    ],
    cta: "Assinar agora",
    highlighted: true,
    badge: "Mais popular",
  },
] as const;
