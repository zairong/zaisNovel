import React, { useState, useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import classes from './RouteTransition.module.scss'

// 路由層級配置
const routeLevels = {
  '/': 1,
  '/auth': 1,
  '/books': 2,
  '/ebooks': 2,
  '/my-library': 2,
  '/about': 1,
  '/user-info': 2,
  '/admin': 3,
  '/admin/users': 3,
  '/ebooks/upload': 3,
  '/ebooks/:id/read': 3,
  '/ebooks/:id/edit': 3,
}

// 獲取路由層級
const getRouteLevel = (pathname) => {
  // 處理動態路由
  if (pathname.includes('/ebooks/') && pathname.includes('/read')) {
    return routeLevels['/ebooks/:id/read']
  }
  if (pathname.includes('/ebooks/') && pathname.includes('/edit')) {
    return routeLevels['/ebooks/:id/edit']
  }
  if (pathname.startsWith('/admin/')) {
    return routeLevels['/admin']
  }
  
  return routeLevels[pathname] || 1
}

const SmartRouteTransition = ({ children }) => {
  const location = useLocation()
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [displayLocation, setDisplayLocation] = useState(location)
  const [displayChildren, setDisplayChildren] = useState(children)
  const [direction, setDirection] = useState('right')
  const prevLocationRef = useRef(location)

  useEffect(() => {
    if (location !== displayLocation) {
      const currentPath = location.pathname
      const prevPath = prevLocationRef.current.pathname
      
      // 獲取當前和之前的路由層級
      const currentLevel = getRouteLevel(currentPath)
      const prevLevel = getRouteLevel(prevPath)
      
      // 根據層級判斷動畫方向
      if (currentLevel > prevLevel) {
        setDirection('right') // 進入更深層頁面
      } else if (currentLevel < prevLevel) {
        setDirection('left') // 返回上層頁面
      } else {
        // 同層級切換，根據路徑長度判斷
        if (currentPath.length > prevPath.length) {
          setDirection('right')
        } else {
          setDirection('left')
        }
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
        }, 400)
        
        return () => clearTimeout(enterTimer)
      }, 400)
      
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

export default SmartRouteTransition
