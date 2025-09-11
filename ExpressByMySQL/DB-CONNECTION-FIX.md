# 資料庫連線 500 錯誤修復指南

## 問題描述

前端登入和註冊時收到 500 內部服務器錯誤：
```
POST https://zaisnovel-backend.onrender.com/api/auth/register 500 (Internal Server Error)
POST https://zaisnovel-backend.onrender.com/api/auth/login 500 (Internal Server Error)
```

## 根本原因

1. **API 路由已載入**：404 錯誤已修復，API 端點可以訪問
2. **資料庫連線失敗**：500 錯誤表示資料庫連線有問題
3. **環境變數配置問題**：Render 上的資料庫環境變數可能未正確設定

## 已修復的問題

### 1. 創建資料庫連線修復腳本
- ✅ 創建 `start-render-db-fix.js` 專用於處理資料庫連線問題
- ✅ 添加資料庫狀態檢查端點 `/api/db-status`
- ✅ 改進錯誤處理，提供更詳細的錯誤信息

### 2. 改進錯誤處理
- ✅ 區分不同類型的錯誤（資料庫連線、驗證、其他）
- ✅ 提供適當的 HTTP 狀態碼
- ✅ 添加詳細的錯誤日誌

## 部署步驟

### 方案 1：使用資料庫連線修復腳本（推薦）

1. **在 Render Dashboard 中修改 Start Command**：
   - 將啟動命令改為 `npm run start:render-db-fix`

2. **重新部署**：
   - 點擊 "Manual Deploy" 或推送新的 commit

### 方案 2：檢查環境變數配置

1. **檢查 Render 環境變數**：
   - 確認 `DATABASE_URL` 正確設定
   - 確認 `JWT_SECRET` 已設定
   - 確認 `NODE_ENV=production`

2. **檢查資料庫狀態**：
   - 訪問 `https://zaisnovel-backend.onrender.com/api/db-status`
   - 查看資料庫連線狀態

## 預期的成功日誌

使用修復後的代碼，您應該看到：

```
🌐 環境: production
🔧 環境變數狀態檢查:
DATABASE_URL: 已設定
DB_HOST: 未設定
DB_PORT: 未設定
DB_NAME: 未設定
DB_USERNAME: 未設定
PORT: 10000
🚀 啟動服務器...
✅ 服務器啟動成功!
📍 監聽端口: 10000
🌐 監聽地址: 0.0.0.0
🏥 健康檢查: http://localhost:10000/health
🧪 測試端點: http://localhost:10000/api/test
🔍 資料庫狀態: http://localhost:10000/api/db-status

🚀 應用程式正在運行...
🔌 測試資料庫連線...
✅ 資料庫連線成功
```

## 驗證修復

部署成功後，您應該能夠：

1. **訪問健康檢查端點**：
   - `https://zaisnovel-backend.onrender.com/health`

2. **檢查資料庫狀態**：
   - `https://zaisnovel-backend.onrender.com/api/db-status`

3. **成功登入和註冊**：
   - 前端登入和註冊應該不再出現 500 錯誤

## 常見問題排查

### 1. 資料庫連線失敗
- 檢查 `DATABASE_URL` 格式是否正確
- 確認 PostgreSQL 資料庫正在運行
- 檢查資料庫的連線限制

### 2. 環境變數問題
- 確認所有必要的環境變數都已設定
- 檢查環境變數的值是否正確
- 確認沒有多餘的空格或引號

### 3. 權限問題
- 確認資料庫用戶有適當的權限
- 檢查資料庫的訪問控制設定

## 重要提醒

- 修復後的代碼提供更好的錯誤處理和調試信息
- 資料庫狀態檢查端點可以幫助診斷問題
- 即使資料庫連線失敗，服務器也會繼續運行
- 服務器會定期重試資料庫連線

## 如果仍然有問題

1. **檢查 Render 日誌**：
   - 確認看到 "✅ 服務器啟動成功!" 訊息
   - 查看資料庫連線錯誤的詳細信息

2. **測試端點**：
   - 訪問 `https://zaisnovel-backend.onrender.com/api/db-status`
   - 查看資料庫連線狀態

3. **檢查環境變數**：
   - 確認 `DATABASE_URL` 正確設定
   - 確認 `JWT_SECRET` 已設定
