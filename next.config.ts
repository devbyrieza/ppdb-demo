import type { NextConfig } from "next";

const nextConfig: NextConfig = {\n  typescript: { ignoreBuildErrors: true },\n  eslint: { ignoreDuringBuilds: true },
  output: "standalone",

  // Hapus generateBuildId yang menggunakan random
  // Biarkan Next.js handle build ID secara otomatis

  // Optimize for faster builds
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },

  experimental: {
    scrollRestoration: false,
    optimizePackageImports: ['lucide-react', '@headlessui/react'],
  },

  // Disable image optimization to prevent sharp memory corruption (502 errors)
  images: {
    unoptimized: true,
  },

  // Cache optimization
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
};

export default nextConfig;
