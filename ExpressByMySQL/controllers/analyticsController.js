'use strict'

const { sequelize } = require('../models')
const { Op } = require('sequelize')

// 根據資料庫方言回傳對應的時間欄位擷取語法
function sqlExtract(dialect, part, alias, column = 'created_at') {
  const col = `${alias}.${column}`
  if (part === 'DATE') {
    // 日期截斷（去除時間）
    return dialect === 'postgres' ? `DATE(${col})` : `DATE(${col})`
  }
  if (dialect === 'postgres') {
    // EXTRACT 回傳 numeric
    return `EXTRACT(${part} FROM ${col})`
  }
  // 預設 MySQL / MariaDB
  return `${part}(${col})`
}

function sqlYearExpr(dialect, tableAlias = null, column = 'created_at') {
  const col = tableAlias ? `${tableAlias}.${column}` : column
  if (dialect === 'postgres') return `EXTRACT(YEAR FROM ${col})::int`
  return `YEAR(${col})`
}

// 檢查表是否存在某欄位
async function tableHasColumn(tableName, columnName) {
  try {
    const qi = sequelize.getQueryInterface()
    const desc = await qi.describeTable(tableName)
    return !!(desc && desc[columnName])
  } catch (_) {
    return false
  }
}

// 產生時間區間
function getRangeBounds(granularity, baseDate = new Date(), custom = {}) {
  const now = baseDate
  if (granularity === 'day') {
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0)
    const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59)
    return { start, end }
  }
  if (granularity === 'month') {
    const start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0)
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)
    return { start, end }
  }
  if (granularity === 'year') {
    const start = new Date(now.getFullYear(), 0, 1, 0, 0, 0)
    const end = new Date(now.getFullYear(), 11, 31, 23, 59, 59)
    return { start, end }
  }
  if (granularity === 'custom') {
    const start = custom.start ? new Date(custom.start) : new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0)
    const end = custom.end ? new Date(custom.end) : new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59)
    return { start, end }
  }
  // 預設為指定年份
  const year = custom.year || now.getFullYear()
  const start = new Date(year, 0, 1, 0, 0, 0)
  const end = new Date(year, 11, 31, 23, 59, 59)
  return { start, end }
}
// 建立空桶
function buildEmptyBuckets(granularity, baseDate = new Date(), custom = {}) {
  // 以小時為單位
  if (granularity === 'day') {
    return { labels: Array.from({ length: 24 }, (_, i) => `${i}:00`), data: Array(24).fill(0) }
  }
  // 以月為單位
  if (granularity === 'month') {
    const daysInMonth = new Date(baseDate.getFullYear(), baseDate.getMonth() + 1, 0).getDate()
    return { labels: Array.from({ length: daysInMonth }, (_, i) => `${i + 1}`), data: Array(daysInMonth).fill(0) }
  }
  // 以年為單位
  if (granularity === 'year') {
    const start = custom.year ? new Date(custom.year, 0, 1) : new Date(baseDate.getFullYear(), 0, 1)
    const end = custom.year ? new Date(custom.year, 11, 31) : new Date(baseDate.getFullYear(), 11, 31)
    const diffMs = end - start
    const diffDays = diffMs / (1000 * 60 * 60 * 24)
    return { labels: Array.from({ length: 12 }, (_, i) => `${i + 1}`), data: Array(12).fill(0) }
  }
  // 以自定義時間為單位
  if (granularity === 'custom') {
    const start = custom.start ? new Date(custom.start) : new Date()
    const end = custom.end ? new Date(custom.end) : new Date()
    const diffMs = Math.max(0, end - start)
    const diffDays = diffMs / (1000 * 60 * 60 * 24)
    if (diffDays <= 2) {
      return { labels: Array.from({ length: 24 }, (_, i) => `${i}:00`), data: Array(24).fill(0), bucket: 'hour' }
    }
    if (diffDays <= 92) {
      const totalDays = Math.max(1, Math.ceil(diffDays))
      // 以日為單位，標籤顯示日期
      const labels = []
      const cursor = new Date(start.getFullYear(), start.getMonth(), start.getDate())
      for (let i = 0; cursor <= end && i < 366; i++) {
        labels.push(`${cursor.getMonth() + 1}/${cursor.getDate()}`)
        cursor.setDate(cursor.getDate() + 1)
      }
      return { labels, data: Array(labels.length).fill(0), bucket: 'day', start, end }
    }
    return { labels: Array.from({ length: 12 }, (_, i) => `${i + 1}`), data: Array(12).fill(0), bucket: 'month' }
  }
  // 預設為指定年份
  const year = custom.year || baseDate.getFullYear()
  return { labels: Array.from({ length: 12 }, (_, i) => `${i + 1}`), data: Array(12).fill(0) }
}

