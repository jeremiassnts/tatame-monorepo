import type { FAQItem } from "@/types/landing";

export const FAQ_ITEMS: readonly FAQItem[] = [
  {
    id: "what-is-tatame",
    question: "O que é o Tatame?",
    answer:
      "Tatame é uma plataforma completa de gestão para academias de Jiu-Jitsu. Oferecemos ferramentas para controle financeiro, gestão de alunos, organização de treinos e muito mais. Nosso objetivo é simplificar a administração da sua academia para que você possa focar no que realmente importa: ensinar e fazer sua academia crescer.",
  },
  {
    id: "who-uses-tatame",
    question: "Quem pode usar o Tatame?",
    answer:
      "O Tatame é usado por gestores, professores e alunos de academias de Jiu-Jitsu. Gestores têm acesso ao plano Standard com todas as funcionalidades de administração. Professores e alunos utilizam o plano Free para acompanhar treinos, graduações e receber notificações.",
  },
  {
    id: "how-payment-works",
    question: "Como funciona o pagamento?",
    answer:
      "O plano Standard custa R$ 49,99 por mês e pode ser cancelado a qualquer momento sem multa. Aceitamos pagamentos via cartão de crédito através da nossa plataforma segura. A cobrança é feita automaticamente todo mês, e você recebe um recibo por e-mail.",
  },
  {
    id: "can-i-cancel",
    question: "Posso cancelar a qualquer momento?",
    answer:
      "Sim! Você pode cancelar sua assinatura a qualquer momento sem nenhuma taxa ou multa. Ao cancelar, você mantém acesso às funcionalidades até o final do período já pago. Não há contratos de longo prazo ou compromissos.",
  },
  {
    id: "support",
    question: "Qual tipo de suporte vocês oferecem?",
    answer:
      "Assinantes do plano Standard têm acesso a suporte prioritário via e-mail. Respondemos normalmente em até 24 horas. Também oferecemos documentação completa e tutoriais em vídeo para ajudar você a aproveitar ao máximo a plataforma.",
  },
] as const;
