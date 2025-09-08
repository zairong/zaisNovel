const { sequelize } = require('./models');
const { initAdmin } = require('./init-admin');

async function setup() {
  try {
    console.log('🚀 開始設置系統...');
    
    // 同步資料庫（創建所有表格）
    console.log('📊 同步資料庫結構...');
    await sequelize.sync({ force: false }); // force: false 表示不刪除現有數據
    console.log('✅ 資料庫結構同步完成');
    
    // 初始化管理員帳戶
    console.log('👤 初始化管理員帳戶...');
    await initAdmin();
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