// 觀看歷史
async function viewsHistory(req, res) {
  try {
    const dialect = typeof sequelize.getDialect === 'function' ? sequelize.getDialect() : 'postgres'
    const { granularity = 'day', year, book_id: bookId } = req.query
    const { start, end } = getRangeBounds(granularity, new Date(), { year: year ? parseInt(year, 10) : undefined })
    const buckets = buildEmptyBuckets(granularity, new Date(), { year: year ? parseInt(year, 10) : undefined })
    const { labels } = buckets
    const data = buckets.data

    const hasUserId = await tableHasColumn('book_views', 'user_id')
    const isAuthor = req.user && req.user.role === 'author'
    const whereUser = hasUserId ? 'v.user_id = :uid' : 'v.viewer_key = :vkey'
    const params = hasUserId ? { uid: req.user.id } : { vkey: `usr:${req.user.id}` }
    if (bookId) params.bookId = parseInt(bookId, 10)

    let groupExpr, idxMapper
    const alias = 'v'
    if (granularity === 'day') {
      groupExpr = sqlExtract(dialect, 'HOUR', alias)
      idxMapper = (row) => parseInt(row.bucket, 10)
    } else if (granularity === 'month') {
      groupExpr = sqlExtract(dialect, 'DAY', alias)
      idxMapper = (row) => parseInt(row.bucket, 10) - 1
    } else if (granularity === 'year') {
      groupExpr = sqlExtract(dialect, 'MONTH', alias)
      idxMapper = (row) => parseInt(row.bucket, 10) - 1
    } else {
      // custom
      if (buckets.bucket === 'hour') {
        groupExpr = sqlExtract(dialect, 'HOUR', alias)
        idxMapper = (row) => parseInt(row.bucket, 10)
      } else if (buckets.bucket === 'day') {
        groupExpr = sqlExtract(dialect, 'DATE', alias)
        // 映射到 labels 的索引
        const indexMap = new Map(labels.map((l, idx) => [l, idx]))
        idxMapper = (row) => {
          const d = new Date(row.bucket)
          return indexMap.get(`${d.getMonth() + 1}/${d.getDate()}`)
        }
      } else {
        groupExpr = sqlExtract(dialect, 'MONTH', alias)
        idxMapper = (row) => parseInt(row.bucket, 10) - 1
      }
    }

    const authorFilter = isAuthor ? 'AND b.author_id = :authorId' : ''
    const [rows] = await sequelize.query(
      `SELECT ${groupExpr} AS bucket, SUM(v.cnt) AS cnt
       FROM book_views v
       JOIN books b ON b.id = v.book_id
       WHERE 1=1
         ${isAuthor ? '' : `AND ${whereUser}`}
         ${bookId ? 'AND v.book_id = :bookId' : ''}
         ${authorFilter}
         AND v.created_at BETWEEN :start AND :end
       GROUP BY bucket
       ORDER BY bucket`,
      { replacements: { ...(isAuthor ? {} : params), start, end, ...(authorFilter ? { authorId: req.user.id } : {}), ...(bookId ? { bookId: parseInt(bookId, 10) } : {}) } }
    )
    for (const r of rows) {
      const idx = idxMapper(r)
      if (idx >= 0 && idx < data.length) data[idx] = parseInt(r.cnt, 10)
    }
    return res.json({ success: true, data: { labels, series: data } })
  } catch (e) {
    return res.status(500).json({ success: false, message: '取得觀看歷史資料失敗', error: e.message })
  }
}

