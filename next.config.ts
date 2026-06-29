import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  trailingSlash: true,
  images: { unoptimized: true },
  async rewrites() {
    return [
      {
        source: '/uploads/:path*',
        destination: 'https://my-website-images-1446625869.cos-website.ap-guangzhou.myqcloud.com/uploads/:path*',
      },
    ];
  },
};

export default nextConfig;
