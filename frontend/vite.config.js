import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: './src/main.jsx',
      output: {
        entryFileNames: '[name].[hash].js',
        assetFileNames: '[name].[hash].[ext]',
        chunkFileNames: '[name].[hash].js'
      }
    }
  },
  resolve: {
    alias: {
      '@': '/src'
    }
  }
});
