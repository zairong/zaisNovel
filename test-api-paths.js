// 測試 API 路徑是否正確
// 這個腳本用來驗證前端服務的 API 路徑設定

console.log('🔍 檢查 API 路徑設定...\n');

// 模擬環境變數
const importMetaEnv = {
  VITE_API_BASE: undefined
};

// 模擬 http 工具類
class MockHttpService {
  constructor() {
    this.baseURL = importMetaEnv.VITE_API_BASE || '/api';
  }
  
  get(url) {
    console.log(`GET 請求: ${this.baseURL}${url}`);
    return Promise.resolve({ success: true });
  }
  
  post(url, data) {
    console.log(`POST 請求: ${this.baseURL}${url}`);
    return Promise.resolve({ success: true });
  }
}

const http = new MockHttpService();

// 測試 authService 的路徑
console.log('📝 測試 AuthService 路徑:');
http.post('/auth/login', { username: 'test', password: 'test' });
http.post('/auth/register', { username: 'test', password: 'test' });
http.get('/auth/me');

console.log('\n📚 測試 BookService 路徑:');
http.get('/books');
http.get('/books/1');
http.post('/books', { title: 'Test Book' });

console.log('\n📊 測試 AnalyticsService 路徑:');
http.get('/analytics/overview');
http.get('/analytics/books');

console.log('\n🔍 測試 AuditService 路徑:');
http.get('/audit/logs');
http.post('/audit/log', { type: 'test' });

console.log('\n✅ 所有 API 路徑檢查完成！');
console.log('💡 如果路徑都是 /api/... 開頭，表示設定正確');
console.log('❌ 如果出現 /api/api/... 表示路徑重複，需要修正');
