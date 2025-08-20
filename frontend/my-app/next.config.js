// next.config.js
const backend = process.env.BACKEND_ORIGIN || 'http://django:8000';

module.exports = {
  // 避免 Next 自動尾斜線轉址造成 308 來回跳轉
  skipTrailingSlashRedirect: true,

  async rewrites() {
    return [
      // 既有後端 /api 路徑直接代理
      { source: '/api/:path*', destination: `${backend}/api/:path*` },

      // 掛在根目錄的授權相關 API，改由前端以 /api/* 呼叫，再代理到後端對應端點，避免與 Next 的 /login 頁面衝突
      { source: '/api/login/',           destination: `${backend}/login/` },
      { source: '/api/register/',        destination: `${backend}/register/` },
      { source: '/api/forgot-password/', destination: `${backend}/forgot-password/` },
      { source: '/api/reset-password/',  destination: `${backend}/reset-password/` },
    ];
  },
};
