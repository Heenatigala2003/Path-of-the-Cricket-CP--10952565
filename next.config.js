/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // SWC minification is now default and cannot be disabled – keep commented out.

  // TypeScript error handling
  typescript: {
    // Ignore build errors only in development, enforce in production
    ignoreBuildErrors: process.env.NODE_ENV === 'production' ? false : true,
  },

  // Images configuration – remotePatterns for Supabase and OAuth providers
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'jmzugvwoszqgfrjpxppw.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**', // ✅ Allow all public buckets
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
        pathname: '/**',
      },
    ],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    formats: ['image/webp'],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: false,
    contentSecurityPolicy:
      "default-src 'self'; script-src 'none'; sandbox;",
  },

  // Webpack optimizations (if you still need webpack – Turbopack users can remove this)
  webpack: (config, { dev, isServer }) => {
    if (!dev && !isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        maxInitialRequests: 25,
        minSize: 20000,
        cacheGroups: {
          default: false,
          vendors: false,
          framework: {
            name: 'framework',
            test: /[\\/]node_modules[\\/](react|react-dom|next)[\\/]/,
            priority: 40,
            enforce: true,
          },
          lib: {
            test: /[\\/]node_modules[\\/]/,
            name(module) {
              const match = module.context.match(
                /[\\/]node_modules[\\/](.*?)([\\/]|$)/
              );
              const packageName = match ? match[1] : 'lib';
              return `npm.${packageName.replace('@', '')}`;
            },
            priority: 30,
            minChunks: 1,
            reuseExistingChunk: true,
          },
          commons: {
            name: 'commons',
            minChunks: 2,
            priority: 20,
          },
        },
      };
      config.optimization.minimize = true;
    }

    // Handle SVGR for SVG files
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack'],
    });

    return config;
  },

  // Turbopack config (empty – keeps Turbopack from complaining)
  turbopack: {},

  // Environment variables exposed to the client
  env: {
    APP_NAME: 'SL Cricket Academy',
    APP_VERSION: '1.0.0',
    APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  },

  // Security headers – merged with the additional CSP requirements
  async headers() {
    if (process.env.NODE_ENV === 'development') {
      return []; // No headers in development for easier debugging
    }
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Referrer-Policy', value: 'origin-when-cross-origin' },
          {
            key: 'Permissions-Policy',
            value:
              'camera=(), microphone=(), geolocation=(), interest-cohort=()',
          },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              // Script sources: include MetaMask compatibility (unsafe-eval, unsafe-inline)
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://jmzugvwoszqgfrjpxppw.supabase.co https://*.infura.io https://*.alchemy.com",
              "style-src 'self' 'unsafe-inline'",
              // Image sources: Supabase, Google, GitHub
              "img-src 'self' data: https://jmzugvwoszqgfrjpxppw.supabase.co https://lh3.googleusercontent.com https://avatars.githubusercontent.com",
              "font-src 'self'",
              // Connect sources: Supabase, Infura, Alchemy, WebSocket for Supabase realtime
              "connect-src 'self' https://jmzugvwoszqgfrjpxppw.supabase.co wss://jmzugvwoszqgfrjpxppw.supabase.co https://*.infura.io https://*.alchemy.com",
              // Frame sources: allow MetaMask iframe
              "frame-src 'self' https://*.metamask.io",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
            ].join('; '),
          },
        ],
      },
    ];
  },

  // Redirects
  async redirects() {
    return [
      { source: '/old-admin', destination: '/admin-panel', permanent: true },
      {
        source: '/cricket/:path*',
        destination: '/matches/:path*',
        permanent: false,
      },
    ];
  },

  // Rewrites (API proxy)
  async rewrites() {
    return [
      {
        source: '/api/v1/:path*',
        destination: 'https://api.example.com/:path*',
      },
    ];
  },

  // i18n is not needed – App Router handles internationalization via middleware.

  // General settings
  compress: true,
  poweredByHeader: false,
  generateEtags: true,

  // Page extensions
  pageExtensions: ['tsx', 'ts', 'jsx', 'js'],
};

// Development overrides
if (process.env.NODE_ENV === 'development') {
  nextConfig.logging = { fetches: { fullUrl: true } };
}

// Production overrides
if (process.env.NODE_ENV === 'production') {
  nextConfig.productionBrowserSourceMaps = false;
  // swcMinify is removed – it's now default.
}

module.exports = nextConfig;