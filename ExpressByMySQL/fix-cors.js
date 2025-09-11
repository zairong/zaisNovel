#!/usr/bin/env node

/**
 * CORS 修復腳本
 * 專門用於修復 Render 部署中的 CORS 問題
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

// 調試中間件
app.use((req, res, next) => {
  console.log('🌐 請求:', {
    method: req.method,
    url: req.url,
    origin: req.headers.origin,
    timestamp: new Date().toISOString()
  });
  next();
});

// OPTIONS 處理
app.options('*', (req, res) => {
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
  } else {
    console.log('🚫 OPTIONS 拒絕來源:', origin);
    return res.status(403).json({ error: 'CORS 不允許的來源' });
  }
  
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Origin, Accept, Access-Control-Request-Method, Access-Control-Request-Headers, Cache-Control, Pragma');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Expose-Headers', 'Access-Control-Allow-Origin, Access-Control-Allow-Credentials');
  res.header('Access-Control-Max-Age', '86400');
  res.sendStatus(200);
});

// 測試端點
app.get('/api/cors-test', (req, res) => {
  res.json({
    success: true,
    message: 'CORS 修復測試成功',
    origin: req.headers.origin,
    timestamp: new Date().toISOString(),
    corsHeaders: {
      'Access-Control-Allow-Origin': res.get('Access-Control-Allow-Origin'),
      'Access-Control-Allow-Credentials': res.get('Access-Control-Allow-Credentials')
    }
  });
});

// 健康檢查
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    cors: 'enabled'
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log('🚀 CORS 修復服務器啟動於端口:', PORT);
  console.log('🔗 測試端點: http://localhost:' + PORT + '/api/cors-test');
  console.log('💚 健康檢查: http://localhost:' + PORT + '/api/health');
});
