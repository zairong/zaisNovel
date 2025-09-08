import React, { useState, useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import classes from './RouteTransition.module.scss'

const RouteTransition = ({ children }) => {
  const location = useLocation()
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [displayLocation, setDisplayLocation] = useState(location)
  const [displayChildren, setDisplayChildren] = useState(children)
  const [direction, setDirection] = useState('right') // 'left' 或 'right'
  const prevLocationRef = useRef(location)

  useEffect(() => {
    if (location !== displayLocation) {
      // 判斷動畫方向（這裡可以根據路由邏輯調整）
      // 簡單的實現：根據路徑長度判斷方向
      const currentPath = location.pathname
      const prevPath = prevLocationRef.current.pathname
      
      // 可以根據具體需求調整方向判斷邏輯
      // 這裡使用簡單的路徑比較
      if (currentPath.length > prevPath.length) {
        setDirection('right') // 進入更深層頁面
      } else {
        setDirection('left') // 返回上層頁面
      }
      
      setIsTransitioning(true)
      prevLocationRef.current = location
      
      // 開始退出動畫
      const exitTimer = setTimeout(() => {
        setDisplayLocation(location)
        setDisplayChildren(children)
        
        // 開始進入動畫
        const enterTimer = setTimeout(() => {
          setIsTransitioning(false)
        }, 300)
        
        return () => clearTimeout(enterTimer)
      }, 300)
      
      return () => clearTimeout(exitTimer)
    }
  }, [location, displayLocation, children])

  return (
    <div className={`${classes.routeTransition} ${isTransitioning ? classes.transitioning : ''}`}>
      <div className={`${classes.pageContent} ${classes[direction]}`}>
        {displayChildren}
      </div>
    </div>
  )
}

export default RouteTransition
