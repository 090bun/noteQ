# --- Build Stage ---
FROM node:20-bookworm-slim AS builder

# 設定工作目錄
WORKDIR /app

# 複製 package.json 和 lock 檔
COPY package*.json ./

# 安裝依賴
RUN npm install --no-audit --no-fund

# 複製專案程式碼
COPY . .

# Next.js build → 配置了 output: 'export' 會自動輸出到 /app/out
RUN npm run build

# --- Production Stage ---
FROM nginx:stable-alpine

# 設定 Nginx 預設目錄
WORKDIR /usr/share/nginx/html

# 清空預設內容
RUN rm -rf ./*

# 複製 Next.js 靜態導出的檔案
COPY --from=builder /app/out  .
# 開放 80 port
EXPOSE 80

# 啟動 Nginx
CMD ["nginx", "-g", "daemon off;"]
