import React, { useState, useEffect } from 'react'
import userBookService from '../../services/userBookService'
import classes from './Pages.module.scss'

function BookRating({ bookId, initialRating = 0, onRatingChange, showText = true, size = 'normal' }) {
  const [rating, setRating] = useState(initialRating)
  const [hoverRating, setHoverRating] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [userRating, setUserRating] = useState(initialRating)
  
  console.log(`🎯 BookRating 組件初始化: bookId=${bookId}, initialRating=${initialRating}`)

  // 當 initialRating 改變時，更新 rating 狀態
  useEffect(() => {
    if (initialRating !== undefined && initialRating !== null) {
      console.log(`🔄 更新初始評分: ${initialRating}`)
      setRating(initialRating)
      setUserRating(initialRating)
    } else {
      console.log(`🔄 初始評分為空，設置為 0`)
      setRating(0)
      setUserRating(0)
    }
  }, [initialRating])

  // 載入用戶的評分（只在沒有 initialRating 時調用）
  useEffect(() => {
    const loadUserRating = async () => {
      // 如果已經有 initialRating，則不需要從後端載入
      if (initialRating > 0) {
        console.log(`✅ 已有初始評分 ${initialRating}，跳過後端載入`)
        return
      }

      try {
        console.log(`🔍 載入書籍 ${bookId} 的用戶評分...`)
        const result = await userBookService.checkBookInLibrary(bookId)
        console.log(`📚 檢查書庫結果:`, result)
        
        if (result.inLibrary && result.userBook && result.userBook.rating) {
          const userRatingValue = result.userBook.rating
          console.log(`⭐ 從後端載入用戶評分: ${userRatingValue}`)
          setUserRating(userRatingValue)
          setRating(userRatingValue)
        } else {
          console.log(`📖 書籍不在書庫中或無評分，保持初始值: ${initialRating}`)
          setUserRating(initialRating)
          setRating(initialRating)
        }
      } catch (error) {
        console.error(`❌ 載入用戶評分失敗:`, error)
        // 如果載入失敗，保持初始值
        setUserRating(initialRating)
        setRating(initialRating)
      }
    }

    loadUserRating()
  }, [bookId, initialRating])

  // 處理評分提交
  const handleRatingSubmit = async (newRating) => {
    console.log(`📝 提交評分: ${newRating} 星 (原評分: ${userRating})`)
    
    if (newRating === userRating) {
      console.log(`🔄 評分未改變，跳過提交`)
      return
    }

    setIsSubmitting(true)
    try {
      const result = await userBookService.updateBookStatus(bookId, { rating: newRating })
      console.log(`📡 評分提交結果:`, result)
      
      if (result.success) {
        // 立即更新本地狀態
        setRating(newRating)
        setUserRating(newRating)
        
        // 調用回調函數通知父組件
        if (onRatingChange) {
          onRatingChange(newRating)
        }
        
        console.log(`✅ 評分更新成功: ${newRating} 星`)
      } else {
        console.error('❌ 評分提交失敗:', result.message)
        // 如果提交失敗，恢復原來的評分
        setRating(userRating || 0)
      }
    } catch (error) {
      console.error('❌ 評分提交錯誤:', error)
      // 如果提交錯誤，恢復原來的評分
      setRating(userRating || 0)
    } finally {
      setIsSubmitting(false)
    }
  }

  // 處理星數點擊
  const handleStarClick = (starValue) => {
    if (isSubmitting) {
      console.log(`⏳ 評分提交中，忽略點擊`)
      return
    }
    
    console.log(`🖱️ 點擊星星: ${starValue} 星`)
    
    // 立即更新視覺狀態（樂觀更新）
    setRating(starValue)
    
    // 提交到後端
    handleRatingSubmit(starValue)
  }

  // 處理星數懸停
  const handleStarHover = (starValue) => {
    if (isSubmitting) return
    setHoverRating(starValue)
  }

  // 處理星數離開
  const handleStarLeave = () => {
    if (isSubmitting) return
    setHoverRating(0)
  }

  // 渲染星數
  const renderStars = () => {
    const stars = []
    // 優先顯示懸停狀態，其次是當前評分
    const displayRating = hoverRating || rating
    
    console.log(`⭐ 渲染星星: rating=${rating}, hoverRating=${hoverRating}, displayRating=${displayRating}`)

    // 根據size屬性設定星星大小
    const starSize = size === 'small' ? '14px' : '18px'

    for (let i = 1; i <= 5; i++) {
      const isActive = i <= displayRating
      const starClass = `${classes.star} ${isActive ? classes.starActive : classes.starInactive}`
      
      console.log(`  🌟 星星 ${i}: isActive=${isActive}, class=${starClass}, displayRating=${displayRating}`)
      
      stars.push(
        <svg
          key={i}
          className={starClass}
          onClick={() => handleStarClick(i)}
          onMouseEnter={() => handleStarHover(i)}
          onMouseLeave={handleStarLeave}
          title={`${i} 星`}
          style={{ 
            cursor: isSubmitting ? 'not-allowed' : 'pointer',
            width: starSize,
            height: starSize,
            fill: isActive ? '#ffd700' : '#ccc',
            transition: 'all 0.2s ease'
          }}
          viewBox="0 0 24 24"
        >
          {/* 簡單的星星路徑 */}
          <path d="M12 2l2.4 7.4H22l-6 4.6 2.4 7.4L12 18.6 5.6 26l2.4-7.4L2 14.4h7.6z"/>
        </svg>
      )
    }

    return stars
  }

  // 評分文字
  const getRatingText = () => {
    if (isSubmitting) return '評分提交中...'
    if (rating === 0) return '點擊星數評分'
    if (rating === 1) return '很差'
    if (rating === 2) return '一般'
    if (rating === 3) return '還行'
    if (rating === 4) return '不錯'
    if (rating === 5) return '很棒'
    return ''
  }

  return (
    <div className={classes.ratingContainer}>
      <div className={classes.starsContainer}>
        {renderStars()}
      </div>
      
      {showText && (
        <div className={classes.ratingText}>
          {isSubmitting ? (
            <span className={classes.ratingSubmitting}>{getRatingText()}</span>
          ) : (
            <span>{getRatingText()}</span>
          )}
        </div>
      )}
      
      {/* 調試信息 - 開發時可以顯示 */}
      {process.env.NODE_ENV === 'development' && (
        <div style={{ fontSize: '10px', color: '#666', marginTop: '4px' }}>
          當前評分: {rating}, 用戶評分: {userRating}, 懸停: {hoverRating}, 初始評分: {initialRating}
        </div>
      )}
    </div>
  )
}

export default BookRating
