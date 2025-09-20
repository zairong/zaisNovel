# 開發模式設定說明

## 使用 Render 後端進行開發

### 方法一：使用環境變數（推薦）

在專案根目錄建立 `.env.local` 檔案：

```bash
# 使用 Render 後端
VITE_USE_RENDER_BACKEND=true

# 或者使用本地後端
VITE_USE_RENDER_BACKEND=false
```

### 方法二：直接修改 config.js

在 `frontend/src/services/config.js` 中修改：

```javascript
// 使用 Render 後端
baseURL: 'https://zaisnovel-backend.onrender.com/api'

// 或使用本地後端
baseURL: 'http://127.0.0.1:3000/api'
```

## 啟動開發伺服器

```bash
cd frontend
npm run dev
```

## 注意事項

1. **CORS 設定**：Render 後端已正確設定 CORS，允許前端域名訪問
2. **HTTPS**：使用 Render 後端時會自動使用 HTTPS
3. **代理設定**：Vite 開發伺服器會自動代理 API 請求到正確的後端
4. **環境變數**：優先使用環境變數設定，如果沒有設定則預設使用本地後端

## 測試連接

啟動開發伺服器後，可以在瀏覽器開發者工具的 Network 標籤中查看 API 請求是否正確發送到 Render 後端。
