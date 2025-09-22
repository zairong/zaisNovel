const { UserBook, Book, User } = require('../models')
const { Op } = require('sequelize')
// 我的書庫
async function myLibrary(req, res) {
  const { page = 1, limit = 10, book_id } = req.query
  
  // 如果指定了 book_id，則只檢查該書籍的狀態
  if (book_id) {
    const userBook = await UserBook.findOne({ 
      where: { user_id: req.user.id, book_id: parseInt(book_id) },
      include: [{ model: Book, as: 'book' }]
    })
    
    return res.json({ 
      success: true, 
      data: { 
        userBooks: userBook ? [userBook.toJSON()] : [],
        pagination: { page: 1, limit: 1, total: userBook ? 1 : 0, pages: 1 }
      } 
    })
  }
  
  // 否則返回分頁的書庫列表
  const offset = (parseInt(page) - 1) * parseInt(limit)
  const { count, rows: userBooks } = await UserBook.findAndCountAll({ 
    where: { user_id: req.user.id }, 
    include: [{ model: Book, as: 'book' }], 
    limit: parseInt(limit), 
    offset: parseInt(offset), 
    order: [['added_at', 'DESC']] 
  })
  return res.json({ 
    success: true, 
    data: { 
      userBooks: userBooks.map(ub => ({ ...ub.toJSON(), book: ub.book })), 
      pagination: { page: parseInt(page), limit: parseInt(limit), total: count, pages: Math.ceil(count / limit) } 
    } 
  })
}
// 添加書籍到書庫
async function addToLibrary(req, res) {
  const { book_id } = req.body
  if (!book_id) return res.status(400).json({ success: false, message: '請提供書籍ID' })
  const book = await Book.findByPk(book_id)
  if (!book) return res.status(404).json({ success: false, message: '書籍不存在' })
  const existing = await UserBook.findOne({ where: { user_id: req.user.id, book_id } })
  if (existing) return res.status(400).json({ success: false, message: '此書籍已在您的書庫中' })
  const userBook = await UserBook.create({ user_id: req.user.id, book_id, is_favorite: false, reading_progress: 0 })
  return res.status(201).json({ success: true, message: '書籍已添加到書庫', data: { userBook: userBook.toJSON(), book: book.toJSON() } })
}
// 從書庫移除書籍
async function removeFromLibrary(req, res) {
  const { book_id } = req.params
  const userBook = await UserBook.findOne({ where: { user_id: req.user.id, book_id } })
  if (!userBook) return res.status(404).json({ success: false, message: '此書籍不在您的書庫中' })
  await userBook.destroy()
  return res.json({ success: true, message: '書籍已從書庫移除' })
}
// 更新書籍狀態
async function updateBookState(req, res) {
  const { book_id } = req.params
  const { is_favorite, reading_progress, rating, notes } = req.body
  
  // 檢查書籍是否存在
  const book = await Book.findByPk(book_id)
  if (!book) {
    return res.status(404).json({ success: false, message: '書籍不存在' })
  }
  
  // 查找或創建用戶書籍記錄
  let userBook = await UserBook.findOne({ where: { user_id: req.user.id, book_id } })
  
  if (!userBook) {
    // 如果用戶書籍記錄不存在，創建一個新的記錄
    userBook = await UserBook.create({ 
      user_id: req.user.id, 
      book_id, 
      rating: rating || null,
      is_favorite: is_favorite || false,
      reading_progress: reading_progress || 0,
      notes: notes || null
    })
  } else {
    // 如果記錄存在，更新相應的欄位
    const updateData = {}
    const wasFavorite = !!userBook.is_favorite
    
    if (is_favorite !== undefined) updateData.is_favorite = is_favorite
    if (reading_progress !== undefined) updateData.reading_progress = reading_progress
    if (rating !== undefined) updateData.rating = rating
    if (notes !== undefined) updateData.notes = notes
    
    await userBook.update(updateData)
    
    try {
      // 若收藏狀態從 false -> true，視為一次收藏事件，可用於 favoritesHistory 統計
      if (!wasFavorite && is_favorite === true) {
        // 無需額外表，直接依 user_books 的 created_at/updated_at 匯總，這裡確保 updated_at 已變更
        await userBook.reload()
      }
    } catch (_) {}
  }
  
  return res.json({ success: true, message: '書籍狀態更新成功', data: { userBook: userBook.toJSON() } })
}
// 我的最愛
async function favorites(req, res) {
  const { page = 1, limit = 10 } = req.query
  const offset = (page - 1) * limit
  const { count, rows: userBooks } = await UserBook.findAndCountAll({ where: { user_id: req.user.id, is_favorite: true }, include: [{ model: Book, as: 'book' }], limit: parseInt(limit), offset: parseInt(offset), order: [['added_at', 'DESC']] })
  return res.json({ success: true, data: { userBooks: userBooks.map(ub => ({ ...ub.toJSON(), book: ub.book })), pagination: { page: parseInt(page), limit: parseInt(limit), total: count, pages: Math.ceil(count / limit) } } })
}
// 閱讀統計
async function readingStats(req, res) {
  const userBooks = await UserBook.findAll({ where: { user_id: req.user.id }, include: [{ model: Book, as: 'book' }] })
  const stats = {
    totalBooks: userBooks.length,
    favoriteBooks: userBooks.filter(ub => ub.is_favorite).length,
    completedBooks: userBooks.filter(ub => ub.reading_progress === 100).length,
    inProgressBooks: userBooks.filter(ub => ub.reading_progress > 0 && ub.reading_progress < 100).length,
    averageRating: 0,
    totalPages: 0
  }
  const ratedBooks = userBooks.filter(ub => ub.rating)
  if (ratedBooks.length > 0) {
    const totalRating = ratedBooks.reduce((sum, ub) => sum + ub.rating, 0)
    stats.averageRating = (totalRating / ratedBooks.length).toFixed(1)
  }
  return res.json({ success: true, data: { stats } })
}
// 管理員統計
async function adminStats(req, res) {
  const stats = await UserBook.findAll({ include: [{ model: User, as: 'user', attributes: ['id', 'username', 'email', 'role'] }, { model: Book, as: 'book', attributes: ['id', 'title', 'author'] }] })
  const userStats = {}
  stats.forEach(userBook => {
    const userId = userBook.user_id
    if (!userStats[userId]) {
      userStats[userId] = { user: userBook.user.toJSON(), totalBooks: 0, favoriteBooks: 0, completedBooks: 0, averageRating: 0, ratings: [] }
    }
    userStats[userId].totalBooks++
    if (userBook.is_favorite) userStats[userId].favoriteBooks++
    if (userBook.reading_progress === 100) userStats[userId].completedBooks++
    if (userBook.rating) userStats[userId].ratings.push(userBook.rating)
  })
  Object.values(userStats).forEach(stat => {
    if (stat.ratings.length > 0) {
      const totalRating = stat.ratings.reduce((sum, rating) => sum + rating, 0)
      stat.averageRating = (totalRating / stat.ratings.length).toFixed(1)
    }
    delete stat.ratings
  })
  return res.json({ success: true, data: { userStats: Object.values(userStats) } })
}
// 導出控制器方法
module.exports = { myLibrary, addToLibrary, removeFromLibrary, updateBookState, favorites, readingStats, adminStats }


