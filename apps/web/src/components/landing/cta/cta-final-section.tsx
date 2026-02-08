import { SectionContainer } from "@/components/shared/section-container";

const HEADLINE = "Pronto para transformar a gestão da sua academia?";
const SUBHEADLINE = "Comece hoje e veja os resultados";
const CTA_LABEL = "Assinar Standard - R$ 49,99/mês";
const DISCLAIMER = "Sem compromisso. Cancele quando quiser.";

export function CTAFinalSection() {
  return (
    <SectionContainer
      id="cta-final"
      paddingY="md"
      className="bg-gradient-to-b from-background to-card text-center"
    >
      <h2 className="text-4xl font-bold tracking-tight text-foreground">
        {HEADLINE}
      </h2>
      <p className="mx-auto mt-4 max-w-2xl text-xl text-muted-foreground mb-8">
        {SUBHEADLINE}
      </p>
      <a
        href="#pricing"
        className="inline-flex h-14 items-center justify-center rounded-lg px-8 text-lg font-semibold text-white bg-gradient-to-br from-[#A376FF] to-[#8B5CF6] shadow-[0_4px_14px_0_rgba(163,118,255,0.25)] transition-all duration-150 ease-out hover:translate-y-[-2px] hover:shadow-[0_6px_20px_0_rgba(163,118,255,0.4)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A376FF]/50"
      >
        {CTA_LABEL}
      </a>
      <p className="mt-4 text-sm text-muted-foreground">{DISCLAIMER}</p>
    </SectionContainer>
  );
}
