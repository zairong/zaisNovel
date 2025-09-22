const { User, Book, BookView, BookDownload } = require('../models');

async function testAgeFormat() {
  try {
    console.log('🧪 測試年齡範圍格式化...');
    
    // 測試格式化函數
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
    
    console.log('\n📝 年齡範圍格式化測試：');
    const testRanges = ['10~20', '20~30', '30~40', '40~50', '50~60', '60以上', '未知'];
    testRanges.forEach(range => {
      console.log(`   ${range} → ${formatAgeRange(range)}`);
    });
    
    // 測試實際的年齡分布查詢
    console.log('\n🔍 測試實際年齡分布查詢...');
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
    
    console.log('\n👁️ 原始年齡分布數據：');
    ageDistribution.forEach(stat => {
      console.log(`   ${stat.age_range}: ${stat.count} 次觀看`);
    });
    
    console.log('\n🎨 格式化後的年齡分布數據：');
    ageDistribution.forEach(stat => {
      const formattedRange = formatAgeRange(stat.age_range);
      console.log(`   ${formattedRange}: ${stat.count} 次觀看`);
    });
    
    console.log('\n✅ 年齡範圍格式化測試完成！');
    
  } catch (error) {
    console.error('💥 測試失敗:', error.message);
  } finally {
    process.exit(0);
  }
}

testAgeFormat();
