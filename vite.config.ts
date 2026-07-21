import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [vue(), tailwindcss()],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  // 主題素材是上千張小 GIF:內聯成 data URI 會把主題 chunk 撐爆(實測 +2MB),
  // 一律走獨立檔案、由 <img> 按需載入
  build: { assetsInlineLimit: 0 },
})
