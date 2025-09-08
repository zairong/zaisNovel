# 🗄️ 資料庫設定指南

## PostgreSQL 資料庫設定

### 1. 本地開發環境

#### 安裝 PostgreSQL
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install postgresql postgresql-contrib

# macOS (使用 Homebrew)
brew install postgresql

# Windows
# 下載並安裝 PostgreSQL 官方安裝程式
```

#### 建立資料庫和用戶
```sql
-- 登入 PostgreSQL
sudo -u postgres psql

-- 建立資料庫
CREATE DATABASE zaisnovel_dev;

-- 建立用戶並設定密碼
CREATE USER zaisnovel_user WITH PASSWORD 'your_password';

-- 給予權限
GRANT ALL PRIVILEGES ON DATABASE zaisnovel_dev TO zaisnovel_user;

-- 退出
\q
```

#### 設定 .env 檔案
```env
# 複製 env.example 到 .env
cp ExpressByMySQL/env.example ExpressByMySQL/.env

# 編輯 .env 檔案
DB_HOST=localhost
DB_PORT=5432
DB_NAME=zaisnovel_dev
DB_USERNAME=zaisnovel_user
DB_PASSWORD=your_password
```

### 2. Render 雲端部署

#### 建立 PostgreSQL 資料庫
1. 登入 Render 控制台
2. 點擊 "New" -> "PostgreSQL"
3. 設定資料庫資訊：
   - Name: `zaisnovel-db`
   - Database Name: `zaisnovel`
   - User: `zaisnovel_user`
   - Region: 選擇 Singapore (較近)
   - Plan: Free (免費方案)

#### 取得連線資訊
建立完成後，Render 會提供：
- **Internal Database URL**: 內部連線 URL
- **External Database URL**: 外部連線 URL
- 主機名稱、埠號、資料庫名稱、用戶名稱、密碼

#### 後端服務設定
1. 建立 Web Service
2. 連接到您的 GitHub 專案
3. 設定部署資訊：
   - **Root Directory**: `ExpressByMySQL`
   - **Environment**: `Node`
   - **Build Command**: `npm install && npx sequelize-cli db:migrate --config ./config/config.js --migrations-path ./migrations`
   - **Start Command**: `npm start`

#### 環境變數設定
在 Render 控制台設定以下環境變數：

| 變數名稱 | 值 | 說明 |
|---------|-----|-----|
| `NODE_ENV` | `production` | 生產環境 |
| `DATABASE_URL` | `[自動連結資料庫]` | PostgreSQL 連線 URL |
| `JWT_SECRET` | `[自動生成]` | JWT 密鑰 |
| `FRONTEND_URL` | `https://your-frontend.onrender.com` | 前端 URL |
| `BCRYPT_ROUNDS` | `12` | 密碼加密強度 |
| `JWT_EXPIRES_IN` | `24h` | JWT 過期時間 |
| `UPLOAD_MAX_SIZE` | `10485760` | 檔案上傳大小限制 |
| `RATE_LIMIT_WINDOW_MS` | `900000` | 請求頻率限制時間窗口 |
| `RATE_LIMIT_MAX_REQUESTS` | `100` | 最大請求數 |

### 3. 資料庫遷移

#### 可用的遷移檔案
專案包含以下資料庫遷移：
- `create-books-table.js` - 建立書籍表
- `add-view-count-to-books.js` - 添加觀看次數
- `add-download-count-to-books.js` - 添加下載次數
- `create-book-views.js` - 建立觀看記錄表
- `create-book-downloads.js` - 建立下載記錄表
- `create-book-comments.js` - 建立評論表
- `add-author-role.js` - 添加作者角色
- `add-age-range-to-users.js` - 添加年齡範圍
- 更多封面圖片相關遷移...

#### 執行遷移
```bash
# 本地開發
cd ExpressByMySQL
npm run db:migrate

# 查看遷移狀態
npm run db:migrate:status

# 回滾遷移（如需要）
npm run db:migrate:undo
```

#### 初始化管理員帳戶
```bash
# 建立預設管理員帳戶
npm run init-admin
```

### 4. 資料庫連線測試

#### 本地測試
```bash
cd ExpressByMySQL
node -e "
const { sequelize } = require('./models');
sequelize.authenticate()
  .then(() => console.log('✅ 資料庫連線成功'))
  .catch(err => console.error('❌ 資料庫連線失敗:', err));
"
```

#### 生產環境測試
部署完成後，檢查 Render 日誌：
```
✅ 資料庫連線成功
🚀 API 服務器正在運行於 http://localhost:10000
```

### 5. 常見問題排除

#### 連線被拒絕
- 檢查 PostgreSQL 服務是否運行
- 確認防火牆設定
- 檢查 `pg_hba.conf` 認證設定

#### SSL 連線錯誤
- Render 需要 SSL 連線
- 設定已在 `config/config.js` 中處理

#### 遷移失敗
- 檢查資料庫權限
- 確認表是否已存在
- 查看詳細錯誤訊息

### 6. 資料庫備份

#### 本地備份
```bash
pg_dump -h localhost -U zaisnovel_user -d zaisnovel_dev > backup.sql
```

#### Render 備份
- Render 免費方案不支援自動備份
- 可以定期匯出資料
- 建議升級到付費方案以獲得備份功能

## 資料庫架構

### 主要資料表
1. **users** - 用戶資料
2. **books** - 書籍資料
3. **user_books** - 用戶書庫關聯
4. **book_views** - 觀看記錄
5. **book_downloads** - 下載記錄
6. **book_comments** - 書籍評論
7. **audit_logs** - 審計日誌

### 關聯設計
- 用戶 ↔ 書籍：多對多關係（透過 user_books）
- 用戶 ↔ 評論：一對多關係
- 書籍 ↔ 評論：一對多關係
- 用戶 ↔ 觀看/下載記錄：一對多關係
