const express = require('express')
const router = express.Router()
// 引入認證中間件 
const { authenticate, optionalAuth } = require('../middleware')
// 引入權限檢查 
const { can } = require('../middleware/roles')
// 引入書籍控制器 書籍控制器
const { bookController: ctrl } = require('../controllers')
// 引入上傳工具 上傳電子書和封面
const { upload, uploadCover } = require('../utils/upload')
// 引入 HTTP 工具 將常用中介層（如 auditLog + asyncHandler）包一層，讓路由更精簡
const { wrap, wrapNoAudit } = require('../utils/http')



// 列出所有書籍
router.get('/', ...wrapNoAudit(optionalAuth)(ctrl.listBooks))
// 列出所有電子書
router.get('/ebooks', ...wrapNoAudit(optionalAuth)(ctrl.listEbooks))
// 搜尋書籍
router.get('/search/:keyword', ...wrapNoAudit(optionalAuth)(ctrl.searchBooks))
// 列出分類書籍
router.get('/category/:category', ...wrapNoAudit(optionalAuth)(ctrl.listByCategory))
// 取得單本書籍
router.get('/:id', ...wrapNoAudit()(ctrl.getBook))
// 新增書籍
router.post('/', ...wrap(authenticate, can.authorOrAdmin)(ctrl.createBook))
// 更新書籍
router.put('/:id', ...wrap(authenticate, can.authorOrAdmin)(ctrl.updateBook))
// 刪除書籍
router.delete('/:id', ...wrap(authenticate, can.authorOrAdmin)(ctrl.deleteBook))
// 上傳電子書
router.post('/:id/upload-ebook', ...wrap(authenticate, can.authorOrAdmin, upload.single('ebook'))(ctrl.uploadEbook))
// 上傳封面圖片
router.post('/:id/upload-cover', ...wrap(authenticate, can.authorOrAdmin, uploadCover.single('cover'))(ctrl.uploadCover))
// 下載電子書（允許未登入）
router.get('/:id/download-ebook', ...wrapNoAudit(optionalAuth)(ctrl.downloadEbook))
// 閱讀電子書（允許未登入）
router.get('/:id/read-ebook', ...wrapNoAudit(optionalAuth)(ctrl.readEbook))
// 獲取書籍評分
router.get('/:id/rating', ...wrapNoAudit()(ctrl.getBookRating))
// 刪除電子書
router.delete('/:id/delete-ebook', ...wrap(authenticate, can.authorOrAdmin)(ctrl.deleteEbook))
// 刪除封面圖片
router.delete('/:id/delete-cover', ...wrap(authenticate, can.authorOrAdmin)(ctrl.deleteCover))
// 更新電子書內容
router.put('/:id/update-content', ...wrap(authenticate, can.authorOrAdmin)(ctrl.updateEbookContent))
// 導出路由
module.exports = router


