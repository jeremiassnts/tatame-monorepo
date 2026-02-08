import type { Benefit } from "@/types/landing";

export const BENEFITS: readonly Benefit[] = [
  {
    id: "financial-control",
    title: "Controle financeiro completo",
    description:
      "Tenha visão clara da saúde financeira da sua academia em tempo real.",
    features: [
      "Acompanhamento de mensalidades",
      "Relatórios de receitas e despesas",
      "Lembretes de pagamento automáticos",
      "Histórico de transações",
    ],
    imagePlaceholder: "financial",
    imageAlt: "Interface de controle financeiro do Tatame",
  },
  {
    id: "student-management",
    title: "Gestão de alunos simplificada",
    description:
      "Organize informações dos alunos, presenças e evolução técnica em um só lugar.",
    features: [
      "Cadastro completo de alunos",
      "Controle de presenças",
      "Registro de graduações",
      "Histórico de evolução",
    ],
    imagePlaceholder: "student-list",
    imageAlt: "Lista de alunos no aplicativo Tatame",
  },
  {
    id: "class-organization",
    title: "Organização de aulas e treinos",
    description: "Planeje e gerencie o calendário de treinos com facilidade.",
    features: [
      "Calendário de aulas",
      "Planejamento de treinos",
      "Notificações para alunos",
      "Gestão de horários",
    ],
    imagePlaceholder: "class-schedule",
    imageAlt: "Calendário de treinos do Tatame",
  },
  {
    id: "growth-insights",
    title: "Visão clara do crescimento",
    description:
      "Métricas e relatórios para tomar decisões estratégicas baseadas em dados.",
    features: [
      "Dashboard com métricas principais",
      "Relatórios de crescimento",
      "Análise de retenção de alunos",
      "Projeções financeiras",
    ],
    imagePlaceholder: "analytics",
    imageAlt: "Dashboard de análises do Tatame",
  },
] as const;
