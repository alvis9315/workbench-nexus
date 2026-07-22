<script setup lang="ts">
// App 殼只做路由出口 + 全域 chrome(splash/toast/tooltip provider/固定頂欄)。
// 頂欄(標題 + 分區分頁)住在 RouterView 外:換頁不重繪、位置恆定不跳動。
import { RouterLink } from 'vue-router'
import { TooltipProvider } from '@/components/ui/tooltip'
import { Toaster } from '@/components/ui/sonner'
import SplashScreen from '@/components/SplashScreen.vue'
import NavTabs from '@/components/NavTabs.vue'
import Mascot from '@/components/Mascot.vue'
import ShellThemePicker from '@/components/ShellThemePicker.vue'
import VesperAvatarBay from '@/components/VesperAvatarBay.vue'
</script>

<template>
  <TooltipProvider :delay-duration="200">
    <SplashScreen />
    <header class="mx-auto w-full max-w-5xl px-6 pt-10">
      <div class="flex items-center gap-3">
        <RouterLink to="/" class="inline-block">
          <h1 class="font-pixel text-lg text-primary sm:text-xl">WORKBENCH NEXUS</h1>
        </RouterLink>
        <ShellThemePicker />
      </div>
      <NavTabs class="mt-5" />
    </header>
    <RouterView />
    <Mascot />
    <VesperAvatarBay />
    <Toaster position="top-center" rich-colors />
  </TooltipProvider>
</template>
