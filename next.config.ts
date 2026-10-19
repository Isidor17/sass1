import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Les photos de carnet sont réduites côté téléphone (~300 Ko) ; marge pour les navigateurs qui ne le font pas.
  experimental: { serverActions: { bodySizeLimit: "8mb" } },
};

export default nextConfig;
