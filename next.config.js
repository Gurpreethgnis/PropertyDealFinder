/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    appDir: false,
  },
  images: {
    domains: ['localhost'],
  },
  // Sprint 1: Configure for port 4000
  env: {
    PORT: 4000,
  },
}

module.exports = nextConfig
