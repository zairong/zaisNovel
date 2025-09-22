const { User, Book, BookView, BookDownload } = require('../models');

async function fixAgeDistribution() {
  try {
    console.log('🚀 開始修復年齡分布數據...');
    
    // 檢查現有用戶
    const existingUsers = await User.count();
    console.log(`📊 現有用戶數量: ${existingUsers}`);
    
    if (existingUsers === 0) {
      console.log('❌ 沒有用戶數據，無法生成年齡分布');
      return;
    }
    
    // 檢查用戶的年齡範圍
    const usersWithAge = await User.count({
      where: { age_range: { [require('sequelize').Op.not]: null } }
    });
    console.log(`📊 有年齡範圍的用戶數量: ${usersWithAge}`);
    
    // 檢查觀看記錄
    const totalViews = await BookView.count();
    console.log(`📊 觀看記錄總數: ${totalViews}`);
    
    // 檢查有用戶ID的觀看記錄
    const viewsWithUser = await BookView.count({
      where: { user_id: { [require('sequelize').Op.not]: null } }
    });
    console.log(`📊 有用戶ID的觀看記錄: ${viewsWithUser}`);
    
    // 檢查下載記錄
    const totalDownloads = await BookDownload.count();
    console.log(`📊 下載記錄總數: ${totalDownloads}`);
    
    // 檢查有用戶ID的下載記錄
    const downloadsWithUser = await BookDownload.count({
      where: { user_id: { [require('sequelize').Op.not]: null } }
    });
    console.log(`📊 有用戶ID的下載記錄: ${downloadsWithUser}`);
    
    // 如果沒有觀看記錄，生成一些測試數據
    if (totalViews === 0) {
      console.log('\n👁️ 生成測試觀看記錄...');
      
      const users = await User.findAll({ where: { is_active: true } });
      const books = await Book.findAll();
      
      if (users.length > 0 && books.length > 0) {
        const viewRecords = [];
        
        // 為每個用戶生成觀看記錄
        for (const user of users) {
          const viewCount = Math.floor(Math.random() * 3) + 1; // 1-3 次觀看
          
          for (let i = 0; i < viewCount; i++) {
            const randomBook = books[Math.floor(Math.random() * books.length)];
            viewRecords.push({
              book_id: randomBook.id,
              user_id: user.id,
              viewer_key: `usr:${user.id}`,
              ip_address: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
              user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
              created_at: new Date(),
              updated_at: new Date()
            });
          }
        }
        
        // 生成一些匿名觀看記錄
        const anonymousViews = Math.floor(Math.random() * 10) + 5;
        for (let i = 0; i < anonymousViews; i++) {
          const randomBook = books[Math.floor(Math.random() * books.length)];
          viewRecords.push({
            book_id: randomBook.id,
            user_id: null,
            viewer_key: `ipua:${Math.random().toString(36).substring(2, 15)}`,
            ip_address: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
            user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            created_at: new Date(),
            updated_at: new Date()
          });
        }
        
        await BookView.bulkCreate(viewRecords);
        console.log(`✅ 成功創建 ${viewRecords.length} 筆觀看記錄`);
      }
    }
    
    // 如果沒有下載記錄，生成一些測試數據
    if (totalDownloads === 0) {
      console.log('\n⬇️ 生成測試下載記錄...');
      
      const users = await User.findAll({ where: { is_active: true } });
      const books = await Book.findAll();
      
      if (users.length > 0 && books.length > 0) {
        const downloadRecords = [];
        
        // 為每個用戶生成下載記錄
        for (const user of users) {
          const downloadCount = Math.floor(Math.random() * 2) + 1; // 1-2 次下載
          
          for (let i = 0; i < downloadCount; i++) {
            const randomBook = books[Math.floor(Math.random() * books.length)];
            downloadRecords.push({
              book_id: randomBook.id,
              user_id: user.id,
              viewer_key: `usr:${user.id}`,
              ip_address: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
              user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
              created_at: new Date(),
              updated_at: new Date()
            });
          }
        }
        
        // 生成一些匿名下載記錄
        const anonymousDownloads = Math.floor(Math.random() * 5) + 3;
        for (let i = 0; i < anonymousDownloads; i++) {
          const randomBook = books[Math.floor(Math.random() * books.length)];
          downloadRecords.push({
            book_id: randomBook.id,
            user_id: null,
            viewer_key: `ipua:${Math.random().toString(36).substring(2, 15)}`,
            ip_address: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
            user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            created_at: new Date(),
            updated_at: new Date()
          });
        }
        
        await BookDownload.bulkCreate(downloadRecords);
        console.log(`✅ 成功創建 ${downloadRecords.length} 筆下載記錄`);
      }
    }
    
    // 更新書籍統計數據
    console.log('\n📊 更新書籍統計數據...');
    const books = await Book.findAll({
      attributes: ['id', 'title']
    });
    
    for (const book of books) {
      const viewCount = await BookView.count({
        where: { book_id: book.id }
      });
      
      const downloadCount = await BookDownload.count({
        where: { book_id: book.id }
      });
      
      await book.update({
        view_count: viewCount,
        download_count: downloadCount
      });
      
      console.log(`   📚 ${book.title}: 觀看 ${viewCount} 次，下載 ${downloadCount} 次`);
    }
    
    console.log('\n🎉 年齡分布數據修復完成！');
    console.log('📊 現在您可以查看觀看者年齡分布圓餅圖了');
    
  } catch (error) {
    console.error('💥 修復失敗:', error.message);
  } finally {
    process.exit(0);
  }
}

// 執行修復
fixAgeDistribution();
