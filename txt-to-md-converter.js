#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * TXT 到 Markdown 轉換器
 * 自動將小說 TXT 文件轉換為帶目錄的漂亮 Markdown 格式
 */

class TxtToMdConverter {
  constructor() {
    this.chapterPatterns = [
      /^第[一二三四五六七八九十百千萬\d]+章\s*[^\n]*$/m,
      /^第[一二三四五六七八九十百千萬\d]+節\s*[^\n]*$/m,
      /^Chapter\s*\d+[^\n]*$/im,
      /^Section\s*\d+[^\n]*$/im,
      /^[\d]+\.\s*[^\n]+$/m,
      /^[一二三四五六七八九十]+\.\s*[^\n]+$/m
    ];
  }

  /**
   * 檢測章節標題
   */
  detectChapterTitle(line) {
    for (const pattern of this.chapterPatterns) {
      if (pattern.test(line.trim())) {
        return line.trim();
      }
    }
    return null;
  }

  /**
   * 清理文本內容
   */
  cleanText(text) {
    return text
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  }

  /**
   * 生成目錄
   */
  generateTOC(chapters) {
    let toc = '# 目錄\n\n';
    
          chapters.forEach((chapter, index) => {
        const chapterNumber = index + 1;
        // 提取章節標題，保留完整的章節名稱
        const cleanTitle = chapter.title.replace(/^第/, '').replace(/章.*$/, '章');
        const displayTitle = cleanTitle || `第${chapterNumber}章`;
        toc += `${chapterNumber}. [${displayTitle}](#${this.generateAnchor(displayTitle)})\n`;
      });
    
    return toc + '\n---\n\n';
  }

  /**
   * 生成錨點
   */
  generateAnchor(text) {
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
      .replace(/^-+|-+$/g, '');
  }

  /**
   * 格式化章節內容
   */
  formatChapterContent(content) {
    // 分割段落
    const paragraphs = content.split('\n\n').filter(p => p.trim());
    
    return paragraphs.map(paragraph => {
      const lines = paragraph.split('\n').filter(line => line.trim());
      return lines.join('\n');
    }).join('\n\n');
  }

