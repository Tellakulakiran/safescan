/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['ws', '@prisma/client', 'prisma'],
}
module.exports = nextConfig