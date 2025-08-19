/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'export',  // Enable static export for Cloudflare Pages
  // trailingSlash: true,  // Removed to prevent API redirect issues
  images: {
    domains: ['localhost'],
    unoptimized: true,  // Required for static export
  },
  // Environment variables for the application
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8080',
  },
}

module.exports = nextConfig
