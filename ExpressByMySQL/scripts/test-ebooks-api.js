const http = require('http')

function testEbooksAPI() {
  console.log('🧪 測試電子書 API...')
  
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/books/ebooks?page=1&pageSize=20',
    method: 'GET'
  }
  
  const req = http.request(options, (res) => {
    console.log('📡 API 回應狀態:', res.statusCode)
    
    let data = ''
    res.on('data', (chunk) => {
      data += chunk
    })
    
    res.on('end', () => {
      try {
        const jsonData = JSON.parse(data)
        console.log('📊 回應數據結構:', JSON.stringify(jsonData, null, 2))
        
        if (jsonData.success) {
          console.log('✅ API 調用成功')
          console.log(`📚 電子書數量: ${jsonData.data.data.length}`)
          console.log(`📄 總頁數: ${jsonData.data.totalPages}`)
          console.log(`🔢 總數量: ${jsonData.data.total}`)
          
          if (jsonData.data.data.length > 0) {
            console.log('📖 第一本電子書:')
            console.log('  標題:', jsonData.data.data[0].title)
            console.log('  作者:', jsonData.data.data[0].author_name)
            console.log('  has_ebook:', jsonData.data.data[0].has_ebook)
          }
        } else {
          console.log('❌ API 調用失敗:', jsonData.message)
        }
      } catch (error) {
        console.error('❌ 解析回應失敗:', error.message)
        console.log('📄 原始回應:', data)
      }
    })
  })
  
  req.on('error', (error) => {
    console.error('❌ 請求失敗:', error.message)
  })
  
  req.end()
}

testEbooksAPI()
