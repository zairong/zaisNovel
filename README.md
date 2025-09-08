# 📚 Zai's ReadNovel - 書籍管理系統

一個現代化的全棧書籍管理系統，支援電子書閱讀、評論、用戶管理等功能。

## 🌟 技術棧

### 後端 (ExpressByMySQL)
- **框架**: Express.js
- **資料庫**: PostgreSQL + Sequelize ORM
- **認證**: JWT + bcryptjs
- **安全**: Helmet, CORS, Rate Limiting
- **檔案上傳**: Multer

### 前端 (frontend)
- **框架**: React 18 + Vite
- **路由**: React Router
- **UI 組件**: Material-UI
- **樣式**: SCSS Modules
- **HTTP 客戶端**: Fetch API

## 🚀 快速開始

### 環境需求
- Node.js 18+
- PostgreSQL 12+
- npm 或 yarn

### 安裝步驟

1. **克隆專案**
```bash
git clone <your-repo-url>
cd zaisNovel
```

2. **安裝後端依賴**
```bash
cd ExpressByMySQL
npm install
```

3. **設定環境變數**
```bash
cp env.example .env
# 編輯 .env 檔案設定資料庫連接等資訊
```

4. **初始化資料庫**
```bash
npm run db:migrate
npm run init-admin
```

5. **啟動後端服務**
```bash
npm start
```

6. **安裝前端依賴**
```bash
cd ../frontend
npm install
```

7. **啟動前端服務**
```bash
npm run dev
```

## 📦 部署

### Render 平台部署

#### 後端部署
1. 在 Render 建立 PostgreSQL 資料庫
2. 建立 Web Service，連接到 `ExpressByMySQL` 目錄
3. 設定環境變數 (參考下方設定)

#### 前端部署
1. 建立 Static Site，連接到 `frontend` 目錄
2. 設定建置命令: `npm run build`
3. 設定發布目錄: `dist`

### 環境變數設定

#### 後端環境變數
```env
NODE_ENV=production
DATABASE_URL=<postgresql-connection-string>
JWT_SECRET=<your-super-secret-jwt-key>
FRONTEND_URL=<your-frontend-url>
PORT=3000
BCRYPT_ROUNDS=12
JWT_EXPIRES_IN=24h
```

#### 前端環境變數
```env
VITE_API_BASE=<your-backend-api-url>
```

## 🔧 開發指令

### 後端
```bash
npm start          # 啟動服務器
npm run db:migrate # 執行資料庫遷移
npm run init-admin # 建立管理員帳戶
npm run setup      # 初始化設定
```

### 前端
```bash
npm run dev        # 開發模式
npm run build      # 產品構建
npm run preview    # 預覽構建結果
npm run lint       # 代碼檢查
```

## 🛡️ 安全特性

- JWT 認證機制
- 密碼雜湊加密
- CORS 保護
- SQL 注入防護
- 請求頻率限制
- 檔案上傳安全檢查

## 📄 API 文檔

### 認證端點
- `POST /api/auth/login` - 用戶登入
- `POST /api/auth/register` - 用戶註冊
- `POST /api/auth/logout` - 用戶登出

### 書籍端點
- `GET /api/books` - 獲取書籍列表
- `POST /api/books` - 新增書籍
- `PUT /api/books/:id` - 更新書籍
- `DELETE /api/books/:id` - 刪除書籍

### 電子書端點
- `GET /api/ebooks` - 獲取電子書列表
- `POST /api/ebooks/upload` - 上傳電子書

## 🤝 貢獻

歡迎提交 Issue 和 Pull Request！

## 📝 授權

MIT License