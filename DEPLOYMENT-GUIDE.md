# zaisNovel 部署指南

## 前端部署配置

### 環境變數設定

在部署平台（如 Render）中，需要設定以下環境變數：

```
VITE_API_BASE=https://your-backend-service.onrender.com/api
```

**重要**：將 `your-backend-service.onrender.com` 替換為實際的後端服務 URL。

### 部署選項

#### 選項 1：分離部署（推薦）
- 前端部署為靜態站點
- 後端部署為 Web 服務
- 透過環境變數 `VITE_API_BASE` 連接

#### 選項 2：同域部署
- 前端和後端部署在同一域名的不同路徑
- 使用相對路徑 `/api`（預設設定）

## 後端部署配置

### 必要環境變數

**選項 1：使用 DATABASE_URL（推薦）**
```
DATABASE_URL=postgresql://username:password@host:port/database
NODE_ENV=production
PORT=3000
JWT_SECRET=your-super-secure-jwt-secret-key
```

**選項 2：使用個別資料庫環境變數**
```
DB_HOST=your-database-host
DB_PORT=5432
DB_NAME=your-database-name
DB_USERNAME=your-username
DB_PASSWORD=your-password
NODE_ENV=production
PORT=3000
JWT_SECRET=your-super-secure-jwt-secret-key
```

### 必要設定
1. 設定資料庫連接環境變數（見上述選項）
2. 設定 JWT 密鑰（建議使用安全的隨機字符串）
3. 確保 CORS 配置允許前端域名
4. 執行資料庫遷移

### 重要注意事項
- 後端配置為使用 **PostgreSQL**，請確保資料庫類型正確
- 部署平台的環境變數會覆蓋 `.env` 文件設定
- 如果使用 Render 平台，會自動提供 PostgreSQL 資料庫

### 建構指令
```bash
cd frontend && npm run build
```

## 故障排除

### API 請求失敗
- 檢查 `VITE_API_BASE` 環境變數是否正確設定
- 確認後端服務正在運行
- 檢查網路連接和 CORS 設定

### JSON 解析錯誤
- 已修復：HTTP 工具類現在能正確處理空響應
- 如果仍有問題，檢查後端 API 響應格式

## 最近修復
- ✅ 修復 echarts 導入問題
- ✅ 修復 JSON 解析錯誤
- ✅ 改善 API 配置系統
- ✅ 增強錯誤處理機制
