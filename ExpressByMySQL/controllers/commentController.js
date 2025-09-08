const { BookComment, User, Book } = require('../models');
const { asyncHandler } = require('../utils/asyncHandler');
const { createAuditLog } = require('./auditController');

// 獲取書籍的所有評論
const getBookComments = asyncHandler(async (req, res) => {
  const { bookId } = req.params;
  const { page = 1, limit = 10 } = req.query;
  
  const offset = (page - 1) * limit;
  
  const comments = await BookComment.findAndCountAll({
    where: {
      book_id: bookId,
      status: 'active'
    },
    include: [
      {
        model: User,
        as: 'user',
        attributes: ['id', 'username', 'email']
      }
    ],
    order: [['created_at', 'DESC']],
    limit: parseInt(limit),
    offset: parseInt(offset)
  });

  // 記錄審計日誌（可選，因為這是公開端點）
  try {
    await createAuditLog({
      user_id: req.user?.id,
      action: 'view_comments',
      resource_type: 'book_comment',
      resource_id: bookId,
      ip_address: req.ip,
      user_agent: req.get('User-Agent')
    });
  } catch (error) {
    console.error('審計日誌記錄失敗:', error);
    // 不影響主要功能
  }

  res.json({
    success: true,
    data: {
      comments: comments.rows,
      pagination: {
        current_page: parseInt(page),
        total_pages: Math.ceil(comments.count / limit),
        total_count: comments.count,
        limit: parseInt(limit)
      }
    }
  });
});

// 創建新評論
const createComment = asyncHandler(async (req, res) => {
  const { bookId } = req.params;
  const { content, rating } = req.body;
  const userId = req.user.id;

  // 驗證書籍是否存在
  const book = await Book.findByPk(bookId);
  if (!book) {
    return res.status(404).json({
      success: false,
      message: '書籍不存在'
    });
  }

  // 檢查用戶是否已經評論過這本書（允許重複評論，但記錄警告）
  const existingComment = await BookComment.findOne({
    where: {
      user_id: userId,
      book_id: bookId,
      status: 'active'
    }
  });

  if (existingComment) {
    console.log(`用戶 ${userId} 對書籍 ${bookId} 已有評論，但允許新增評論`);
    // 不再阻止重複評論，只記錄日誌
  }

  // 創建評論
  const comment = await BookComment.create({
    user_id: userId,
    book_id: bookId,
    content,
    rating: rating || null
  });

  // 獲取包含用戶資訊的完整評論
  const fullComment = await BookComment.findByPk(comment.id, {
    include: [
      {
        model: User,
        as: 'user',
        attributes: ['id', 'username', 'email']
      }
    ]
  });

  // 記錄審計日誌
  await createAuditLog({
    user_id: userId,
    action: 'create_comment',
    resource_type: 'book_comment',
    resource_id: comment.id,
    details: { book_id: bookId, content_length: content.length },
    ip_address: req.ip,
    user_agent: req.get('User-Agent')
  });

  res.status(201).json({
    success: true,
    message: '評論創建成功',
    data: fullComment
  });
});

// 更新評論
const updateComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const { content, rating } = req.body;
  const userId = req.user.id;

  const comment = await BookComment.findByPk(commentId);
  
  if (!comment) {
    return res.status(404).json({
      success: false,
      message: '評論不存在'
    });
  }

  // 檢查權限：只有評論作者或管理員可以編輯
  if (comment.user_id !== userId && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: '您沒有權限編輯此評論'
    });
  }

  // 更新評論
  await comment.update({
    content,
    rating: rating || null
  });

  // 獲取更新後的完整評論
  const updatedComment = await BookComment.findByPk(commentId, {
    include: [
      {
        model: User,
        as: 'user',
        attributes: ['id', 'username', 'email']
      }
    ]
  });

  // 記錄審計日誌
  await createAuditLog({
    user_id: userId,
    action: 'update_comment',
    resource_type: 'book_comment',
    resource_id: commentId,
    details: { content_length: content.length },
    ip_address: req.ip,
    user_agent: req.get('User-Agent')
  });

  res.json({
    success: true,
    message: '評論更新成功',
    data: updatedComment
  });
});

// 刪除評論
const deleteComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const userId = req.user.id;

  const comment = await BookComment.findByPk(commentId);
  
  if (!comment) {
    return res.status(404).json({
      success: false,
      message: '評論不存在'
    });
  }

  // 檢查權限：只有評論作者或管理員可以刪除
  if (comment.user_id !== userId && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: '您沒有權限刪除此評論'
    });
  }

  // 軟刪除：將狀態設為deleted
  await comment.update({ status: 'deleted' });

  // 記錄審計日誌
  await createAuditLog({
    user_id: userId,
    action: 'delete_comment',
    resource_type: 'book_comment',
    resource_id: commentId,
    ip_address: req.ip,
    user_agent: req.get('User-Agent')
  });

  res.json({
    success: true,
    message: '評論刪除成功'
  });
});

// 獲取用戶的評論
const getUserComments = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { page = 1, limit = 10 } = req.query;
  
  const offset = (page - 1) * limit;
  
  const comments = await BookComment.findAndCountAll({
    where: {
      user_id: userId,
      status: 'active'
    },
    include: [
      {
        model: Book,
        as: 'book',
        attributes: ['id', 'title', 'author_name']
      }
    ],
    order: [['created_at', 'DESC']],
    limit: parseInt(limit),
    offset: parseInt(offset)
  });

  res.json({
    success: true,
    data: {
      comments: comments.rows,
      pagination: {
        current_page: parseInt(page),
        total_pages: Math.ceil(comments.count / limit),
        total_count: comments.count,
        limit: parseInt(limit)
      }
    }
  });
});

module.exports = {
  getBookComments,
  createComment,
  updateComment,
  deleteComment,
  getUserComments
};
