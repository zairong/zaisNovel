import React, { useState, useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import classes from './RouteTransition.module.scss'

// 路由配置和動畫類型
const routeConfig = {
  '/': { level: 1, animation: 'slide' },
  '/auth': { level: 1, animation: 'slide' },
  '/books': { level: 2, animation: 'slide' },
  '/ebooks': { level: 2, animation: 'slide' },
  '/my-library': { level: 2, animation: 'slide' },
  '/about': { level: 1, animation: 'slide' },
  '/user-info': { level: 2, animation: 'slide' },
  '/admin': { level: 3, animation: 'slide' },
  '/admin/users': { level: 3, animation: 'slide' },
  '/ebooks/upload': { level: 3, animation: 'slide' },
  '/ebooks/:id/read': { level: 3, animation: 'slide' },
  '/ebooks/:id/edit': { level: 3, animation: 'slide' },
}

// 獲取路由配置
const getRouteConfig = (pathname) => {
  // 處理動態路由
  if (pathname.includes('/ebooks/') && pathname.includes('/read')) {
    return routeConfig['/ebooks/:id/read']
  }
  if (pathname.includes('/ebooks/') && pathname.includes('/edit')) {
    return routeConfig['/ebooks/:id/edit']
  }
  if (pathname.startsWith('/admin/')) {
    return routeConfig['/admin']
  }
  
  return routeConfig[pathname] || { level: 1, animation: 'slide' }
}

const AdvancedRouteTransition = ({ children }) => {
  const location = useLocation()
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [displayLocation, setDisplayLocation] = useState(location)
  const [displayChildren, setDisplayChildren] = useState(children)
  const [direction, setDirection] = useState('right')
  const [animationType, setAnimationType] = useState('slide')
  const prevLocationRef = useRef(location)

  useEffect(() => {
    if (location !== displayLocation) {
      const currentPath = location.pathname
      const prevPath = prevLocationRef.current.pathname
      
      // 獲取路由配置
      const currentConfig = getRouteConfig(currentPath)
      const prevConfig = getRouteConfig(prevPath)
      
      // 設置動畫類型
      setAnimationType(currentConfig.animation)
      
      // 根據層級判斷動畫方向
      if (currentConfig.level > prevConfig.level) {
        setDirection('right') // 進入更深層頁面
      } else if (currentConfig.level < prevConfig.level) {
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
    <div className={`${classes.routeTransition} ${classes[animationType]} ${isTransitioning ? classes.transitioning : ''}`}>
      <div className={`${classes.pageContent} ${classes[direction]}`}>
        {displayChildren}
      </div>
    </div>
  )
}

export default AdvancedRouteTransition