// 下載歷史
async function downloadsHistory(req, res) {
  try {
    const dialect = typeof sequelize.getDialect === 'function' ? sequelize.getDialect() : 'postgres'
    const { granularity = 'day', year, book_id: bookId } = req.query
    const { start, end } = getRangeBounds(granularity, new Date(), { year: year ? parseInt(year, 10) : undefined })
    const buckets = buildEmptyBuckets(granularity, new Date(), { year: year ? parseInt(year, 10) : undefined })
    const { labels } = buckets
    const data = buckets.data

    const hasUserId = await tableHasColumn('book_downloads', 'user_id')
    const isAuthor = req.user && req.user.role === 'author'
    const whereUser = hasUserId ? 'd.user_id = :uid' : 'd.viewer_key = :vkey'
    const params = hasUserId ? { uid: req.user.id } : { vkey: `usr:${req.user.id}` }
    if (bookId) params.bookId = parseInt(bookId, 10)

    let groupExpr, idxMapper
    const dalias = 'd'
    if (granularity === 'day') {
      groupExpr = sqlExtract(dialect, 'HOUR', dalias)
      idxMapper = (row) => parseInt(row.bucket, 10)
    } else if (granularity === 'month') {
      groupExpr = sqlExtract(dialect, 'DAY', dalias)
      idxMapper = (row) => parseInt(row.bucket, 10) - 1
    } else if (granularity === 'year') {
      groupExpr = sqlExtract(dialect, 'MONTH', dalias)
      idxMapper = (row) => parseInt(row.bucket, 10) - 1
    } else {
      if (buckets.bucket === 'hour') {
        groupExpr = sqlExtract(dialect, 'HOUR', dalias)
        idxMapper = (row) => parseInt(row.bucket, 10)
      } else if (buckets.bucket === 'day') {
        groupExpr = sqlExtract(dialect, 'DATE', dalias)
        const indexMap = new Map(labels.map((l, idx) => [l, idx]))
        idxMapper = (row) => {
          const d = new Date(row.bucket)
          return indexMap.get(`${d.getMonth() + 1}/${d.getDate()}`)
        }
      } else {
        groupExpr = sqlExtract(dialect, 'MONTH', dalias)
        idxMapper = (row) => parseInt(row.bucket, 10) - 1
      }
    }

    const authorFilter = isAuthor ? 'AND b.author_id = :authorId' : ''
    const [rows] = await sequelize.query(
      `SELECT ${groupExpr} AS bucket, SUM(d.cnt) AS cnt
       FROM book_downloads d
       JOIN books b ON b.id = d.book_id
       WHERE 1=1
         ${isAuthor ? '' : `AND ${whereUser}`}
         ${bookId ? 'AND d.book_id = :bookId' : ''}
         ${authorFilter}
         AND d.created_at BETWEEN :start AND :end
       GROUP BY bucket
       ORDER BY bucket`,
      { replacements: { ...(isAuthor ? {} : params), start, end, ...(authorFilter ? { authorId: req.user.id } : {}), ...(bookId ? { bookId: parseInt(bookId, 10) } : {}) } }
    )
    for (const r of rows) {
      const idx = idxMapper(r)
      if (idx >= 0 && idx < data.length) data[idx] = parseInt(r.cnt, 10)
    }
    return res.json({ success: true, data: { labels, series: data } })
  } catch (e) {
    return res.status(500).json({ success: false, message: '取得下載歷史資料失敗', error: e.message })
  }
}

