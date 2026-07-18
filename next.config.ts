import type { NextConfig } from "next";

const supabaseHostname = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
  : undefined

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Allow blog cover images up to 5 MB plus multipart form overhead.
      bodySizeLimit: '6mb',
    },
  },
  images: {
    remotePatterns: supabaseHostname
      ? [
          {
            protocol: 'https',
            hostname: supabaseHostname,
            pathname: '/storage/v1/object/public/**',
          },
        ]
      : [],
  },
};

export default nextConfig;
