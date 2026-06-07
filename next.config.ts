import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "https://stockmate-server-6lvd.onrender.com/:path*",
      },
    ];
  },
};

export default nextConfig;
