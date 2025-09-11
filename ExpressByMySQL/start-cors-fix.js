#!/usr/bin/env node

/**
 * CORS 修復版 Render 啟動腳本
 * 專門用於修復 CORS 跨域問題
 */

const { sequelize } = require('./models');
const { initAdmin } = require('./init-admin');

async function quickSetup() {
  try {
    console.log('🚀 CORS 修復版快速啟動系統...');
    
    // 快速測試連線（5秒超時）
    console.log('🔍 測試資料庫連線...');
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('連線超時')), 5000);
    });
    
    try {
      await Promise.race([sequelize.authenticate(), timeoutPromise]);
      console.log('✅ 資料庫連線成功');
    } catch (error) {
      console.log('⚠️  資料庫連線測試失敗，但繼續啟動:', error.message);
    }
    
    // 同步資料庫（不強制）
    console.log('📊 同步資料庫結構...');
    try {
      await sequelize.sync({ force: false, alter: false });
      console.log('✅ 資料庫結構同步完成');
    } catch (error) {
      console.log('⚠️  資料庫同步失敗，但繼續啟動:', error.message);
    }
    
    // 初始化管理員（不強制）
    console.log('👤 初始化管理員帳戶...');
    try {
      await initAdmin();
      console.log('✅ 管理員帳戶初始化完成');
    } catch (error) {
      console.log('⚠️  管理員初始化失敗，但繼續啟動:', error.message);
    }
    
    console.log('🎉 CORS 修復版設置完成！');
    return true;
  } catch (error) {
    console.error('❌ CORS 修復版設置失敗:', error.message);
    return false;
  }
}

async function startApp() {
  try {
    // 執行快速設置
    const setupSuccess = await quickSetup();
    
    if (!setupSuccess) {
      console.log('⚠️  設置過程中有錯誤，但嘗試啟動 CORS 修復版應用程式...');
    }
    
    // 啟動 CORS 修復版 Express 應用程式
    console.log('🌐 啟動 CORS 修復版 Express 應用程式...');
    require('./app-cors-fix.js');
    
  } catch (error) {
    console.error('💥 CORS 修復版啟動失敗:', error);
    process.exit(1);
  }
}

// 如果直接執行此腳本
if (require.main === module) {
  startApp();
}

module.exports = { startApp, quickSetup };
