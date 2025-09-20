import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  publicDir: 'public', // 確保 public 目錄中的文件被複製到 dist
  define: {
    global: 'globalThis',
  },
  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern-compiler', // 使用現代 Sass API
        silenceDeprecations: ['legacy-js-api']
      }
    }
  },
  build: {
    target: 'es2015', // 降低構建目標以兼容 Node.js 16
    rollupOptions: {
      external: [],
    },
  },
  server: {
    port: 5173,
    host: '127.0.0.1',  // 強制使用 IPv4
    // 開發環境代理設定 - 指向 Render 後端
    proxy: {
      '/api': {
        target: 'https://zaisnovel-backend.onrender.com', // 使用 Render 後端
        changeOrigin: true,
        secure: true, // 使用 HTTPS
        rewrite: (path) => path,
        configure: (proxy, options) => {
          proxy.on('error', (err, req, res) => {
            console.log('proxy error', err);
          });
          proxy.on('proxyReq', (proxyReq, req, res) => {
            proxyReq.setHeader('X-Special-Proxy-Header', 'foobar');
            // 添加必要的 CORS headers
            proxyReq.setHeader('Origin', 'https://zaisnovel-frontend.onrender.com');
          });
          proxy.on('proxyRes', (proxyRes, req, res) => {
            console.log('Received Response from the Target:', proxyRes.statusCode, req.url);
          });
        },
      }
    }
  }
})
