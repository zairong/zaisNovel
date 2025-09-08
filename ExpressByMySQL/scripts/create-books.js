const { Book } = require('../models');

async function createBooks() {
  const books = [
    {
      title: '深入淺出 Node.js',
      author_name: 'Shelley Powers',
      isbn: '9787115545388',
      price: 85.00,
      description: 'Node.js 的實用指南，適合初學者和進階開發者',
      category: '程式設計'
    },
    {
      title: 'JavaScript 忍者秘籍',
      author_name: 'John Resig',
      isbn: '9787115545389',
      price: 95.00,
      description: 'JavaScript 高手的必備書籍，涵蓋進階技巧和最佳實踐',
      category: '程式設計'
    },
    {
      title: 'MongoDB 實戰',
      author_name: 'Kyle Banker',
      isbn: '9787115545390',
      price: 75.00,
      description: 'MongoDB 的全面指南，適合資料庫管理員和開發者',
      category: '資料庫'
    }
  ];

  try {
    await Book.bulkCreate(books);
    console.log('📚 書籍資料插入成功');
  } catch (error) {
    console.error('❌ 插入書籍資料失敗:', error);
  } finally {
    process.exit(0);
  }
}

createBooks();
