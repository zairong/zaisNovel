import React, { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import bookService from '../../services/bookService'
import classes from './EbookEditor.module.scss'

function EbookEditor() {
  const { id } = useParams()
  const navigate = useNavigate()
  const editorRef = useRef(null)
  const previewRef = useRef(null)
  
  const [book, setBook] = useState(null)
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [saving, setSaving] = useState(false)
  
  // 編輯模式狀態
  const [editMode, setEditMode] = useState('split') // 'edit', 'preview', 'split'
  const [showToc, setShowToc] = useState(true)
  const [autoSave, setAutoSave] = useState(true)
  
  // 章節管理
  const [chapters, setChapters] = useState([])
  const [selectedChapter, setSelectedChapter] = useState(null)
  
  // 自動保存計時器
  const [autoSaveTimer, setAutoSaveTimer] = useState(null)
  
  // 新增狀態
  const [showShortcuts, setShowShortcuts] = useState(true)
  const [lastSaved, setLastSaved] = useState(null)
  const [wordCount, setWordCount] = useState(0)
  const [charCount, setCharCount] = useState(0)

  useEffect(() => {
    loadEbookContent()
  }, [id])

  useEffect(() => {
    if (content) {
      parseChapters()
      updateCounts()
    }
  }, [content])

  useEffect(() => {
    if (autoSave && content && !saving) {
      // 清除之前的計時器
      if (autoSaveTimer) {
        clearTimeout(autoSaveTimer)
      }
      
      // 設置新的自動保存計時器
      const timer = setTimeout(() => {
        handleAutoSave()
      }, 3000) // 3秒後自動保存
      
      setAutoSaveTimer(timer)
    }
    
    return () => {
      if (autoSaveTimer) {
        clearTimeout(autoSaveTimer)
      }
    }
  }, [content, autoSave])

  // 隱藏快捷鍵提示
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowShortcuts(false)
    }, 5000)
    
    return () => clearTimeout(timer)
  }, [])

  const updateCounts = () => {
    const words = content.trim() ? content.trim().split(/\s+/).length : 0
    const chars = content.length
    setWordCount(words)
    setCharCount(chars)
  }

  const loadEbookContent = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await bookService.readEbook(id)
      setBook(response.data)
      setContent(response.data.content || '')
      
    } catch (err) {
      if (err.message.includes('沒有電子書檔案')) {
        setError('這本書目前沒有電子書檔案。請先上傳電子書檔案。')
      } else {
        setError('載入電子書失敗：' + err.message)
      }
    } finally {
      setLoading(false)
    }
  }

  const parseChapters = () => {
    if (!content) return
    
    const lines = content.split('\n')
    const chapters = []
    let currentChapter = null
    let currentContent = []
    
    // 章節標題模式
    const chapterPatterns = [
      /^第[一二三四五六七八九十百千萬\d]+章\s*[^\n]*$/m,
      /^第[一二三四五六七八九十百千萬\d]+節\s*[^\n]*$/m,
      /^Chapter\s*\d+[^\n]*$/im,
      /^Section\s*\d+[^\n]*$/im,
      /^[\d]+\.\s*[^\n]+$/m,
      /^[一二三四五六七八九十]+\.\s*[^\n]+$/m
    ]
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      const isChapterTitle = chapterPatterns.some(pattern => pattern.test(line.trim()))
      
      if (isChapterTitle) {
        // 保存前一章
        if (currentChapter) {
          currentChapter.content = currentContent.join('\n')
          chapters.push(currentChapter)
        }
        
        // 開始新章節
        currentChapter = {
          title: line.trim(),
          lineNumber: i,
          content: ''
        }
        currentContent = []
      } else {
        currentContent.push(line)
      }
    }
    
    // 保存最後一章
    if (currentChapter) {
      currentChapter.content = currentContent.join('\n')
      chapters.push(currentChapter)
    }
    
    setChapters(chapters)
  }

  const generateToc = () => {
    if (chapters.length === 0) return ''
    
    let toc = '# 目錄\n\n'
    
    chapters.forEach((chapter, index) => {
      const chapterNumber = index + 1
      const cleanTitle = chapter.title.replace(/^第/, '').replace(/章.*$/, '章')
      const displayTitle = cleanTitle || `第${chapterNumber}章`
      const anchor = generateAnchor(displayTitle)
      
      toc += `${chapterNumber}. [${displayTitle}](#${anchor})\n`
    })
    
    return toc + '\n---\n\n'
  }

  const generateAnchor = (text) => {
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
      .replace(/^-+|-+$/g, '')
  }

  const handleContentChange = (e) => {
    const newContent = e.target.value
    setContent(newContent)
  }

  const handleAutoSave = async () => {
    if (!content.trim()) return
    
    try {
      setSaving(true)
      await bookService.updateEbookContent(id, content)
      setLastSaved(new Date())
      console.log('✅ 自動保存成功')
    } catch (err) {
      console.error('❌ 自動保存失敗:', err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleManualSave = async () => {
    if (!content.trim()) {
      setError('內容不能為空')
      return
    }
    
    try {
      setSaving(true)
      setError(null)
      
      await bookService.updateEbookContent(id, content)
      setLastSaved(new Date())
      alert('✅ 保存成功！')
      
    } catch (err) {
      setError('保存失敗：' + err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleAddChapter = () => {
    const chapterNumber = chapters.length + 1
    const newChapter = `第${chapterNumber}章 新章節\n\n在這裡添加章節內容...`
    
    const newContent = content + '\n\n' + newChapter
    setContent(newContent)
  }

  const handleInsertToc = () => {
    const toc = generateToc()
    const newContent = toc + content
    setContent(newContent)
  }

  const handleChapterClick = (chapter) => {
    setSelectedChapter(chapter)
    
    // 滾動到編輯器中的章節位置
    if (editorRef.current) {
      const lines = content.split('\n')
      let lineCount = 0
      
      for (let i = 0; i < chapter.lineNumber; i++) {
        lineCount += lines[i].length + 1 // +1 for newline
      }
      
      editorRef.current.setSelectionRange(lineCount, lineCount)
      editorRef.current.focus()
    }
  }

  // 獲取當前顯示的內容（根據選中的章節或完整內容）
  const getDisplayContent = () => {
    if (selectedChapter && (editMode === 'preview' || editMode === 'split')) {
      // 在預覽模式下，只顯示選中章節的內容
      return selectedChapter.content || content
    }
    return content
  }

  const handleKeyDown = (e) => {
    // Ctrl+S 保存
    if (e.ctrlKey && e.key === 's') {
      e.preventDefault()
      handleManualSave()
    }
    
    // Ctrl+Enter 切換預覽
    if (e.ctrlKey && e.key === 'Enter') {
      e.preventDefault()
      setEditMode(editMode === 'split' ? 'preview' : 'split')
    }
  }

  const formatLastSaved = () => {
    if (!lastSaved) return null
    return lastSaved.toLocaleTimeString('zh-TW', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className={classes.editorContainer}>
        <div className={classes.loadingContainer}>
          <div className={classes.loadingSpinner}>
            <div className={classes.spinnerAnimation}>⏳</div>
            <p>載入編輯器中...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={classes.editorContainer}>
        <div className={classes.errorContainer}>
          <div className={classes.errorIcon}>❌</div>
          <h3>載入失敗</h3>
          <p>{error}</p>
          <div className={classes.errorActions}>
            <button onClick={() => navigate('/books')} className={classes.btnBack}>
              返回書籍列表
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={classes.editorContainer}>
      {/* 編輯器工具列 */}
      <div className={classes.editorToolbar}>
        <div className={classes.toolbarLeft}>
          <button onClick={() => navigate('/books')} className={classes.btnBack}>
            ← 返回
          </button>
          <h2 className={classes.bookTitle}>{book?.title} - 編輯器</h2>
        </div>
        
        <div className={classes.toolbarCenter}>
          <div className={classes.editModeControls}>
            <button 
              onClick={() => setEditMode('edit')}
              className={`${classes.modeBtn} ${editMode === 'edit' ? classes.active : ''}`}
              title="純編輯模式"
            >
              ✏️ 編輯
            </button>
            <button 
              onClick={() => setEditMode('split')}
              className={`${classes.modeBtn} ${editMode === 'split' ? classes.active : ''}`}
              title="分割視窗模式"
            >
              📋 分割
            </button>
            <button 
              onClick={() => setEditMode('preview')}
              className={`${classes.modeBtn} ${editMode === 'preview' ? classes.active : ''}`}
              title="純預覽模式"
            >
              👁️ 預覽
            </button>
          </div>
          
          <div className={classes.toolControls}>
            <button onClick={handleAddChapter} className={classes.toolBtn} title="新增章節">
              ➕ 新增章節
            </button>
            <button onClick={handleInsertToc} className={classes.toolBtn} title="插入目錄">
              📋 插入目錄
            </button>
            <button 
              onClick={() => setShowToc(!showToc)}
              className={`${classes.toolBtn} ${showToc ? classes.active : ''}`}
              title="切換章節目錄"
            >
              📖 章節目錄
            </button>
          </div>
        </div>
        
        <div className={classes.toolbarRight}>
          <div className={classes.autoSaveControl}>
            <label title="自動保存功能">
              <input 
                type="checkbox" 
                checked={autoSave}
                onChange={(e) => setAutoSave(e.target.checked)}
              />
              自動保存
            </label>
            {saving && <span className={classes.savingIndicator}>💾 保存中...</span>}
            {lastSaved && !saving && (
              <span className={classes.lastSavedIndicator} title="最後保存時間">
                ✅ {formatLastSaved()}
              </span>
            )}
          </div>
          
          <button onClick={handleManualSave} className={classes.btnSave} disabled={saving} title="手動保存 (Ctrl+S)">
            💾 保存
          </button>
        </div>
      </div>

      {/* 主要內容區域 */}
      <div className={classes.contentContainer}>
        {/* 章節目錄側邊欄 */}
        {showToc && (
          <div className={classes.tocSidebar}>
            <div className={classes.tocHeader}>
              <h3>📚 章節目錄</h3>
              <span className={classes.chapterCount}>{chapters.length} 章</span>
            </div>
            
            <div className={classes.tocList}>
              {chapters.map((chapter, index) => (
                <div 
                  key={index}
                  className={`${classes.tocItem} ${selectedChapter === chapter ? classes.selected : ''}`}
                  onClick={() => handleChapterClick(chapter)}
                  title={`點擊跳轉到 ${chapter.title}`}
                >
                  <span className={classes.chapterNumber}>{index + 1}</span>
                  <span className={classes.chapterTitle}>{chapter.title}</span>
                </div>
              ))}
              
              {chapters.length === 0 && (
                <div className={classes.noChapters}>
                  <p>📝 尚未檢測到章節</p>
                  <button onClick={handleAddChapter} className={classes.btnAddChapter}>
                    ➕ 新增第一章
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 主要編輯區域 */}
        <div className={classes.mainEditor}>
        {editMode === 'edit' && (
          <div className={classes.editPanel}>
            <div className={classes.editorHeader}>
              <h3>✏️ Markdown 編輯器</h3>
              <div className={classes.editorInfo}>
                <span title="字數統計">📝 {wordCount} 字</span>
                <span title="字元統計">🔤 {charCount} 字元</span>
                <span title="行數統計">📄 {content.split('\n').length} 行</span>
              </div>
            </div>
            
            <textarea
              ref={editorRef}
              value={content}
              onChange={handleContentChange}
              onKeyDown={handleKeyDown}
              className={classes.markdownEditor}
              placeholder="在這裡編寫您的 Markdown 內容...

# 標題範例
## 子標題範例

- 列表項目 1
- 列表項目 2

**粗體文字** 和 *斜體文字*

> 引用區塊範例

`程式碼片段`

```javascript
// 程式碼區塊範例
console.log('Hello World!');
```"
            />
          </div>
        )}

        {editMode === 'preview' && (
          <div className={classes.previewPanel}>
            <div className={classes.previewHeader}>
              <h3>👁️ 預覽</h3>
              {selectedChapter && (
                <span className={classes.selectedChapterInfo}>
                  正在預覽: {selectedChapter.title}
                </span>
              )}
            </div>
            
            <div ref={previewRef} className={classes.markdownPreview}>
              <ReactMarkdown 
                remarkPlugins={[remarkGfm]}
                components={{
                  h1: ({node, ...props}) => <h1 style={{fontSize: '2em', marginTop: '1.5em'}} {...props} />,
                  h2: ({node, ...props}) => <h2 style={{fontSize: '1.5em', marginTop: '1.2em'}} {...props} />,
                  h3: ({node, ...props}) => <h3 style={{fontSize: '1.3em', marginTop: '1em'}} {...props} />,
                  p: ({node, ...props}) => <p style={{lineHeight: '1.8', marginBottom: '1em'}} {...props} />,
                  code: ({node, inline, ...props}) => 
                    inline ? 
                      <code style={{backgroundColor: '#f0f0f0', padding: '2px 4px', borderRadius: '3px'}} {...props} /> :
                      <pre style={{backgroundColor: '#f5f5f5', padding: '10px', borderRadius: '5px', overflow: 'auto'}}><code {...props} /></pre>,
                  a: ({node, ...props}) => <a style={{color: '#007bff', textDecoration: 'underline'}} {...props} />
                }}
              >
                {getDisplayContent()}
              </ReactMarkdown>
            </div>
          </div>
        )}

        {editMode === 'split' && (
          <>
            <div className={classes.editPanel}>
              <div className={classes.editorHeader}>
                <h3>✏️ 編輯</h3>
                <div className={classes.editorInfo}>
                  <span title="字數統計">📝 {wordCount} 字</span>
                  <span title="字元統計">🔤 {charCount} 字元</span>
                  <span title="行數統計">📄 {content.split('\n').length} 行</span>
                </div>
              </div>
              
              <textarea
                ref={editorRef}
                value={content}
                onChange={handleContentChange}
                onKeyDown={handleKeyDown}
                className={classes.markdownEditor}
                placeholder="在這裡編寫您的 Markdown 內容...

# 標題範例
## 子標題範例

- 列表項目 1
- 列表項目 2

**粗體文字** 和 *斜體文字*

> 引用區塊範例

`程式碼片段`

```javascript
// 程式碼區塊範例
console.log('Hello World!');
```"
              />
            </div>

            <div className={classes.previewPanel}>
              <div className={classes.previewHeader}>
                <h3>👁️ 預覽</h3>
                {selectedChapter && (
                  <span className={classes.selectedChapterInfo}>
                    正在預覽: {selectedChapter.title}
                  </span>
                )}
              </div>
              
              <div ref={previewRef} className={classes.markdownPreview}>
                <ReactMarkdown 
                  remarkPlugins={[remarkGfm]}
                  components={{
                    h1: ({node, ...props}) => <h1 style={{fontSize: '2em', marginTop: '1.5em'}} {...props} />,
                    h2: ({node, ...props}) => <h2 style={{fontSize: '1.5em', marginTop: '1.2em'}} {...props} />,
                    h3: ({node, ...props}) => <h3 style={{fontSize: '1.3em', marginTop: '1em'}} {...props} />,
                    p: ({node, ...props}) => <p style={{lineHeight: '1.8', marginBottom: '1em'}} {...props} />,
                    code: ({node, inline, ...props}) => 
                      inline ? 
                        <code style={{backgroundColor: '#f0f0f0', padding: '2px 4px', borderRadius: '3px'}} {...props} /> :
                        <pre style={{backgroundColor: '#f5f5f5', padding: '10px', borderRadius: '5px', overflow: 'auto'}}><code {...props} /></pre>,
                    a: ({node, ...props}) => <a style={{color: '#007bff', textDecoration: 'underline'}} {...props} />
                  }}
                >
                  {getDisplayContent()}
                </ReactMarkdown>
              </div>
            </div>
          </>
        )}
      </div>
      </div>

      {/* 快捷鍵提示 */}
      {showShortcuts && (
        <div className={classes.shortcuts}>
          <span title="保存文件">⌘S: 保存</span>
          <span title="切換預覽模式">⌘↵: 切換預覽</span>
        </div>
      )}
    </div>
  )
}

export default EbookEditor
