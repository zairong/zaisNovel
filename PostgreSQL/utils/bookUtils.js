function serializeBook(book) {
  const raw = typeof book.toJSON === 'function' ? book.toJSON() : book
  return {
    ...raw,
    author: raw.author_name
  }
}

function fixFilename(filename) {
  try {
    if (filename && (filename.includes('ã') || filename.includes('ä') || filename.includes('ç'))) {
      const buffer = Buffer.from(filename, 'latin1')
      return buffer.toString('utf8')
    }
    return filename
  } catch (error) {
    console.error('修復檔案名稱編碼錯誤:', error)
    return filename
  }
}

module.exports = { serializeBook, fixFilename }


