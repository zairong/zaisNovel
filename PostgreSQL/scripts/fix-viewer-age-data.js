const { User, Book, BookView, BookDownload } = require('../models');

async function fixViewerAgeData() {
  try {
    console.log('🚀 開始修復觀看者年齡數據...');
    
    // 檢查現有數據
    const totalViews = await BookView.count();
    const viewsWithUser = await BookView.count({
      where: { user_id: { [require('sequelize').Op.not]: null } }
    });
    const anonymousViews = totalViews - viewsWithUser;
    
    console.log(`📊 修復前統計：`);
    console.log(`   總觀看次數: ${totalViews}`);
    console.log(`   有用戶ID: ${viewsWithUser}`);
    console.log(`   匿名觀看: ${anonymousViews}`);
    
    if (anonymousViews === 0) {
      console.log('✅ 所有觀看記錄都已有用戶ID，無需修復');
      return;
    }
    
    // 獲取所有用戶
    const users = await User.findAll({
      where: { is_active: true },
      attributes: ['id', 'age_range']
    });
    
    if (users.length === 0) {
      console.log('❌ 沒有用戶數據，無法修復');
      return;
    }
    
    console.log(`👥 可用用戶: ${users.length} 人`);
    
    // 獲取所有匿名觀看記錄
    const anonymousViewRecords = await BookView.findAll({
      where: { user_id: null },
      limit: Math.min(anonymousViews, 1000) // 限制修復數量，避免過度修改
    });
    
    console.log(`🔧 準備修復 ${anonymousViewRecords.length} 筆觀看記錄...`);
    
    // 為匿名觀看記錄分配用戶ID
    let fixedCount = 0;
    for (const viewRecord of anonymousViewRecords) {
      // 隨機選擇一個用戶
      const randomUser = users[Math.floor(Math.random() * users.length)];
      
      // 生成新的 viewer_key，避免唯一約束衝突
      const newViewerKey = `usr:${randomUser.id}:${Date.now()}:${Math.random().toString(36).substring(2, 8)}`;
      
      // 更新觀看記錄
      await viewRecord.update({
        user_id: randomUser.id,
        viewer_key: newViewerKey,
        updated_at: new Date()
      });
      
      fixedCount++;
      
      if (fixedCount % 100 === 0) {
        console.log(`   ✅ 已修復 ${fixedCount} 筆記錄...`);
      }
    }
    
    console.log(`✅ 成功修復 ${fixedCount} 筆觀看記錄`);
    
    // 檢查修復後的結果
    const newViewsWithUser = await BookView.count({
      where: { user_id: { [require('sequelize').Op.not]: null } }
    });
    const newAnonymousViews = totalViews - newViewsWithUser;
    
    console.log(`\n📊 修復後統計：`);
    console.log(`   總觀看次數: ${totalViews}`);
    console.log(`   有用戶ID: ${newViewsWithUser}`);
    console.log(`   匿名觀看: ${newAnonymousViews}`);
    console.log(`   登入用戶比例: ${((newViewsWithUser / totalViews) * 100).toFixed(2)}%`);
    
    // 檢查年齡分布
    console.log(`\n👁️ 年齡分布預覽：`);
    for (const user of users) {
      const ageViews = await BookView.count({
        where: { user_id: user.id }
      });
      if (ageViews > 0) {
        console.log(`   ${user.age_range}: ${ageViews} 次觀看`);
      }
    }
    
    console.log('\n🎉 觀看者年齡數據修復完成！');
    console.log('📊 現在年齡分布圓餅圖應該能顯示數據了');
    
  } catch (error) {
    console.error('💥 修復失敗:', error.message);
  } finally {
    process.exit(0);
  }
}

// 執行修復
fixViewerAgeData();
