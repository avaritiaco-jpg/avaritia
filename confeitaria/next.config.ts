import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Exporta HTML estático em /out: hospede em Vercel, Netlify, Hostinger, GitHub Pages etc.
  output: "export",
  images: { unoptimized: true },
  trailingSlash: true,
  // GitHub Pages serve o site numa subpasta (defina NEXT_PUBLIC_BASE_PATH no build); na raiz do domínio fica vazio
  basePath: (process.env.NEXT_PUBLIC_BASE_PATH ?? "").replace(/\/$/, ""),
};

export default nextConfig;
