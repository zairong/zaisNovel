const { Sequelize, DataTypes } = require('sequelize');
const config = require('../config/config.js');

// 創建資料庫連接
const sequelize = new Sequelize(config.database, config.username, config.password, {
  host: config.host,
  port: config.port,
  dialect: 'postgres',
  logging: false
});

// 引入模型
const Book = require('../models/book.js');
const BookView = require('../models/bookView.js');
const BookDownload = require('../models/bookDownload.js');

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

// 檢查現有數據問題
async function checkExistingData() {
  console.log('\n🔍 檢查現有數據問題...');
  
  try {
    // 檢查種子數據
    const seedViews = await BookView.count({
      where: {
        viewer_key: {
          [Sequelize.Op.like]: 'seed:%'
        }
      }
    });
    
    const seedDownloads = await BookDownload.count({
      where: {
        viewer_key: {
          [Sequelize.Op.like]: 'seed:%'
        }
      }
    });
    
    console.log(`📊 現有種子數據：觀看 ${seedViews} 筆，下載 ${seedDownloads} 筆`);
    
    // 檢查年份分布
    const yearStats = await BookView.findAll({
      attributes: [
        [Sequelize.fn('YEAR', Sequelize.col('created_at')), 'year'],
        [Sequelize.fn('COUNT', Sequelize.col('*')), 'count']
      ],
      where: {
        viewer_key: {
          [Sequelize.Op.like]: 'seed:%'
        }
      },
      group: [Sequelize.fn('YEAR', Sequelize.col('created_at'))],
      order: [[Sequelize.fn('YEAR', Sequelize.col('created_at')), 'ASC']],
      raw: true
    });
    
    console.log('📅 年份數據分布：');
    yearStats.forEach(stat => {
      console.log(`   ${stat.year}年: ${stat.count} 筆`);
    });
    
    return { seedViews, seedDownloads, yearStats };
  } catch (error) {
    console.error('❌ 檢查數據失敗:', error.message);
    return null;
  }
}

// 清除舊的種子數據
async function clearOldSeedData() {
  console.log('\n🗑️ 清除舊的種子數據...');
  
  try {
    // 清除觀看記錄
    const deletedViews = await BookView.destroy({
      where: {
        viewer_key: {
          [Sequelize.Op.like]: 'seed:%'
        }
      }
    });
    
    // 清除下載記錄
    const deletedDownloads = await BookDownload.destroy({
      where: {
        viewer_key: {
          [Sequelize.Op.like]: 'seed:%'
        }
      }
    });
    
    console.log(`✅ 已清除：觀看記錄 ${deletedViews} 筆，下載記錄 ${deletedDownloads} 筆`);
    
    return { deletedViews, deletedDownloads };
  } catch (error) {
    console.error('❌ 清除數據失敗:', error.message);
    return null;
  }
}

// 生成時間範圍
function generateTimeRanges() {
  const ranges = [];
  
  // 2020-2024年：完整年份
  for (let year = 2020; year <= 2024; year++) {
    const isLeapYear = (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
    const daysInYear = isLeapYear ? 366 : 365;
    
    ranges.push({
      year,
      start: new Date(year, 0, 1, 0, 0, 0),
      end: new Date(year, 11, 31, 23, 0, 0),
      days: daysInYear,
      hours: daysInYear * 24
    });
  }
  
  // 2025年：從年初到當前時間
  const now = new Date();
  const currentYear = now.getFullYear();
  if (currentYear >= 2025) {
    const startOfYear = new Date(2025, 0, 1, 0, 0, 0);
    const endOfYear = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), 0, 0);
    
    ranges.push({
      year: 2025,
      start: startOfYear,
      end: endOfYear,
      days: Math.ceil((endOfYear - startOfYear) / (1000 * 60 * 60 * 24)),
      hours: Math.ceil((endOfYear - startOfYear) / (1000 * 60 * 60))
    });
  }
  
  return ranges;
}

// 生成小時鍵
function generateHourKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hour = String(date.getHours()).padStart(2, '0');
  const minute = String(date.getMinutes()).padStart(2, '0');
  const second = String(date.getSeconds()).padStart(2, '0');
  
  return `${year}-${month}-${day}-${hour}-${minute}-${second}`;
}

