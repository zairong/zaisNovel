# 📝 電子書評論功能說明

## 🎯 功能概述

在ebookCard中新增了評論modal功能，實現類似留言板的評論CRUD功能。用戶可以對書籍進行評論、評分，並管理自己的評論。

## ✨ 主要功能

### 1. 評論查看
- 點擊電子書卡片上的「💬 評論」按鈕
- 彈出評論Modal，顯示該書籍的所有評論
- 支持分頁瀏覽評論列表
- 顯示評論者用戶名、評論時間、評分等信息

### 2. 發表評論
- 登入用戶可以在評論Modal中發表新評論
- 支持文字評論（最多1000字）
- 可選的評分功能（1-5星）
- 實時字數統計

### 3. 評論管理
- 用戶可以編輯自己的評論
- 用戶可以刪除自己的評論
- 管理員可以刪除任何評論
- 支持評論的軟刪除

### 4. 評分系統
- 與現有的BookRating組件整合
- 支持在評論時同時評分
- 顯示評論中的評分信息

## 🏗️ 技術架構

### 後端架構
```
ExpressByPostgreSQL/
├── models/
│   ├── bookComment.js          # 評論模型
│   ├── book.js                 # 書籍模型（已更新關聯）
│   └── user.js                 # 用戶模型（已更新關聯）
├── controllers/
│   └── commentController.js    # 評論控制器
├── routes/
│   └── commentRoutes.js        # 評論路由
└── migrations/
    └── create-book-comments.js # 評論表遷移
```

### 前端架構
```
frontend/src/
├── components/Ebook/
│   ├── CommentModal.jsx        # 評論Modal組件
│   ├── CommentModal.module.scss # 評論Modal樣式
│   └── EbookList.jsx           # 電子書列表（已整合評論按鈕）
├── services/
│   └── commentService.js       # 評論API服務
└── hooks/
    └── useAuth.js              # 認證Hook（用於權限控制）
```

## 🔌 API端點

### 公開端點
- `GET /api/comments/books/:bookId/comments` - 獲取書籍評論

### 需要登入的端點
- `POST /api/comments/books/:bookId/comments` - 創建評論
- `PUT /api/comments/comments/:commentId` - 更新評論
- `DELETE /api/comments/comments/:commentId` - 刪除評論
- `GET /api/comments/user/comments` - 獲取用戶評論

## 🎨 UI/UX特色

### 設計風格
- 與現有系統保持一致的金色主題
- 響應式設計，支持移動端
- 流暢的動畫效果
- 直觀的用戶界面

### 交互體驗
- Modal彈出動畫
- 實時字數統計
- 評分星星交互
- 編輯/刪除確認
- 載入狀態提示

## 🔒 權限控制

### 評論權限
- 所有用戶都可以查看評論
- 只有登入用戶可以發表評論
- 用戶只能編輯/刪除自己的評論
- 管理員可以刪除任何評論

### 評分權限
- 與現有評分系統整合
- 支持在評論時同時評分
- 評分可選，不強制要求

## 📊 數據庫設計

### book_comments表結構
```sql
CREATE TABLE book_comments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  book_id INT NOT NULL,
  content TEXT NOT NULL,
  rating INT,
  status ENUM('active', 'hidden', 'deleted') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE
);
```

## 🚀 使用方法

### 1. 查看評論
1. 在電子書列表中，點擊任意書籍卡片上的「💬 評論」按鈕
2. 評論Modal會彈出，顯示該書籍的所有評論
3. 可以瀏覽評論列表，查看評分和評論內容

### 2. 發表評論
1. 確保已登入系統
2. 在評論Modal中，找到「💬 發表評論」區域
3. 選擇評分（可選）
4. 輸入評論內容（1-1000字）
5. 點擊「發表評論」按鈕

### 3. 編輯評論
1. 找到自己發表的評論
2. 點擊「✏️ 編輯」按鈕
3. 修改評論內容和評分
4. 點擊「💾 儲存」或「❌ 取消」

### 4. 刪除評論
1. 找到自己發表的評論
2. 點擊「🗑️ 刪除」按鈕
3. 確認刪除操作

## 🧪 測試

### API測試
```bash
# 獲取書籍評論
curl -X GET http://localhost:3000/api/comments/books/1/comments

# 創建評論（需要JWT token）
curl -X POST http://localhost:3000/api/comments/books/1/comments \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"content": "很棒的小說！", "rating": 5}'
```

### 前端測試
1. 啟動前端開發服務器
2. 訪問電子書列表頁面
3. 點擊評論按鈕測試Modal功能
4. 測試評論的CRUD操作

## 🔧 配置和部署

### 環境要求
- Node.js 18+
- MySQL 8.0+
- Express.js
- React 18+

### 安裝步驟
1. 運行數據庫遷移：`npm run db:migrate`
2. 啟動後端服務器：`npm start`
3. 啟動前端開發服務器：`npm run dev`

## 📝 更新日誌

### v1.0.0 (2024-12-19)
- ✅ 新增評論模型和數據庫表
- ✅ 實現評論CRUD API
- ✅ 創建評論Modal組件
- ✅ 整合到ebookCard中
- ✅ 添加權限控制
- ✅ 實現響應式設計

## 🤝 貢獻

歡迎提交Issue和Pull Request來改進評論功能！

## �� 授權

本項目採用MIT授權協議。
