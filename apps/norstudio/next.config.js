/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  output: 'standalone',

  // Ignore TypeScript and ESLint errors during builds (for CI/CD flexibility)
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },

  // Webpack configuration for Monaco Editor and browser compatibility
  webpack: (config, { isServer }) => {
    // Monaco Editor requires specific webpack configuration
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
      crypto: false,
      stream: false,
      http: false,
      https: false,
      zlib: false,
      path: false,
      os: false,
    };

    // Handle Monaco Editor workers
    if (!isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        'monaco-editor': 'monaco-editor/esm/vs/editor/editor.api',
      };
    }

    return config;
  },

  // Transpile Monaco Editor for better compatibility
  transpilePackages: ['monaco-editor'],

  // Environment variables exposed to the browser
  env: {
    NEXT_PUBLIC_APP_NAME: 'NorStudio',
    NEXT_PUBLIC_APP_VERSION: '1.0.0',
  },

  // Image optimization configuration
  images: {
    domains: ['norchain.org', 'api.norchain.org'],
  },

  // Headers for security
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
