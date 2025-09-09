# Render 部署 SPA 路由修復

## 問題描述
前端應用部署在 Render 靜態站點時，直接訪問路由（如 `/ebooks`）會出現 404 錯誤。這是因為 React SPA 的路由需要伺服器端的重寫規則支援。

## 解決方案

### 1. 創建 `_redirects` 文件
在 `frontend/public/` 目錄中創建 `_redirects` 文件：

```
# Render SPA 重寫規則
# 所有非 API 和非靜態資源的請求都重寫到 index.html
# 這樣可以支援 React Router 的客戶端路由

# 靜態資源直接提供（不重寫）
/assets/*  /assets/:splat  200
/vite.svg  /vite.svg  200
/favicon.ico  /favicon.ico  200

# 所有其他路由重寫到 index.html，讓 React Router 處理
/*  /index.html  200
```

### 2. 確保建置配置正確
在 `vite.config.js` 中確認 `publicDir` 設定：

```javascript
export default defineConfig({
  plugins: [react()],
  publicDir: 'public', // 確保 public 目錄中的文件被複製到 dist
  // ... 其他配置
})
```

### 3. 重新部署
1. 提交變更到 Git 儲存庫
2. Render 會自動重新建置和部署
3. `_redirects` 文件會被包含在建置輸出中

## 工作原理
- Render 讀取 `_redirects` 文件中的規則
- 當用戶直接訪問 `/ebooks` 時，伺服器會返回 `index.html`
- React Router 接管路由處理，顯示正確的頁面

## 測試
部署完成後，以下 URL 都應該正常工作：
- `https://zaisnovel-frontend.onrender.com/`
- `https://zaisnovel-frontend.onrender.com/ebooks`
- `https://zaisnovel-frontend.onrender.com/books`
- 所有其他前端路由

## 注意事項
- 此修復僅適用於前端路由問題
- API 請求仍需要正確的後端 URL 配置
- 如果修改了 `_redirects` 規則，需要重新部署才能生效
