# CORS 修復指南

## 問題描述

您的 zaisNovel 專案在 Render 部署後遇到 CORS 跨域問題，前端 `https://zaisnovel-frontend.onrender.com` 無法訪問後端 `https://zaisnovel.onrender.com` 的 API。

## 錯誤訊息

```
Access to fetch at 'https://zaisnovel.onrender.com/api/audit/log' from origin 'https://zaisnovel-frontend.onrender.com' has been blocked by CORS policy: Response to preflight request doesn't pass access control check: No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

## 已修復的內容

### 1. 強化 CORS 配置 (`app.js`)

- ✅ 使用函數式 origin 檢查
- ✅ 添加詳細的調試日誌
- ✅ 強化 OPTIONS 請求處理
- ✅ 添加 CORS 測試端點

### 2. 創建 CORS 修復腳本 (`fix-cors.js`)

- ✅ 獨立的 CORS 測試服務器
- ✅ 完整的調試功能
- ✅ 測試端點：`/api/cors-test`

## 部署步驟

### 步驟 1：重新部署後端

1. **提交更改到 GitHub**：
   ```bash
   git add .
   git commit -m "修復 CORS 跨域問題"
   git push origin main
   ```

2. **在 Render Dashboard 中**：
   - 進入您的後端服務
   - 點擊 "Manual Deploy" 或等待自動部署
   - 確保使用 `npm run start:render` 作為啟動命令

### 步驟 2：驗證修復

1. **測試 CORS 端點**：
   ```bash
   curl -H "Origin: https://zaisnovel-frontend.onrender.com" https://zaisnovel.onrender.com/api/cors-test
   ```

2. **檢查前端連接**：
   - 訪問 `https://zaisnovel-frontend.onrender.com`
   - 檢查瀏覽器控制台是否還有 CORS 錯誤

### 步驟 3：監控日誌

在 Render Dashboard 的 Logs 標籤中，您應該看到：

```
🌐 請求詳情: {
  method: 'OPTIONS',
  url: '/api/audit/log',
  origin: 'https://zaisnovel-frontend.onrender.com',
  timestamp: '2025-09-11T03:41:26.915Z'
}
✅ 允許來源: https://zaisnovel-frontend.onrender.com
```

## 如果問題仍然存在

### 方案 1：使用 CORS 修復腳本

1. **在 Render 中修改啟動命令**：
   - 將 `npm run start:render` 改為 `npm run fix:cors`
   - 重新部署

2. **測試修復腳本**：
   ```bash
   npm run fix:cors
   ```

### 方案 2：檢查環境變數

確保 Render 環境變數中沒有衝突的 CORS 設定：

```env
NODE_ENV=production
DATABASE_URL=your-database-url
JWT_SECRET=your-jwt-secret
PORT=3000
```

### 方案 3：使用 Nginx 代理

如果 CORS 問題持續，可以考慮使用 Nginx 代理來處理 CORS 標頭。

## 測試命令

### 本地測試
```bash
# 啟動修復腳本
npm run fix:cors

# 測試 CORS
curl -H "Origin: https://zaisnovel-frontend.onrender.com" http://localhost:3000/api/cors-test
```

### 生產環境測試
```bash
# 測試 CORS 端點
curl -H "Origin: https://zaisnovel-frontend.onrender.com" https://zaisnovel.onrender.com/api/cors-test

# 測試健康檢查
curl https://zaisnovel.onrender.com/api/health
```

## 預期結果

修復成功後，您應該看到：

1. ✅ 前端可以正常訪問後端 API
2. ✅ 登入功能正常工作
3. ✅ 電子書列表正常載入
4. ✅ 審計日誌正常發送
5. ✅ 沒有 CORS 錯誤訊息

## 重要提醒

- 確保前端和後端都使用 HTTPS
- 檢查瀏覽器快取，必要時清除
- 監控 Render 日誌以確認修復效果
- 如果問題持續，請檢查 Render 的網路配置

## 聯絡支援

如果修復後仍有問題，請提供：
1. Render 後端日誌截圖
2. 瀏覽器控制台錯誤訊息
3. 網路請求的詳細資訊
