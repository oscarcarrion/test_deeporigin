/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  experimental: {
    // This is required to work with Docker
    outputFileTracingRoot: undefined,
  },
  // Disable eslint during builds for faster production builds
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Enable image optimization for better performance
  images: {
    domains: [],
    unoptimized: true, // Disable for Docker deployment
  },
  // Security headers
  async headers() {
    return [
      {
        source: "/(.*)",
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
