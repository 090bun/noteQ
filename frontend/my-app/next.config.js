// next.config.js  —— 單一版本（CommonJS）
/** @type {import('next').NextConfig} */
const backendOrigin = process.env.NEXT_PUBLIC_API_ORIGIN || 'http://django:8000';

module.exports = {
  async rewrites() {
    return [
      // 讓 :3000/login 代理到後端
      { source: '/login',  destination: `${backendOrigin}/login` },
      { source: '/login/', destination: `${backendOrigin}/login/` }, // 避免 308 加斜線

      // 後端 API
      { source: '/api/:path*', destination: `${backendOrigin}/api/:path*` },

      // 你原本的通用 proxy（如果還需要就保留）
      { source: '/api-proxy/:path*', destination: `${backendOrigin}/:path*` },
    ];
  },
  // 可選：若常看到 308，可統一加斜線
  // trailingSlash: true,
};
