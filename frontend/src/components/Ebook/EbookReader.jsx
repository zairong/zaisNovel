import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import bookService from '../../services/bookService';
import userBookService from '../../services/userBookService';
import classes from './EbookReader.module.scss';

function EbookReader() {
  const { id } = useParams();
  const navigate = useNavigate();
  const contentRef = useRef(null);
  
  // console.log('EbookReader component initialized with id:', id);

  const [book, setBook] = useState(null);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fontSize, setFontSize] = useState(16);
  const [theme, setTheme] = useState(() => {
    try {
      const saved = localStorage.getItem('ebookReaderTheme') || localStorage.getItem('theme');
      if (saved === 'light' || saved === 'dark') return saved;
    } catch (_) {}
    return 'dark';
  });
  const [isFullscreen, setIsFullscreen] = useState(false);

  // 主題持久化：每次變更時儲存
  useEffect(() => {
    try {
      localStorage.setItem('ebookReaderTheme', theme);
    } catch (_) {
      // 忽略存取失敗
    }
  }, [theme]);

  // 全螢幕功能 - 針對 ebookReader 元素
  const ebookReaderRef = useRef(null);
  
  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        if (ebookReaderRef.current) {
          await ebookReaderRef.current.requestFullscreen();
          setIsFullscreen(true);
        }
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch (error) {
      console.error('全螢幕切換失敗:', error);
    }
  };

  // 監聽全螢幕狀態變化
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  // 分頁相關狀態
  const [currentPage, setCurrentPage] = useState(0);
  const [pages, setPages] = useState([]);
  const [pageHeight, setPageHeight] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [pagePositions, setPagePositions] = useState([]); // 記錄每個頁面在原始內容中的位置

  // 章節相關狀態
  const [chapters, setChapters] = useState([]);
  const [currentChapter, setCurrentChapter] = useState(0);
  const [selectedChapter, setSelectedChapter] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true); // 預設開啟側邊欄
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false); // 側邊欄縮放狀態

  // 觸控翻頁相關狀態
  const [touchStart, setTouchStart] = useState({ x: 0, y: 0 });
  const [touchEnd, setTouchEnd] = useState({ x: 0, y: 0 });
  const [isSwiping, setIsSwiping] = useState(false);
  const [pinchStart, setPinchStart] = useState({ distance: 0, scale: 1 });
  const [currentScale, setCurrentScale] = useState(1);
  const [isPinching, setIsPinching] = useState(false);

  // 閱讀進度儲存相關狀態
  const [savingProgress, setSavingProgress] = useState(false);
  const [lastSavedProgress, setLastSavedProgress] = useState(0);
  const [autoSaveTimer, setAutoSaveTimer] = useState(null);
  const [userReadingProgress, setUserReadingProgress] = useState(0); // 新增：用戶閱讀進度

  useEffect(() => {
    // console.log('=== EbookReader useEffect triggered ===');
    // console.log('ID:', id);
    // console.log('Loading ebook content...');
    loadEbookContent();
    loadUserReadingProgress(); // 新增：載入用戶的閱讀進度
  }, [id]);

  useEffect(() => {
    // console.log('useEffect triggered - content:', !!content, 'pageHeight:', pageHeight);
    if (content && pageHeight > 0) {
      // console.log('Calling createPages and parseChapters');
      createPages();
    }
  }, [content, pageHeight, fontSize]);

  // 當頁面創建完成後解析章節
  useEffect(() => {
    if (pages.length > 0 && pagePositions.length > 0) {
      // console.log('Pages created, parsing chapters');
      parseChapters();
    }
  }, [pages, pagePositions]);

  useEffect(() => {
    const handleResize = () => {
      calculatePageHeight();
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 解析章節
  const parseChapters = () => {
    if (!content) {
      // console.log('No content to parse chapters');
      return;
    }

    // console.log('Content length:', content.length);
    // console.log('Content preview:', content.substring(0, 500));
    // console.log('Content type:', typeof content);

    // 改進的章節正則表達式，支援更多格式
    const chapterRegex = /^(#{1,6})\s+(.+)$/gm;
    const chineseChapterRegex = /^(第[一二三四五六七八九十\d]+[章节篇]|第\d+[章节篇]|[一二三四五六七八九十]+[、.．]\s*|Chapter\s*\d+|CHAPTER\s*\d+)\s*(.+)$/gm;
    const simpleChapterRegex = /^(第\d+[章节篇])\s*(.+)$/gm;
    
    const chapterList = [];
    let match;

    // 首先嘗試 Markdown 格式的標題
    // console.log('Trying Markdown chapter format...');
    while ((match = chapterRegex.exec(content)) !== null) {
      const level = match[1].length;
      const title = match[2].trim();
      const position = match.index;

      // console.log('Found Markdown chapter:', { level, title, position });

      chapterList.push({
        level,
        title,
        position,
        pageIndex: findPageByPosition(position)
      });
    }

    // 如果沒有找到 Markdown 格式的章節，嘗試中文章節格式
    if (chapterList.length === 0) {
      // console.log('No Markdown chapters found, trying Chinese chapter formats...');
      
      // 重置正則表達式的 lastIndex
      chineseChapterRegex.lastIndex = 0;
      
      while ((match = chineseChapterRegex.exec(content)) !== null) {
        const fullMatch = match[0];
        const title = match[2] ? match[2].trim() : fullMatch.trim();
        const position = match.index;

        // console.log('Found Chinese chapter:', { title, position });

        chapterList.push({
          level: 1, // 預設為一級標題
          title,
          position,
          pageIndex: findPageByPosition(position)
        });
      }
    }

    // 如果還是沒有找到章節，嘗試簡單的數字章節格式
    if (chapterList.length === 0) {
      // console.log('No Chinese chapters found, trying simple number formats...');
      
      // 重置正則表達式的 lastIndex
      simpleChapterRegex.lastIndex = 0;
      
      while ((match = simpleChapterRegex.exec(content)) !== null) {
        const fullMatch = match[0];
        const title = match[2] ? match[2].trim() : fullMatch.trim();
        const position = match.index;

        // console.log('Found simple chapter:', { title, position });

        chapterList.push({
          level: 1,
          title,
          position,
          pageIndex: findPageByPosition(position)
        });
      }
    }

    // 如果還是沒有找到章節，嘗試更寬鬆的匹配
    if (chapterList.length === 0) {
      // console.log('No chapters found with standard patterns, trying loose matching...');
      
      // 尋找包含"章"、"節"、"篇"的行
      const looseRegex = /^.*[章节篇].*$/gm;
      const lines = content.split('\n');
      
      // console.log('Total lines in content:', lines.length);
      // console.log('First 10 lines:', lines.slice(0, 10));
      
      lines.forEach((line, index) => {
        const trimmedLine = line.trim();
        if (looseRegex.test(trimmedLine) && trimmedLine.length > 0) {
          const title = trimmedLine;
          const position = content.indexOf(line);
          
          // console.log('Found loose chapter:', { title, position, lineNumber: index });
          
          chapterList.push({
            level: 1,
            title,
            position,
            pageIndex: findPageByPosition(position)
          });
        }
      });
    }

    // 最後嘗試：尋找任何以數字開頭的行
    if (chapterList.length === 0) {
      // console.log('No chapters found with loose patterns, trying number-based matching...');
      
      const numberRegex = /^(\d+[、.．]\s*)(.+)$/gm;
      
      while ((match = numberRegex.exec(content)) !== null) {
        const title = match[2].trim();
        const position = match.index;

        // console.log('Found number-based chapter:', { title, position });

        chapterList.push({
          level: 1,
          title,
          position,
          pageIndex: findPageByPosition(position)
        });
      }
    }

    // console.log('Final parsed chapters:', chapterList);
    // console.log('Total chapters found:', chapterList.length);
    // console.log('Setting chapters state...');
    setChapters(chapterList);
    // console.log('Chapters state set, length:', chapterList.length);
  };

  // 根據位置找到對應的頁面索引
  const findPageByPosition = (position) => {
    if (!pages.length || !content || !pagePositions.length) return 0;

    // 使用二分搜尋來找到最接近的頁面
    let left = 0;
    let right = pagePositions.length - 1;
    let bestMatch = 0;

    while (left <= right) {
      const mid = Math.floor((left + right) / 2);
      
      if (pagePositions[mid] <= position) {
        bestMatch = mid;
        left = mid + 1;
      } else {
        right = mid - 1;
      }
    }

    return bestMatch;
  };

  // 自動儲存閱讀進度
  const saveReadingProgress = useCallback(async (progress) => {
    if (savingProgress) return;
    
    try {
      setSavingProgress(true);
      const result = await userBookService.updateBookStatus(id, { reading_progress: progress });
      
      if (result.success) {
        setLastSavedProgress(progress);
        console.log('閱讀進度已儲存:', progress + '%');
      } else {
        console.error('儲存閱讀進度失敗:', result.message);
      }
    } catch (error) {
      console.error('儲存閱讀進度錯誤:', error);
    } finally {
      setSavingProgress(false);
    }
  }, [id, savingProgress]);

  // 立即儲存閱讀進度（用於頁面離開時）
  const saveReadingProgressImmediately = useCallback(async (progress) => {
    try {
      console.log('立即儲存閱讀進度:', progress + '%');
      const result = await userBookService.updateBookStatus(id, { reading_progress: progress });
      
      if (result.success) {
        console.log('閱讀進度已立即儲存:', progress + '%');
      } else {
        console.error('立即儲存閱讀進度失敗:', result.message);
      }
    } catch (error) {
      console.error('立即儲存閱讀進度錯誤:', error);
    }
  }, [id]);

  // 設置自動儲存計時器
  const setupAutoSave = useCallback((progress) => {
    // 清除現有計時器
    if (autoSaveTimer) {
      clearTimeout(autoSaveTimer);
    }
    
    // 設置新的計時器，3秒後自動儲存
    const timer = setTimeout(() => {
      saveReadingProgress(progress);
    }, 3000);
    
    setAutoSaveTimer(timer);
  }, [autoSaveTimer, saveReadingProgress]);

  // 跳轉到指定章節
  const jumpToChapter = (chapterIndex) => {
    if (chapterIndex >= 0 && chapterIndex < chapters.length) {
      const chapter = chapters[chapterIndex];
      setCurrentPage(chapter.pageIndex);
      setCurrentChapter(chapterIndex);
      setSelectedChapter(chapter);
      
      // 觸發自動儲存進度
      const newProgress = Math.round(((chapter.pageIndex + 1) / totalPages) * 100);
      // 立即儲存進度，確保不會丟失
      saveReadingProgress(newProgress);
      // 同時設置自動儲存計時器作為備份
      setupAutoSave(newProgress);
      
      // console.log('Jumped to chapter:', chapter.title, 'page:', chapter.pageIndex);
    }
  };

  // 跳轉到下一章
  const nextChapter = () => {
    if (currentChapter < chapters.length - 1) {
      jumpToChapter(currentChapter + 1);
    }
  };

  // 跳轉到上一章
  const previousChapter = () => {
    if (currentChapter > 0) {
      jumpToChapter(currentChapter - 1);
    }
  };

  // 清除選中的章節（返回完整內容顯示）
  const clearSelectedChapter = () => {
    setSelectedChapter(null);
    // console.log('Cleared selected chapter');
  };

  // 檢查當前頁面是否在選中章節範圍內
  const isPageInSelectedChapter = (pageIndex) => {
    if (!selectedChapter) return false;
    
    const chapterStart = selectedChapter.pageIndex;
    const nextChapter = chapters.find((ch, index) => 
      ch.pageIndex > chapterStart && index > chapters.indexOf(selectedChapter)
    );
    const chapterEnd = nextChapter ? nextChapter.pageIndex : totalPages;
    
    return pageIndex >= chapterStart && pageIndex < chapterEnd;
  };

  // 更新當前章節狀態
  const updateCurrentChapter = () => {
    if (chapters.length === 0) return;
    
    for (let i = chapters.length - 1; i >= 0; i--) {
      if (chapters[i].pageIndex <= currentPage) {
        if (currentChapter !== i) {
          setCurrentChapter(i);
          // console.log('Updated current chapter to:', chapters[i].title);
        }
        break;
      }
    }
  };

  // 當頁面改變時更新章節狀態
  useEffect(() => {
    updateCurrentChapter();
  }, [currentPage, chapters]);

  // 當有選中章節時，檢查是否需要清除選中狀態
  useEffect(() => {
    if (selectedChapter && !isPageInSelectedChapter(currentPage)) {
      // console.log('Page out of selected chapter range, clearing selection');
      setSelectedChapter(null);
    }
  }, [currentPage, selectedChapter]);

  // 組件卸載時清理計時器並立即儲存進度
  useEffect(() => {
    // 添加頁面離開事件監聽器
    const handleBeforeUnload = () => {
      const currentProgress = getReadingProgress();
      if (currentProgress > 0) {
        console.log('頁面離開時立即儲存進度:', currentProgress + '%');
        // 使用立即儲存函數
        saveReadingProgressImmediately(currentProgress);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      if (autoSaveTimer) {
        clearTimeout(autoSaveTimer);
      }
      
      // 組件卸載時立即儲存當前進度
      const currentProgress = getReadingProgress();
      if (currentProgress > 0) {
        console.log('組件卸載時立即儲存進度:', currentProgress + '%');
        saveReadingProgressImmediately(currentProgress);
      }

      // 移除事件監聽器
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [autoSaveTimer, lastSavedProgress, id]);

  // 切換側邊欄開關
  const toggleSidebar = () => {
    // console.log('toggleSidebar called, current sidebarOpen:', sidebarOpen);
    setSidebarOpen(!sidebarOpen);
    // console.log('sidebarOpen will be set to:', !sidebarOpen);
  };

  // 切換側邊欄縮放
  const toggleSidebarCollapse = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  // 從側邊欄選擇章節
  const selectChapterFromSidebar = (chapterIndex) => {
    jumpToChapter(chapterIndex);
  };

  const calculatePageHeight = () => {
    // console.log('calculatePageHeight called, contentRef.current:', !!contentRef.current);
    if (contentRef.current) {
      const toolbarHeight = 80;
      const infoBarHeight = 80;
      const pageControlsHeight = 80;
      const bottomMargin = 80;
      const padding = 40;

      const availableHeight = window.innerHeight - toolbarHeight - infoBarHeight - pageControlsHeight - bottomMargin - padding;
      // console.log('Calculated page height:', availableHeight);
      setPageHeight(availableHeight);
    } else {
      // console.log('contentRef.current is null, setting default height');
      setPageHeight(600);
    }
  };

  const createPages = () => {
    if (!content || pageHeight <= 0) return;

    const sections = content.split(/(?=^#{1,6}\s)/m);
    const pages = [];
    const pagePositions = []; // 記錄每個頁面在原始內容中的位置
    let currentPageContent = '';
    let currentHeight = 0;
    let currentPosition = 0; // 追蹤在原始內容中的位置
    const lineHeight = fontSize * 1.8;

    sections.forEach((section) => {
      const sectionLines = section.split('\n');

      sectionLines.forEach((line) => {
        const lineHeightPx = line ? lineHeight : lineHeight * 0.5;

        if (currentHeight + lineHeightPx > pageHeight && currentPageContent.trim()) {
          pages.push(currentPageContent.trim());
          pagePositions.push(currentPosition - currentPageContent.length);
          currentPageContent = line;
          currentHeight = lineHeightPx;
        } else {
          currentPageContent += (currentPageContent ? '\n' : '') + line;
          currentHeight += lineHeightPx;
        }
        currentPosition += line.length + 1; // +1 for newline
      });
    });

    if (currentPageContent.trim()) {
      pages.push(currentPageContent.trim());
      pagePositions.push(currentPosition - currentPageContent.length);
    }

    // console.log('Created pages:', pages.length);
    // console.log('Page positions:', pagePositions);

    setPages(pages);
    setTotalPages(pages.length);
    setCurrentPage(0);
    
    // 將頁面位置信息存儲在組件狀態中
    setPagePositions(pagePositions);
  };

  const loadEbookContent = async () => {
    // console.log('=== loadEbookContent called ===');
    try {
      setLoading(true);
      setError(null);

      // console.log('Making API call to readEbook...');
      const response = await bookService.readEbook(id);
      // console.log('API response received:', response.data);
      // console.log('Book content length:', response.data.content ? response.data.content.length : 0);
      // console.log('Book content preview:', response.data.content ? response.data.content.substring(0, 300) : 'No content');
      
      setBook(response.data);
      setContent(response.data.content);

      setTimeout(() => {
        calculatePageHeight();
      }, 100);
    } catch (err) {
      // console.log('=== API ERROR ===');
      // console.log('Error:', err);
      if (err.message.includes('沒有電子書檔案')) {
        setError('這本書目前沒有電子書檔案。請先上傳電子書檔案。');
      } else {
        setError('載入電子書失敗：' + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    try {
      const result = await bookService.downloadEbook(id);
      // 下載後重新取得書籍資訊，更新下載次數（每日唯一去重可能不會變動）
      try {
        const fresh = await bookService.getBook(id);
        setBook(prev => {
          const patched = { ...prev, ...fresh };
          if (result && typeof result.download_count === 'number') patched.download_count = result.download_count;
          if (result && typeof result.view_count === 'number') patched.view_count = result.view_count;
          return patched;
        });
      } catch (_) {}
    } catch (err) {
      setError('下載失敗：' + err.message);
    }
  };

  const handlePreviousPage = useCallback(() => {
    if (currentPage > 0) {
      console.log('Previous page triggered:', currentPage + 1, '->', currentPage);
      const newPage = currentPage - 1;
      setCurrentPage(newPage);
      
      // 翻頁時清除章節選擇，確保正常翻頁
      if (selectedChapter) {
        console.log('Clearing selected chapter due to page navigation');
        setSelectedChapter(null);
      }
      
      // 觸發自動儲存進度
      const newProgress = Math.round(((newPage + 1) / totalPages) * 100);
      console.log('Saving new progress:', newProgress + '%');
      // 立即儲存進度，確保不會丟失
      saveReadingProgress(newProgress);
      // 同時設置自動儲存計時器作為備份
      setupAutoSave(newProgress);
    } else {
      console.log('Cannot go to previous page: already at first page');
    }
  }, [currentPage, selectedChapter, totalPages, setupAutoSave, saveReadingProgress]);

  const handleNextPage = useCallback(() => {
    if (currentPage < totalPages - 1) {
      console.log('Next page triggered:', currentPage + 1, '->', currentPage + 2);
      const newPage = currentPage + 1;
      setCurrentPage(newPage);
      
      // 翻頁時清除章節選擇，確保正常翻頁
      if (selectedChapter) {
        console.log('Clearing selected chapter due to page navigation');
        setSelectedChapter(null);
      }
      
      // 觸發自動儲存進度
      const newProgress = Math.round(((newPage + 1) / totalPages) * 100);
      console.log('Saving new progress:', newProgress + '%');
      // 立即儲存進度，確保不會丟失
      saveReadingProgress(newProgress);
      // 同時設置自動儲存計時器作為備份
      setupAutoSave(newProgress);
    } else {
      console.log('Cannot go to next page: already at last page');
    }
  }, [currentPage, totalPages, selectedChapter, setupAutoSave, saveReadingProgress]);

  const handleKeyPress = useCallback((e) => {
    // console.log('Key pressed:', e.key);
    if (e.key === 'ArrowLeft') {
      handlePreviousPage();
    } else if (e.key === 'ArrowRight' || e.key === ' ') {
      handleNextPage();
    } else if (e.key === 'c' || e.key === 'C') {
      // console.log('C key pressed, toggling sidebar');
      toggleSidebar();
    }
  }, [handlePreviousPage, handleNextPage, toggleSidebar]);

  // 觸控翻頁功能
  const handleTouchStart = (e) => {
    const touch = e.touches[0];
    setTouchStart({ x: touch.clientX, y: touch.clientY });
    setTouchEnd({ x: touch.clientX, y: touch.clientY });
    setIsSwiping(false);
    
    // 雙指觸控檢測
    if (e.touches.length === 2) {
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const distance = Math.sqrt(
        Math.pow(touch1.clientX - touch2.clientX, 2) +
        Math.pow(touch1.clientY - touch2.clientY, 2)
      );
      setPinchStart({ distance, scale: currentScale });
      setIsPinching(true);
    }
  };

  const handleTouchMove = (e) => {
    const touch = e.touches[0];
    setTouchEnd({ x: touch.clientX, y: touch.clientY });
    setIsSwiping(true);

    const distanceX = Math.abs(touchStart.x - touch.clientX);
    const distanceY = Math.abs(touchStart.y - touch.clientY);

    // 雙指縮放處理
    if (e.touches.length === 2 && isPinching) {
      e.preventDefault();
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const currentDistance = Math.sqrt(
        Math.pow(touch1.clientX - touch2.clientX, 2) +
        Math.pow(touch1.clientY - touch2.clientY, 2)
      );
      
      const scale = (currentDistance / pinchStart.distance) * pinchStart.scale;
      const clampedScale = Math.max(0.5, Math.min(3, scale));
      setCurrentScale(clampedScale);
    } else if (distanceX > distanceY && distanceX > 10) {
      e.preventDefault();
    }
  };

  const handleTouchEnd = () => {
    if (!isSwiping && !isPinching) return;

    if (isPinching) {
      setIsPinching(false);
      return;
    }

    const minSwipeDistance = 50;
    const distanceX = touchStart.x - touchEnd.x;
    const distanceY = touchStart.y - touchEnd.y;

    if (Math.abs(distanceX) > Math.abs(distanceY) && Math.abs(distanceX) > minSwipeDistance) {
      // console.log('Touch swipe detected:', distanceX > 0 ? 'next' : 'previous');
      if (distanceX > 0) {
        handleNextPage();
      } else {
        handlePreviousPage();
      }
    }

    setIsSwiping(false);
  };

  // 重置縮放
  const resetZoom = () => {
    setCurrentScale(1);
  };

  // 檢測設備類型
  const isMobile = () => {
    return window.innerWidth <= 768;
  };

  const isTablet = () => {
    return window.innerWidth > 768 && window.innerWidth <= 1024;
  };

  const isDesktop = () => {
    return window.innerWidth > 1024;
  };

  // 根據設備類型調整字體大小
  const getOptimalFontSize = () => {
    if (isMobile()) {
      return Math.max(14, Math.min(20, fontSize));
    } else if (isTablet()) {
      return Math.max(16, Math.min(22, fontSize));
    } else {
      return Math.max(16, Math.min(24, fontSize));
    }
  };

  // 根據設備類型調整側邊欄顯示
  const shouldShowSidebar = () => {
    if (isMobile()) {
      return sidebarOpen && chapters.length > 0;
    } else {
      return sidebarOpen && chapters.length > 0;
    }
  };

  // 響應式測試功能
  const getDeviceInfo = () => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const orientation = width > height ? 'landscape' : 'portrait';
    
    let deviceType = 'desktop';
    if (isMobile()) deviceType = 'mobile';
    else if (isTablet()) deviceType = 'tablet';
    
    return {
      width,
      height,
      orientation,
      deviceType,
      isTouch: 'ontouchstart' in window
    };
  };

  // 開發模式下的設備信息顯示
  const showDeviceInfo = process.env.NODE_ENV === 'development';

  // 漢堡選單狀態
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // 切換漢堡選單
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  // 關閉漢堡選單
  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  // 獲取當前章節
  const getCurrentChapter = () => {
    if (chapters.length === 0) return null;

    for (let i = chapters.length - 1; i >= 0; i--) {
      if (chapters[i].pageIndex <= currentPage) {
        return chapters[i];
      }
    }
    return chapters[0];
  };

  // 調試信息
  const debugInfo = {
    currentPage,
    totalPages,
    selectedChapter: selectedChapter?.title || 'None',
    currentChapter: getCurrentChapter()?.title || 'None',
    pagesLength: pages.length,
    chaptersLength: chapters.length
  };

  useEffect(() => {
    // console.log('Setting up keyboard event listener');
    const handleKeyDown = (e) => {
      // console.log('Global keydown event:', e.key);
      handleKeyPress(e);
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      // console.log('Removing keyboard event listener');
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyPress]);

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getReadingProgress = () => {
    if (totalPages === 0) return 0;
    return Math.round(((currentPage + 1) / totalPages) * 100);
  };

  // 新增：載入用戶的閱讀進度
  const loadUserReadingProgress = async () => {
    try {
      const result = await userBookService.checkBookInLibrary(id);
      if (result.inLibrary && result.userBook) {
        const progress = result.userBook.reading_progress || 0;
        setUserReadingProgress(progress);
        console.log('載入用戶閱讀進度:', progress + '%');
      }
    } catch (error) {
      console.error('載入用戶閱讀進度失敗:', error);
    }
  };

  // 移除 jumpToReadingProgress 函數，避免循環依賴

  // 當頁面創建完成後，根據閱讀進度跳轉（只在初始載入時執行一次）
  useEffect(() => {
    if (pages.length > 0 && pagePositions.length > 0 && userReadingProgress > 0) {
      // 只在初始載入時跳轉，避免翻頁時的循環依賴
      const targetPage = Math.floor((userReadingProgress / 100) * totalPages);
      const clampedPage = Math.max(0, Math.min(targetPage, totalPages - 1));
      
      if (clampedPage !== currentPage) {
        setCurrentPage(clampedPage);
        console.log(`初始載入：根據閱讀進度 ${userReadingProgress}% 跳轉到第 ${clampedPage + 1} 頁`);
      }
    }
  }, [pages, pagePositions, userReadingProgress, totalPages]); // 移除 jumpToReadingProgress 依賴

  // 新增：獲取顯示用的閱讀進度（優先顯示當前進度，如果沒有則顯示用戶之前的進度）
  const getDisplayProgress = () => {
    const currentProgress = getReadingProgress();
    // 如果當前進度為0且用戶之前有進度，顯示用戶的進度
    // 一旦用戶開始閱讀（翻頁），就顯示即時進度
    if (currentProgress === 0 && userReadingProgress > 0) {
      return userReadingProgress;
    }
    return currentProgress;
  };

  // 新增：獲取進度條的樣式類別
  const getProgressBarClass = () => {
    const currentProgress = getReadingProgress();
    // 只有在初始狀態（當前進度為0）且用戶之前有進度時，才顯示儲存進度樣式
    if (currentProgress === 0 && userReadingProgress > 0) {
      return `${classes.progressBar} ${classes.savedProgress}`; // 顯示之前儲存的進度
    }
    return classes.progressBar;
  };

  // 新增：檢查是否應該顯示儲存進度樣式
  const shouldShowSavedProgress = () => {
    const currentProgress = getReadingProgress();
    // 只有在初始狀態（當前進度為0）且用戶之前有進度時，才顯示儲存進度樣式
    return currentProgress === 0 && userReadingProgress > 0;
  };

  // 新增：檢查是否應該顯示儲存進度樣式（手機版）
  const shouldShowMobileSavedProgress = () => {
    const currentProgress = getReadingProgress();
    // 只有在初始狀態（當前進度為0）且用戶之前有進度時，才顯示儲存進度樣式
    return currentProgress === 0 && userReadingProgress > 0;
  };

  // 獲取顯示內容 (根據選中的章節)
  const getDisplayContent = () => {
    if (selectedChapter) {
      // 當有選中章節時，顯示該章節的完整內容
      const chapterStart = selectedChapter.position;
      const nextChapter = chapters.find((ch, index) => 
        ch.position > chapterStart && index > chapters.indexOf(selectedChapter)
      );
      const chapterEnd = nextChapter ? nextChapter.position : content.length;
      return content.substring(chapterStart, chapterEnd);
    }
    // 沒有選中章節時，顯示當前頁面內容
    return pages[currentPage] || '';
  };

  // 獲取當前頁面內容（用於翻頁顯示）
  const getCurrentPageContent = () => {
    return pages[currentPage] || '';
  };

  if (loading) {
    return (
      <div className={classes.ebookReader}>
        <div className={classes.loadingContainer}>
          <div className={classes.loadingSpinner}>載入電子書中...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={classes.ebookReader}>
        <div className={classes.errorContainer}>
          <div className={classes.errorIcon}>❌</div>
          <h3>載入失敗</h3>
          <p>{error}</p>
          <div className={classes.errorActions}>
            <button onClick={() => navigate('/books')} className={classes.btnBack}>
              返回書籍列表
            </button>
            {error.includes('沒有電子書檔案') && (
              <button
                onClick={() => navigate(`/books`)}
                className={classes.btnDownload}
                style={{ marginLeft: '1rem' }}
              >
                上傳電子書
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

 


  return (
    <div className={`${classes.ebookReader} ${classes[theme]}`} ref={ebookReaderRef}>
      {/* 手機/平板漢堡選單按鈕 */}
      {(isMobile() || isTablet()) && (
        <div className={classes.mobileMenuButton}>
          <button
            onClick={toggleMobileMenu}
            className={classes.hamburgerBtn}
            title="開啟選單"
          >
            ☰
          </button>
        </div>
      )}

      {/* 手機/平板漢堡選單 */}
      {(isMobile() || isTablet()) && mobileMenuOpen && (
        <div className={classes.mobileMenuOverlay} onClick={closeMobileMenu}>
          <div className={classes.mobileMenu} onClick={(e) => e.stopPropagation()}>
            <div className={classes.mobileMenuHeader}>
              <h3>📚 {book?.title}</h3>
              <button onClick={closeMobileMenu} className={classes.closeMenuBtn}>
                ✕
              </button>
            </div>
            
            <div className={classes.mobileMenuContent}>
              {/* 返回按鈕 */}
              <div className={classes.mobileMenuItem}>
                <button onClick={() => { navigate('/books'); closeMobileMenu(); }} className={classes.mobileMenuBtn}>
                  ← 返回書籍列表
                </button>
              </div>

              {/* 字體控制 */}
              <div className={classes.mobileMenuItem}>
                <span className={classes.mobileMenuLabel}>字體大小</span>
                <div className={classes.mobileFontControls}>
                  <button
                    onClick={() => setFontSize(Math.max(12, fontSize - 2))}
                    className={classes.mobileFontBtn}
                    disabled={fontSize <= 12}
                  >
                    A-
                  </button>
                  <span className={classes.mobileFontSize}>{fontSize}px</span>
                  <button
                    onClick={() => setFontSize(Math.min(24, fontSize + 2))}
                    className={classes.mobileFontBtn}
                    disabled={fontSize >= 24}
                  >
                    A+
                  </button>
                </div>
              </div>

              {/* 主題切換 */}
              <div className={classes.mobileMenuItem}>
                <span className={classes.mobileMenuLabel}>主題</span>
                <button
                  onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                  className={classes.mobileThemeBtn}
                >
                  {theme === 'light' ? '🌙 深色模式' : '☀️ 淺色模式'}
                </button>
              </div>

              {/* 縮放控制 */}
              <div className={classes.mobileMenuItem}>
                <span className={classes.mobileMenuLabel}>縮放</span>
                <div className={classes.mobileZoomControls}>
                  <button
                    onClick={() => setCurrentScale(Math.max(0.5, currentScale - 0.1))}
                    className={classes.mobileZoomBtn}
                    disabled={currentScale <= 0.5}
                  >
                    🔍-
                  </button>
                  <span className={classes.mobileZoomLevel}>{Math.round(currentScale * 100)}%</span>
                  <button
                    onClick={() => setCurrentScale(Math.min(3, currentScale + 0.1))}
                    className={classes.mobileZoomBtn}
                    disabled={currentScale >= 3}
                  >
                    🔍
                  </button>
                  <button onClick={resetZoom} className={classes.mobileResetZoomBtn}>
                    🔄
                  </button>
                </div>
              </div>

              {/* 全螢幕控制 */}
              <div className={classes.mobileMenuItem}>
                <span className={classes.mobileMenuLabel}>全螢幕</span>
                <button
                  onClick={() => { toggleFullscreen(); closeMobileMenu(); }}
                  className={classes.mobileFullscreenBtn}
                >
                  {isFullscreen ? '🗗 退出全螢幕' : '🗖 進入全螢幕'}
                </button>
              </div>

              {/* 章節選擇 */}
              {chapters.length > 0 && (
                <div className={classes.mobileMenuItem}>
                  <span className={classes.mobileMenuLabel}>章節選擇</span>
                  <div className={classes.mobileChapterList}>
                    {chapters.map((chapter, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          jumpToChapter(index);
                          closeMobileMenu();
                        }}
                        className={`${classes.mobileChapterBtn} ${index === currentChapter ? classes.activeMobileChapter : ''}`}
                      >
                        <span className={classes.mobileChapterNumber}>{index + 1}</span>
                        <span className={classes.mobileChapterTitle}>{chapter.title}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* 下載按鈕 */}
              <div className={classes.mobileMenuItem}>
                <button onClick={() => { handleDownload(); closeMobileMenu(); }} className={classes.mobileDownloadBtn}>
                  📥 下載電子書
                </button>
              </div>

              {/* 閱讀進度 */}
              <div className={classes.mobileMenuItem}>
                <span className={classes.mobileMenuLabel}>閱讀進度</span>
                <div className={`${classes.mobileProgressBar} ${shouldShowMobileSavedProgress() ? classes.savedProgress : ''}`}>
                  <div
                    className={classes.mobileProgressFill}
                    style={{ width: `${getDisplayProgress()}%` }}
                  ></div>
                </div>
                <span className={classes.mobileProgressText}>{getDisplayProgress()}%</span>
                {savingProgress && (
                  <span className={classes.mobileSavingIndicator} title="正在儲存進度...">
                    💾
                  </span>
                )}
              </div>

              {/* 設備信息 (開發模式) */}
              {showDeviceInfo && (
                <div className={classes.mobileMenuItem}>
                  <span className={classes.mobileMenuLabel}>設備信息</span>
                  <span className={classes.mobileDeviceInfo}>
                    {getDeviceInfo().deviceType} ({getDeviceInfo().width}x{getDeviceInfo().height})
                  </span>
                </div>
              )}

              {/* 調試信息 (開發模式) */}
              {showDeviceInfo && (
                <div className={classes.mobileMenuItem}>
                  <span className={classes.mobileMenuLabel}>調試信息</span>
                  <div className={classes.mobileDebugInfo}>
                    <div>頁面: {debugInfo.currentPage + 1} / {debugInfo.totalPages}</div>
                    <div>選中章節: {debugInfo.selectedChapter}</div>
                    <div>當前章節: {debugInfo.currentChapter}</div>
                    <div>頁面數: {debugInfo.pagesLength}</div>
                    <div>章節數: {debugInfo.chaptersLength}</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 桌面版工具列 - 只在桌面版顯示 */}
      {isDesktop() && (
        <div className={classes.readerToolbar}>
          <div className={classes.toolbarLeft}>
            <button onClick={() => navigate('/books')} className={classes.btnBack}>
              ← 返回
            </button>
            <h2 className={classes.bookTitle}>{book?.title}</h2>
            <span className={classes.bookAuthor}>by {book?.author}</span>
          </div>

          <div className={classes.toolbarCenter}>
            <div className={classes.fontControls}>
              <button
                onClick={() => setFontSize(Math.max(12, fontSize - 2))}
                className={classes.fontBtn}
                disabled={fontSize <= 12}
              >
                A-
              </button>
              <span className={classes.fontSize}>{fontSize}px</span>
              <button
                onClick={() => setFontSize(Math.min(24, fontSize + 2))}
                className={classes.fontBtn}
                disabled={fontSize >= 24}
              >
                A+
              </button>
            </div>

            <div className={classes.themeControls}>
              <button
                onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                className={classes.themeBtn}
              >
                {theme === 'light' ? '🌙' : '☀️'}
              </button>
            </div>

            {chapters.length > 0 && (
              <div className={classes.chapterControls}>
                <button
                  onClick={toggleSidebar}
                  className={classes.chapterBtn}
                  title="章節選擇 (C)"
                >
                  📖
                </button>
                {selectedChapter && (
                  <button
                    onClick={clearSelectedChapter}
                    className={classes.clearChapterBtn}
                    title="清除章節選擇"
                  >
                    ✕
                  </button>
                )}
              </div>
            )}

            {/* 縮放控制 */}
            <div className={classes.zoomControls}>
              <button
                onClick={() => setCurrentScale(Math.max(0.5, currentScale - 0.1))}
                className={classes.zoomBtn}
                disabled={currentScale <= 0.5}
                title="縮小"
              >
                🔍-
              </button>
              <span className={classes.zoomLevel}>{Math.round(currentScale * 100)}%</span>
              <button
                onClick={() => setCurrentScale(Math.min(3, currentScale + 0.1))}
                className={classes.zoomBtn}
                disabled={currentScale >= 3}
                title="放大"
              >
                🔍
              </button>
              <button
                onClick={resetZoom}
                className={classes.resetZoomBtn}
                title="重置縮放"
              >
                🔄
              </button>
            </div>

            <div className={classes.fullscreenControls}>
              <button
                onClick={toggleFullscreen}
                className={classes.fullscreenBtn}
                title={isFullscreen ? "退出全螢幕" : "進入全螢幕"}
              >
                {isFullscreen ? '🗗' : '🗖'}
              </button>
            </div>
          </div>

          <div className={classes.toolbarRight}>
            <button onClick={handleDownload} className={classes.btnDownload}>
              📥 下載
            </button>
          </div>
        </div>
      )}

      {/* 桌面版書籍資訊 - 只在桌面版顯示 */}
      {isDesktop() && (
        <div className={classes.bookInfoBar}>
          <div className={classes.infoItem}>
            <span className={classes.infoLabel}>檔案：</span>
            <span className={classes.infoValue}>{book?.filename}</span>
          </div>
          <div className={classes.infoItem}>
            <span className={classes.infoLabel}>大小：</span>
            <span className={classes.infoValue}>{formatFileSize(book?.size)}</span>
          </div>
          <div className={classes.infoItem}>
            <span className={classes.infoLabel}>觀看：</span>
            <span className={classes.infoValue}>{book?.view_count ?? 0}</span>
          </div>
          <div className={classes.infoItem}>
            <span className={classes.infoLabel}>下載：</span>
            <span className={classes.infoValue}>{book?.download_count ?? 0}</span>
          </div>
          <div className={classes.infoItem}>
            <span className={classes.infoLabel}>頁數：</span>
            <span className={classes.infoValue}>{totalPages} 頁</span>
          </div>
          {getCurrentChapter() && (
            <div className={classes.infoItem}>
              <span className={classes.infoLabel}>章節：</span>
              <span className={classes.infoValue}>{getCurrentChapter().title}</span>
            </div>
          )}
          <div className={classes.infoItem}>
            <span className={classes.infoLabel}>進度：</span>
            <div className={getProgressBarClass()}>
              <div
                className={classes.progressFill}
                style={{ width: `${getDisplayProgress()}%` }}
              ></div>
            </div>
            <span className={classes.progressText}>{getDisplayProgress()}%</span>
            {savingProgress && (
              <span className={classes.savingIndicator} title="正在儲存進度...">
                💾
              </span>
            )}
          </div>
          {showDeviceInfo && (
            <div className={classes.infoItem}>
              <span className={classes.infoLabel}>設備：</span>
              <span className={classes.infoValue}>
                {getDeviceInfo().deviceType} ({getDeviceInfo().width}x{getDeviceInfo().height})
              </span>
            </div>
          )}
        </div>
      )}

      {/* 主要內容區域 */}
      <div className={classes.contentContainer}>
        {/* 章節目錄側邊欄 - 只在桌面版顯示 */}
        {isDesktop() && shouldShowSidebar() && (
          <div className={`${classes.tocSidebar} ${sidebarCollapsed ? classes.collapsed : ''}`}>
            <div className={classes.tocHeader}>
              <h3>📚 章節目錄</h3>
              <div className={classes.tocControls}>
                <span className={classes.chapterCount}>{chapters.length} 章</span>
                <button
                  onClick={toggleSidebarCollapse}
                  className={classes.collapseBtn}
                  title={sidebarCollapsed ? "展開側邊欄" : "收縮側邊欄"}
                >
                  {sidebarCollapsed ? '▶' : '◀'}
                </button>
                <button
                  onClick={toggleSidebar}
                  className={classes.closeBtn}
                  title="關閉側邊欄"
                >
                  ✕
                </button>
              </div>
            </div>
            
            <div className={classes.tocList}>
              {chapters.map((chapter, index) => (
                <div 
                  key={index}
                  className={`${classes.tocItem} ${index === currentChapter ? classes.activeChapter : ''}`}
                  onClick={() => selectChapterFromSidebar(index)}
                  title={`點擊跳轉到 ${chapter.title}`}
                >
                  <span className={classes.chapterNumber}>{index + 1}</span>
                  <span className={classes.chapterTitle}>{chapter.title}</span>
                  {!sidebarCollapsed && (
                    <span className={classes.chapterPage}>第 {chapter.pageIndex + 1} 頁</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 主要閱讀區域 */}
        <div className={classes.mainReader}>
          {/* 桌面版閱讀器標題 - 只在桌面版顯示 */}
          {isDesktop() && (
            <div className={classes.readerHeader}>
              <button
                onClick={toggleSidebar}
                className={classes.toggleSidebarBtn}
                title="切換章節目錄"
              >
                📖
              </button>
              {selectedChapter && (
                <span className={classes.selectedChapterInfo}>
                  正在閱讀: {selectedChapter.title}
                </span>
              )}
            </div>
          )}
          
          <div
            className={`${classes.readerContent} ${isSwiping ? classes.swiping : ''}`}
            ref={contentRef}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            tabIndex={0}
            style={{
              transform: `scale(${currentScale})`,
              transformOrigin: 'top left',
              transition: isPinching ? 'none' : 'transform 0.3s ease'
            }}
          >
            {pages.length > 0 ? (
              <div
                className={classes.contentText}
                style={{
                  fontSize: `${getOptimalFontSize()}px`,
                  overflow: 'auto'
                }}
              >
                <div className={classes.markdownContent}>
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      h1: ({ node, ...props }) => <h1 style={{ fontSize: `${getOptimalFontSize() + 8}px` }} {...props} />,
                      h2: ({ node, ...props }) => <h2 style={{ fontSize: `${getOptimalFontSize() + 6}px` }} {...props} />,
                      h3: ({ node, ...props }) => <h3 style={{ fontSize: `${getOptimalFontSize() + 4}px` }} {...props} />,
                      h4: ({ node, ...props }) => <h4 style={{ fontSize: `${getOptimalFontSize() + 2}px` }} {...props} />,
                      h5: ({ node, ...props }) => <h5 style={{ fontSize: `${getOptimalFontSize()}px` }} {...props} />,
                      h6: ({ node, ...props }) => <h6 style={{ fontSize: `${getOptimalFontSize() - 2}px` }} {...props} />,
                      p: ({ node, ...props }) => <p className={classes.contentLine} {...props} />,
                      code: ({ node, inline, ...props }) =>
                        inline ?
                          <code style={{ backgroundColor: '#f0f0f0', padding: '2px 4px', borderRadius: '3px' }} {...props} /> :
                          <pre style={{ backgroundColor: '#f5f5f5', padding: '10px', borderRadius: '5px', overflow: 'auto' }}><code {...props} /></pre>,
                      a: ({ node, ...props }) => <a style={{ color: '#007bff', textDecoration: 'underline' }} {...props} />
                    }}
                  >
                    {getDisplayContent()}
                  </ReactMarkdown>
                </div>
              </div>
            ) : (
              <div className={classes.loadingContent}>正在處理內容...</div>
            )}
          </div>
        </div>
      </div>

   
    </div>
  );
  }
  
export default EbookReader; 