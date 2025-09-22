const path = require('path');
const fs = require('fs');

console.log('🔍 檢查資料庫配置...\n');

// 檢查 .env 檔案
const envPath = path.join(__dirname, '..', '.env');
console.log(`📁 檢查 .env 檔案: ${envPath}`);

if (fs.existsSync(envPath)) {
  console.log('✅ .env 檔案存在');
  
  // 讀取 .env 檔案內容（不顯示密碼）
  const envContent = fs.readFileSync(envPath, 'utf8');
  const lines = envContent.split('\n');
  
  console.log('📋 環境變數檢查:');
  lines.forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, value] = trimmed.split('=');
      if (key && value) {
        if (key.includes('PASSWORD') || key.includes('SECRET')) {
          console.log(`   ${key}: ${'*'.repeat(Math.min(value.length, 8))}`);
        } else {
          console.log(`   ${key}: ${value}`);
        }
      }
    }
  });
} else {
  console.log('❌ .env 檔案不存在');
  console.log('💡 請創建 .env 檔案並設定資料庫連接資訊');
}

// 檢查 config.js
const configPath = path.join(__dirname, '..', 'config', 'config.js');
console.log(`\n📁 檢查 config.js 檔案: ${configPath}`);

if (fs.existsSync(configPath)) {
  console.log('✅ config.js 檔案存在');
} else {
  console.log('❌ config.js 檔案不存在');
}

// 檢查 package.json
const packagePath = path.join(__dirname, '..', 'package.json');
console.log(`\n📁 檢查 package.json 檔案: ${packagePath}`);

if (fs.existsSync(packagePath)) {
  console.log('✅ package.json 檔案存在');
  
  try {
    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    console.log(`   📦 專案名稱: ${packageJson.name}`);
    console.log(`   📋 版本: ${packageJson.version}`);
    
    if (packageJson.dependencies) {
      const hasSequelize = packageJson.dependencies.sequelize;
      const hasMysql2 = packageJson.dependencies.mysql2;
      
      console.log(`   🔧 Sequelize: ${hasSequelize ? '✅ 已安裝' : '❌ 未安裝'}`);
      console.log(`   🔧 mysql2: ${hasMysql2 ? '✅ 已安裝' : '❌ 未安裝'}`);
    }
  } catch (error) {
    console.log('   ❌ 無法解析 package.json');
  }
} else {
  console.log('❌ package.json 檔案不存在');
}

// 檢查 node_modules
const nodeModulesPath = path.join(__dirname, '..', 'node_modules');
console.log(`\n📁 檢查 node_modules: ${nodeModulesPath}`);

if (fs.existsSync(nodeModulesPath)) {
  console.log('✅ node_modules 目錄存在');
  
  const sequelizePath = path.join(nodeModulesPath, 'sequelize');
  const mysql2Path = path.join(nodeModulesPath, 'mysql2');
  
  console.log(`   🔧 Sequelize: ${fs.existsSync(sequelizePath) ? '✅ 已安裝' : '❌ 未安裝'}`);
  console.log(`   🔧 mysql2: ${fs.existsSync(mysql2Path) ? '✅ 已安裝' : '❌ 未安裝'}`);
} else {
  console.log('❌ node_modules 目錄不存在');
  console.log('💡 請執行 npm install 安裝依賴');
}

// 顯示配置建議
console.log('\n💡 配置建議:');
console.log('1. 建議優先在生產環境使用 DATABASE_URL（Render 會自動提供）');
console.log('   或在本地開發使用以下環境變數:');
console.log('   DB_HOST=localhost');
console.log('   DB_PORT=5432');
console.log('   DB_NAME=your_database_name');
console.log('   DB_USERNAME=your_username');
console.log('   DB_PASSWORD=your_password');
console.log('');
console.log('2. 確保 PostgreSQL 服務正在運行');
console.log('3. 確保資料庫用戶有適當的權限');
console.log('4. 檢查防火牆設定（如果使用遠端資料庫）');
console.log('');
console.log('5. 測試資料庫連接:');
console.log('   psql -U username -h hostname -p port database_name');

// 檢查是否有 .env.example 檔案
const envExamplePath = path.join(__dirname, '..', '.env.example');
if (fs.existsSync(envExamplePath)) {
  console.log('\n📋 發現 .env.example 檔案，您可以參考它來設定 .env');
} else {
  console.log('\n📋 建議創建 .env.example 檔案作為配置範例');
}
