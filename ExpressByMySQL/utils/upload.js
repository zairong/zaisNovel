const multer = require('multer')
const path = require('path')
const fs = require('fs')
const { fixFilename } = require('./bookUtils')

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '..', 'uploads', 'ebooks')
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true })
    }
    cb(null, uploadDir)
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9)
    const originalName = fixFilename(file.originalname)
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(originalName))
  }
})

// 電子書上傳配置
const upload = multer({
  storage,
  fileFilter: function (req, file, cb) {
    if (file.mimetype === 'text/markdown' || path.extname(file.originalname).toLowerCase() === '.md') {
      cb(null, true)
    } else {
      cb(new Error('只允許上傳 .md 檔案'), false)
    }
  },
  limits: { fileSize: 50 * 1024 * 1024 }
})

// 封面圖片上傳配置
const coverStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '..', 'uploads', 'covers')
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true })
    }
    cb(null, uploadDir)
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9)
    const originalName = fixFilename(file.originalname)
    cb(null, 'cover-' + uniqueSuffix + path.extname(originalName))
  }
})

const uploadCover = multer({
  storage: coverStorage,
  fileFilter: function (req, file, cb) {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error('只允許上傳 JPG、PNG、GIF、WebP 格式的圖片'), false)
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
})

module.exports = { upload, uploadCover }


