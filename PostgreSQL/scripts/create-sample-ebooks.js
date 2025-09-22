const { Book } = require('../models')
const fs = require('fs')
const path = require('path')

async function createSampleEbooks() {
  try {
    console.log('🔧 開始創建示例電子書...')
    
    // 檢查 uploads/ebooks 目錄是否存在
    const uploadsDir = path.join(__dirname, '../uploads/ebooks')
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true })
      console.log('✅ 創建 uploads/ebooks 目錄')
    }
    
    // 創建示例電子書內容
    const sampleEbookContent = `# 示例電子書

這是一個示例電子書的內容。

## 第一章：介紹

歡迎閱讀這本示例電子書！

## 第二章：內容

這裡是一些示例內容...

## 結語

感謝您的閱讀！
`
    
    // 創建示例電子書檔案
    const ebookFilename = `sample-ebook-${Date.now()}.md`
    const ebookPath = path.join(uploadsDir, ebookFilename)
    fs.writeFileSync(ebookPath, sampleEbookContent)
    
    // 更新現有書籍，設置為電子書
    const books = await Book.findAll()
    
    for (let i = 0; i < Math.min(books.length, 3); i++) {
      const book = books[i]
      await book.update({
        has_ebook: true,
        ebook_filename: ebookFilename,
        ebook_size: fs.statSync(ebookPath).size,
        ebook_file: ebookPath
      })
      console.log(`✅ 更新書籍 "${book.title}" 為電子書`)
    }
    
    console.log('🎉 示例電子書創建完成！')
    console.log(`📁 電子書檔案：${ebookPath}`)
    console.log(`📊 已更新 ${Math.min(books.length, 3)} 本書籍為電子書`)
    
  } catch (error) {
    console.error('❌ 創建示例電子書失敗:', error)
  } finally {
    process.exit(0)
  }
}

createSampleEbooks()
