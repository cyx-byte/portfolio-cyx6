import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  trailingSlash: true,
  images: { unoptimized: true },
  async rewrites() {
    return [
      {
        source: '/uploads/:path*',
        destination: 'https://portfolio-cyx6-1446625869.cos-website.ap-guangzhou.myqcloud.com/uploads/:path*',
      },
    ];
  },
};

export default nextConfig;
