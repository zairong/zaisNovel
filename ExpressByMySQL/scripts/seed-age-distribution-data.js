const { Sequelize } = require('sequelize');
const { User, Book, BookView, BookDownload } = require('../models');

// 直接配置資料庫連接（嘗試不同的密碼配置）
const sequelize = new Sequelize('books', 'root', '', {
  host: '127.0.0.1',
  port: 3306,
  dialect: 'mysql',
  logging: false
});

// 檢查資料庫連接
async function checkConnection() {
  try {
    await sequelize.authenticate();
    console.log('✅ 資料庫連接成功');
    return true;
  } catch (error) {
    console.error('❌ 資料庫連接失敗:', error.message);
    return false;
  }
}

// 生成用戶年齡分布數據
async function generateUserAgeData() {
  console.log('\n👥 生成用戶年齡分布數據...');
  
  try {
    // 檢查是否已有用戶數據
    const existingUsers = await User.count();
    if (existingUsers > 0) {
      console.log(`⚠️ 已存在 ${existingUsers} 個用戶，跳過用戶生成`);
      return;
    }

    // 年齡範圍定義（與資料庫 ENUM 一致）
    const ageRanges = ['10~20', '20~30', '30~40', '40~50', '50~60', '60以上'];
    
    // 為每個年齡範圍生成用戶
    const users = [];
    for (let i = 0; i < ageRanges.length; i++) {
      const ageRange = ageRanges[i];
      const userCount = Math.floor(Math.random() * 8) + 8; // 8-15 個用戶
      
      for (let j = 0; j < userCount; j++) {
        users.push({
          username: `user_${ageRange}_${j + 1}`,
          email: `user_${ageRange}_${j + 1}@example.com`,
          password: 'password123', // 會自動加密
          role: 'user',
          age_range: ageRange,
          is_active: true
        });
      }
      
      console.log(`   ${ageRange}: ${userCount} 個用戶`);
    }
    
    // 批量創建用戶
    const createdUsers = await User.bulkCreate(users);
    console.log(`✅ 成功創建 ${createdUsers.length} 個用戶`);
    
    return createdUsers;
  } catch (error) {
    console.error('❌ 生成用戶數據失敗:', error.message);
    return null;
  }
}

// 生成觀看記錄數據
async function generateViewData() {
  console.log('\n👁️ 生成觀看記錄數據...');
  
  try {
    // 獲取所有用戶和書籍
    const users = await User.findAll({ where: { is_active: true } });
    const books = await Book.findAll({ where: { is_active: true } });
    
    if (users.length === 0 || books.length === 0) {
      console.log('⚠️ 沒有用戶或書籍數據，跳過觀看記錄生成');
      return;
    }
    
    console.log(`   📚 書籍數量: ${books.length}`);
    console.log(`   👥 用戶數量: ${users.length}`);
    
    // 生成觀看記錄
    const viewRecords = [];
    const now = new Date();
    
    // 為每個用戶生成一些觀看記錄
    for (const user of users) {
      const viewCount = Math.floor(Math.random() * 5) + 1; // 1-5 次觀看
      
      for (let i = 0; i < viewCount; i++) {
        const randomBook = books[Math.floor(Math.random() * books.length)];
        const randomTime = new Date(now.getTime() - Math.random() * 30 * 24 * 60 * 60 * 1000); // 最近30天內
        
        viewRecords.push({
          book_id: randomBook.id,
          user_id: user.id,
          viewer_key: `usr:${user.id}`,
          ip_address: generateRandomIP(),
          user_agent: generateRandomUserAgent(),
          created_at: randomTime,
          updated_at: randomTime
        });
      }
    }
    
    // 生成一些未登入用戶的觀看記錄
    const anonymousViews = Math.floor(Math.random() * 20) + 10; // 10-30 次匿名觀看
    for (let i = 0; i < anonymousViews; i++) {
      const randomBook = books[Math.floor(Math.random() * books.length)];
      const randomTime = new Date(now.getTime() - Math.random() * 30 * 24 * 60 * 60 * 1000);
      
      viewRecords.push({
        book_id: randomBook.id,
        user_id: null,
        viewer_key: `ipua:${generateRandomHash()}`,
        ip_address: generateRandomIP(),
        user_agent: generateRandomUserAgent(),
        created_at: randomTime,
        updated_at: randomTime
      });
    }
    
    // 批量插入觀看記錄
    const createdViews = await BookView.bulkCreate(viewRecords);
    console.log(`✅ 成功創建 ${createdViews.length} 筆觀看記錄`);
    
    return createdViews;
  } catch (error) {
    console.error('❌ 生成觀看記錄失敗:', error.message);
    return null;
  }
}

