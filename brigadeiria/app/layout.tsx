import type { Metadata, Viewport } from "next";
import { Cinzel, Cormorant_Garamond, Figtree, Great_Vibes } from "next/font/google";
import { Providers } from "@/components/providers";
import { site } from "@/lib/site";
import "./globals.css";

// As letras do logo: maiúsculas romanas em "BRIGADEIRIA" e cursiva em "e algo mais"
const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});
const cinzel = Cinzel({ subsets: ["latin"], weight: ["500", "600"], variable: "--font-cinzel", display: "swap" });
const vibes = Great_Vibes({ subsets: ["latin"], weight: "400", variable: "--font-vibes", display: "swap" });
const figtree = Figtree({ subsets: ["latin"], variable: "--font-figtree", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: site.title,
  description: site.description,
  keywords: [
    "confeitaria",
    "entremet",
    "macarons",
    "torre de macarons",
    "bolo espatulado",
    "docinhos finos",
    "Pelinca",
    "Campos dos Goytacazes",
    "Brigadeiria e Algo Mais",
  ],
  alternates: { canonical: `${site.url}/` },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: site.url,
    siteName: site.name,
    title: site.title,
    description: site.description,
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fffaf6" },
    { media: "(prefers-color-scheme: dark)", color: "#1b0f0e" },
  ],
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Bakery",
  name: site.name,
  description: site.description,
  url: site.url,
  telephone: `+${site.phone}`,
  sameAs: [site.instagram, site.facebook],
  servesCuisine: ["Confeitaria"],
  foundingDate: "2015-07",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${cormorant.variable} ${cinzel.variable} ${vibes.variable} ${figtree.variable}`} suppressHydrationWarning>
      <body className="font-sans">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <Providers>{children}</Providers>
        <div className="grain" aria-hidden />
      </body>
    </html>
  );
}
