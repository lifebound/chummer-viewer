import { defineConfig } from 'vite';
import { fileURLToPath, URL } from 'url';

export default defineConfig({
  root: 'public',
  resolve: {
    alias: {
      '@mdui/icons': fileURLToPath(new URL('./node_modules/@mdui/icons', import.meta.url))
    }
  },
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:3000',
      '/upload': 'http://localhost:3000',
      '/append-job': 'http://localhost:3000'
    }
  }
});