// 生成下載記錄數據
async function generateDownloadData() {
  console.log('\n⬇️ 生成下載記錄數據...');
  
  try {
    // 獲取所有用戶和書籍
    const users = await User.findAll({ where: { is_active: true } });
    const books = await Book.findAll({ where: { is_active: true } });
    
    if (users.length === 0 || books.length === 0) {
      console.log('⚠️ 沒有用戶或書籍數據，跳過下載記錄生成');
      return;
    }
    
    // 生成下載記錄
    const downloadRecords = [];
    const now = new Date();
    
    // 為每個用戶生成一些下載記錄
    for (const user of users) {
      const downloadCount = Math.floor(Math.random() * 3) + 1; // 1-3 次下載
      
      for (let i = 0; i < downloadCount; i++) {
        const randomBook = books[Math.floor(Math.random() * books.length)];
        const randomTime = new Date(now.getTime() - Math.random() * 30 * 24 * 60 * 60 * 1000);
        
        downloadRecords.push({
          book_id: randomBook.id,
          user_id: user.id,
          viewer_key: `usr:${user.id}`,
          ip_address: generateRandomIP(),
          user_agent: generateRandomUserAgent(),
          created_at: randomTime,
          updated_at: randomTime
        });
      }
    }
    
    // 生成一些未登入用戶的下載記錄
    const anonymousDownloads = Math.floor(Math.random() * 10) + 5; // 5-15 次匿名下載
    for (let i = 0; i < anonymousDownloads; i++) {
      const randomBook = books[Math.floor(Math.random() * books.length)];
      const randomTime = new Date(now.getTime() - Math.random() * 30 * 24 * 60 * 60 * 1000);
      
      downloadRecords.push({
        book_id: randomBook.id,
        user_id: null,
        viewer_key: `ipua:${generateRandomHash()}`,
        ip_address: generateRandomIP(),
        user_agent: generateRandomUserAgent(),
        created_at: randomTime,
        updated_at: randomTime
      });
    }
    
    // 批量插入下載記錄
    const createdDownloads = await BookDownload.bulkCreate(downloadRecords);
    console.log(`✅ 成功創建 ${createdDownloads.length} 筆下載記錄`);
    
    return createdDownloads;
  } catch (error) {
    console.error('❌ 生成下載記錄失敗:', error.message);
    return null;
  }
}

// 更新書籍統計數據
async function updateBookStatistics() {
  console.log('\n📊 更新書籍統計數據...');
  
  try {
    const books = await Book.findAll({
      attributes: ['id', 'title'],
      where: { is_active: true }
    });
    
    for (const book of books) {
      // 計算觀看次數
      const viewCount = await BookView.count({
        where: { book_id: book.id }
      });
      
      // 計算下載次數
      const downloadCount = await BookDownload.count({
        where: { book_id: book.id }
      });
      
      // 更新書籍記錄
      await book.update({
        view_count: viewCount,
        download_count: downloadCount
      });
      
      console.log(`   📚 ${book.title}: 觀看 ${viewCount} 次，下載 ${downloadCount} 次`);
    }
    
    console.log('✅ 書籍統計數據更新完成');
    return true;
  } catch (error) {
    console.error('❌ 更新統計數據失敗:', error.message);
    return false;
  }
}

// 驗證年齡分布數據
async function validateAgeDistribution() {
  console.log('\n🔍 驗證年齡分布數據...');
  
  try {
    // 檢查用戶年齡分布
    const userAgeStats = await User.findAll({
      attributes: [
        'age_range',
        [Sequelize.fn('COUNT', Sequelize.col('*')), 'count']
      ],
      where: { is_active: true },
      group: ['age_range'],
      order: [['age_range', 'ASC']],
      raw: true
    });
    
    console.log('👥 用戶年齡分布：');
    userAgeStats.forEach(stat => {
      console.log(`   ${stat.age_range}: ${stat.count} 人`);
    });
    
    // 檢查觀看者年齡分布
    const [viewerAgeStats] = await sequelize.query(`
      SELECT 
        CASE 
          WHEN bv.user_id IS NOT NULL THEN 
            COALESCE(u.age_range, '未知')
          ELSE '未知'
        END as age_range,
        COUNT(*) as count
      FROM book_views bv
      LEFT JOIN users u ON bv.user_id = u.id
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
    
    console.log('👁️ 觀看者年齡分布：');
    viewerAgeStats.forEach(stat => {
      console.log(`   ${stat.age_range}: ${stat.count} 次觀看`);
    });
    
    return { userAgeStats, viewerAgeStats };
  } catch (error) {
    console.error('❌ 驗證年齡分布失敗:', error.message);
    return null;
  }
}

// 輔助函數
function generateRandomIP() {
  return `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
}

function generateRandomUserAgent() {
  const agents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36',
    'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15'
  ];
  return agents[Math.floor(Math.random() * agents.length)];
}

function generateRandomHash() {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

// 主函數
async function main() {
  console.log('🚀 開始生成年齡分布數據...');
  
  try {
    // 檢查資料庫連接
    if (!(await checkConnection())) {
      return;
    }
    
    // 生成用戶年齡數據
    await generateUserAgeData();
    
    // 生成觀看記錄數據
    await generateViewData();
    
    // 生成下載記錄數據
    await generateDownloadData();
    
    // 更新書籍統計數據
    await updateBookStatistics();
    
    // 驗證年齡分布數據
    await validateAgeDistribution();
    
    console.log('\n🎉 年齡分布數據生成完成！');
    console.log('📊 現在您可以查看觀看者年齡分布圓餅圖了');
    
  } catch (error) {
    console.error('💥 生成數據失敗:', error.message);
  } finally {
    await sequelize.close();
    process.exit(0);
  }
}

// 如果直接執行此腳本
if (require.main === module) {
  main();
}

module.exports = { main };
