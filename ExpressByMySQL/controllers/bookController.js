const { Book, UserBook, sequelize, BookView, BookDownload } = require('../models')
const fs = require('fs')
const path = require('path')
const { serializeBook, fixFilename } = require('../utils/bookUtils')
const crypto = require('crypto')
// 檢查用戶是否有管理書籍的權限
async function canManage(req, book) {
  if (!req.user) return false
  if (req.user.role === 'admin') return true
  if (req.user.role === 'author' && book.author_id === req.user.id) return true
  return false
}
// 檢查用戶是否有閱讀書籍的權限
async function canRead(req, book) {
  if (!req.user) return false
  if (req.user.role === 'admin') return true
  if (req.user.role === 'author' && book.author_id === req.user.id) return true
  const userBook = await UserBook.findOne({ where: { user_id: req.user.id, book_id: book.id } })
  return !!userBook
}
// 列出所有書籍
async function listBooks(req, res) {
  const { Op } = require('sequelize')
  const whereClause = {}
  if (req.user && req.user.role === 'author') {
    whereClause.author_id = req.user.id
  }
  const books = await Book.findAll({ where: whereClause, order: [['created_at', 'DESC']] })
  return res.json({ success: true, data: books.map(serializeBook), message: '成功取得所有書籍' })
}
// 列出所有電子書
async function listEbooks(req, res) {
  const { page = 1, pageSize = 20, search = '', category = 'all' } = req.query
  const { Op } = require('sequelize')

  // 搜尋/分類條件
  const baseWhere = {}
  if (search) {
    baseWhere[Op.or] = [
      { title: { [Op.like]: `%${search}%` } },
      { author_name: { [Op.like]: `%${search}%` } },
      { description: { [Op.like]: `%${search}%` } }
    ]
  }
  if (category && category !== 'all') baseWhere.category = category

  const offset = (parseInt(page) - 1) * parseInt(pageSize)
  const limit = parseInt(pageSize)

  try {
    // 檢查資料表欄位
    const qi = sequelize.getQueryInterface()
    let tableInfo = null
    try {
      tableInfo = await qi.describeTable('books')
    } catch (_) {
      tableInfo = null
    }

    const hasHasEbookColumn = !!(tableInfo && tableInfo.has_ebook)
    const hasCreatedAtColumn = !!(tableInfo && tableInfo.created_at)

    if (hasHasEbookColumn) {
      // 使用 has_ebook 欄位過濾
      const whereClause = { ...baseWhere, has_ebook: true }
      const total = await Book.count({ where: whereClause })
      const totalPages = Math.ceil(total / limit)
      
      const findOptions = {
        where: whereClause,
        ...(hasCreatedAtColumn ? { order: [['created_at', 'DESC']] } : {}),
        offset,
        limit
      }
      
      const ebooks = await Book.findAll(findOptions)
      const serializedEbooks = ebooks.map(serializeBook)
      
      return res.json({ 
        success: true, 
        data: {
          data: serializedEbooks,
          total,
          totalPages,
          currentPage: parseInt(page),
          pageSize: limit
        }, 
        message: '成功取得電子書列表' 
      })
    } else {
      // 若無 has_ebook 欄位，使用 ebook_file 欄位過濾
      const fallbackWhere = { ...baseWhere }
      const allMatched = await Book.findAll({ where: fallbackWhere })
      const onlyEbooks = allMatched.filter(b => !!b.ebook_file)
      const total = onlyEbooks.length
      const totalPages = Math.ceil(total / limit) || 1
      const pageItems = onlyEbooks.slice(offset, offset + limit)
      const serializedEbooks = pageItems.map(serializeBook)
      
      return res.json({ 
        success: true, 
        data: {
          data: serializedEbooks,
          total,
          totalPages,
          currentPage: parseInt(page),
          pageSize: limit
        }, 
        message: '成功取得電子書列表' 
      })
    }
  } catch (error) {
    console.error('取得電子書列表錯誤:', error)
    // 錯誤時回傳空清單
    return res.json({ 
      success: true, 
      data: {
        data: [],
        total: 0,
        totalPages: 1,
        currentPage: parseInt(page),
        pageSize: limit
      }, 
      message: '目前無法取得電子書列表，已回傳空清單' 
    })
  }
}
// 取得單本書籍
async function getBook(req, res) {
  const { id } = req.params
  // 避免資料表缺欄位造成查詢錯誤（例如舊表無 view_count）
  let book
  try {
    const qi = sequelize.getQueryInterface()
    let tableInfo = null
    try { tableInfo = await qi.describeTable('books') } catch (_) { tableInfo = null }
    const attrs = tableInfo ? Object.keys(tableInfo) : null
    const findOptions = {}
    if (attrs) findOptions.attributes = attrs
    book = await Book.findByPk(id, findOptions)
  } catch (e) {
    return res.status(500).json({ success: false, message: '取得書籍時發生錯誤', error: e.message })
  }
  if (!book) return res.status(404).json({ success: false, message: '找不到該書籍' })
  return res.json({ success: true, data: serializeBook(book), message: '成功取得書籍資料' })
}
// 新增書籍
async function createBook(req, res) {
  const { title, author, isbn, price, description, category, author_id } = req.body
  if (!title || !author) return res.status(400).json({ success: false, message: '標題和作者為必填欄位' })
  const payload = { title, author_name: author, isbn, price, description, category }
  if (req.user.role === 'author') payload.author_id = req.user.id
  else if (author_id) payload.author_id = author_id
  const book = await Book.create(payload)
  return res.status(201).json({ success: true, data: serializeBook(book), message: '書籍新增成功' })
}
// 更新書籍   
async function updateBook(req, res) {
  const { id } = req.params
  const { title, author, isbn, price, description, category } = req.body
  const book = await Book.findByPk(id)
  if (!book) return res.status(404).json({ success: false, message: '找不到該書籍' })
  const allowed = await canManage(req, book)
  if (!allowed) return res.status(403).json({ success: false, message: '權限不足，無法管理此書籍' })
  await book.update({ title, author_name: author, isbn, price, description, category })
  return res.json({ success: true, data: serializeBook(book), message: '書籍更新成功' })
}
// 刪除書籍
async function deleteBook(req, res) {
  const transaction = await sequelize.transaction()
  try {
    const { id } = req.params
    const book = await Book.findByPk(id, { transaction })
    if (!book) {
      await transaction.rollback()
      return res.status(404).json({ success: false, message: '找不到該書籍' })
    }
    const allowed = await canManage(req, book)
    if (!allowed) {
      await transaction.rollback()
      return res.status(403).json({ success: false, message: '權限不足，無法刪除此書籍' })
    }
    try {
      if (book.ebook_file && fs.existsSync(book.ebook_file)) fs.unlinkSync(book.ebook_file)
    } catch (e) {
      // 忽略檔案刪除錯誤
    }
    await UserBook.destroy({ where: { book_id: id }, transaction })
    await book.destroy({ transaction })
    await transaction.commit()
    return res.json({ success: true, message: '書籍刪除成功' })
  } catch (error) {
    await sequelize.transaction(async () => {}) // 保證 transaction 關閉
    return res.status(500).json({ success: false, message: '刪除書籍時發生錯誤', error: error.message })
  }
}

