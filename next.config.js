/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://neoconnect-backend-wzc0.onrender.com/api/:path*',
      },
    ];
  },
};

module.exports = nextConfig;