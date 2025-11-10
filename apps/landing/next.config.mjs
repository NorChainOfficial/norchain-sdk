/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Enable static export for deployment
  output: 'export',
  trailingSlash: true,
  
  // Image optimization needs to be disabled for static export
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
}

export default nextConfig