// 收藏歷史
async function favoritesHistory(req, res) {
  try {
    const dialect = typeof sequelize.getDialect === 'function' ? sequelize.getDialect() : 'postgres'
    const { granularity = 'day', year, book_id: bookId } = req.query
    const { start, end } = getRangeBounds(granularity, new Date(), { year: year ? parseInt(year, 10) : undefined })
    const buckets = buildEmptyBuckets(granularity, new Date(), { year: year ? parseInt(year, 10) : undefined })
    const { labels } = buckets
    const data = buckets.data

    let groupExpr, idxMapper
    const ubalias = 'ub'
    if (granularity === 'day') {
      groupExpr = sqlExtract(dialect, 'HOUR', ubalias)
      idxMapper = (row) => parseInt(row.bucket, 10)
    } else if (granularity === 'month') {
      groupExpr = sqlExtract(dialect, 'DAY', ubalias)
      idxMapper = (row) => parseInt(row.bucket, 10) - 1
    } else if (granularity === 'year') {
      groupExpr = sqlExtract(dialect, 'MONTH', ubalias)
      idxMapper = (row) => parseInt(row.bucket, 10) - 1
    } else {
      if (buckets.bucket === 'hour') {
        groupExpr = sqlExtract(dialect, 'HOUR', ubalias)
        idxMapper = (row) => parseInt(row.bucket, 10)
      } else if (buckets.bucket === 'day') {
        groupExpr = sqlExtract(dialect, 'DATE', ubalias)
        const indexMap = new Map(labels.map((l, idx) => [l, idx]))
        idxMapper = (row) => {
          const d = new Date(row.bucket)
          return indexMap.get(`${d.getMonth() + 1}/${d.getDate()}`)
        }
      } else {
        groupExpr = sqlExtract(dialect, 'MONTH', ubalias)
        idxMapper = (row) => parseInt(row.bucket, 10) - 1
      }
    }

    const isAuthor = req.user && req.user.role === 'author'
    const authorFilterFav = isAuthor ? 'AND b.author_id = :authorId' : ''
    const [rows] = await sequelize.query(
      `SELECT ${groupExpr} AS bucket, COUNT(*) AS cnt
       FROM user_books ub
       JOIN books b ON b.id = ub.book_id
       WHERE 1=1
         ${bookId ? 'AND ub.book_id = :bookId' : ''}
         ${authorFilterFav}
         AND ub.created_at BETWEEN :start AND :end
       GROUP BY bucket
       ORDER BY bucket`,
      { replacements: { start, end, ...(bookId ? { bookId: parseInt(bookId, 10) } : {}), ...(isAuthor ? { authorId: req.user.id } : {}) } }
    )
    for (const r of rows) {
      const idx = idxMapper(r)
      if (idx >= 0 && idx < data.length) data[idx] = parseInt(r.cnt, 10)
    }
    return res.json({ success: true, data: { labels, series: data } })
  } catch (e) {
    return res.status(500).json({ success: false, message: '取得收藏歷史資料失敗', error: e.message })
  }
}

// 作者書籍列表
async function myBooks(req, res) {
  try {
    // 僅作者可用此端點
    if (!req.user || req.user.role !== 'author') {
      return res.json({ success: true, data: [] })
    }
    const [rows] = await sequelize.query(
      `SELECT id, title
       FROM books
       WHERE author_id = :uid AND has_ebook = TRUE
       ORDER BY created_at DESC` ,
      { replacements: { uid: req.user.id } }
    )
    return res.json({ success: true, data: rows })
  } catch (e) {
    return res.status(500).json({ success: false, message: '取得作者書籍列表失敗', error: e.message })
  }
}

