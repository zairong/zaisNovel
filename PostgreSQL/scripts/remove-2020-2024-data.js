const { Sequelize } = require('sequelize');
const { sequelize } = require('../models');

// 引入模型
const { Book, BookView, BookDownload } = require('../models');

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

// 檢查 2020-2024 年的數據統計
async function checkDataStats() {
  console.log('\n🔍 檢查 2020-2024 年數據統計...');
  
  try {
    // 檢查觀看記錄
    const viewStats = await BookView.findAll({
      attributes: [
        [Sequelize.fn('YEAR', Sequelize.col('created_at')), 'year'],
        [Sequelize.fn('COUNT', Sequelize.col('*')), 'count']
      ],
      where: {
        created_at: {
          [Sequelize.Op.between]: [
            new Date('2020-01-01 00:00:00'),
            new Date('2024-12-31 23:59:59')
          ]
        }
      },
      group: [Sequelize.fn('YEAR', Sequelize.col('created_at'))],
      order: [[Sequelize.fn('YEAR', Sequelize.col('created_at')), 'ASC']],
      raw: true
    });
    
    // 檢查下載記錄
    const downloadStats = await BookDownload.findAll({
      attributes: [
        [Sequelize.fn('YEAR', Sequelize.col('created_at')), 'year'],
        [Sequelize.fn('COUNT', Sequelize.col('*')), 'count']
      ],
      where: {
        created_at: {
          [Sequelize.Op.between]: [
            new Date('2020-01-01 00:00:00'),
            new Date('2024-12-31 23:59:59')
          ]
        }
      },
      group: [Sequelize.fn('YEAR', Sequelize.col('created_at'))],
      order: [[Sequelize.fn('YEAR', Sequelize.col('created_at')), 'ASC']],
      raw: true
    });
    
    console.log('📊 2020-2024 年觀看記錄統計：');
    viewStats.forEach(stat => {
      console.log(`   ${stat.year}年: ${stat.count} 筆`);
    });
    
    console.log('📊 2020-2024 年下載記錄統計：');
    downloadStats.forEach(stat => {
      console.log(`   ${stat.year}年: ${stat.count} 筆`);
    });
    
    return { viewStats, downloadStats };
  } catch (error) {
    console.error('❌ 檢查數據統計失敗:', error.message);
    return null;
  }
}

// 移除 2020-2024 年的所有數據
async function remove2020To2024Data() {
  console.log('\n🗑️ 開始移除 2020-2024 年的所有歷史數據...');
  
  try {
    // 移除觀看記錄
    const deletedViews = await BookView.destroy({
      where: {
        created_at: {
          [Sequelize.Op.between]: [
            new Date('2020-01-01 00:00:00'),
            new Date('2024-12-31 23:59:59')
          ]
        }
      }
    });
    
    console.log(`✅ 已移除觀看記錄: ${deletedViews} 筆`);
    
    // 移除下載記錄
    const deletedDownloads = await BookDownload.destroy({
      where: {
        created_at: {
          [Sequelize.Op.between]: [
            new Date('2020-01-01 00:00:00'),
            new Date('2024-12-31 23:59:59')
          ]
        }
      }
    });
    
    console.log(`✅ 已移除下載記錄: ${deletedDownloads} 筆`);
    
    return { deletedViews, deletedDownloads };
  } catch (error) {
    console.error('❌ 移除數據失敗:', error.message);
    return null;
  }
}

// 更新書籍的觀看和下載計數
async function updateBookCounts() {
  console.log('\n🔄 更新書籍的觀看和下載計數...');
  
  try {
    // 獲取所有書籍
    const books = await Book.findAll({
      attributes: ['id', 'title']
    });
    
    let updatedCount = 0;
    
    for (const book of books) {
      // 計算實際的觀看次數
      const viewCount = await BookView.count({
        where: { book_id: book.id }
      });
      
      // 計算實際的下載次數
      const downloadCount = await BookDownload.count({
        where: { book_id: book.id }
      });
      
      // 更新書籍記錄
      await book.update({
        view_count: viewCount,
        download_count: downloadCount
      });
      
      updatedCount++;
    }
    
    console.log(`✅ 已更新 ${updatedCount} 本書籍的計數`);
    return updatedCount;
  } catch (error) {
    console.error('❌ 更新書籍計數失敗:', error.message);
    return 0;
  }
}

// 驗證移除結果
async function verifyRemoval() {
  console.log('\n🔍 驗證移除結果...');
  
  try {
    // 檢查是否還有 2020-2024 年的數據
    const remainingViews = await BookView.count({
      where: {
        created_at: {
          [Sequelize.Op.between]: [
            new Date('2020-01-01 00:00:00'),
            new Date('2024-12-31 23:59:59')
          ]
        }
      }
    });
    
    const remainingDownloads = await BookDownload.count({
      where: {
        created_at: {
          [Sequelize.Op.between]: [
            new Date('2020-01-01 00:00:00'),
            new Date('2024-12-31 23:59:59')
          ]
        }
      }
    });
    
    if (remainingViews === 0 && remainingDownloads === 0) {
      console.log('✅ 驗證成功：2020-2024 年的所有數據已完全移除');
    } else {
      console.log(`⚠️ 仍有殘留數據：觀看記錄 ${remainingViews} 筆，下載記錄 ${remainingDownloads} 筆`);
    }
    
    return { remainingViews, remainingDownloads };
  } catch (error) {
    console.error('❌ 驗證失敗:', error.message);
    return null;
  }
}

// 主函數
async function main() {
  console.log('🚀 開始移除 2020-2024 年歷史數據...');
  console.log('⚠️  警告：此操作將永久刪除 2020-2024 年的所有觀看和下載記錄！');
  
  // 檢查資料庫連接
  if (!(await checkConnection())) {
    process.exit(1);
  }
  
  try {
    // 檢查現有數據統計
    await checkDataStats();
    
    // 確認操作
    console.log('\n❓ 確認要移除 2020-2024 年的所有數據嗎？(y/N)');
    process.stdin.setEncoding('utf8');
    process.stdin.once('data', async (data) => {
      const answer = data.trim().toLowerCase();
      
      if (answer === 'y' || answer === 'yes') {
        console.log('✅ 確認移除，開始執行...');
        
        // 移除數據
        const result = await remove2020To2024Data();
        
        if (result) {
          // 更新書籍計數
          await updateBookCounts();
          
          // 驗證結果
          await verifyRemoval();
          
          console.log('\n🎉 2020-2024 年歷史數據移除完成！');
        } else {
          console.log('\n❌ 數據移除失敗');
        }
      } else {
        console.log('❌ 操作已取消');
      }
      
      process.exit(0);
    });
    
  } catch (error) {
    console.error('💥 執行過程中發生錯誤:', error.message);
    process.exit(1);
  }
}

// 如果直接執行此腳本
if (require.main === module) {
  main();
}

module.exports = { 
  remove2020To2024Data, 
  checkDataStats, 
  updateBookCounts, 
  verifyRemoval 
};
