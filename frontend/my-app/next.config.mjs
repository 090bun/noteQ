// next.config.js  —— 單一版本（CommonJS）
/** @type {import('next').NextConfig} */
const backend = process.env.BACKEND_ORIGIN || 'http://django:8000';
module.exports = {
  async rewrites() {
    return [
      { source: '/api/:path*', destination: `${backend}/api/:path*` },
      { source: '/login',      destination: `${backend}/login` },
      { source: '/login/',     destination: `${backend}/login/` },
      { source: '/:path*',     destination: `${backend}/:path*` },
    ];
  },
};