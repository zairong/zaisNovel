import React, { useEffect, useState } from 'react';
import classes from './CustomCursor.module.scss';

const CustomCursor = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isClicking, setIsClicking] = useState(false);
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    const updateCursorPosition = (e) => {
      try {
        if (e && typeof e.clientX === 'number' && typeof e.clientY === 'number') {
          setPosition({ x: e.clientX, y: e.clientY });
        }
      } catch (error) {
        console.warn('CustomCursor: Failed to update cursor position:', error);
      }
    };

    const handleMouseDown = () => {
      try {
        setIsClicking(true);
      } catch (error) {
        console.warn('CustomCursor: Failed to handle mouse down:', error);
      }
    };

    const handleMouseUp = () => {
      try {
        setIsClicking(false);
      } catch (error) {
        console.warn('CustomCursor: Failed to handle mouse up:', error);
      }
    };

    const handleMouseEnter = (e) => {
      try {
        // 確保 e.target 是一個有效的 DOM 元素
        if (!e.target || typeof e.target.tagName === 'undefined') {
          return;
        }

        // 檢查是否是可點擊元素
        const isClickable = 
          e.target.tagName === 'BUTTON' || 
          e.target.tagName === 'A' || 
          e.target.tagName === 'INPUT' || 
          e.target.tagName === 'TEXTAREA';

        // 檢查父元素是否包含可點擊元素
        let hasClickableParent = false;
        try {
          if (e.target.closest) {
            hasClickableParent = !!(e.target.closest('button') || e.target.closest('a'));
          }
        } catch (error) {
          // 忽略 closest 方法的錯誤
          console.warn('CustomCursor: closest method error:', error);
        }

        if (isClickable || hasClickableParent) {
          setIsHovering(true);
        }
      } catch (error) {
        // 忽略任何其他錯誤
        console.warn('CustomCursor: mouseenter error:', error);
      }
    };

    const handleMouseLeave = (e) => {
      try {
        // 簡單地重置懸停狀態
        setIsHovering(false);
      } catch (error) {
        // 忽略任何錯誤
        console.warn('CustomCursor: mouseleave error:', error);
        setIsHovering(false);
      }
    };

    document.addEventListener('mousemove', updateCursorPosition);
    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mouseenter', handleMouseEnter);
    document.addEventListener('mouseleave', handleMouseLeave);

    // 為所有可點擊元素添加事件監聽
    const clickableElements = document.querySelectorAll('button, a, input, textarea, [role="button"], [tabindex]');
    clickableElements.forEach(element => {
      try {
        if (element && typeof element.addEventListener === 'function') {
          element.addEventListener('mouseenter', handleMouseEnter);
          element.addEventListener('mouseleave', handleMouseLeave);
        }
      } catch (error) {
        console.warn('CustomCursor: Failed to add event listener to element:', error);
      }
    });

    return () => {
      document.removeEventListener('mousemove', updateCursorPosition);
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mouseenter', handleMouseEnter);
      document.removeEventListener('mouseleave', handleMouseLeave);
      
      clickableElements.forEach(element => {
        try {
          if (element && typeof element.removeEventListener === 'function') {
            element.removeEventListener('mouseenter', handleMouseEnter);
            element.removeEventListener('mouseleave', handleMouseLeave);
          }
        } catch (error) {
          console.warn('CustomCursor: Failed to remove event listener from element:', error);
        }
      });
    };
  }, []);

  const cursorClasses = [
    classes.customCursor,
    isClicking ? classes.cursorClick : '',
    isHovering ? classes.cursorHover : ''
  ].filter(Boolean).join(' ');

  return (
    <div 
      className={cursorClasses}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`
      }}
    >
      <div className={classes.cursorOuter}></div>
      <div className={classes.cursorInner}></div>
      <div className={classes.cursorCrosshair}></div>
    </div>
  );
};

export default CustomCursor;
