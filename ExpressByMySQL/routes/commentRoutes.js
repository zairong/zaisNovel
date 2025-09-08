const express = require('express');
const router = express.Router();
const { 
  getBookComments, 
  createComment, 
  updateComment, 
  deleteComment, 
  getUserComments 
} = require('../controllers/commentController');
const { authenticate } = require('../middleware/auth');

// 獲取書籍的所有評論（公開）
router.get('/books/:bookId/comments', getBookComments);

// 需要登入的路由
router.use(authenticate);

// 創建評論
router.post('/books/:bookId/comments', createComment);

// 更新評論
router.put('/comments/:commentId', updateComment);

// 刪除評論
router.delete('/comments/:commentId', deleteComment);

// 獲取用戶的評論
router.get('/user/comments', getUserComments);

module.exports = router;