// 生成真實的歷史數據
async function generateHistoricalData() {
  console.log('\n🚀 開始生成真實的歷史數據...');
  
  try {
    // 獲取所有書籍
    const books = await Book.findAll({
      attributes: ['id', 'title'],
      where: { is_active: true }
    });
    
    if (books.length === 0) {
      console.log('❌ 沒有找到活躍的書籍');
      return false;
    }
    
    console.log(`📚 找到 ${books.length} 本書籍`);
    
    // 生成時間範圍
    const timeRanges = generateTimeRanges();
    console.log('📅 時間範圍：');
    timeRanges.forEach(range => {
      console.log(`   ${range.year}年: ${range.start.toISOString()} 到 ${range.end.toISOString()} (${range.hours} 小時)`);
    });
    
    let totalRecords = 0;
    const batchSize = 1000;
    
    // 為每個時間範圍生成數據
    for (const range of timeRanges) {
      console.log(`\n📊 生成 ${range.year} 年數據...`);
      
      const startTime = range.start.getTime();
      const endTime = range.end.getTime();
      const hourInMs = 60 * 60 * 1000;
      
      let hourCount = 0;
      const viewRecords = [];
      const downloadRecords = [];
      
      // 每小時生成數據
      for (let time = startTime; time <= endTime; time += hourInMs) {
        const currentDate = new Date(time);
        
        // 跳過未來的時間
        if (currentDate > new Date()) {
          break;
        }
        
        // 為每本書生成記錄
        for (const book of books) {
          // 生成觀看記錄
          const viewRecord = {
            book_id: book.id,
            viewer_key: `seed:${generateHourKey(currentDate)}:${book.id}:view`,
            viewer_age_range: getRandomAgeRange(),
            ip_address: generateRandomIP(),
            user_agent: generateRandomUserAgent(),
            created_at: currentDate,
            updated_at: currentDate
          };
          
          // 生成下載記錄
          const downloadRecord = {
            book_id: book.id,
            viewer_key: `seed:${generateHourKey(currentDate)}:${book.id}:download`,
            viewer_age_range: getRandomAgeRange(),
            ip_address: generateRandomIP(),
            user_agent: generateRandomUserAgent(),
            created_at: currentDate,
            updated_at: currentDate
          };
          
          viewRecords.push(viewRecord);
          downloadRecords.push(downloadRecord);
          
          // 批次插入
          if (viewRecords.length >= batchSize) {
            await insertBatch(viewRecords, downloadRecords);
            totalRecords += viewRecords.length + downloadRecords.length;
            viewRecords.length = 0;
            downloadRecords.length = 0;
            console.log(`   ✅ 已插入 ${totalRecords} 筆記錄`);
          }
        }
        
        hourCount++;
        if (hourCount % 100 === 0) {
          console.log(`   📈 進度: ${hourCount}/${range.hours} 小時`);
        }
      }
      
      // 插入剩餘的記錄
      if (viewRecords.length > 0) {
        await insertBatch(viewRecords, downloadRecords);
        totalRecords += viewRecords.length + downloadRecords.length;
      }
      
      console.log(`✅ ${range.year} 年數據生成完成，共 ${hourCount} 小時`);
    }
    
    console.log(`\n🎉 所有歷史數據生成完成！總計 ${totalRecords} 筆記錄`);
    return true;
    
  } catch (error) {
    console.error('❌ 生成歷史數據失敗:', error.message);
    return false;
  }
}

// 批次插入數據
async function insertBatch(viewRecords, downloadRecords) {
  try {
    if (viewRecords.length > 0) {
      await BookView.bulkCreate(viewRecords, { ignoreDuplicates: true });
    }
    if (downloadRecords.length > 0) {
      await BookDownload.bulkCreate(downloadRecords, { ignoreDuplicates: true });
    }
  } catch (error) {
    console.error('❌ 批次插入失敗:', error.message);
    throw error;
  }
}

// 生成隨機年齡範圍
function getRandomAgeRange() {
  const ranges = ['13-17', '18-24', '25-34', '35-44', '45-54', '55+'];
  return ranges[Math.floor(Math.random() * ranges.length)];
}

