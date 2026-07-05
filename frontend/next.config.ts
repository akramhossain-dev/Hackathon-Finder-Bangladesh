/** @type {import('next').NextConfig} */
const nextConfig = {
  // Strict mode for catching potential issues early
  reactStrictMode: true,

  // Image domains will be configured in Phase 1 when we add real sources
  images: {
    remotePatterns: [],
  },
};

export default nextConfig;
