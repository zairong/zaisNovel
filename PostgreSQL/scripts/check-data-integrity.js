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

// 檢查基本數據統計
async function checkBasicStats() {
  console.log('\n📊 基本數據統計...');
  
  try {
    // 檢查書籍數量
    const bookCount = await Book.count({
      where: { is_active: true }
    });
    console.log(`📚 活躍書籍數量: ${bookCount}`);
    
    // 檢查觀看記錄總數
    const totalViews = await BookView.count();
    console.log(`👁️ 觀看記錄總數: ${totalViews}`);
    
    // 檢查下載記錄總數
    const totalDownloads = await BookDownload.count();
    console.log(`⬇️ 下載記錄總數: ${totalDownloads}`);
    
    // 檢查種子數據
    const seedViews = await BookView.count({
      where: {
        viewer_key: {
          [Sequelize.Op.like]: 'seed:%'
        }
      }
    });
    console.log(`🌱 種子觀看記錄: ${seedViews}`);
    
    const seedDownloads = await BookDownload.count({
      where: {
        viewer_key: {
          [Sequelize.Op.like]: 'seed:%'
        }
      }
    });
    console.log(`🌱 種子下載記錄: ${seedDownloads}`);
    
    return { bookCount, totalViews, totalDownloads, seedViews, seedDownloads };
  } catch (error) {
    console.error('❌ 檢查基本統計失敗:', error.message);
    return null;
  }
}

