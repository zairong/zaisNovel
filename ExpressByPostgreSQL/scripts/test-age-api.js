const { User, Book, BookView, BookDownload } = require('../models');

async function testAgeDistribution() {
  try {
    console.log('🧪 測試年齡分布 API...');
    
    // 檢查用戶年齡分布
    const userAgeStats = await User.findAll({
      attributes: [
        'age_range',
        [require('sequelize').fn('COUNT', require('sequelize').col('*')), 'count']
      ],
      where: { is_active: true },
      group: ['age_range'],
      order: [['age_range', 'ASC']],
      raw: true
    });
    
    console.log('\n👥 用戶年齡分布：');
    userAgeStats.forEach(stat => {
      console.log(`   ${stat.age_range}: ${stat.count} 人`);
    });
    
    // 檢查觀看記錄的用戶ID分布
    const totalViews = await BookView.count();
    const viewsWithUser = await BookView.count({
      where: { user_id: { [require('sequelize').Op.not]: null } }
    });
    const anonymousViews = totalViews - viewsWithUser;
    
    console.log('\n📊 觀看記錄統計：');
    console.log(`   總觀看次數: ${totalViews}`);
    console.log(`   登入用戶觀看: ${viewsWithUser}`);
    console.log(`   匿名用戶觀看: ${anonymousViews}`);
    console.log(`   登入用戶比例: ${((viewsWithUser / totalViews) * 100).toFixed(2)}%`);
    
    // 檢查每個年齡範圍的觀看次數
    console.log('\n👁️ 各年齡範圍的觀看次數：');
    for (const ageStat of userAgeStats) {
      const ageViews = await BookView.count({
        where: { user_id: { [require('sequelize').Op.not]: null } },
        include: [{
          model: User,
          as: 'user',
          where: { age_range: ageStat.age_range }
        }]
      });
      console.log(`   ${ageStat.age_range}: ${ageViews} 次觀看`);
    }
    
    console.log('\n🎯 分析結果：');
    if (viewsWithUser > 0) {
      console.log('   ✅ 有登入用戶的觀看記錄，年齡分布圓餅圖應該能顯示數據');
    } else {
      console.log('   ❌ 沒有登入用戶的觀看記錄，年齡分布圓餅圖只會顯示"未知"');
    }
    
    if (anonymousViews > 0) {
      console.log('   ℹ️  有匿名用戶的觀看記錄，這些會顯示為"未知"年齡');
    }
    
    console.log('\n💡 建議：');
    if (viewsWithUser === 0) {
      console.log('   1. 需要生成一些有用戶ID的觀看記錄');
      console.log('   2. 或者修改年齡分布統計邏輯，包含匿名用戶');
    }
    
  } catch (error) {
    console.error('💥 測試失敗:', error.message);
  } finally {
    process.exit(0);
  }
}

testAgeDistribution();
