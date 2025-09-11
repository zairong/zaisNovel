# Render 資料庫連線問題修復指南

## 問題描述

您的 zaisNovel 專案在 Render 上遇到資料庫連線超時問題：
```
Error: connect ETIMEDOUT 10.211.204.178:5432
```

## 根本原因

1. **錯誤的資料庫類型配置**：`app.json` 中配置的是 MySQL (`cleardb:ignite`)，但應用程式使用 PostgreSQL
2. **連線超時設定不足**：預設的連線超時時間太短
3. **缺乏重試機制**：網路不穩定時沒有重試機制

## 已修復的問題

### 1. 修復 app.json 配置
- ✅ 將資料庫類型從 MySQL 改為 PostgreSQL
- ✅ 更新 addon 為 `postgresql:free`
- ✅ 添加必要的環境變數配置

### 2. 增強資料庫連線設定
- ✅ 增加連線超時時間到 60 秒
- ✅ 添加 SSL 配置支援
- ✅ 增加重試機制和錯誤處理

### 3. 改進調試日誌
- ✅ 添加詳細的連線日誌
- ✅ 隱藏敏感資訊（密碼）
- ✅ 增加錯誤詳情輸出

## 部署步驟

### 1. 在 Render 上重新部署

1. **刪除現有的 Web Service**（如果有的話）
2. **建立新的 PostgreSQL 資料庫**：
   - 在 Render Dashboard 中點擊 "New +"
   - 選擇 "PostgreSQL"
   - 選擇 "Free" 方案
   - 記下資料庫的連線資訊

3. **建立新的 Web Service**：
   - 在 Render Dashboard 中點擊 "New +"
   - 選擇 "Web Service"
   - 連接到您的 GitHub 儲存庫
   - 選擇 `ExpressByMySQL` 目錄
   - 使用以下設定：
     - **Build Command**: `npm install`
     - **Start Command**: `npm run start:deploy`
     - **Environment**: `Node`

### 2. 設定環境變數

在 Web Service 的環境變數設定中添加：

```
NODE_ENV=production
DATABASE_URL=<從 PostgreSQL 資料庫複製的連線字串>
JWT_SECRET=<生成一個安全的密鑰>
PORT=3000
```

### 3. 重要注意事項

- **DATABASE_URL 格式**：`postgresql://username:password@host:port/database`
- **JWT_SECRET**：使用強密碼，建議至少 32 個字符
- **連線超時**：現在設定為 60 秒，應該足夠處理網路延遲

## 驗證部署

部署完成後，檢查日誌中是否出現：
```
✅ 資料庫連線測試成功
✅ 資料庫結構同步完成
✅ 管理員帳戶初始化完成
🎉 系統設置完成！
```

## 故障排除

如果仍然遇到連線問題：

1. **檢查環境變數**：確認 `DATABASE_URL` 格式正確
2. **檢查資料庫狀態**：確認 PostgreSQL 資料庫正在運行
3. **檢查網路**：Render 的網路可能有暫時性問題
4. **查看詳細日誌**：新的日誌會顯示更詳細的錯誤資訊

## 技術改進

### 連線配置優化
- 連線超時：30 秒 → 60 秒
- 添加 SSL 支援
- 增加重試機制（最多 3 次）

### 錯誤處理改進
- 詳細的錯誤日誌
- 分層錯誤處理
- 自動重試機制

### 安全性提升
- 隱藏敏感資訊
- SSL 連線支援
- 環境變數驗證

這些修復應該能解決您的資料庫連線問題。如果問題持續存在，請檢查 Render 的服務狀態或聯繫 Render 支援。
