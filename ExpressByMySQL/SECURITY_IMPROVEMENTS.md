# 安全性改進指南

## 🔒 已實現的安全性改進

### 1. 環境變數安全性配置

#### 新增檔案：
- `env.example` - 環境變數範本（已更新）
- `config/env-validation.js` - 環境變數驗證模組

#### 功能：
- ✅ 強制要求 JWT_SECRET 設置且長度至少 32 字符
- ✅ 驗證資料庫配置完整性
- ✅ 生產環境額外安全檢查
- ✅ 自動生成安全的 JWT 密鑰功能
- ✅ 環境配置統一管理

#### 使用方法：
```bash
# 1. 複製環境變數範本
cp env.example .env

# 2. 編輯 .env 檔案，設置正確的值
# 特別注意：JWT_SECRET 必須是至少 32 字符的安全字符串

# 3. 啟動應用時會自動驗證環境變數
npm start
```

### 2. 輸入驗證強化

#### 新增檔案：
- `middleware/validation.js` - 統一輸入驗證模組
- `middleware/security.js` - 安全性中間件

#### 功能：
- ✅ Joi 輸入驗證（用戶註冊、登入、書籍等）
- ✅ 檔案上傳安全檢查
- ✅ SQL 注入基本防護
- ✅ XSS 防護（HTML 標籤清理）
- ✅ 速率限制（API、登入、註冊、上傳）
- ✅ 請求大小限制
- ✅ 惡意用戶代理過濾

#### 驗證規則：
```javascript
// 用戶註冊
- 用戶名：3-50字符，只允許字母數字下劃線
- 密碼：至少6字符，包含大小寫字母和數字
- 電子郵件：有效格式，最多100字符

// 書籍資料
- 書名：必填，最多255字符
- ISBN：符合標準格式
- 價格：非負數，最多兩位小數

// 檔案上傳
- 類型限制：圖片、PDF、文本檔案
- 大小限制：最大10MB
```

### 3. 統一錯誤處理機制

#### 新增檔案：
- `utils/errors.js` - 自定義錯誤類別
- `middleware/errorHandler.js` - 全域錯誤處理中間件

#### 功能：
- ✅ 統一的錯誤回應格式
- ✅ 自定義錯誤類別（驗證、認證、授權等）
- ✅ Sequelize 錯誤自動處理
- ✅ JWT 錯誤自動處理
- ✅ 檔案操作錯誤處理
- ✅ 開發/生產環境錯誤顯示差異
- ✅ 未捕獲異常處理
- ✅ 優雅關閉機制

#### 錯誤回應格式：
```json
{
  "success": false,
  "message": "錯誤訊息",
  "code": "ERROR_CODE",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "errors": [
    {
      "field": "username",
      "message": "用戶名至少3個字符"
    }
  ]
}
```

## 🚀 安裝新的改進

### 1. 安裝依賴套件

```bash
cd /root/zaisNovel/ExpressByMySQL
npm install
```

新增的套件：
- `joi` - 輸入驗證
- `express-rate-limit` - 速率限制
- `helmet` - 安全標頭
- `express-validator` - 額外驗證工具

### 2. 設置環境變數

```bash
# 複製範本
cp env.example .env

# 編輯 .env（必須設置）
nano .env
```

**重要設定：**
```env
# 生成安全的 JWT 密鑰（至少32字符）
JWT_SECRET=your-super-secret-jwt-key-at-least-32-characters-long

# 資料庫配置
DATABASE_URL=postgresql://username:password@localhost:5432/database
# 或
DB_HOST=localhost
DB_NAME=zaisnovel_db
DB_USERNAME=your_username
DB_PASSWORD=your_password

# 前端 URL（用於CORS）
FRONTEND_URL=http://localhost:5173
```

### 3. 重啟應用

```bash
npm start
```

啟動時會看到：
```
✅ 環境變數驗證通過
🔌 測試資料庫連線...
✅ 資料庫連線成功
🚀 API 服務器正在運行於 http://localhost:3000
📦 API 路由: /api
🛡️  安全性中間件已啟用
⚡ 環境模式: development
```

## 📊 速率限制設定

| 端點類型 | 時間窗口 | 最大請求數 |
|---------|----------|-----------|
| 一般 API | 15分鐘 | 100次 |
| 登入 | 15分鐘 | 5次 |
| 註冊 | 1小時 | 3次 |
| 檔案上傳 | 15分鐘 | 10次 |

## 🔍 錯誤監控

### 開發環境
- 詳細錯誤資訊包含堆棧追蹤
- 完整的錯誤物件

### 生產環境
- 隱藏敏感錯誤資訊
- 只顯示使用者友好的錯誤訊息
- 自動記錄未預期錯誤

## 🛠️ 自定義配置

### 調整速率限制
編輯 `.env`：
```env
RATE_LIMIT_WINDOW_MS=900000    # 15分鐘
RATE_LIMIT_MAX_REQUESTS=100    # 最大請求數
```

### 調整檔案上傳限制
編輯 `.env`：
```env
UPLOAD_MAX_SIZE=10485760                    # 10MB
UPLOAD_ALLOWED_TYPES=jpg,jpeg,png,gif,pdf  # 允許的檔案類型
```

### 自定義驗證規則
編輯 `middleware/validation.js` 中的 `validationSchemas`

## 🚨 注意事項

1. **JWT_SECRET** 必須是安全的隨機字符串
2. 生產環境務必設置正確的 **FRONTEND_URL**
3. 定期檢查日誌檔案
4. 監控速率限制觸發情況
5. 備份環境變數設定

## 📝 範例請求

### 註冊（包含驗證）
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "SecurePass123",
    "age_range": "20~30"
  }'
```

### 登入（包含速率限制）
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "SecurePass123"
  }'
```

## 🎯 後續建議

1. 實施日誌集中化管理
2. 添加健康檢查端點
3. 實施 API 版本控制
4. 添加更詳細的監控指標
5. 考慮實施 API 文檔自動生成
