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

// 檢查年份數據重複問題
async function checkYearDuplication() {
  console.log('\n🔍 檢查年份數據重複問題...');
  
  try {
    // 檢查2020-2024年的數據是否與2025年相同
    const yearComparison = [];
    
    for (let year = 2020; year <= 2024; year++) {
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
      
      yearComparison.push({
        year,
        viewCount,
        downloadCount,
        total: viewCount + downloadCount
      });
      
      console.log(`   ${year}年: 觀看 ${viewCount} 筆，下載 ${downloadCount} 筆，總計 ${viewCount + downloadCount} 筆`);
    }
    
    // 檢查2025年數據
    const currentYear = new Date().getFullYear();
    if (currentYear >= 2025) {
      const viewCount2025 = await BookView.count({
        where: {
          viewer_key: {
            [Sequelize.Op.like]: 'seed:%'
          },
          created_at: {
            [Sequelize.Op.between]: [
              new Date(2025, 0, 1, 0, 0, 0),
              new Date()
            ]
          }
        }
      });
      
      const downloadCount2025 = await BookDownload.count({
        where: {
          viewer_key: {
            [Sequelize.Op.like]: 'seed:%'
          },
          created_at: {
            [Sequelize.Op.between]: [
              new Date(2025, 0, 1, 0, 0, 0),
              new Date()
            ]
          }
        }
      });
      
      yearComparison.push({
        year: 2025,
        viewCount: viewCount2025,
        downloadCount: downloadCount2025,
        total: viewCount2025 + downloadCount2025
      });
      
      console.log(`   ${currentYear}年: 觀看 ${viewCount2025} 筆，下載 ${downloadCount2025} 筆，總計 ${viewCount2025 + downloadCount2025} 筆`);
    }
    
    // 分析重複問題
    const duplicates = [];
    for (let i = 0; i < yearComparison.length - 1; i++) {
      for (let j = i + 1; j < yearComparison.length; j++) {
        if (yearComparison[i].total === yearComparison[j].total && yearComparison[i].total > 0) {
          duplicates.push({
            year1: yearComparison[i].year,
            year2: yearComparison[j].year,
            count: yearComparison[i].total
          });
        }
      }
    }
    
    if (duplicates.length > 0) {
      console.log('\n⚠️ 發現年份數據重複問題:');
      duplicates.forEach(dup => {
        console.log(`   ${dup.year1}年 與 ${dup.year2}年 數據相同 (${dup.count} 筆)`);
      });
    } else {
      console.log('\n✅ 沒有發現年份數據重複問題');
    }
    
    return { yearComparison, duplicates };
  } catch (error) {
    console.error('❌ 檢查年份重複失敗:', error.message);
    return null;
  }
}

// 快速修復：清除有問題的年份數據
async function quickFixDuplicateYears() {
  console.log('\n🚀 開始快速修復年份數據重複問題...');
  
  try {
    // 1. 清除2020-2024年的種子數據
    console.log('🗑️ 清除2020-2024年的種子數據...');
    
    for (let year = 2020; year <= 2024; year++) {
      const deletedViews = await BookView.destroy({
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
      
      const deletedDownloads = await BookDownload.destroy({
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
      
      console.log(`   ${year}年: 清除觀看記錄 ${deletedViews} 筆，下載記錄 ${deletedDownloads} 筆`);
    }
    
    // 2. 保留2025年的數據
    console.log('\n💾 保留2025年的數據...');
    const currentYear = new Date().getFullYear();
    if (currentYear >= 2025) {
      const remainingViews = await BookView.count({
        where: {
          viewer_key: {
            [Sequelize.Op.like]: 'seed:%'
          },
          created_at: {
            [Sequelize.Op.between]: [
              new Date(2025, 0, 1, 0, 0, 0),
              new Date()
            ]
          }
        }
      });
      
      const remainingDownloads = await BookDownload.count({
        where: {
          viewer_key: {
            [Sequelize.Op.like]: 'seed:%'
          },
          created_at: {
            [Sequelize.Op.between]: [
              new Date(2025, 0, 1, 0, 0, 0),
              new Date()
            ]
          }
        }
      });
      
      console.log(`   2025年: 保留觀看記錄 ${remainingViews} 筆，下載記錄 ${remainingDownloads} 筆`);
    }
    
    console.log('✅ 快速修復完成！');
    return true;
    
  } catch (error) {
    console.error('❌ 快速修復失敗:', error.message);
    return false;
  }
}

// 驗證修復結果
async function validateQuickFix() {
  console.log('\n🔍 驗證快速修復結果...');
  
  try {
    // 檢查各年份的數據
    for (let year = 2020; year <= 2024; year++) {
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
      
      if (viewCount === 0 && downloadCount === 0) {
        console.log(`   ✅ ${year}年: 數據已清除`);
      } else {
        console.log(`   ⚠️ ${year}年: 仍有觀看 ${viewCount} 筆，下載 ${downloadCount} 筆`);
      }
    }
    
    // 檢查2025年數據
    const currentYear = new Date().getFullYear();
    if (currentYear >= 2025) {
      const viewCount2025 = await BookView.count({
        where: {
          viewer_key: {
            [Sequelize.Op.like]: 'seed:%'
          },
          created_at: {
            [Sequelize.Op.between]: [
              new Date(2025, 0, 1, 0, 0, 0),
              new Date()
            ]
          }
        }
      });
      
      const downloadCount2025 = await BookDownload.count({
        where: {
          viewer_key: {
            [Sequelize.Op.like]: 'seed:%'
          },
          created_at: {
            [Sequelize.Op.between]: [
              new Date(2025, 0, 1, 0, 0, 0),
              new Date()
            ]
          }
        }
      });
      
      console.log(`   ✅ 2025年: 保留觀看 ${viewCount2025} 筆，下載 ${downloadCount2025} 筆`);
    }
    
    console.log('\n🎯 快速修復驗證完成！');
    console.log('💡 建議: 如果需要完整的歷史數據，請運行完整修復腳本');
    console.log('   node scripts/fix-historical-data-complete.js');
    
  } catch (error) {
    console.error('❌ 驗證修復結果失敗:', error.message);
  }
}

// 主函數
async function main() {
  console.log('🚀 開始快速修復年份數據重複問題...\n');
  
  try {
    // 檢查資料庫連接
    if (!(await checkConnection())) {
      return;
    }
    
    // 檢查年份數據重複問題
    const duplicationCheck = await checkYearDuplication();
    if (!duplicationCheck) {
      return;
    }
    
    // 如果有重複問題，進行快速修復
    if (duplicationCheck.duplicates && duplicationCheck.duplicates.length > 0) {
      console.log('\n🔧 發現數據重複問題，開始快速修復...');
      
      const fixResult = await quickFixDuplicateYears();
      if (fixResult) {
        await validateQuickFix();
      }
    } else {
      console.log('\n✅ 沒有發現數據重複問題，無需修復');
    }
    
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
  checkYearDuplication,
  quickFixDuplicateYears,
  validateQuickFix
};
