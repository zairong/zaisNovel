import React, { useState, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import classes from './ChapterTest.module.scss'

function ChapterTest() {
  const [content, setContent] = useState('')
  const [chapters, setChapters] = useState([])
  const [currentChapter, setCurrentChapter] = useState(0)
  const [showChapterSelector, setShowChapterSelector] = useState(false)
  const [currentPage, setCurrentPage] = useState(0)
  const [pages, setPages] = useState([])
  const [fontSize, setFontSize] = useState(16)

  // 測試用的電子書內容
  const testContent = `# 第一章：這隻水豚有點東西

Jack 感覺自己在飛。

不對，不是飛，是——墜落！

「哇啊啊啊啊啊——！」

「砰！」

他狠狠摔在地上，吃了一嘴的土。

「靠，穿越了？」Jack 持懷疑態度地爬起來，結果映入眼簾的是一隻…… 卡比巴拉？！

一隻毛茸茸、圓滾滾的大水豚，正淡定地看著他，嘴裡還叼著一根不知從哪來的靈草，像個隨時準備退休的養老神獸。

「汝，已與吾契約。」

水豚突然開口說話，語氣深沉，彷彿隱藏著億萬年的智慧。

Jack：？？？？？

「你誰啊？」

「吾名——卡比巴拉君，此世唯一的'摸魚神獸'。」

Jack 愣了一下，低頭看了看自己，發現手背上真的出現了一個閃閃發光的契約印記。

「……所以，我現在是你的主人？」

卡比巴拉君慢條斯理地點了點頭，「不錯，然後按照契約，我可以庇護你，助你成長。」

Jack 聞言，興奮起來：「真的假的？那你很強嘍？」

「強。」卡比巴拉君點頭。

「那你能讓我變成絕世高手嗎？」Jack 期待地問。

卡比巴拉君：「……不能。」

Jack：「？？？」

水豚優雅地咀嚼著靈草，語氣平靜：「吾之力量，來自'絕對的安逸'。只要吾夠懶，敵人就會自行敗退。」

Jack：「……」

他低頭看了看這隻正翹著二郎腿、吃著靈草、享受午後微風的神獸，突然覺得，自己大概拿到了最廢的開局。

然而，就在此時——

「叮！」

一道虛幻的聲音在他腦海中響起：

【你的獸寵「卡比巴拉君」成功發動'不戰而勝'，擊敗了周圍所有潛伏的敵人。】

Jack：「？」

「叮！」

【你吸收了敵人死亡後的能量，境界突破至——鍛體五重天！】

Jack：「？？？？」

「叮！」

【你的獸寵「卡比巴拉君」躺平了一分鐘，你獲得了'摸魚悟道'能力！】

Jack：「……等一下，我怎麼什麼都沒做就變強了？！」

卡比巴拉君淡淡地瞥了他一眼：「這就是'摸魚神獸'的力量。」

Jack：「……」

這不會真讓他 光躺平就能成無敵大佬吧？！

——（第一章完）——

## 第二章：這是在耍我嗎？！

Jack 盯著眼前這隻悠哉啃靈草的卡比巴拉，深深感覺到了世界的惡意。

「你真的能保護我？」Jack 試探性地問。

「當然。」卡比巴拉君懶洋洋地回應，「事實證明，你剛剛突破了。」

Jack：「……」

他低頭看了看自己的手掌，明顯感覺到體內有一股狂暴的力量在流動，比剛剛強了好幾倍！

這就突破了？

我什麼都沒做啊？！

就在 Jack 陷入沉思的時候，遠方突然傳來一陣密集的腳步聲。

「站住！此地是我們'狂刀門'的地盤，所有外來者……嗯？」

話還沒說完，Jack 看到一群凶神惡煞的武者衝了過來，為首的男人目光如刀，帶著一絲戲謔的笑容，看著 Jack 和他的卡比巴拉。

「小子，看你這裝扮，不像我們這片區域的人，莫非是剛來的？」

Jack 心中一緊，這些人看起來來者不善。

然而，就在此時，卡比巴拉君慢悠悠地站了起來，伸了個懶腰。

「吾主，交給吾吧。」

說完，卡比巴拉君就這麼躺在了地上，開始打呼嚕。

Jack：「……」

狂刀門的武者們：「……」

「哈哈哈！」為首的男人大笑起來，「就這？一隻會睡覺的豬？」

然而，就在他話音剛落的時候，卡比巴拉君突然睜開了眼睛。

「吾不是豬，吾是卡比巴拉。」

說完，卡比巴拉君又閉上了眼睛，繼續睡覺。

但是，奇怪的事情發生了。

那些凶神惡煞的武者們，突然感覺到了一股莫名的壓力，彷彿有什麼無形的力量在壓迫著他們。

「這……這是什麼感覺？」

「好可怕……」

「我們快跑吧！」

就這樣，一群凶神惡煞的武者，被一隻睡覺的卡比巴拉嚇跑了。

Jack：「……」

——（第二章完）——

### 第三章：摸魚也能變強

經過這次事件，Jack 終於明白了卡比巴拉君的強大。

「原來你的力量真的來自於'絕對的安逸'啊！」Jack 感嘆道。

卡比巴拉君點了點頭，「不錯，只要吾夠懶，敵人就會自行敗退。」

Jack：「……」

這邏輯，好像沒毛病？

就在此時，系統提示音再次響起：

「叮！」

【你的獸寵「卡比巴拉君」成功發動'躺平威壓'，嚇跑了所有敵人！】

【你獲得了'摸魚修煉法'！】

【你的境界提升至——鍛體七重天！】

Jack：「……」

這也行？

卡比巴拉君淡淡地說道：「這就是摸魚神獸的奧義，躺平即修煉，睡覺即變強。」

Jack 無語地看著這隻悠哉的神獸，突然覺得，也許這樣也不錯？

至少，他不用像其他穿越者一樣，每天拼命修煉，還要面對各種危險。

他只需要躺平，然後讓卡比巴拉君保護他就行了。

「好吧，那我就接受這個設定吧。」Jack 無奈地說道。

卡比巴拉君滿意地點了點頭，「孺子可教也。」

就這樣，Jack 開始了他的摸魚修煉之路。

——（第三章完）——

#### 第四章：摸魚神獸的日常

自從接受了摸魚修煉的設定後，Jack 的生活變得異常悠閒。

每天，他只需要：

1. 找個舒服的地方躺下
2. 讓卡比巴拉君在旁邊睡覺
3. 等待系統提示音響起
4. 變強

就這樣，Jack 的實力每天都在穩步提升。

「這簡直就是最輕鬆的修煉方式啊！」Jack 感嘆道。

卡比巴拉君：「當然，這就是摸魚神獸的奧義。」

就這樣，Jack 和卡比巴拉君過著悠閒的摸魚生活。

——（第四章完）——

##### 第五章：摸魚也能成神

經過一段時間的摸魚修煉，Jack 的實力已經達到了驚人的地步。

「叮！」

【恭喜宿主，你的境界已突破至——神境！】

Jack：「……」

這也行？

卡比巴拉君：「當然，這就是摸魚神獸的終極奧義。」

就這樣，Jack 成為了史上第一個靠摸魚成神的人。

——（全書完）——`

  useEffect(() => {
    setContent(testContent)
  }, [])

  useEffect(() => {
    if (content) {
      parseChapters()
      createPages()
    }
  }, [content, fontSize])

  // 解析章節
  const parseChapters = () => {
    if (!content) return

    const chapterRegex = /^(#{1,6})\s+(.+)$/gm
    const chapterList = []
    let match

    while ((match = chapterRegex.exec(content)) !== null) {
      const level = match[1].length
      const title = match[2].trim()
      const position = match.index
      
      chapterList.push({
        level,
        title,
        position,
        pageIndex: findPageByPosition(position)
      })
    }

    setChapters(chapterList)
  }

  // 根據位置找到對應的頁面索引
  const findPageByPosition = (position) => {
    if (!pages.length) return 0
    
    let currentPos = 0
    for (let i = 0; i < pages.length; i++) {
      currentPos += pages[i].length + 1 // +1 for newline
      if (currentPos >= position) {
        return i
      }
    }
    return pages.length - 1
  }

  // 創建頁面
  const createPages = () => {
    if (!content) return

    const sections = content.split(/(?=^#{1,6}\s)/m)
    const pages = []
    let currentPageContent = ''
    let currentHeight = 0
    const lineHeight = fontSize * 1.8
    const pageHeight = 600 // 固定頁面高度

    sections.forEach((section) => {
      const sectionLines = section.split('\n')
      let sectionContent = ''
      
      sectionLines.forEach((line) => {
        const lineHeightPx = line ? lineHeight : lineHeight * 0.5
        
        if (currentHeight + lineHeightPx > pageHeight && currentPageContent.trim()) {
          pages.push(currentPageContent.trim())
          currentPageContent = line
          currentHeight = lineHeightPx
        } else {
          currentPageContent += (currentPageContent ? '\n' : '') + line
          currentHeight += lineHeightPx
        }
      })
    })

    if (currentPageContent.trim()) {
      pages.push(currentPageContent.trim())
    }

    setPages(pages)
  }

  // 跳轉到指定章節
  const jumpToChapter = (chapterIndex) => {
    if (chapterIndex >= 0 && chapterIndex < chapters.length) {
      const chapter = chapters[chapterIndex]
      setCurrentPage(chapter.pageIndex)
      setCurrentChapter(chapterIndex)
      setShowChapterSelector(false)
    }
  }

  // 獲取當前章節
  const getCurrentChapter = () => {
    if (chapters.length === 0) return null
    
    for (let i = chapters.length - 1; i >= 0; i--) {
      if (chapters[i].pageIndex <= currentPage) {
        return chapters[i]
      }
    }
    return chapters[0]
  }

  const currentChapterInfo = getCurrentChapter()

  return (
    <div className={classes.chapterTest}>
      <div className={classes.header}>
        <h1>章節選擇功能測試</h1>
        <div className={classes.controls}>
          <button 
            onClick={() => setShowChapterSelector(!showChapterSelector)}
            className={classes.chapterBtn}
          >
            📖 章節選擇 ({chapters.length} 章)
          </button>
          <div className={classes.fontControls}>
            <button onClick={() => setFontSize(Math.max(12, fontSize - 2))}>A-</button>
            <span>{fontSize}px</span>
            <button onClick={() => setFontSize(Math.min(24, fontSize + 2))}>A+</button>
          </div>
        </div>
      </div>

      {/* 章節選擇器 */}
      {showChapterSelector && (
        <div className={classes.chapterSelector}>
          <div className={classes.chapterSelectorHeader}>
            <h3>章節選擇</h3>
            <button onClick={() => setShowChapterSelector(false)}>✕</button>
          </div>
          <div className={classes.chapterList}>
            {chapters.map((chapter, index) => (
              <button
                key={index}
                onClick={() => jumpToChapter(index)}
                className={`${classes.chapterItem} ${
                  index === currentChapter ? classes.activeChapter : ''
                }`}
                style={{ paddingLeft: `${(chapter.level - 1) * 20}px` }}
              >
                <span className={classes.chapterTitle}>{chapter.title}</span>
                <span className={classes.chapterPage}>第 {chapter.pageIndex + 1} 頁</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 閱讀區域 */}
      <div className={classes.readerContent}>
        {pages.length > 0 ? (
          <div className={classes.contentText} style={{ fontSize: `${fontSize}px` }}>
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {pages[currentPage] || ''}
            </ReactMarkdown>
          </div>
        ) : (
          <div className={classes.loadingContent}>正在處理內容...</div>
        )}
      </div>

      {/* 頁面控制 */}
      <div className={classes.pageControls}>
        <button 
          onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
          disabled={currentPage === 0}
        >
          ← 上一頁
        </button>
        
        <div className={classes.pageInfo}>
          <span>第 {currentPage + 1} / {pages.length} 頁</span>
          {currentChapterInfo && (
            <span className={classes.currentChapter}>
              當前章節：{currentChapterInfo.title}
            </span>
          )}
        </div>
        
        <button 
          onClick={() => setCurrentPage(Math.min(pages.length - 1, currentPage + 1))}
          disabled={currentPage === pages.length - 1}
        >
          下一頁 →
        </button>
      </div>
    </div>
  )
}

export default ChapterTest
