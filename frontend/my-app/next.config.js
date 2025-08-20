// next.config.js
const backend = process.env.BACKEND_ORIGIN || 'http://django:8000';

module.exports = {
  // ★ 重要：不要把有斜線的 URL 自動改成沒斜線（避免 308）
  skipTrailingSlashRedirect: true,

  async rewrites() {
    return [
      { source: '/api/:path*', destination: `${backend}/api/:path*` },
      // 若有 /login 的 API 也要代理可加：
      // { source: '/login',  destination: `${backend}/login` },
      // { source: '/login/', destination: `${backend}/login/` },
    ];
  },
};
