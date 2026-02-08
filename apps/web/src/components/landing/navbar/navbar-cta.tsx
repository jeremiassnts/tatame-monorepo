"use client";

const ctaClass =
  "inline-flex items-center justify-center rounded-lg px-4 py-2 font-semibold text-white bg-gradient-to-br from-[#A376FF] to-[#8B5CF6] shadow-[0_4px_14px_0_rgba(163,118,255,0.25)] transition-all duration-150 ease-out hover:-translate-y-px hover:shadow-[0_6px_20px_0_rgba(163,118,255,0.4)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A376FF]/50";

export function NavbarCTA() {
  return (
    <a href="#pricing" className={ctaClass} aria-label="Assinar plano Standard">
      <span className="hidden sm:inline">Assine agora</span>
      <span className="sm:hidden">Assinar</span>
    </a>
  );
}
