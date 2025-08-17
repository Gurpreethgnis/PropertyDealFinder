/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  output: 'export',  // Enable static export for Cloudflare Pages
  trailingSlash: true,  // Required for static export
  images: {
    domains: ['localhost'],
    unoptimized: true,  // Required for static export
  },
  // Environment variables for the application
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  },
}

module.exports = nextConfig
