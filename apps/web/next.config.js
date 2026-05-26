/** @type {import('next').NextConfig} */
const pkg = require('./package.json');

const nextConfig = {
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
    // Auto-updates on every Vercel deploy; falls back to package.json version locally
    APP_VERSION: process.env.VERCEL_GIT_COMMIT_SHA
      ? process.env.VERCEL_GIT_COMMIT_SHA.slice(0, 7)
      : pkg.version,
  },
};

module.exports = nextConfig;
