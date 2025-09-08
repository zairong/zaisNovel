const { Book, UserBook } = require('./models')

async function initDatabase() {
  try {
    console.log('🔧 開始初始化資料庫...')
    
    // 刪除 user_books 表（因為它有外鍵約束）
    try {
      await UserBook.drop({ cascade: true })
      console.log('✅ user_books 表格刪除成功')
    } catch (error) {
      console.log('⚠️ user_books 表格不存在或無法刪除:', error.message)
    }
    
    // 刪除 books 表
    try {
      await Book.drop({ cascade: true })
      console.log('✅ books 表格刪除成功')
    } catch (error) {
      console.log('⚠️ books 表格不存在或無法刪除:', error.message)
    }
    
    // 重新建立 books 表格
    await Book.sync({ force: true })
    console.log('✅ books 表格建立成功')
    
    // 插入範例資料
    const sampleBooks = [
      {
        title: 'JavaScript 高級程式設計',
        author_name: 'Nicholas C. Zakas',
        isbn: '9787115545384',
        price: 89.00,
        description: '深入學習 JavaScript 的經典教材，涵蓋 ES6+ 新特性',
        category: '程式設計'
      },
      {
        title: 'Node.js 實戰',
        author_name: 'Mike Cantelon',
        isbn: '9787115471652',
        price: 79.00,
        description: '使用 Node.js 建立高效能網路應用程式',
        category: '程式設計'
      },
      {
        title: 'MySQL 必知必會',
        author_name: 'Ben Forta',
        isbn: '9787115545385',
        price: 69.00,
        description: 'MySQL 資料庫查詢和管理的實用指南',
        category: '資料庫'
      },
      {
        title: 'Express.js 指南',
        author_name: 'Evan Hahn',
        isbn: '9787115545386',
        price: 59.00,
        description: '使用 Express.js 框架開發 Web 應用程式',
        category: '程式設計'
      },
      {
        title: 'RESTful API 設計',
        author_name: 'Leonard Richardson',
        isbn: '9787115545387',
        price: 75.00,
        description: '設計和實作 RESTful API 的最佳實踐',
        category: 'API 設計'
      }
    ]
    
    // 使用 Sequelize 建立範例資料
    await Book.bulkCreate(sampleBooks)
    console.log('✅ 範例資料插入成功')
    
    // 重新建立 user_books 表格
    await UserBook.sync({ force: true })
    console.log('✅ user_books 表格建立成功')
    
    console.log('🎉 資料庫初始化完成！')
    console.log('📚 可用的 API 端點：')
    console.log('  GET    /api/books                    - 取得所有書籍')
    console.log('  GET    /api/books/:id                - 取得單一書籍')
    console.log('  POST   /api/books                    - 新增書籍')
    console.log('  PUT    /api/books/:id                - 更新書籍')
    console.log('  DELETE /api/books/:id                - 刪除書籍')
    console.log('  GET    /api/books/search/:keyword    - 搜尋書籍')
    console.log('  GET    /api/books/category/:category - 依分類取得書籍')
    console.log('')
    console.log('📖 電子書相關 API 端點：')
    console.log('  POST   /api/books/:id/upload-ebook   - 上傳電子書檔案')
    console.log('  GET    /api/books/:id/download-ebook - 下載電子書檔案')
    console.log('  GET    /api/books/:id/read-ebook     - 取得電子書內容')
    console.log('  DELETE /api/books/:id/delete-ebook   - 刪除電子書檔案')
    
  } catch (error) {
    console.error('❌ 資料庫初始化失敗:', error)
  } finally {
    process.exit(0)
  }
}

// 執行初始化
initDatabase() 