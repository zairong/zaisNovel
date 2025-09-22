import React from 'react'
import classes from './Modal.module.scss'

function Modal({ open, title, message, confirmText = '確定', cancelText = '取消', onConfirm, onCancel, hideCancel = false }) {
  if (!open) return null

  return (
    <div className={classes.modalOverlay} onClick={onCancel}>
      <div className={classes.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={classes.modalHeader}>
          <h3>{title}</h3>
          <button className={classes.modalClose} onClick={onCancel}>✕</button>
        </div>
        <div className={classes.modalBody}>
          <p className={classes.modalMessage}>{message}</p>
        </div>
        <div className={classes.modalFooter}>
          {!hideCancel && (
            <button className={`${classes.modalBtn} ${classes.cancel}`} onClick={onCancel}> {cancelText} </button>
          )}
          <button className={`${classes.modalBtn} ${classes.confirm}`} onClick={onConfirm}> {confirmText} </button>
        </div>
      </div>
    </div>
  )
}

export default Modal


