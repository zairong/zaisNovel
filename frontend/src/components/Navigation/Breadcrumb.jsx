import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { getRouteByPath, getRouteTitle } from '../../router/routerUtils'
import classes from './Breadcrumb.module.scss'

const Breadcrumb = () => {
  const location = useLocation()
  
  // 解析路徑生成麵包屑
  const generateBreadcrumbs = () => {
    const pathSegments = location.pathname.split('/').filter(segment => segment)
    const breadcrumbs = []
    
    // 添加首頁
    breadcrumbs.push({
      path: '/',
      title: '首頁',
      icon: '🏠'
    })
    
    // 構建路徑並添加每個段
    let currentPath = ''
    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`
      
      // 嘗試獲取路由資訊
      const route = getRouteByPath(currentPath)
      const title = route ? route.title : segment
      const icon = route?.meta?.icon || '📄'
      
      breadcrumbs.push({
        path: currentPath,
        title: title,
        icon: icon,
        isLast: index === pathSegments.length - 1
      })
    })
    
    return breadcrumbs
  }
  
  const breadcrumbs = generateBreadcrumbs()
  
  return (
    <nav className={classes.breadcrumb} aria-label="麵包屑導航">
      <ol className={classes.breadcrumbList}>
        {breadcrumbs.map((crumb, index) => (
          <li key={crumb.path} className={classes.breadcrumbItem}>
            {index > 0 && (
              <span className={classes.separator}>
                <svg viewBox="0 0 24 24" className={classes.separatorIcon}>
                  <path 
                    fill="currentColor" 
                    d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"
                  />
                </svg>
              </span>
            )}
            
            {crumb.isLast ? (
              <span className={`${classes.breadcrumbLink} ${classes.current}`}>
                <span className={classes.breadcrumbIcon}>{crumb.icon}</span>
                <span className={classes.breadcrumbText}>{crumb.title}</span>
              </span>
            ) : (
              <Link to={crumb.path} className={classes.breadcrumbLink}>
                <span className={classes.breadcrumbIcon}>{crumb.icon}</span>
                <span className={classes.breadcrumbText}>{crumb.title}</span>
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}

export default Breadcrumb 