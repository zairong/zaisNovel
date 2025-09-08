const { User } = require('./models');
const bcrypt = require('bcryptjs');

async function initAdmin() {
  try {
    console.log('🔧 開始初始化管理員帳戶...');

    // 檢查是否已存在管理員帳戶
    const existingAdmin = await User.findOne({
      where: { username: 'admin' }
    });

    if (existingAdmin) {
      console.log('✅ 管理員帳戶已存在');
      return;
    }

    // 創建管理員帳戶
    const adminUser = await User.create({
      username: 'admin',
      email: 'admin@example.com',
      password: 'admin', // 會自動加密
      role: 'admin',
      is_active: true
    });

    console.log('✅ 管理員帳戶創建成功！');
    console.log('📋 管理員資訊：');
    console.log(`   用戶名: ${adminUser.username}`);
    console.log(`   電子郵件: ${adminUser.email}`);
    console.log(`   角色: ${adminUser.role}`);
    console.log(`   狀態: ${adminUser.is_active ? '啟用' : '停用'}`);
    console.log('');
    console.log('🔑 登入資訊：');
    console.log('   用戶名: admin');
    console.log('   密碼: admin');
    console.log('');
    console.log('⚠️  請在首次登入後立即更改密碼！');

  } catch (error) {
    console.error('❌ 初始化管理員帳戶失敗:', error);
    process.exit(1);
  }
}

// 如果直接執行此腳本
if (require.main === module) {
  initAdmin().then(() => {
    console.log('🎉 初始化完成！');
    process.exit(0);
  }).catch(error => {
    console.error('💥 初始化失敗:', error);
    process.exit(1);
  });
}

module.exports = { initAdmin };
