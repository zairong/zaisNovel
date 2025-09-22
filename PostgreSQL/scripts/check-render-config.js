#!/usr/bin/env node

/**
 * Render 配置檢查腳本
 * 用於診斷 Render 部署時的資料庫連線問題
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Render 配置診斷工具');
console.log('========================\n');

// 檢查環境變數
console.log('📊 環境變數檢查:');
console.log('  - NODE_ENV:', process.env.NODE_ENV || '未設定');
console.log('  - DATABASE_URL:', process.env.DATABASE_URL ? '已設定' : '❌ 未設定');
console.log('  - DB_HOST:', process.env.DB_HOST || '未設定');
console.log('  - DB_PORT:', process.env.DB_PORT || '未設定');
console.log('  - DB_NAME:', process.env.DB_NAME || '未設定');
console.log('  - DB_USERNAME:', process.env.DB_USERNAME || '未設定');
console.log('  - DB_PASSWORD:', process.env.DB_PASSWORD ? '已設定' : '未設定');
console.log('  - JWT_SECRET:', process.env.JWT_SECRET ? '已設定' : '❌ 未設定');
console.log('  - PORT:', process.env.PORT || '未設定');

// 檢查 DATABASE_URL 格式
if (process.env.DATABASE_URL) {
  console.log('\n🔗 DATABASE_URL 分析:');
  const url = process.env.DATABASE_URL;
  const safeUrl = url.replace(/:([^:@]+)@/, ':***@');
  console.log('  - 完整 URL:', safeUrl);
  
  if (url.startsWith('postgresql://') || url.startsWith('postgres://')) {
    console.log('  - 格式: ✅ PostgreSQL');
  } else if (url.startsWith('mysql://')) {
    console.log('  - 格式: ❌ MySQL (錯誤！)');
  } else {
    console.log('  - 格式: ❓ 未知格式');
  }
  
  // 解析 URL 組件
  try {
    const urlObj = new URL(url);
    console.log('  - 主機:', urlObj.hostname);
    console.log('  - 端口:', urlObj.port || '5432');
    console.log('  - 資料庫:', urlObj.pathname.substring(1));
    console.log('  - 用戶名:', urlObj.username);
  } catch (error) {
    console.log('  - URL 解析錯誤:', error.message);
  }
}

// 檢查 app.json 配置
console.log('\n📄 app.json 配置檢查:');
const appJsonPath = path.join(__dirname, '../app.json');
if (fs.existsSync(appJsonPath)) {
  try {
    const appJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'));
    console.log('  - 服務名稱:', appJson.name);
    console.log('  - 資料庫 addon:', appJson.addons?.[0]?.plan || '未設定');
    console.log('  - 環境變數:', Object.keys(appJson.env || {}));
  } catch (error) {
    console.log('  - 讀取 app.json 失敗:', error.message);
  }
} else {
  console.log('  - app.json 不存在');
}

// 檢查 package.json 腳本
console.log('\n📦 package.json 腳本檢查:');
const packageJsonPath = path.join(__dirname, '../package.json');
if (fs.existsSync(packageJsonPath)) {
  try {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    console.log('  - start:deploy:', packageJson.scripts?.['start:deploy'] || '未設定');
    console.log('  - setup:', packageJson.scripts?.setup || '未設定');
    console.log('  - migrate:', packageJson.scripts?.migrate || '未設定');
  } catch (error) {
    console.log('  - 讀取 package.json 失敗:', error.message);
  }
}

// 提供建議
console.log('\n💡 建議:');
if (!process.env.DATABASE_URL) {
  console.log('❌ 缺少 DATABASE_URL 環境變數');
  console.log('   1. 在 Render Dashboard 中建立 PostgreSQL 資料庫');
  console.log('   2. 複製資料庫的連線字串');
  console.log('   3. 在 Web Service 環境變數中設定 DATABASE_URL');
}

if (process.env.DATABASE_URL && process.env.DATABASE_URL.includes('mysql')) {
  console.log('❌ DATABASE_URL 是 MySQL 格式，但應用程式需要 PostgreSQL');
  console.log('   1. 刪除現有的 MySQL 資料庫');
  console.log('   2. 建立新的 PostgreSQL 資料庫');
  console.log('   3. 更新 DATABASE_URL 環境變數');
}

if (!process.env.JWT_SECRET) {
  console.log('❌ 缺少 JWT_SECRET 環境變數');
  console.log('   1. 生成一個安全的密鑰');
  console.log('   2. 在環境變數中設定 JWT_SECRET');
}

console.log('\n🔧 修復步驟:');
console.log('1. 登入 Render Dashboard');
console.log('2. 刪除現有的 Web Service');
console.log('3. 建立新的 PostgreSQL 資料庫 (Free 方案)');
console.log('4. 建立新的 Web Service，連接到 ExpressByMySQL 目錄');
console.log('5. 設定環境變數:');
console.log('   - NODE_ENV=production');
console.log('   - DATABASE_URL=<PostgreSQL 連線字串>');
console.log('   - JWT_SECRET=<安全密鑰>');
console.log('   - PORT=3000');
console.log('6. 部署並檢查日誌');

console.log('\n✅ 診斷完成');