// 搜尋書籍
async function searchBooks(req, res) {
  const { keyword } = req.params
  const { Op } = require('sequelize')
  const whereClause = { [Op.or]: [
    { title: { [Op.like]: `%${keyword}%` } },
    { author_name: { [Op.like]: `%${keyword}%` } },
    { description: { [Op.like]: `%${keyword}%` } }
  ] }
  if (req.user && req.user.role === 'author') whereClause.author_id = req.user.id
  const books = await Book.findAll({ where: whereClause, order: [['created_at', 'DESC']] })
  return res.json({ success: true, data: books.map(serializeBook), message: `搜尋 "${keyword}" 的結果` })
}

// 列出分類書籍
async function listByCategory(req, res) {
  const { category } = req.params
  const whereClause = { category }
  if (req.user && req.user.role === 'author') whereClause.author_id = req.user.id
  const books = await Book.findAll({ where: whereClause, order: [['created_at', 'DESC']] })
  return res.json({ success: true, data: books.map(serializeBook), message: `分類 "${category}" 的書籍` })
}
// 上傳電子書
async function uploadEbook(req, res) {
  const { id } = req.params
  if (!req.file) return res.status(400).json({ success: false, message: '請選擇要上傳的電子書檔案' })
  const book = await Book.findByPk(id)
  if (!book) return res.status(404).json({ success: false, message: '找不到該書籍' })
  const allowed = await canManage(req, book)
  if (!allowed) return res.status(403).json({ success: false, message: '權限不足，無法上傳此書籍的電子書' })
  if (book.ebook_file && fs.existsSync(book.ebook_file)) { try { fs.unlinkSync(book.ebook_file) } catch (_) {} }
  const originalName = fixFilename(req.file.originalname)
  const payload = { ebook_file: req.file.path, ebook_filename: originalName, ebook_size: req.file.size, has_ebook: true }
  // 若有資料庫欄位，將內容寫入 DB（方案 B）
  try {
    const qi = sequelize.getQueryInterface()
    let tableInfo = null
    try { tableInfo = await qi.describeTable('books') } catch (_) { tableInfo = null }
    if (tableInfo && tableInfo.ebook_content) {
      const fileContent = fs.readFileSync(req.file.path, 'utf8')
      payload.ebook_content = fileContent
      payload.ebook_mime = 'text/markdown'
    }
  } catch (_) {}
  await book.update(payload)
  return res.json({ success: true, data: { filename: originalName, size: req.file.size, path: req.file.path }, message: '電子書上傳成功' })
}

