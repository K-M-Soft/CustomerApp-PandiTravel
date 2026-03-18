import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '5star-transportation.com',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