// 檢查年份數據分布
async function checkYearDistribution() {
  console.log('\n📅 檢查年份數據分布...');
  
  try {
    // 檢查觀看記錄的年份分布
    const viewYearStats = await BookView.findAll({
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
    
    console.log('👁️ 觀看記錄年份分布:');
    viewYearStats.forEach(stat => {
      console.log(`   ${stat.year}年: ${stat.count} 筆`);
    });
    
    // 檢查下載記錄的年份分布
    const downloadYearStats = await BookDownload.findAll({
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
    
    console.log('⬇️ 下載記錄年份分布:');
    downloadYearStats.forEach(stat => {
      console.log(`   ${stat.year}年: ${stat.count} 筆`);
    });
    
    return { viewYearStats, downloadYearStats };
  } catch (error) {
    console.error('❌ 檢查年份分布失敗:', error.message);
    return null;
  }
}

// 檢查月份數據分布
async function checkMonthDistribution() {
  console.log('\n📆 檢查月份數據分布...');
  
  try {
    // 檢查2024年的月份分布
    const monthStats = await BookView.findAll({
      attributes: [
        [Sequelize.fn('MONTH', Sequelize.col('created_at')), 'month'],
        [Sequelize.fn('COUNT', Sequelize.col('*')), 'count']
      ],
      where: {
        viewer_key: {
          [Sequelize.Op.like]: 'seed:%'
        },
        created_at: {
          [Sequelize.Op.between]: [
            new Date(2024, 0, 1, 0, 0, 0),
            new Date(2024, 11, 31, 23, 59, 59)
          ]
        }
      },
      group: [Sequelize.fn('MONTH', Sequelize.col('created_at'))],
      order: [[Sequelize.fn('MONTH', Sequelize.col('created_at')), 'ASC']],
      raw: true
    });
    
    console.log('📊 2024年月份分布:');
    monthStats.forEach(stat => {
      const monthName = new Date(2024, stat.month - 1).toLocaleDateString('zh-TW', { month: 'long' });
      console.log(`   ${monthName}: ${stat.count} 筆`);
    });
    
    return monthStats;
  } catch (error) {
    console.error('❌ 檢查月份分布失敗:', error.message);
    return null;
  }
}

// 檢查數據重複問題
async function checkDataDuplication() {
  console.log('\n🔍 檢查數據重複問題...');
  
  try {
    // 檢查觀看記錄的重複
    const duplicateViews = await BookView.findAll({
      attributes: [
        'book_id',
        [Sequelize.fn('DATE', Sequelize.col('created_at')), 'date'],
        [Sequelize.fn('HOUR', Sequelize.col('created_at')), 'hour'],
        [Sequelize.fn('COUNT', Sequelize.col('*')), 'count']
      ],
      where: {
        viewer_key: {
          [Sequelize.Op.like]: 'seed:%'
        }
      },
      group: ['book_id', Sequelize.fn('DATE', Sequelize.col('created_at')), Sequelize.fn('HOUR', Sequelize.col('created_at'))],
      having: Sequelize.literal('count > 1'),
      order: [[Sequelize.fn('COUNT', Sequelize.col('*')), 'DESC']],
      limit: 10,
      raw: true
    });
    
    if (duplicateViews.length > 0) {
      console.log('⚠️ 發現重複的觀看記錄:');
      duplicateViews.forEach(dup => {
        console.log(`   📚 書籍ID ${dup.book_id}, 日期 ${dup.date}, 小時 ${dup.hour}: ${dup.count} 筆`);
      });
    } else {
      console.log('✅ 沒有發現重複的觀看記錄');
    }
    
    // 檢查下載記錄的重複
    const duplicateDownloads = await BookDownload.findAll({
      attributes: [
        'book_id',
        [Sequelize.fn('DATE', Sequelize.col('created_at')), 'date'],
        [Sequelize.fn('HOUR', Sequelize.col('created_at')), 'hour'],
        [Sequelize.fn('COUNT', Sequelize.col('*')), 'count']
      ],
      where: {
        viewer_key: {
          [Sequelize.Op.like]: 'seed:%'
        }
      },
      group: ['book_id', Sequelize.fn('DATE', Sequelize.col('created_at')), Sequelize.fn('HOUR', Sequelize.col('created_at'))],
      having: Sequelize.literal('count > 1'),
      order: [[Sequelize.fn('COUNT', Sequelize.col('*')), 'DESC']],
      limit: 10,
      raw: true
    });
    
    if (duplicateDownloads.length > 0) {
      console.log('⚠️ 發現重複的下載記錄:');
      duplicateDownloads.forEach(dup => {
        console.log(`   📚 書籍ID ${dup.book_id}, 日期 ${dup.date}, 小時 ${dup.hour}: ${dup.count} 筆`);
      });
    } else {
      console.log('✅ 沒有發現重複的下載記錄');
    }
    
    return { duplicateViews, duplicateDownloads };
  } catch (error) {
    console.error('❌ 檢查數據重複失敗:', error.message);
    return null;
  }
}

// 檢查數據完整性
async function checkDataCompleteness() {
  console.log('\n✅ 檢查數據完整性...');
  
  try {
    const issues = [];
    
    // 檢查2020-2024年的完整性
    for (let year = 2020; year <= 2024; year++) {
      const isLeapYear = (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
      const expectedDays = isLeapYear ? 366 : 365;
      const expectedHours = expectedDays * 24;
      
      // 檢查觀看記錄
      const viewCount = await BookView.count({
        where: {
          viewer_key: {
            [Sequelize.Op.like]: 'seed:%'
          },
          created_at: {
            [Sequelize.Op.between]: [
              new Date(year, 0, 1, 0, 0, 0),
              new Date(year, 11, 31, 23, 59, 59)
            ]
          }
        }
      });
      
      // 檢查下載記錄
      const downloadCount = await BookDownload.count({
        where: {
          viewer_key: {
            [Sequelize.Op.like]: 'seed:%'
          },
          created_at: {
            [Sequelize.Op.between]: [
              new Date(year, 0, 1, 0, 0, 0),
              new Date(year, 11, 31, 23, 59, 59)
            ]
          }
        }
      });
      
      // 獲取書籍數量
      const bookCount = await Book.count({
        where: { is_active: true }
      });
      
      const expectedRecords = bookCount * expectedHours * 2; // 觀看 + 下載
      const actualRecords = viewCount + downloadCount;
      const completeness = (actualRecords / expectedRecords * 100).toFixed(2);
      
      if (completeness < 95) {
        issues.push({
          year,
          expected: expectedRecords,
          actual: actualRecords,
          completeness: `${completeness}%`,
          status: '❌ 不完整'
        });
      } else {
        console.log(`   ${year}年: ${completeness}% 完整 (${actualRecords}/${expectedRecords})`);
      }
    }
    
    if (issues.length > 0) {
      console.log('⚠️ 發現數據完整性問題:');
      issues.forEach(issue => {
        console.log(`   ${issue.year}年: ${issue.status} - ${issue.completeness} (${issue.actual}/${issue.expected})`);
      });
    } else {
      console.log('✅ 所有年份數據完整性良好');
    }
    
    return issues;
  } catch (error) {
    console.error('❌ 檢查數據完整性失敗:', error.message);
    return null;
  }
}

// 檢查時間戳問題
async function checkTimestampIssues() {
  console.log('\n⏰ 檢查時間戳問題...');
  
  try {
    // 檢查是否有未來的時間戳
    const futureRecords = await BookView.count({
      where: {
        viewer_key: {
          [Sequelize.Op.like]: 'seed:%'
        },
        created_at: {
          [Sequelize.Op.gt]: new Date()
        }
      }
    });
    
    if (futureRecords > 0) {
      console.log(`⚠️ 發現 ${futureRecords} 筆未來時間戳的記錄`);
    } else {
      console.log('✅ 沒有發現未來時間戳的記錄');
    }
    
    // 檢查最早和最晚的時間戳
    const earliestRecord = await BookView.findOne({
      attributes: ['created_at'],
      where: {
        viewer_key: {
          [Sequelize.Op.like]: 'seed:%'
        }
      },
      order: [['created_at', 'ASC']],
      raw: true
    });
    
    const latestRecord = await BookView.findOne({
      attributes: ['created_at'],
      where: {
        viewer_key: {
          [Sequelize.Op.like]: 'seed:%'
        }
      },
      order: [['created_at', 'DESC']],
      raw: true
    });
    
    if (earliestRecord && latestRecord) {
      console.log(`📅 時間範圍: ${earliestRecord.created_at} 到 ${latestRecord.created_at}`);
      
      const timeSpan = new Date(latestRecord.created_at) - new Date(earliestRecord.created_at);
      const daysSpan = Math.ceil(timeSpan / (1000 * 60 * 60 * 24));
      console.log(`⏱️ 總時間跨度: ${daysSpan} 天`);
    }
    
    return { futureRecords, earliestRecord, latestRecord };
  } catch (error) {
    console.error('❌ 檢查時間戳失敗:', error.message);
    return null;
  }
}

// 生成診斷報告
async function generateDiagnosticReport() {
  console.log('\n📋 生成診斷報告...');
  
  try {
    const basicStats = await checkBasicStats();
    const yearDistribution = await checkYearDistribution();
    const monthDistribution = await checkMonthDistribution();
    const duplicationIssues = await checkDataDuplication();
    const completenessIssues = await checkDataCompleteness();
    const timestampIssues = await checkTimestampIssues();
    
    console.log('\n🎯 診斷總結:');
    
    if (basicStats) {
      console.log(`   📊 總數據量: ${basicStats.totalViews + basicStats.totalDownloads} 筆`);
      console.log(`   🌱 種子數據比例: ${((basicStats.seedViews + basicStats.seedDownloads) / (basicStats.totalViews + basicStats.totalDownloads) * 100).toFixed(2)}%`);
    }
    
    if (yearDistribution && yearDistribution.viewYearStats) {
      const yearsWithData = yearDistribution.viewYearStats.length;
      console.log(`   📅 有數據的年份: ${yearsWithData} 年`);
      
      if (yearsWithData < 5) {
        console.log('   ⚠️ 年份數據不完整，建議運行修復腳本');
      }
    }
    
    if (duplicationIssues) {
      const totalDuplicates = duplicationIssues.duplicateViews.length + duplicationIssues.duplicateDownloads.length;
      if (totalDuplicates > 0) {
        console.log(`   ⚠️ 發現 ${totalDuplicates} 個重複數據問題`);
      }
    }
    
    if (completenessIssues && completenessIssues.length > 0) {
      console.log(`   ❌ 發現 ${completenessIssues.length} 個年份數據不完整`);
    }
    
    if (timestampIssues && timestampIssues.futureRecords > 0) {
      console.log(`   ⚠️ 發現 ${timestampIssues.futureRecords} 筆未來時間戳記錄`);
    }
    
    // 建議
    console.log('\n💡 建議:');
    if (completenessIssues && completenessIssues.length > 0) {
      console.log('   1. 運行修復腳本: node scripts/fix-historical-data-complete.js');
    }
    if (duplicationIssues && (duplicationIssues.duplicateViews.length > 0 || duplicationIssues.duplicateDownloads.length > 0)) {
      console.log('   2. 清除重複數據並重新生成');
    }
    if (timestampIssues && timestampIssues.futureRecords > 0) {
      console.log('   3. 檢查並修正時間戳問題');
    }
    
    if (!completenessIssues || completenessIssues.length === 0) {
      console.log('   ✅ 數據狀態良好，無需修復');
    }
    
  } catch (error) {
    console.error('❌ 生成診斷報告失敗:', error.message);
  }
}

// 主函數
async function main() {
  console.log('🔍 開始數據完整性檢查...\n');
  
  try {
    // 檢查資料庫連接
    if (!(await checkConnection())) {
      return;
    }
    
    // 生成診斷報告
    await generateDiagnosticReport();
    
  } catch (error) {
    console.error('❌ 檢查過程發生錯誤:', error.message);
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
  checkBasicStats,
  checkYearDistribution,
  checkMonthDistribution,
  checkDataDuplication,
  checkDataCompleteness,
  checkTimestampIssues,
  generateDiagnosticReport
};
