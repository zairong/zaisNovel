// 網路診斷工具 - 幫助診斷網路請求問題
class NetworkDiagnostics {
  constructor() {
    this.diagnostics = [];
  }

  // 檢查基本網路連接
  async checkBasicConnectivity() {
    const results = {
      online: navigator.onLine,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString()
    };

    console.log('🌐 基本網路狀態:', results);
    return results;
  }

  // 測試 API 端點連接
  async testAPIEndpoints() {
    const endpoints = [
      'https://zaisnovel-backend.onrender.com/api/books',
      'https://zaisnovel-backend.onrender.com/api/auth/check',
      'https://zaisnovel-frontend.onrender.com'
    ];

    const results = [];

    for (const endpoint of endpoints) {
      try {
        const startTime = Date.now();
        const response = await fetch(endpoint, {
          method: 'HEAD',
          mode: 'cors',
          cache: 'no-cache'
        });
        const endTime = Date.now();
        
        results.push({
          endpoint,
          status: response.status,
          statusText: response.statusText,
          responseTime: endTime - startTime,
          headers: Object.fromEntries(response.headers.entries()),
          success: response.ok
        });
      } catch (error) {
        results.push({
          endpoint,
          error: error.message,
          success: false
        });
      }
    }

    console.log('🔍 API 端點測試結果:', results);
    return results;
  }

  // 檢查 CORS 配置
  async testCORS() {
    const testOrigin = window.location.origin;
    const backendURL = 'https://zaisnovel-backend.onrender.com';
    
    try {
      const response = await fetch(`${backendURL}/api/books`, {
        method: 'OPTIONS',
        headers: {
          'Origin': testOrigin,
          'Access-Control-Request-Method': 'GET',
          'Access-Control-Request-Headers': 'Content-Type,Authorization'
        }
      });

      const corsHeaders = {
        'Access-Control-Allow-Origin': response.headers.get('Access-Control-Allow-Origin'),
        'Access-Control-Allow-Methods': response.headers.get('Access-Control-Allow-Methods'),
        'Access-Control-Allow-Headers': response.headers.get('Access-Control-Allow-Headers'),
        'Access-Control-Allow-Credentials': response.headers.get('Access-Control-Allow-Credentials')
      };

      console.log('🔒 CORS 預檢測試結果:', {
        status: response.status,
        headers: corsHeaders,
        success: response.ok
      });

      return {
        status: response.status,
        headers: corsHeaders,
        success: response.ok
      };
    } catch (error) {
      console.error('❌ CORS 測試失敗:', error);
      return {
        error: error.message,
        success: false
      };
    }
  }

  // 檢查瀏覽器快取
  checkBrowserCache() {
    const cacheInfo = {
      hasServiceWorker: 'serviceWorker' in navigator,
      hasCacheAPI: 'caches' in window,
      localStorage: typeof(Storage) !== "undefined",
      sessionStorage: typeof(Storage) !== "undefined"
    };

    console.log('💾 瀏覽器快取支援:', cacheInfo);
    return cacheInfo;
  }

  // 檢查環境變數
  checkEnvironmentVariables() {
    const envVars = {
      NODE_ENV: import.meta.env.MODE,
      VITE_API_URL: import.meta.env.VITE_API_URL,
      currentOrigin: window.location.origin,
      currentHost: window.location.host,
      protocol: window.location.protocol
    };

    console.log('⚙️ 環境變數:', envVars);
    return envVars;
  }

  // 執行完整診斷
  async runFullDiagnosis() {
    console.log('🚀 開始網路診斷...');
    
    const results = {
      timestamp: new Date().toISOString(),
      basicConnectivity: await this.checkBasicConnectivity(),
      environmentVariables: this.checkEnvironmentVariables(),
      browserCache: this.checkBrowserCache(),
      apiEndpoints: await this.testAPIEndpoints(),
      cors: await this.testCORS()
    };

    console.log('📊 完整診斷結果:', results);
    return results;
  }

  // 生成診斷報告
  generateReport(results) {
    const issues = [];
    const recommendations = [];

    // 檢查基本連接
    if (!results.basicConnectivity.online) {
      issues.push('網路離線');
      recommendations.push('檢查網路連接');
    }

    // 檢查 API 端點
    const failedEndpoints = results.apiEndpoints.filter(ep => !ep.success);
    if (failedEndpoints.length > 0) {
      issues.push(`${failedEndpoints.length} 個 API 端點無法連接`);
      recommendations.push('檢查後端服務狀態');
    }

    // 檢查 CORS
    if (!results.cors.success) {
      issues.push('CORS 配置問題');
      recommendations.push('檢查後端 CORS 設定');
    }

    // 檢查環境變數
    if (!results.environmentVariables.VITE_API_URL) {
      issues.push('未設定 VITE_API_URL 環境變數');
      recommendations.push('設定正確的 API URL');
    }

    const report = {
      summary: {
        totalIssues: issues.length,
        issues,
        recommendations
      },
      details: results
    };

    console.log('📋 診斷報告:', report);
    return report;
  }
}

// 創建全域診斷實例
const networkDiagnostics = new NetworkDiagnostics();

// 在開發環境中自動執行診斷
if (import.meta.env.DEV) {
  // 延遲執行，確保頁面完全載入
  setTimeout(() => {
    networkDiagnostics.runFullDiagnosis().then(results => {
      const report = networkDiagnostics.generateReport(results);
      
      // 如果有問題，顯示警告
      if (report.summary.totalIssues > 0) {
        console.warn('⚠️ 發現網路問題:', report.summary);
      } else {
        console.log('✅ 網路診斷通過');
      }
    });
  }, 2000);
}

export default networkDiagnostics;
