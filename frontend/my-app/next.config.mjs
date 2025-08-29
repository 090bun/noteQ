console.log("✅ Loaded next.config.mjs");

/** @type {import('next').NextConfig} */
const nextConfig = {
     images: {
           unoptimized: true,  // 關閉內建圖片優化
     },
     output: 'export',   // <-- 告訴 Next.js 輸出靜態檔
};

export default nextConfig;
