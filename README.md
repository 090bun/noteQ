# 專案簡介
本專案為一個多服務架構的系統，使用 Django 作為後端服務，以及Flask 的微服務（ml-service）。

# 目錄結構
```
/
├── frontend/ # React 前端
│ └── README.md
├── backend-django/ # Django 主系統（JWT驗證帳號、熟悉度計算、綠界串接、筆記系統）
│ └── README.md
├── ml-service/ # Flask 微服務（GPT 題目產生、聊天處理）
│ └── README.md
├── docker-compose.yml # 整合啟動所有服務
├── .gitignore
└── README.md # 專案說明
```

## 技術棧

- Django
- Flask 
- Python 
- MySQL
- Docker
- React 

---

## 啟動流程

下面提供整個專案及各服務的本地開發啟動步驟。專案採多服務架構：前端（React）、後端（Django REST）、以及Flask作為微服務（ml-service）。
建議先透過 Docker Compose 一次啟動整個開發環境，或分別啟動各服務以利開發除錯。

1) 使用 docker-compose

	 在專案根目錄執行：

```powershell
docker-compose up --build
```

	 會根據 `docker-compose.yml` 啟動或建立所需的服務（若有設定資料庫、redis 等會一併啟動）。

2) 個別啟動（開發模式）

 - 後端（Django）
	- 進入資料夾 backend-django

```
# 使用虛擬環境(uv)
source .venv/Scripts/activate
uv sync
uv run python manage.py migrate
uv run python manage.py runserver

```

 - 前端（React）
	- 進入資料夾 frontend/my-app
  
```
npm install
npm run dev

```

 - 機器學習服務（ml-service）
	- 進入資料夾 ml-service
  
```
# 使用虛擬環境(uv)
source .venv/Scripts/activate
uv sync
python topic_apps.py

```

3) 瀏覽器介面
   
	 - 後端 Swagger 可透過： http://noteq.pair.tw/swagger/ 或 /redoc/ 檢視 API 文件（若後端使用預設埠）。

注意：以上執行埠與設定以你本機環境與 docker-compose 設定為準，若有額外環境變數（例如資料庫連線字串）請在啟動前設定或建立 `.env` 檔案。

## API 介面說明（摘要）

以下為專案目前已實作的主要 API 端點與簡短說明，範例基於本機後端在 http://noteq.pair.tw/swagger/的假設。

- 認證與使用者

- Quiz 相關

	- GET /api/quiz/ 取得 Quiz 列表

	- POST /api/quiz/ 建立 Quiz

	- GET /api/quiz/{quiz_id}/topics/ 取得 Quiz 下的所有 Topics

	- POST /api/create_quiz/ 建立 Quiz 與 Topic

- Topic 相關

	- GET /api/topic/{topic_id}/ 取得單一 Topic 詳細

	- PATCH /api/topic/{topic_id}/ 更新單一 Topic

	- DELETE /api/topic/{topic_id}/ 刪除單一 Topic

- Note 相關

	- GET /api/notes/ 取得使用者的 Note 列表

	- POST /api/notes/ 新增 Note

	- GET /api/notes/{note_id}/ 取得單一 Note

	- PATCH /api/notes/{note_id}/ 編輯單一 Note

	- DELETE /api/notes/{note_id}/ 刪除單一 Note

- User / Auth 相關

	- POST /api/token/ 取得 JWT Token

	- POST /api/token/refresh/ 刷新 JWT Token

	- POST /api/register/ 使用者註冊

	- POST /api/login/ 使用者登入

	- POST /api/logout/ 使用者登出

	- POST /api/forgot_password/ 忘記密碼

	- POST /api/reset_password/ 重設密碼

- Familiarity (熟悉度) 相關

	- POST /api/submit_answer/ 提交使用者單題作答

	- POST /api/submit_attempt/ 提交測驗結果，計算熟悉度

	- GET /api/familiarity/ 取得使用者所有熟悉度紀錄

- ECPay (金流) 相關

	- POST /api/ecpay/create_order/ 建立訂單

	- POST /api/ecpay/callback/ 綠界金流回調

	- GET /api/ecpay/redirect/ 綠界付款結果導回前端

	
## Swagger / API 文件

後端已整合 drf-yasg，啟動 Django 後可在以下路徑查看互動式文件（預設）：

- http://noteq.pair.tw/swagger/  (Swagger UI)
- http://noteq.pair.tw/redoc/    (ReDoc)

## 注意事項

- 大多數需要授權的端點請在 HTTP Header 中加入 Authorization: Bearer <access_token>
- 若要在前端取得 `is_paid`（訂閱狀態），登入 API 會回傳 `is_paid` 欄位，可儲存在 localStorage 或前端狀態管理中。
- 若後端在非預期埠或以 Docker 運行，請依 docker-compose 設定自行調整 URL 與埠號。
