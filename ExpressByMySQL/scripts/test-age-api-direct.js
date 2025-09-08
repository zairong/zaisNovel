const { User, Book, BookView, BookDownload } = require('../models');

async function testAgeDistributionDirect() {
  try {
    console.log('🧪 直接測試年齡分布查詢...');
    
    // 使用修復後的查詢邏輯
    const [ageDistribution] = await require('../models').sequelize.query(`
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
    `);
    
    console.log('\n👁️ 年齡分布結果：');
    ageDistribution.forEach(stat => {
      console.log(`   ${stat.age_range}: ${stat.count} 次觀看`);
    });
    
    console.log('\n✅ 查詢成功！年齡分布 API 應該能正常工作了');
    
  } catch (error) {
    console.error('💥 查詢失敗:', error.message);
    console.error('詳細錯誤:', error);
  } finally {
    process.exit(0);
  }
}

testAgeDistributionDirect();
