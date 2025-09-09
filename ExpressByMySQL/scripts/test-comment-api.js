console.log('🧪 評論API測試指南\n');

console.log('📋 可用的評論API端點：');
console.log('1. GET /api/comments/books/:bookId/comments - 獲取書籍評論（公開）');
console.log('2. POST /api/comments/books/:bookId/comments - 創建評論（需要登入）');
console.log('3. PUT /api/comments/comments/:commentId - 更新評論（需要登入）');
console.log('4. DELETE /api/comments/comments/:commentId - 刪除評論（需要登入）');
console.log('5. GET /api/comments/user/comments - 獲取用戶評論（需要登入）\n');

console.log('🔧 測試方法：');
console.log('1. 使用瀏覽器訪問: http://localhost:3000/api/comments/books/1/comments');
console.log('2. 使用Postman或其他API測試工具');
console.log('3. 使用curl命令：');
console.log('   curl -X GET http://localhost:3000/api/comments/books/1/comments\n');

console.log('💡 需要登入的端點需要JWT token，請先登入獲取token');
console.log('🎯 評論功能已成功整合到ebookCard中！');
