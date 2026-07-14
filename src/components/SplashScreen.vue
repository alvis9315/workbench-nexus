<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref } from 'vue'

// 進場動畫(REQ-001):像素進度條 → 100 → 淡出。
// 節制條款:~1.2s、點一下可跳過、每 session 只演第一次(sessionStorage)。
const SEEN_KEY = 'wn-splash-seen'
const visible = ref(sessionStorage.getItem(SEEN_KEY) !== '1')
const progress = ref(0)
const leaving = ref(false)
let timer = 0

const dismiss = () => {
  if (leaving.value || !visible.value) return
  leaving.value = true
  sessionStorage.setItem(SEEN_KEY, '1')
  window.setTimeout(() => (visible.value = false), 250)
}

onMounted(() => {
  if (!visible.value) return
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (reduce) {
    dismiss()
    return
  }
  const start = performance.now()
  const DURATION = 1100
  const tick = (t: number) => {
    progress.value = Math.min(100, Math.round(((t - start) / DURATION) * 100))
    if (progress.value >= 100) {
      dismiss()
      return
    }
    timer = requestAnimationFrame(tick)
  }
  timer = requestAnimationFrame(tick)
})
onBeforeUnmount(() => cancelAnimationFrame(timer))
</script>

<template>
  <Transition name="splash">
    <div
      v-if="visible"
      class="fixed inset-0 z-50 flex cursor-pointer flex-col items-center justify-center gap-8 bg-background"
      role="button"
      aria-label="點擊跳過進場動畫"
      @click="dismiss"
    >
      <p class="font-pixel text-xl text-primary sm:text-2xl">WORKBENCH NEXUS</p>
      <div class="pixel-frame h-6 w-64 overflow-hidden rounded-sm bg-card">
        <div class="h-full bg-primary transition-[width] duration-75" :style="{ width: `${progress}%` }" />
      </div>
      <p class="font-pixel text-[10px] text-muted-foreground">LOADING {{ progress }}% — CLICK TO SKIP</p>
    </div>
  </Transition>
</template>

<style scoped>
.splash-leave-active { transition: opacity 0.25s ease; }
.splash-leave-to { opacity: 0; }
</style>
