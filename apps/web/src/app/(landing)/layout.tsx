import type { Metadata } from "next";
import { Montserrat } from "next/font/google";

import { GoogleAnalytics } from "@/components/landing/google-analytics";
import { StructuredData } from "@/components/landing/structured-data";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://tatame.com.br";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Tatame - Gestão completa para academias de Jiu-Jitsu",
  description:
    "Controle financeiro, gestão de alunos e organização de treinos em um só lugar. Plataforma completa para gestores de academias de Jiu-Jitsu. R$ 49,99/mês.",
  keywords: [
    "gestão de academias",
    "jiu-jitsu",
    "controle financeiro",
    "gestão de alunos",
    "tatame",
  ],
  authors: [{ name: "Tatame" }],
  openGraph: {
    title: "Tatame - Gestão completa para academias de Jiu-Jitsu",
    description:
      "Controle financeiro, gestão de alunos e organização de treinos em um só lugar.",
    url: "https://tatame.com.br",
    siteName: "Tatame",
    images: [
      {
        url: "/images/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Tatame - Gestão de academias",
      },
    ],
    locale: "pt_BR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Tatame - Gestão completa para academias de Jiu-Jitsu",
    description:
      "Controle financeiro, gestão de alunos e organização de treinos.",
    images: ["/images/twitter-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function LandingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

  return (
    <div className={`${montserrat.className} dark`}>
      {gaId && <GoogleAnalytics gaId={gaId} />}
      <StructuredData />
      {children}
    </div>
  );
}
