import { createApp } from 'vue'
import App from './App.vue'
import { router } from './router'
import './assets/main.css'
// vue-sonner 必要樣式(內含 z-index: 999999999):缺此 import,toast 無明確堆疊層級,
// 會被 Dialog 遮罩(z-50 + backdrop-blur)蓋在背景看不到。
import 'vue-sonner/style.css'

createApp(App).use(router).mount('#app')
