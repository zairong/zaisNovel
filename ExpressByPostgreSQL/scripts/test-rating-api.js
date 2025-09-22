const http = require('http')

function testRatingAPI() {
  console.log('🧪 測試評分 API...')
  
  // 測試獲取書籍評分
  const getRatingOptions = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/books/1/rating',
    method: 'GET'
  }
  
  const getRatingReq = http.request(getRatingOptions, (res) => {
    console.log('📡 獲取評分 API 回應狀態:', res.statusCode)
    
    let data = ''
    res.on('data', (chunk) => {
      data += chunk
    })
    
    res.on('end', () => {
      try {
        const jsonData = JSON.parse(data)
        console.log('📊 評分回應數據:', JSON.stringify(jsonData, null, 2))
        
        if (jsonData.success) {
          console.log('✅ 獲取評分 API 調用成功')
          console.log(`📚 書籍評分統計:`)
          console.log(`  平均評分: ${jsonData.data.averageRating}`)
          console.log(`  總評分數: ${jsonData.data.totalRatings}`)
          console.log(`  是否有評分: ${jsonData.data.hasRating}`)
        } else {
          console.log('❌ 獲取評分 API 調用失敗:', jsonData.message)
        }
      } catch (error) {
        console.error('❌ 解析回應失敗:', error.message)
        console.log('📄 原始回應:', data)
      }
    })
  })
  
  getRatingReq.on('error', (error) => {
    console.error('❌ 獲取評分請求失敗:', error.message)
  })
  
  getRatingReq.end()
}

testRatingAPI()
