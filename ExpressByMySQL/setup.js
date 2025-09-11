const { sequelize } = require('./models');
const { initAdmin } = require('./init-admin');

// 重試函數
async function retryOperation(operation, maxRetries = 3, delay = 5000) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🔄 嘗試第 ${attempt} 次執行操作...`);
      return await operation();
    } catch (error) {
      console.error(`❌ 第 ${attempt} 次嘗試失敗:`, error.message);
      
      if (attempt === maxRetries) {
        throw error;
      }
      
      console.log(`⏳ 等待 ${delay/1000} 秒後重試...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

// 測試資料庫連線
async function testConnection() {
  try {
    console.log('🔍 測試資料庫連線...');
    
    // 設定連線超時
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('連線測試超時')), 30000); // 30 秒超時
    });
    
    const authPromise = sequelize.authenticate();
    
    await Promise.race([authPromise, timeoutPromise]);
    console.log('✅ 資料庫連線測試成功');
    return true;
  } catch (error) {
    console.error('❌ 資料庫連線測試失敗:', error.message);
    return false;
  }
}

async function setup() {
  try {
    console.log('🚀 開始設置系統...');
    
    // 測試資料庫連線
    const isConnected = await retryOperation(testConnection, 2, 5000);
    if (!isConnected) {
      throw new Error('無法連接到資料庫，請檢查資料庫設定');
    }
    
    // 同步資料庫（創建所有表格）
    console.log('📊 同步資料庫結構...');
    await retryOperation(async () => {
      await sequelize.sync({ force: false }); // force: false 表示不刪除現有數據
    }, 2, 3000);
    console.log('✅ 資料庫結構同步完成');
    
    // 初始化管理員帳戶
    console.log('👤 初始化管理員帳戶...');
    await retryOperation(initAdmin, 2, 2000);
    console.log('✅ 管理員帳戶初始化完成');
    
    console.log('');
    console.log('🎉 系統設置完成！');
    console.log('');
    console.log('📋 系統資訊：');
    console.log('   - 後端 API: http://localhost:3000');
    console.log('   - 前端應用: http://localhost:5173');
    console.log('');
    console.log('🔑 管理員帳戶：');
    console.log('   用戶名: admin');
    console.log('   密碼: admin');
    console.log('');
    console.log('⚠️  請在首次登入後立即更改密碼！');
    console.log('');
    console.log('📚 功能說明：');
    console.log('   - 管理員可以管理所有用戶和書籍');
    console.log('   - 一般用戶可以註冊並管理自己的書庫');
    console.log('   - 用戶可以將喜歡的書籍添加到個人書庫');
    console.log('   - 支援閱讀進度追蹤、評分和珍藏功能');
    
  } catch (error) {
    console.error('❌ 設置失敗:', error);
    console.error('🔍 錯誤詳情:', error.message);
    if (error.parent) {
      console.error('🔗 原始錯誤:', error.parent.message);
    }
    process.exit(1);
  }
}

// 如果直接執行此腳本
if (require.main === module) {
  setup().then(() => {
    console.log('🎯 設置腳本執行完成！');
    process.exit(0);
  }).catch(error => {
    console.error('💥 設置腳本執行失敗:', error);
    process.exit(1);
  });
}

module.exports = { setup };
