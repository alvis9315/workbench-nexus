<script setup lang="ts">
// App 殼只做路由出口 + 全域 toast(規範:App.vue 不寫主要畫面)。
import { Toaster } from '@/components/ui/sonner'
</script>

<template>
  <RouterView />
  <Toaster position="bottom-center" />
</template>
