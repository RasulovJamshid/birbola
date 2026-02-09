/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'api.birbola.uz',
      },
      {
        protocol: 'https',
        hostname: 'auth.birbola.uz',
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/api/v1/:path*',
        destination: 'https://api.birbola.uz/api/v1/:path*',
      },
      {
        source: '/auth/api/:path*',
        destination: 'https://auth.birbola.uz/api/:path*',
      },
    ]
  },
  // Enable React strict mode for better development experience
  reactStrictMode: true,
  // Configure output for standalone deployment
  output: 'standalone',
}

export default nextConfig
