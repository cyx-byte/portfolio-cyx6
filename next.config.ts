import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  basePath: '/portfolio-cyx6',
  trailingSlash: true,
  images: { unoptimized: true },
};

export default nextConfig;
