<script setup lang="ts">
// App 殼只做路由出口 + 全域 chrome(splash/toast/tooltip provider)。
import { TooltipProvider } from '@/components/ui/tooltip'
import { Toaster } from '@/components/ui/sonner'
import SplashScreen from '@/components/SplashScreen.vue'
</script>

<template>
  <TooltipProvider :delay-duration="200">
    <SplashScreen />
    <RouterView />
    <Toaster position="bottom-center" />
  </TooltipProvider>
</template>
