import type { NextConfig } from "next";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

// Content Security Policy
const cspDirectives = [
  "default-src 'self'",
  `connect-src 'self' ${API_URL}`,
  "img-src 'self' data: blob: https://*.blob.core.windows.net",
  "media-src 'self' blob: https://*.blob.core.windows.net",
  // Next.js requires 'unsafe-eval' in dev; restrict in production
  process.env.NODE_ENV === "development"
    ? "script-src 'self' 'unsafe-eval' 'unsafe-inline'"
    : "script-src 'self'",
  "style-src 'self' 'unsafe-inline'", // Tailwind requires inline styles
  "font-src 'self' data:",
  "frame-src 'none'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "upgrade-insecure-requests",
];

const securityHeaders = [
  {
    key: "Content-Security-Policy",
    value: cspDirectives.join("; "),
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "X-Frame-Options",
    value: "DENY",
  },
  {
    key: "X-XSS-Protection",
    value: "1; mode=block",
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=()",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
];

const nextConfig: NextConfig = {
  output: "standalone",

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.blob.core.windows.net",
      },
    ],
    formats: ["image/avif", "image/webp"],
  },

  experimental: {
    optimizePackageImports: ["lucide-react"],
  },

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
