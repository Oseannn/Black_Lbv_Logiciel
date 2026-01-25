import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: "standalone",

  // Environment variables
  env: {
    NEXT_PUBLIC_BACKEND_URL:
      process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3000",
    NEXT_PUBLIC_API_URL:
      process.env.NEXT_PUBLIC_API_URL ||
      `${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3000"}/api`,
  },

  // Image optimization configuration
  images: {
    remotePatterns: [
      // Local development
      {
        protocol: "http",
        hostname: "localhost",
        port: "3000",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "127.0.0.1",
        port: "3000",
        pathname: "/**",
      },
      // Railway production backend (wildcard for any Railway domain)
      {
        protocol: "https",
        hostname: "*.railway.app",
        pathname: "/**",
      },
      // Alternative: specific Railway domain (uncomment and customize)
      // {
      //   protocol: 'https',
      //   hostname: 'your-backend.up.railway.app',
      //   pathname: '/**',
      // },
    ],
  },

  // Headers for security
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "origin-when-cross-origin",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