// 上傳封面圖片
async function uploadCover(req, res) {
  try {
    const { id } = req.params
    if (!req.file) return res.status(400).json({ success: false, message: '請選擇要上傳的封面圖片' })
    
    // 檢查檔案類型
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(req.file.mimetype)) {
      return res.status(400).json({ success: false, message: '只允許上傳 JPG、PNG、GIF、WebP 格式的圖片' })
    }
    
    // 檢查檔案大小 (最大 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (req.file.size > maxSize) {
      return res.status(400).json({ success: false, message: '封面圖片大小不能超過 5MB' })
    }
    
    const book = await Book.findByPk(id)
    if (!book) return res.status(404).json({ success: false, message: '找不到該書籍' })
    const allowed = await canManage(req, book)
    if (!allowed) return res.status(403).json({ success: false, message: '權限不足，無法上傳此書籍的封面' })
    
    // 舊的封面圖片數據會自動被新的覆蓋，不需要手動刪除
    
    const originalName = fixFilename(req.file.originalname)
    
    // 讀取檔案內容並轉為 Base64
    const fileBuffer = fs.readFileSync(req.file.path)
    const base64Image = fileBuffer.toString('base64')
    const mimeType = req.file.mimetype
    
    await book.update({ 
      cover_image: `data:${mimeType};base64,${base64Image}`, 
      cover_filename: originalName, 
      has_cover: true 
    })
    
    // 刪除臨時檔案，因為我們已經將內容存到資料庫
    try {
      fs.unlinkSync(req.file.path)
    } catch (e) {
      console.warn('刪除臨時檔案失敗:', e.message)
    }
    
    return res.json({ 
      success: true, 
      data: { 
        filename: originalName, 
        size: req.file.size, 
        path: req.file.path,
        mimetype: req.file.mimetype
      }, 
      message: '封面上傳成功' 
    })
  } catch (error) {
    console.error('上傳封面錯誤:', error)
    return res.status(500).json({ success: false, message: '伺服器錯誤：' + error.message })
  }
}
// 下載電子書   
async function downloadEbook(req, res) {
  const { id } = req.params
  // 避免資料表缺欄位造成查詢錯誤（例如舊表無 view_count）
  let book
  try {
    const qi = sequelize.getQueryInterface()
    let tableInfo = null
    try { tableInfo = await qi.describeTable('books') } catch (_) { tableInfo = null }
    const attrs = tableInfo ? Object.keys(tableInfo) : null
    const findOptions = {}
    if (attrs) findOptions.attributes = attrs
    book = await Book.findByPk(id, findOptions)
  } catch (e) {
    return res.status(500).json({ success: false, message: '取得書籍時發生錯誤', error: e.message })
  }
  if (!book) return res.status(404).json({ success: false, message: '找不到該書籍' })
  if (!book.has_ebook) return res.status(404).json({ success: false, message: '該書籍沒有電子書檔案' })
  // 若原紀錄的路徑不存在，嘗試回退至環境變數目錄尋找
  let ebookPath = book.ebook_file
  if (!fs.existsSync(ebookPath)) {
    const fallbackDir = process.env.UPLOAD_DIR || path.join(__dirname, '..', 'uploads', 'ebooks')
    const candidate = path.join(fallbackDir, path.basename(ebookPath))
    if (fs.existsSync(candidate)) ebookPath = candidate
  }
  if (!fs.existsSync(ebookPath)) return res.status(404).json({ success: false, message: '電子書檔案不存在' })
  // 去重下載計數：每日唯一
  try {
    const qi = sequelize.getQueryInterface()
    let hasDownloadTable = false
    let hasDownloadCountColumn = false
    try {
      const tableInfo = await qi.describeTable('book_downloads')
      hasDownloadTable = !!tableInfo
    } catch (_) { hasDownloadTable = false }
    try {
      const booksInfo = await qi.describeTable('books')
      hasDownloadCountColumn = !!(booksInfo && booksInfo.download_count)
    } catch (_) { hasDownloadCountColumn = false }

    if (hasDownloadTable && hasDownloadCountColumn && BookDownload) {
      const viewerKey = (() => {
        if (req.user && req.user.id) return `usr:${req.user.id}`
        const ip = (req.headers['x-forwarded-for'] || '').toString().split(',')[0].trim() || (req.ip || '')
        const ua = req.get('User-Agent') || ''
        const hash = crypto.createHash('sha256').update(`${ip}|${ua}`).digest('hex').slice(0, 32)
        return `ipua:${hash}`
      })()
      const today = new Date().toISOString().slice(0, 10)
      const t = await sequelize.transaction()
      try {
        const [_, created] = await BookDownload.findOrCreate({
          where: { book_id: book.id, viewer_key: viewerKey, view_date: today },
          defaults: { book_id: book.id, viewer_key: viewerKey, view_date: today, user_id: (req.user && req.user.id) || null },
          transaction: t
        })
        if (created) {
          await Book.update({ download_count: sequelize.literal('download_count + 1') }, { where: { id: book.id }, transaction: t })
        }
        await t.commit()
      } catch (e) {
        try { await t.rollback() } catch (_) {}
        const isUniqueViolation = !!(e && (
          e.name === 'SequelizeUniqueConstraintError' ||
          (e.parent && (e.parent.code === 'ER_DUP_ENTRY' || e.parent.errno === 1062))
        ))
        if (!isUniqueViolation) {
          try { await book.increment('download_count').catch(() => {}) } catch (_) {}
        }
      }
    } else {
      await book.increment('download_count').catch(() => {})
    }
  } catch (_) {}
  // 下載前，嘗試重新載入並帶上計數資訊於回應標頭，方便前端即時更新
  try { await book.reload() } catch (_) {}
  try {
    if (typeof book.download_count !== 'undefined') {
      res.set('X-Download-Count', String(book.download_count || 0))
    }
    if (typeof book.view_count !== 'undefined') {
      res.set('X-View-Count', String(book.view_count || 0))
    }
  } catch (_) {}
  // 若資料庫已存有內容，直接傳回文字內容
  if (typeof book.ebook_content !== 'undefined' && book.ebook_content) {
    let downloadName = book.ebook_filename || `${book.title || 'ebook'}.md`
    try { downloadName = fixFilename(downloadName) } catch (_) {}
    try {
      const encoded = encodeURIComponent(downloadName)
      res.setHeader('Content-Type', `${book.ebook_mime || 'text/markdown'}; charset=utf-8`)
      res.setHeader('Content-Disposition', `attachment; filename="${downloadName}"; filename*=UTF-8''${encoded}`)
    } catch (_) {}
    return res.status(200).send(book.ebook_content)
  }
  // 優先使用原始檔名（修正編碼），其次以書名作為檔名，最後使用實體檔案名
  let downloadName = book.ebook_filename || `${book.title || 'ebook'}.md`
  try { downloadName = fixFilename(downloadName) } catch (_) {}
  // 設定 RFC5987 的 filename* 以避免中文亂碼，同時保留 filename 作為相容
  try {
    const encoded = encodeURIComponent(downloadName)
    res.setHeader('Content-Type', 'text/markdown; charset=utf-8')
    res.setHeader('Content-Disposition', `attachment; filename="${downloadName}"; filename*=UTF-8''${encoded}`)
  } catch (_) {}
  return res.download(ebookPath, downloadName)
}
// 閱讀電子書
async function readEbook(req, res) {
  const { id } = req.params
  // 避免資料表缺欄位造成查詢錯誤（例如舊表無 view_count）
  let book
  try {
    const qi = sequelize.getQueryInterface()
    let tableInfo = null
    try { tableInfo = await qi.describeTable('books') } catch (_) { tableInfo = null }
    const attrs = tableInfo ? Object.keys(tableInfo) : null
    const findOptions = {}
    if (attrs) findOptions.attributes = attrs
    book = await Book.findByPk(id, findOptions)
  } catch (e) {
    return res.status(500).json({ success: false, message: '取得書籍時發生錯誤', error: e.message })
  }
  if (!book) return res.status(404).json({ success: false, message: '找不到該書籍' })
  if (!book.has_ebook) return res.status(404).json({ success: false, message: '該書籍沒有電子書檔案' })
  // 無論是否登入，只要點擊閱讀即計數（資源存在時），採每日唯一去重
  try {
    const qi = sequelize.getQueryInterface()
    let hasBookViews = false
    try {
      const v = await qi.describeTable('book_views')
      hasBookViews = !!v
    } catch (_) {
      hasBookViews = false
    }

    if (hasBookViews && BookView) {
      const viewerKey = (() => {
        if (req.user && req.user.id) return `usr:${req.user.id}`
        const ip = (req.headers['x-forwarded-for'] || '').toString().split(',')[0].trim() || (req.ip || '')
        const ua = req.get('User-Agent') || ''
        const hash = crypto.createHash('sha256').update(`${ip}|${ua}`).digest('hex').slice(0, 32)
        return `ipua:${hash}`
      })()
      const today = new Date().toISOString().slice(0, 10)

      const t = await sequelize.transaction()
      try {
        // 去重：同一 viewer_key 在同一天只算一次
        const [_, created] = await BookView.findOrCreate({
          where: { book_id: book.id, viewer_key: viewerKey, view_date: today },
          defaults: { book_id: book.id, viewer_key: viewerKey, view_date: today, user_id: (req.user && req.user.id) || null },
          transaction: t
        })
        if (created) {
          await Book.update({ view_count: sequelize.literal('view_count + 1') }, { where: { id: book.id }, transaction: t })
        }
        await t.commit()
      } catch (e) {
        try { await t.rollback() } catch (_) {}
        const isUniqueViolation = !!(e && (
          e.name === 'SequelizeUniqueConstraintError' ||
          (e.parent && (e.parent.code === 'ER_DUP_ENTRY' || e.parent.errno === 1062))
        ))
        if (!isUniqueViolation) {
          // 降級：非唯一衝突才回退為單純遞增
          try { await book.increment('view_count').catch(() => {}) } catch (_) {}
        }
      }
    } else {
      // 無新表時的相容降級：單純遞增
      await book.increment('view_count').catch(() => {})
    }
  } catch (_) {}
  // 若資料庫已有內容，直接回傳
  if (typeof book.ebook_content !== 'undefined' && book.ebook_content) {
    try { await book.reload() } catch (_) {}
    return res.json({ success: true, data: { title: book.title, author: book.author_name, filename: book.ebook_filename, size: book.ebook_size, view_count: book.view_count, content: book.ebook_content }, message: '成功取得電子書內容' })
  }
  // 檔案回退
  let ebookPathR = book.ebook_file
  if (!fs.existsSync(ebookPathR)) {
    const fallbackDir = process.env.UPLOAD_DIR || path.join(__dirname, '..', 'uploads', 'ebooks')
    const candidate = path.join(fallbackDir, path.basename(ebookPathR))
    if (fs.existsSync(candidate)) ebookPathR = candidate
  }
  if (!fs.existsSync(ebookPathR)) return res.status(404).json({ success: false, message: '電子書檔案不存在' })
  const content = fs.readFileSync(ebookPathR, 'utf8')
  // 取最新觀看數
  try { await book.reload() } catch (_) {}
  return res.json({ success: true, data: { title: book.title, author: book.author_name, filename: book.ebook_filename, size: book.ebook_size, view_count: book.view_count, content }, message: '成功取得電子書內容' })
}
// 更新電子書內容
async function updateEbookContent(req, res) {
  const { id } = req.params
  const { content } = req.body
  if (!content) return res.status(400).json({ success: false, message: '內容不能為空' })
  const book = await Book.findByPk(id)
  if (!book) return res.status(404).json({ success: false, message: '找不到該書籍' })
  const allowed = await canManage(req, book)
  if (!allowed) return res.status(403).json({ success: false, message: '權限不足，無法更新此書籍的電子書內容' })
  // 優先更新資料庫欄位（方案 B）
  try {
    const qi = sequelize.getQueryInterface()
    let info = null
    try { info = await qi.describeTable('books') } catch (_) { info = null }
    if (info && info.ebook_content) {
      const size = Buffer.byteLength(content, 'utf8')
      await book.update({ ebook_content: content, ebook_mime: 'text/markdown', ebook_size: size, has_ebook: true })
      return res.json({ success: true, data: { title: book.title, author: book.author_name, filename: book.ebook_filename, size, content }, message: '電子書內容更新成功' })
    }
  } catch (_) {}
  // 檔案回退
  if (!book.has_ebook || !book.ebook_file) return res.status(404).json({ success: false, message: '該書籍沒有電子書檔案' })
  if (!fs.existsSync(book.ebook_file)) return res.status(404).json({ success: false, message: '電子書檔案不存在' })
  fs.writeFileSync(book.ebook_file, content, 'utf8')
  const stats = fs.statSync(book.ebook_file)
  await book.update({ ebook_size: stats.size })
  return res.json({ success: true, data: { title: book.title, author: book.author_name, filename: book.ebook_filename, size: stats.size, content }, message: '電子書內容更新成功' })
}
// 刪除電子書
async function deleteEbook(req, res) {
  const { id } = req.params
  const book = await Book.findByPk(id)
  if (!book) return res.status(404).json({ success: false, message: '找不到該書籍' })
  const allowed = await canManage(req, book)
  if (!allowed) return res.status(403).json({ success: false, message: '權限不足，無法刪除此書籍的電子書' })
  if (!book.has_ebook) return res.status(404).json({ success: false, message: '該書籍沒有電子書檔案' })
  if (fs.existsSync(book.ebook_file)) {
    try { fs.unlinkSync(book.ebook_file) } catch (_) {}
  }
  // 清除資料庫欄位（若存在）
  try {
    const qi = sequelize.getQueryInterface()
    let info = null
    try { info = await qi.describeTable('books') } catch (_) { info = null }
    if (info && info.ebook_content) {
      await book.update({ ebook_content: null, ebook_mime: null })
    }
  } catch (_) {}
  await book.update({ ebook_file: null, ebook_filename: null, ebook_size: null, has_ebook: false })
  return res.json({ success: true, message: '電子書檔案刪除成功' })
}

