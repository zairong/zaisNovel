# Render 部署步驟指南

## 問題診斷

根據錯誤日誌，您的應用程式仍在嘗試連接到 `10.211.204.178:5432`，這表示 Render 可能仍在使用舊的資料庫配置。

## 解決方案：完全重新部署

### 步驟 1：清理現有部署

1. **登入 Render Dashboard**
2. **刪除現有的 Web Service**（如果有的話）
3. **刪除現有的資料庫**（如果有的話）

### 步驟 2：建立 PostgreSQL 資料庫

1. 在 Render Dashboard 中點擊 **"New +"**
2. 選擇 **"PostgreSQL"**
3. 選擇 **"Free"** 方案
4. 設定資料庫名稱（例如：`zaisnovel-db`）
5. 點擊 **"Create Database"**
6. **重要**：複製資料庫的連線資訊，格式如下：
   ```
   postgresql://username:password@host:port/database
   ```

### 步驟 3：建立 Web Service

1. 在 Render Dashboard 中點擊 **"New +"**
2. 選擇 **"Web Service"**
3. 連接到您的 GitHub 儲存庫
4. 選擇 **`ExpressByMySQL`** 目錄
5. 使用以下設定：
   - **Name**: `zaisnovel-backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm run start:deploy`
   - **Instance Type**: `Free`

### 步驟 4：設定環境變數

在 Web Service 的 **"Environment"** 標籤中，添加以下環境變數：

```
NODE_ENV=production
DATABASE_URL=postgresql://username:password@host:port/database
JWT_SECRET=your-super-secure-jwt-secret-key-here
PORT=3000
```

**重要注意事項**：
- `DATABASE_URL` 必須是從步驟 2 複製的完整連線字串
- `JWT_SECRET` 應該是至少 32 個字符的隨機字符串
- 確保沒有多餘的空格或引號

### 步驟 5：部署並監控

1. 點擊 **"Create Web Service"**
2. 等待建置完成
3. 查看 **"Logs"** 標籤中的輸出

### 步驟 6：驗證部署

成功的部署日誌應該包含：

```
🔍 正在建立資料庫連線...
📊 環境: production
🔧 使用環境變數: DATABASE_URL
🌍 環境變數檢查:
  - NODE_ENV: production
  - DATABASE_URL: 已設定
  - DB_HOST: 未設定
  - DB_PORT: 未設定
  - DB_NAME: 未設定
  - DB_USERNAME: 未設定
  - DB_PASSWORD: 未設定
🌐 使用 DATABASE_URL 連線
🔗 資料庫 URL: postgresql://username:***@host:port/database
✅ Sequelize 實例建立成功
🔍 測試資料庫連線...
✅ 資料庫連線測試成功
📊 同步資料庫結構...
✅ 資料庫結構同步完成
👤 初始化管理員帳戶...
✅ 管理員帳戶初始化完成
🎉 系統設置完成！
```

## 故障排除

### 如果仍然出現 ETIMEDOUT 錯誤

1. **檢查 DATABASE_URL 格式**：
   - 確保以 `postgresql://` 開頭
   - 確保包含正確的主機、端口、用戶名、密碼和資料庫名

2. **檢查資料庫狀態**：
   - 確認 PostgreSQL 資料庫正在運行
   - 檢查資料庫的連線限制

3. **使用診斷腳本**：
   - 在 Render 的 Shell 中執行：`npm run check-config`
   - 這會顯示詳細的配置資訊

### 如果出現其他錯誤

1. **檢查 JWT_SECRET**：
   - 確保已設定且不為空
   - 使用強密碼

2. **檢查端口設定**：
   - Render 會自動設定 PORT 環境變數
   - 不要手動覆蓋

3. **檢查建置日誌**：
   - 確保所有依賴都正確安裝
   - 檢查是否有建置錯誤

## 驗證部署成功

部署成功後，您應該能夠：

1. **訪問 API 端點**：
   - `https://your-app-name.onrender.com/api/health`
   - `https://your-app-name.onrender.com/api/books`

2. **使用管理員帳戶登入**：
   - 用戶名：`admin`
   - 密碼：`admin`

3. **檢查資料庫**：
   - 所有表格都已建立
   - 管理員帳戶已初始化

## 重要提醒

- **不要使用 MySQL**：應用程式已配置為使用 PostgreSQL
- **環境變數優先**：Render 的環境變數會覆蓋任何本地配置
- **監控日誌**：部署後持續監控日誌以確保穩定性
- **備份資料**：定期備份重要資料

如果按照這些步驟操作後仍有問題，請檢查 Render 的服務狀態或聯繫 Render 支援。
