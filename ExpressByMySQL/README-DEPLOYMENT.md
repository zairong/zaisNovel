# 📦 Render 部署指南

## 🎯 專案概述

此專案已完全配置為 PostgreSQL，適合部署到 Render 平台。

### 技術棧
- **後端**: Node.js + Express.js
- **資料庫**: PostgreSQL
- **ORM**: Sequelize
- **認證**: JWT
- **部署平台**: Render

## 🚀 部署到 Render

### 方法一：使用 render.yaml（推薦）

1. **上傳到 GitHub**
   ```bash
   git add .
   git commit -m "準備部署到 Render - PostgreSQL 配置"
   git push origin main
   ```

2. **在 Render 創建服務**
   - 登入 [Render Dashboard](https://dashboard.render.com)
   - 點擊 "New +" → "Blueprint"
   - 連接您的 GitHub 儲存庫
   - 選擇包含 `render.yaml` 的專案
   - Render 會自動創建資料庫和 Web 服務

3. **設置環境變數**
   - `JWT_SECRET`: 會自動生成安全密鑰
   - `FRONTEND_URL`: 更新為您的前端網址
   - 其他變數已在 `render.yaml` 中預設

### 方法二：手動設置

#### Step 1: 創建 PostgreSQL 資料庫
1. 在 Render Dashboard 點擊 "New +"
2. 選擇 "PostgreSQL"
3. 填寫資料庫資訊：
   - **Name**: `zaisnovel-db`
   - **Database**: `zaisnovel`
   - **User**: `zaisnovel_user`
   - **Region**: 選擇最近的區域
   - **Plan**: Free

#### Step 2: 創建 Web 服務
1. 在 Render Dashboard 點擊 "New +"
2. 選擇 "Web Service"
3. 連接您的 GitHub 儲存庫
4. 填寫服務資訊：
   - **Name**: `zaisnovel-backend`
   - **Region**: 與資料庫相同區域
   - **Branch**: `main`
   - **Root Directory**: `ExpressByMySQL`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`

#### Step 3: 設置環境變數

在 Web 服務的 Environment 頁面添加：

```env
NODE_ENV=production
DATABASE_URL=[從資料庫頁面複製內部連接字串]
JWT_SECRET=[生成一個至少32字符的安全密鑰]
FRONTEND_URL=https://your-frontend-domain.onrender.com
BCRYPT_ROUNDS=12
JWT_EXPIRES_IN=24h
UPLOAD_MAX_SIZE=10485760
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## 🔑 重要配置說明

### 1. JWT_SECRET 生成
```bash
# 在本地生成安全密鑰
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 2. DATABASE_URL 格式
```
postgresql://username:password@hostname:port/database_name
```

### 3. SSL 連接
生產環境會自動啟用 SSL 連接到 PostgreSQL。

## 📁 部署檔案結構

```
ExpressByMySQL/
├── package.json          # PostgreSQL 依賴，無 MySQL
├── config/
│   ├── config.js         # PostgreSQL 配置 + SSL
│   └── env-validation.js # 環境變數驗證
├── middleware/           # 安全性中間件
├── utils/               # 錯誤處理
├── render.yaml          # Render 部署配置
└── README-DEPLOYMENT.md # 此檔案
```

## 🔍 部署後檢查清單

### ✅ 資料庫連接
- [ ] 資料庫創建成功
- [ ] 遷移執行成功
- [ ] 可以創建管理員帳戶

### ✅ API 功能
- [ ] 用戶註冊/登入
- [ ] JWT 認證正常
- [ ] 書籍 CRUD 操作
- [ ] 檔案上傳功能

### ✅ 安全性
- [ ] JWT_SECRET 已設置且安全
- [ ] 速率限制正常運作
- [ ] CORS 配置正確
- [ ] SSL 連接正常

## 🐛 常見問題

### 1. 資料庫連接失敗
```
Error: connect ECONNREFUSED
```
**解決方案**: 檢查 DATABASE_URL 是否正確，確保使用內部連接字串。

### 2. JWT 錯誤
```
Error: JWT_SECRET 必須在環境變數中設定
```
**解決方案**: 確保 JWT_SECRET 已設置且至少32字符。

### 3. 遷移失敗
```
Error: relation "users" does not exist
```
**解決方案**: 
```bash
# 在 Render 控制台執行
npx sequelize-cli db:migrate
```

### 4. CORS 錯誤
**解決方案**: 確保 FRONTEND_URL 設置為正確的前端網址。

## 📊 監控和日誌

### Render 日誌查看
1. 進入 Web 服務頁面
2. 點擊 "Logs" 頁籤
3. 查看即時日誌輸出

### 健康檢查
```bash
# 檢查 API 狀態
curl https://your-backend-url.onrender.com/api

# 檢查資料庫連接
curl https://your-backend-url.onrender.com/api/health
```

## 🔄 更新部署

### 自動部署
每次推送到 main 分支時，Render 會自動重新部署。

### 手動部署
在 Render Dashboard 中點擊 "Deploy latest commit"。

## 📝 環境變數範本

```env
# 必須設置
NODE_ENV=production
DATABASE_URL=postgresql://user:password@host:5432/database
JWT_SECRET=your-super-secure-32-character-secret-key

# 可選設置（有預設值）
FRONTEND_URL=https://your-frontend-app.onrender.com
BCRYPT_ROUNDS=12
JWT_EXPIRES_IN=24h
UPLOAD_MAX_SIZE=10485760
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
LOG_LEVEL=info
```

## 🎉 部署成功

部署成功後，您的 API 將可在以下位置訪問：
```
https://your-backend-name.onrender.com/api
```

主要端點：
- `GET /api` - API 資訊
- `POST /api/auth/register` - 用戶註冊
- `POST /api/auth/login` - 用戶登入
- `GET /api/books` - 獲取書籍列表
- `GET /api/ebooks` - 獲取電子書列表