// 刪除封面圖片
async function deleteCover(req, res) {
  const { id } = req.params
  const book = await Book.findByPk(id)
  if (!book) return res.status(404).json({ success: false, message: '找不到該書籍' })
  const allowed = await canManage(req, book)
  if (!allowed) return res.status(403).json({ success: false, message: '權限不足，無法刪除此書籍的封面' })
  if (!book.has_cover || !book.cover_image) return res.status(404).json({ success: false, message: '該書籍沒有封面圖片' })
  
  // 直接清空資料庫欄位，因為圖片數據存在資料庫中
  await book.update({ cover_image: null, cover_filename: null, has_cover: false })
  return res.json({ success: true, message: '封面圖片刪除成功' })
}

// 獲取書籍平均評分
async function getBookRating(req, res) {
  const { id } = req.params
  
  try {
    // 檢查書籍是否存在
    const book = await Book.findByPk(id)
    if (!book) {
      return res.status(404).json({ 
        success: false, 
        message: '找不到該書籍' 
      })
    }

    // 計算該書籍的平均評分
    const ratingStats = await UserBook.findAll({
      where: { 
        book_id: id,
        rating: { [require('sequelize').Op.not]: null } // 只計算有評分的記錄
      },
      attributes: [
        [require('sequelize').fn('COUNT', require('sequelize').col('rating')), 'totalRatings'],
        [require('sequelize').fn('AVG', require('sequelize').col('rating')), 'averageRating']
      ]
    })

    if (ratingStats.length === 0 || ratingStats[0].dataValues.totalRatings === 0) {
      return res.json({
        success: true,
        data: {
          book_id: id,
          averageRating: 0,
          totalRatings: 0,
          hasRating: false
        },
        message: '此書籍目前沒有評分'
      })
    }

    const totalRatings = parseInt(ratingStats[0].dataValues.totalRatings)
    const averageRating = parseFloat(ratingStats[0].dataValues.averageRating).toFixed(1)

    return res.json({
      success: true,
      data: {
        book_id: id,
        averageRating: parseFloat(averageRating),
        totalRatings,
        hasRating: true
      },
      message: '成功取得書籍評分'
    })

  } catch (error) {
    console.error('獲取書籍評分錯誤:', error)
    return res.status(500).json({
      success: false,
      message: '獲取書籍評分時發生錯誤',
      error: error.message
    })
  }
}

// 導出控制器方法
module.exports = {
  listBooks,
  listEbooks,
  getBook,
  createBook,
  updateBook,
  deleteBook,
  searchBooks,
  listByCategory,
  uploadEbook,
  uploadCover,
  downloadEbook,
  readEbook,
  updateEbookContent,
  deleteEbook,
  deleteCover,
  getBookRating
}


