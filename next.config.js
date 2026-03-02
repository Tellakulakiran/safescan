/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['ws', '@prisma/client', 'prisma'],
  },
}
module.exports = nextConfig