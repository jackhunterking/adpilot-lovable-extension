import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: { ignoreBuildErrors: true },
  env: {
    NEXT_PUBLIC_FB_APP_ID: process.env.NEXT_PUBLIC_FB_APP_ID,
    NEXT_PUBLIC_FB_GRAPH_VERSION: process.env.NEXT_PUBLIC_FB_GRAPH_VERSION,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [32, 48, 64, 96, 128, 256, 384], // Removed 16 (Next.js 16 breaking change)
    minimumCacheTTL: 31536000, // 1 year for immutable images
  },
  // Allow the app to be embedded in iframes on Lovable
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          // Removed X-Frame-Options (conflicts with CSP and invalid value in Next.js 16)
          {
            key: 'Content-Security-Policy',
            value: "frame-ancestors 'self' https://lovable.dev https://*.lovable.dev http://localhost:* http://127.0.0.1:*",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
