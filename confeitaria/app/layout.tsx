import type { Metadata, Viewport } from "next";
import { Quicksand, Satisfy } from "next/font/google";
import { Providers } from "@/components/providers";
import { site } from "@/lib/site";
import "./globals.css";

// As mesmas famílias do cardápio impresso: cursiva nos títulos, Quicksand no texto
const satisfy = Satisfy({ subsets: ["latin"], weight: "400", variable: "--font-satisfy", display: "swap" });
const quicksand = Quicksand({ subsets: ["latin"], variable: "--font-quicksand", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: site.title,
  description: site.description,
  keywords: [
    "confeitaria",
    "bolo por encomenda",
    "bolo confeitado",
    "bolo gelado",
    "brigadeiro gourmet",
    "trufas",
    "docinhos para festa",
    "Cianinha Confeitaria",
  ],
  alternates: { canonical: `${site.url}/` },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: site.url,
    siteName: site.fullName,
    title: site.title,
    description: site.description,
    images: [{ url: `${site.url}/og.jpg`, width: 1200, height: 630, alt: site.fullName }],
  },
  twitter: {
    card: "summary_large_image",
    title: site.title,
    description: site.description,
    images: [`${site.url}/og.jpg`],
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#fbf3f1",
  colorScheme: "light",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Bakery",
  name: site.fullName,
  description: site.description,
  url: site.url,
  telephone: `+${site.whatsapp}`,
  sameAs: [site.instagram],
  servesCuisine: "Confeitaria",
  paymentAccepted: "Pix, PicPay, Dinheiro",
  openingHoursSpecification: {
    "@type": "OpeningHoursSpecification",
    dayOfWeek: ["Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${satisfy.variable} ${quicksand.variable}`} suppressHydrationWarning>
      <body className="font-sans">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <Providers>{children}</Providers>
        <div className="grain" aria-hidden />
      </body>
    </html>
  );
}
