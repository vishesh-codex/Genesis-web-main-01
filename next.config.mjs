/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
  },

  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
  turbopack: {
    root: process.cwd(),
  },
};

export default nextConfig;