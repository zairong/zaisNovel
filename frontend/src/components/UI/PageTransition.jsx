import React, { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import classes from './PageTransition.module.scss'

const PageTransition = ({ children }) => {
  const location = useLocation()
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [displayLocation, setDisplayLocation] = useState(location)
  const [displayChildren, setDisplayChildren] = useState(children)

  useEffect(() => {
    if (location !== displayLocation) {
      setIsTransitioning(true)
      
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
    <div className={`${classes.pageTransition} ${isTransitioning ? classes.transitioning : ''}`}>
      <div className={classes.pageContent}>
        {displayChildren}
      </div>
      
      {/* 過渡遮罩 */}
      <div className={`${classes.transitionOverlay} ${isTransitioning ? classes.active : ''}`}>
        <div className={classes.transitionSpinner}>
          <div className={classes.spinnerRing}></div>
          <div className={classes.spinnerRing}></div>
          <div className={classes.spinnerRing}></div>
        </div>
      </div>
    </div>
  )
}

export default PageTransition 