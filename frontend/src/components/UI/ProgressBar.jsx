import React, { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import classes from './ProgressBar.module.scss'

const ProgressBar = () => {
  const location = useLocation()
  const [isLoading, setIsLoading] = useState(false)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    // 路由變化時開始載入動畫
    setIsLoading(true)
    setProgress(0)

    // 模擬載入進度
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval)
          return 90
        }
        return prev + Math.random() * 30
      })
    }, 100)

    // 完成載入
    const completeTimer = setTimeout(() => {
      setProgress(100)
      setTimeout(() => {
        setIsLoading(false)
        setProgress(0)
      }, 300)
    }, 500)

    return () => {
      clearInterval(progressInterval)
      clearTimeout(completeTimer)
    }
  }, [location.pathname])

  if (!isLoading) return null

  return (
    <div className={classes.progressContainer}>
      <div className={classes.progressBar}>
        <div 
          className={classes.progressFill}
          style={{ width: `${progress}%` }}
        />
        <div className={classes.progressGlow} />
      </div>
      
      {/* 奧術魔法粒子效果 */}
      <div className={classes.magicParticles}>
        {[...Array(5)].map((_, i) => (
          <div 
            key={i} 
            className={classes.particle}
            style={{
              animationDelay: `${i * 0.2}s`,
              left: `${20 + i * 15}%`
            }}
          />
        ))}
      </div>
    </div>
  )
}

export default ProgressBar 