// 生成隨機IP地址
function generateRandomIP() {
  return `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
}

// 生成隨機User Agent
function generateRandomUserAgent() {
  const agents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36',
    'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15'
  ];
  return agents[Math.floor(Math.random() * agents.length)];
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

// 驗證修復結果
async function validateRepair() {
  console.log('\n🔍 驗證修復結果...');
  
  try {
    // 檢查總記錄數
    const totalViews = await BookView.count({
      where: {
        viewer_key: {
          [Sequelize.Op.like]: 'seed:%'
        }
      }
    });
    
    const totalDownloads = await BookDownload.count({
      where: {
        viewer_key: {
          [Sequelize.Op.like]: 'seed:%'
        }
      }
    });
    
    console.log(`📊 總記錄數：觀看 ${totalViews} 筆，下載 ${totalDownloads} 筆`);
    
    // 檢查年份分布
    const yearStats = await BookView.findAll({
      attributes: [
        [Sequelize.fn('YEAR', Sequelize.col('created_at')), 'year'],
        [Sequelize.fn('COUNT', Sequelize.col('*')), 'count']
      ],
      where: {
        viewer_key: {
          [Sequelize.Op.like]: 'seed:%'
        }
      },
      group: [Sequelize.fn('YEAR', Sequelize.col('created_at'))],
      order: [[Sequelize.fn('YEAR', Sequelize.col('created_at')), 'ASC']],
      raw: true
    });
    
    console.log('📅 修復後年份分布：');
    yearStats.forEach(stat => {
      console.log(`   ${stat.year}年: ${stat.count} 筆`);
    });
    
    // 檢查數據完整性
    let isComplete = true;
    for (let year = 2020; year <= 2024; year++) {
      const yearData = yearStats.find(stat => stat.year === year);
      if (!yearData || yearData.count === 0) {
        console.log(`   ❌ ${year}年數據不完整`);
        isComplete = false;
      }
    }
    
    if (isComplete) {
      console.log('✅ 所有年份數據完整！');
    } else {
      console.log('❌ 部分年份數據仍不完整');
    }
    
    return { totalViews, totalDownloads, yearStats, isComplete };
  } catch (error) {
    console.error('❌ 驗證失敗:', error.message);
    return null;
  }
}

// 主函數
async function main() {
  console.log('🚀 開始修復歷史數據問題...\n');
  
  try {
    // 1. 檢查資料庫連接
    if (!(await checkConnection())) {
      return;
    }
    
    // 2. 檢查現有數據問題
    const existingData = await checkExistingData();
    if (!existingData) {
      return;
    }
    
    // 3. 清除舊的種子數據
    const clearedData = await clearOldSeedData();
    if (!clearedData) {
      return;
    }
    
    // 4. 生成新的歷史數據
    const dataGenerated = await generateHistoricalData();
    if (!dataGenerated) {
      return;
    }
    
    // 5. 更新書籍統計數據
    const statsUpdated = await updateBookStatistics();
    if (!statsUpdated) {
      return;
    }
    
    // 6. 驗證修復結果
    const validation = await validateRepair();
    if (!validation) {
      return;
    }
    
    console.log('\n🎉 歷史數據修復完成！');
    console.log('\n📋 修復摘要：');
    console.log(`   - 清除了 ${clearedData.deletedViews + clearedData.deletedDownloads} 筆舊數據`);
    console.log(`   - 生成了 ${validation.totalViews + validation.totalDownloads} 筆新數據`);
    console.log(`   - 涵蓋年份：2020-${new Date().getFullYear()}`);
    console.log(`   - 數據完整性：${validation.isComplete ? '✅ 完整' : '❌ 不完整'}`);
    
  } catch (error) {
    console.error('❌ 修復過程發生錯誤:', error.message);
  } finally {
    await sequelize.close();
    console.log('\n🔌 資料庫連接已關閉');
  }
}

// 執行主函數
if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  main,
  checkConnection,
  checkExistingData,
  clearOldSeedData,
  generateHistoricalData,
  updateBookStatistics,
  validateRepair
};
