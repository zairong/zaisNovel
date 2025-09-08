import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import classes from '../UI/Pages.module.scss'

function AuthorApplication() {
  const navigate = useNavigate()
  const { handleApplyForAuthor, updateAuthState } = useAuth()
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!termsAccepted) {
      setError('請先勾選同意條款')
      return
    }

    setSubmitting(true)
    const result = await handleApplyForAuthor({ termsAccepted })
    setSubmitting(false)

    if (result?.success) {
      // 後端會回傳新 token 與 user，但我們已在 authService 內更新狀態
      // 這裡確保前端權限立即刷新
      updateAuthState()
      navigate('/ebooks', { replace: true })
    } else {
      setError(result?.message || '申請失敗，請稍後再試')
    }
  }

  return (
    <div className={classes.pageContainer}>
      <div className={classes.pageHeader}>
        <div className={classes.headerContent}>
          <h2>📝 申請成為作者</h2>
        </div>
      </div>

      {error && (
        <div className={classes.errorMessage}>
          <span>❌ {error}</span>
          <button onClick={() => setError('')} className={classes.closeError}>✕</button>
        </div>
      )}

      <form onSubmit={handleSubmit} className={classes.bookForm}>
        <div className={classes.formGroup}>
          <label>
            <input
              type="checkbox"
              checked={termsAccepted}
              onChange={(e) => setTermsAccepted(e.target.checked)}
            />
            <span style={{ marginLeft: 8 }}>
              我已閱讀並同意作者使用條款，了解升級後可上傳與管理自己的電子書。
            </span>
          </label>
        </div>

        <div className={classes.formActions}>
          <button type="submit" className={classes.btnPrimary} disabled={!termsAccepted || submitting}>
            {submitting ? '⏳ 提交中...' : '立即升級為作者'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default AuthorApplication