// 獲取年齡分布統計
async function getAgeDistribution(req, res) {
  try {
    const { sequelize } = require('../models')
    // 若統計表不存在，直接回傳預設（全未知）避免 500
    const hasViewTable = await (async () => {
      try {
        await sequelize.getQueryInterface().describeTable('book_views')
        return true
      } catch (_) { return false }
    })()
    if (!hasViewTable) {
      return res.json({ success: true, data: [{ age_range: '未知', count: 0 }] })
    }

    const hasUserId = await tableHasColumn('book_views', 'user_id')

    let ageDistribution = []
    if (hasUserId) {
      // 有 user_id 欄位：可連接 users 取得年齡層
      const [rows] = await sequelize.query(`
        SELECT 
          age_range,
          COUNT(*) as count
        FROM (
          SELECT 
            CASE 
              WHEN bv.user_id IS NOT NULL THEN 
                COALESCE(u.age_range, '未知')
              ELSE '未知'
            END as age_range
          FROM book_views bv
          LEFT JOIN users u ON bv.user_id = u.id
        ) as age_data
        GROUP BY age_range
        ORDER BY 
          CASE age_range 
            WHEN '未知' THEN 1 
            WHEN '10~20' THEN 2 
            WHEN '20~30' THEN 3 
            WHEN '30~40' THEN 4 
            WHEN '40~50' THEN 5 
            WHEN '50~60' THEN 6 
            WHEN '60以上' THEN 7 
            ELSE 8 
          END
      `)
      ageDistribution = rows
    } else {
      // 沒有 user_id 欄位：一律視為未知
      const [rows] = await sequelize.query(`
        SELECT '未知' AS age_range, COUNT(*) AS count
        FROM book_views
      `)
      ageDistribution = rows
    }

    return res.json({
      success: true,
      data: ageDistribution.map(item => ({
        age_range: formatAgeRange(item.age_range),
        count: parseInt(item.count, 10)
      }))
    })
  } catch (error) {
    console.error('獲取年齡分布失敗:', error)
    return res.status(500).json({ success: false, message: '獲取年齡分布失敗', error: error.message })
  }
}

// 格式化年齡範圍顯示
function formatAgeRange(ageRange) {
  if (ageRange === '未知') return '未知'
  
  const ageMap = {
    '10~20': '10歲~20歲',
    '20~30': '20歲~30歲',
    '30~40': '30歲~40歲',
    '40~50': '40歲~50歲',
    '50~60': '50歲~60歲',
    '60以上': '60歲以上'
  }
  
  return ageMap[ageRange] || ageRange
}

// 獲取可用的年份
async function getAvailableYears(req, res) {
  try {
    const { BookView, BookDownload } = require('../models')
    const dialect = typeof sequelize.getDialect === 'function' ? sequelize.getDialect() : 'postgres'
    
    // 查詢觀看記錄中的年份
    const yearExpr = sqlYearExpr(dialect, null, 'created_at')
    const viewYears = await sequelize.query(`
      SELECT DISTINCT ${yearExpr} as year 
      FROM book_views 
      ORDER BY year
    `, { type: sequelize.QueryTypes.SELECT })
    
    // 查詢下載記錄中的年份
    const downloadYears = await sequelize.query(`
      SELECT DISTINCT ${yearExpr} as year 
      FROM book_downloads 
      ORDER BY year
    `, { type: sequelize.QueryTypes.SELECT })
    
    // 合併並去重年份
    const allYears = [...new Set([
      ...viewYears.map(v => v.year),
      ...downloadYears.map(d => d.year)
    ])].sort((a, b) => a - b)
    
    res.json({
      success: true,
      data: allYears
    })
  } catch (error) {
    console.error('獲取可用年份失敗:', error)
    res.status(500).json({
      success: false,
      message: '獲取可用年份失敗',
      error: error.message
    })
  }
}

module.exports = {
  viewsHistory,
  downloadsHistory,
  favoritesHistory,
  myBooks,
  getAgeDistribution,
  getAvailableYears
}