  /**
   * 轉換 TXT 到 Markdown
   */
  convertTxtToMd(inputPath, outputPath = null) {
    try {
      // 讀取 TXT 文件
      const content = fs.readFileSync(inputPath, 'utf8');
      const cleanedContent = this.cleanText(content);
      
      // 按行分割
      const lines = cleanedContent.split('\n');
      const chapters = [];
      let currentChapter = null;
      let currentContent = [];
      
      // 解析章節
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const chapterTitle = this.detectChapterTitle(line);
        
        if (chapterTitle) {
          // 保存前一章
          if (currentChapter) {
            currentChapter.content = this.formatChapterContent(currentContent.join('\n'));
            chapters.push(currentChapter);
          }
          
          // 開始新章節
          currentChapter = {
            title: chapterTitle,
            content: ''
          };
          currentContent = [];
        } else {
          currentContent.push(line);
        }
      }
      
      // 保存最後一章
      if (currentChapter) {
        currentChapter.content = this.formatChapterContent(currentContent.join('\n'));
        chapters.push(currentChapter);
      }
      
      // 如果沒有檢測到章節，將整個內容作為一章
      if (chapters.length === 0) {
        chapters.push({
          title: '第一章',
          content: this.formatChapterContent(cleanedContent)
        });
      }
      
      // 生成 Markdown 內容
      let mdContent = '';
      
      // 添加標題
      const fileName = path.basename(inputPath, '.txt');
      mdContent += `# ${fileName}\n\n`;
      
      // 添加目錄
      mdContent += this.generateTOC(chapters);
      
      // 添加章節內容
              chapters.forEach((chapter, index) => {
          const chapterNumber = index + 1;
          // 提取章節標題，保留完整的章節名稱
          const cleanTitle = chapter.title.replace(/^第/, '').replace(/章.*$/, '章');
          const displayTitle = cleanTitle || `第${chapterNumber}章`;
          
          mdContent += `## ${displayTitle}\n\n`;
          mdContent += chapter.content + '\n\n';
        });
      
      // 寫入輸出文件
      if (!outputPath) {
        outputPath = inputPath.replace('.txt', '.md');
      }
      
      fs.writeFileSync(outputPath, mdContent, 'utf8');
      
      console.log(`✅ 轉換完成！`);
      console.log(`📁 輸入文件: ${inputPath}`);
      console.log(`📁 輸出文件: ${outputPath}`);
      console.log(`📖 章節數量: ${chapters.length}`);
      
      return {
        success: true,
        inputPath,
        outputPath,
        chapterCount: chapters.length,
        chapters: chapters.map((c, i) => ({ number: i + 1, title: c.title }))
      };
      
    } catch (error) {
      console.error(`❌ 轉換失敗: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  /**
   * 批量轉換
   */
  batchConvert(inputDir, outputDir = null) {
    try {
      if (!fs.existsSync(inputDir)) {
        throw new Error(`目錄不存在: ${inputDir}`);
      }
      
      const files = fs.readdirSync(inputDir)
        .filter(file => file.toLowerCase().endsWith('.txt'));
      
      if (files.length === 0) {
        console.log('❌ 在指定目錄中沒有找到 .txt 文件');
        return;
      }
      
      console.log(`📁 找到 ${files.length} 個 TXT 文件`);
      
      const results = [];
      
      files.forEach(file => {
        const inputPath = path.join(inputDir, file);
        const outputPath = outputDir ? 
          path.join(outputDir, file.replace('.txt', '.md')) : 
          inputPath.replace('.txt', '.md');
        
        console.log(`\n🔄 正在轉換: ${file}`);
        const result = this.convertTxtToMd(inputPath, outputPath);
        results.push(result);
      });
      
      // 統計結果
      const successCount = results.filter(r => r.success).length;
      const failCount = results.length - successCount;
      
      console.log(`\n📊 轉換統計:`);
      console.log(`✅ 成功: ${successCount} 個文件`);
      console.log(`❌ 失敗: ${failCount} 個文件`);
      
      return results;
      
    } catch (error) {
      console.error(`❌ 批量轉換失敗: ${error.message}`);
      return [];
    }
  }
}

/**
 * 命令行界面
 */
function showHelp() {
  console.log(`
📚 TXT 到 Markdown 轉換器

用法:
  node txt-to-md-converter.js <輸入文件> [輸出文件]
  node txt-to-md-converter.js --batch <輸入目錄> [輸出目錄]
  node txt-to-md-converter.js --help

參數:
  <輸入文件>    要轉換的 TXT 文件路徑
  [輸出文件]    可選的輸出 MD 文件路徑（預設為同目錄同名）
  --batch       批量轉換模式
  <輸入目錄>    包含 TXT 文件的目錄
  [輸出目錄]    可選的輸出目錄（預設為輸入目錄）
  --help        顯示此幫助信息

示例:
  node txt-to-md-converter.js novel.txt
  node txt-to-md-converter.js novel.txt novel.md
  node txt-to-md-converter.js --batch ./novels
  node txt-to-md-converter.js --batch ./novels ./converted
`);
}

function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0 || args.includes('--help')) {
    showHelp();
    return;
  }
  
  const converter = new TxtToMdConverter();
  
  if (args[0] === '--batch') {
    // 批量轉換模式
    if (args.length < 2) {
      console.error('❌ 請指定輸入目錄');
      showHelp();
      return;
    }
    
    const inputDir = args[1];
    const outputDir = args[2] || null;
    
    converter.batchConvert(inputDir, outputDir);
    
  } else {
    // 單文件轉換模式
    const inputFile = args[0];
    const outputFile = args[1] || null;
    
    if (!fs.existsSync(inputFile)) {
      console.error(`❌ 文件不存在: ${inputFile}`);
      return;
    }
    
    converter.convertTxtToMd(inputFile, outputFile);
  }
}

// 如果直接運行此腳本
if (require.main === module) {
  main();
}

module.exports = TxtToMdConverter;
