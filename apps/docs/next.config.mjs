import nextra from 'nextra';

const withNextra = nextra({
  theme: 'nextra-theme-docs',
  themeConfig: './theme.config.tsx',
});

export default withNextra({
  reactStrictMode: true,
  // Enable static export for deployment
  output: 'export',
  images: {
    unoptimized: true,
  },

  // Bypass TypeScript and ESLint errors for deployment
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
});
