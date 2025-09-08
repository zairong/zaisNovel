import React, { useState, useEffect } from 'react'
import classes from './ThemeSwitcher.module.scss'

const themes = {
  arcane: {
    name: '奧術',
    icon: '🔮',
    description: '神秘奧術風格',
    colors: {
      primary: '#ffd700',
      secondary: '#ffed4e',
      background: '#1a1a2e',
      surface: '#16213e',
      text: '#e6e6fa'
    }
  },
  nature: {
    name: '自然',
    icon: '🌿',
    description: '清新自然風格',
    colors: {
      primary: '#22c55e',
      secondary: '#4ade80',
      background: '#064e3b',
      surface: '#065f46',
      text: '#ecfdf5'
    }
  },
  fire: {
    name: '火焰',
    icon: '🔥',
    description: '熾熱火焰風格',
    colors: {
      primary: '#ef4444',
      secondary: '#f87171',
      background: '#450a0a',
      surface: '#7f1d1d',
      text: '#fef2f2'
    }
  },
  ocean: {
    name: '海洋',
    icon: '🌊',
    description: '深邃海洋風格',
    colors: {
      primary: '#06b6d4',
      secondary: '#22d3ee',
      background: '#0c4a6e',
      surface: '#0e7490',
      text: '#f0f9ff'
    }
  },
  cosmic: {
    name: '宇宙',
    icon: '✨',
    description: '浩瀚宇宙風格',
    colors: {
      primary: '#a855f7',
      secondary: '#c084fc',
      background: '#1e1b4b',
      surface: '#312e81',
      text: '#faf5ff'
    }
  }
}

const ThemeSwitcher = () => {
  const [currentTheme, setCurrentTheme] = useState('arcane')
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    // 從 localStorage 讀取主題
    const savedTheme = localStorage.getItem('theme') || 'arcane'
    setCurrentTheme(savedTheme)
    applyTheme(savedTheme)
  }, [])

  const applyTheme = (themeName) => {
    const theme = themes[themeName]
    if (!theme) return

    const root = document.documentElement
    Object.entries(theme.colors).forEach(([key, value]) => {
      root.style.setProperty(`--color-${key}`, value)
    })

    // 更新背景
    root.style.setProperty('--theme-background', theme.colors.background)
    root.style.setProperty('--theme-surface', theme.colors.surface)
  }

  const handleThemeChange = (themeName) => {
    setCurrentTheme(themeName)
    setIsOpen(false)
    applyTheme(themeName)
    localStorage.setItem('theme', themeName)
  }

  const currentThemeData = themes[currentTheme]

  return (
    <div className={classes.themeSwitcher}>
      <button
        className={classes.themeButton}
        onClick={() => setIsOpen(!isOpen)}
        title="切換主題"
      >
        <span className={classes.themeIcon}>{currentThemeData.icon}</span>
        <span className={classes.themeName}>{currentThemeData.name}</span>
        <span className={`${classes.dropdownArrow} ${isOpen ? classes.rotated : ''}`}>
          ▼
        </span>
      </button>

      {isOpen && (
        <div className={classes.themeDropdown}>
          <div className={classes.dropdownHeader}>
            <span className={classes.dropdownTitle}>選擇主題</span>
            <button
              className={classes.closeButton}
              onClick={() => setIsOpen(false)}
            >
              ✕
            </button>
          </div>
          
          <div className={classes.themeOptions}>
            {Object.entries(themes).map(([key, theme]) => (
              <button
                key={key}
                className={`${classes.themeOption} ${currentTheme === key ? classes.active : ''}`}
                onClick={() => handleThemeChange(key)}
                title={theme.description}
              >
                <span className={classes.optionIcon}>{theme.icon}</span>
                <div className={classes.optionContent}>
                  <span className={classes.optionName}>{theme.name}</span>
                  <span className={classes.optionDesc}>{theme.description}</span>
                </div>
                {currentTheme === key && (
                  <span className={classes.activeIndicator}>✓</span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default ThemeSwitcher 