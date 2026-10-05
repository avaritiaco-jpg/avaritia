import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Exporta HTML estático em /out: hospede em Vercel, Netlify, Hostinger, GitHub Pages etc.
  output: "export",
  images: { unoptimized: true },
  trailingSlash: true,
};

export default nextConfig;
