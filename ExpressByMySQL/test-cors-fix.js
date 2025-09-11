#!/usr/bin/env node

/**
 * CORS 修復測試腳本
 * 測試 CORS 配置是否正確工作
 */

const express = require('express');
const cors = require('cors');

const app = express();

// 強化版 CORS 配置
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      'https://zaisnovel-frontend.onrender.com',
      'http://localhost:3000',
      'http://localhost:5173',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:5173'
    ];
    
    console.log('🔍 CORS 檢查來源:', origin);
    
    if (!origin) {
      console.log('✅ 允許無來源請求');
      return callback(null, true);
    }
    
    if (allowedOrigins.includes(origin)) {
      console.log('✅ 允許來源:', origin);
      callback(null, true);
    } else {
      console.log('❌ 拒絕來源:', origin);
      callback(new Error('不允許的 CORS 來源'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'X-Requested-With',
    'Origin',
    'Accept',
    'Access-Control-Request-Method',
    'Access-Control-Request-Headers',
    'Cache-Control',
    'Pragma'
  ],
  exposedHeaders: [
    'Access-Control-Allow-Origin',
    'Access-Control-Allow-Credentials'
  ],
  optionsSuccessStatus: 200,
  maxAge: 86400
};

app.use(cors(corsOptions));

// 備用 CORS 中間件
app.use((req, res, next) => {
  const origin = req.headers.origin;
  const allowedOrigins = [
    'https://zaisnovel-frontend.onrender.com',
    'http://localhost:3000',
    'http://localhost:5173',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:5173'
  ];
  
  if (origin && allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  } else if (!origin) {
    res.header('Access-Control-Allow-Origin', '*');
  }
  
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Origin, Accept, Access-Control-Request-Method, Access-Control-Request-Headers, Cache-Control, Pragma');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Expose-Headers', 'Access-Control-Allow-Origin, Access-Control-Allow-Credentials');
  res.header('Access-Control-Max-Age', '86400');
  
  next();
});

// 調試中間件
app.use((req, res, next) => {
  console.log('🌐 請求詳情:', {
    method: req.method,
    url: req.url,
    origin: req.headers.origin,
    userAgent: req.headers['user-agent'],
    timestamp: new Date().toISOString()
  });
  next();
});

// 專門處理 OPTIONS 請求
app.options('*', (req, res) => {
  const origin = req.headers.origin;
  const allowedOrigins = [
    'https://zaisnovel-frontend.onrender.com',
    'http://localhost:3000',
    'http://localhost:5173',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:5173'
  ];
  
  console.log('🔍 OPTIONS 請求檢查來源:', origin);
  console.log('🔍 OPTIONS 請求 URL:', req.url);
  
  if (origin && allowedOrigins.includes(origin)) {
    console.log('✅ OPTIONS 允許來源:', origin);
    res.header('Access-Control-Allow-Origin', origin);
  } else if (!origin) {
    console.log('✅ OPTIONS 允許無來源請求');
    res.header('Access-Control-Allow-Origin', '*');
  } else {
    console.log('🚫 OPTIONS 請求拒絕來源:', origin);
    return res.status(403).json({ error: 'CORS 不允許的來源' });
  }
  
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Origin, Accept, Access-Control-Request-Method, Access-Control-Request-Headers, Cache-Control, Pragma');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Expose-Headers', 'Access-Control-Allow-Origin, Access-Control-Allow-Credentials');
  res.header('Access-Control-Max-Age', '86400');
  
  console.log('✅ OPTIONS 回應標頭已設置');
  res.sendStatus(200);
});

// 測試端點
app.get('/api/cors-test', (req, res) => {
  res.json({
    success: true,
    message: 'CORS 測試成功',
    origin: req.headers.origin,
    timestamp: new Date().toISOString(),
    headers: {
      'Access-Control-Allow-Origin': res.get('Access-Control-Allow-Origin'),
      'Access-Control-Allow-Credentials': res.get('Access-Control-Allow-Credentials')
    }
  });
});

// 模擬電子書端點
app.get('/api/books/ebooks', (req, res) => {
  res.json({
    success: true,
    data: {
      data: [],
      total: 0,
      totalPages: 1,
      currentPage: 1,
      pageSize: 20
    },
    message: '成功取得電子書列表'
  });
});

// 模擬審計端點
app.post('/api/audit/log', (req, res) => {
  res.json({
    success: true,
    message: '審計事件記錄成功'
  });
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`🚀 CORS 測試服務器運行在 http://localhost:${PORT}`);
  console.log(`📦 測試端點:`);
  console.log(`   GET  http://localhost:${PORT}/api/cors-test`);
  console.log(`   GET  http://localhost:${PORT}/api/books/ebooks`);
  console.log(`   POST http://localhost:${PORT}/api/audit/log`);
  console.log(`\n🔍 測試指令:`);
  console.log(`   curl -H "Origin: https://zaisnovel-frontend.onrender.com" http://localhost:${PORT}/api/cors-test`);
  console.log(`   curl -X OPTIONS -H "Origin: https://zaisnovel-frontend.onrender.com" http://localhost:${PORT}/api/books/ebooks`);
});
