const http = require('http')

function testRatingWithoutLibrary() {
  console.log('🧪 測試用戶不加入書庫就能評分...')
  
  // 測試評分 API
  const testRating = () => {
    const postData = JSON.stringify({
      rating: 4
    })
    
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/user-books/update-book/1', // 假設書籍 ID 為 1
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer YOUR_TOKEN_HERE' // 需要替換為實際的 token
      }
    }
    
    const req = http.request(options, (res) => {
      console.log('📡 評分 API 回應狀態:', res.statusCode)
      
      let data = ''
      res.on('data', (chunk) => {
        data += chunk
      })
      
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data)
          console.log('📊 評分回應:', JSON.stringify(jsonData, null, 2))
          
          if (jsonData.success) {
            console.log('✅ 評分成功！用戶可以不加入書庫就評分')
          } else {
            console.log('❌ 評分失敗:', jsonData.message)
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
    
    req.write(postData)
    req.end()
  }
  
  // 測試檢查書籍狀態 API
  const testCheckBookStatus = () => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/user-books/my-library?book_id=1',
      method: 'GET',
      headers: {
        'Authorization': 'Bearer YOUR_TOKEN_HERE' // 需要替換為實際的 token
      }
    }
    
    const req = http.request(options, (res) => {
      console.log('📡 檢查書籍狀態 API 回應狀態:', res.statusCode)
      
      let data = ''
      res.on('data', (chunk) => {
        data += chunk
      })
      
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data)
          console.log('📊 書籍狀態回應:', JSON.stringify(jsonData, null, 2))
          
          if (jsonData.success) {
            const userBooks = jsonData.data.userBooks
            if (userBooks.length > 0) {
              const userBook = userBooks[0]
              console.log('✅ 找到用戶書籍記錄')
              console.log('📖 書庫狀態:', userBook.is_favorite ? '已收藏' : '未收藏')
              console.log('⭐ 評分:', userBook.rating || '無評分')
              console.log('📚 是否在書庫:', userBook.reading_progress > 0 || userBook.is_favorite ? '是' : '否')
            } else {
              console.log('📖 用戶沒有此書籍的記錄')
            }
          } else {
            console.log('❌ 檢查書籍狀態失敗:', jsonData.message)
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
  
  console.log('🔍 先檢查書籍狀態...')
  testCheckBookStatus()
  
  setTimeout(() => {
    console.log('\n📝 進行評分測試...')
    testRatingWithoutLibrary()
  }, 1000)
  
  setTimeout(() => {
    console.log('\n🔍 評分後再次檢查書籍狀態...')
    testCheckBookStatus()
  }, 2000)
}

testRatingWithoutLibrary()
