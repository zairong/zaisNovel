'use strict'

// 使用專案現有的 Sequelize 初始化
const { sequelize } = require('../models')

async function checkBooksTable() {
  try {
    console.log('🔌 測試資料庫連線...')
    await sequelize.authenticate()
    console.log('✅ 資料庫連線成功')

    const qi = sequelize.getQueryInterface()

    // 檢查表是否存在
    let exists = false
    try {
      await qi.describeTable('books')
      exists = true
    } catch (err) {
      exists = false
    }

    if (!exists) {
      console.log('❌ 未找到表: books')
      return
    }

    // 簡單檢查表結構
    const desc = await qi.describeTable('books')
    console.log('✅ books 表結構檢查完成')
    
    // 只在開發環境顯示詳細信息
    if (process.env.NODE_ENV !== 'production') {
      console.log('📋 books 欄位：')
      Object.entries(desc).forEach(([name, info]) => {
        console.log(`- ${name}: type=${info.type}, allowNull=${info.allowNull}, default=${info.defaultValue ?? 'NULL'}`)
      })

      // 額外輸出欄位清單（方便比對）
      const [columns] = await sequelize.query(`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns
        WHERE table_schema='public' AND table_name='books'
        ORDER BY ordinal_position
      `)
      console.log('🧾 information_schema.columns：')
      columns.forEach((c) => {
        console.log(`- ${c.column_name} | ${c.data_type} | nullable=${c.is_nullable} | default=${c.column_default ?? 'NULL'}`)
      })
    }
  } catch (error) {
    console.error('❌ 檢查失敗：', error.message)
    process.exitCode = 1
  } finally {
    try { await sequelize.close() } catch (_) {}
  }
}

checkBooksTable()


