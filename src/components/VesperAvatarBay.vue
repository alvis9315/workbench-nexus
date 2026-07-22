<script setup lang="ts">
import vesperPreview from '@/assets/themes/neon-protocol/icon.png'
import { shellThemeId } from '@/shell-themes'
</script>

<template>
  <aside v-if="shellThemeId === 'neon-protocol'" class="vesper-avatar-bay" aria-label="Vesper 3D 紙片人預留區">
    <p class="font-pixel text-[7px] text-primary">VESPER // AVATAR BAY</p>
    <div class="avatar-bay-frame mt-2 grid h-56 place-items-center overflow-hidden rounded-lg border border-primary/40 bg-card/45">
      <img :src="vesperPreview" alt="Vesper 2D preview" class="h-36 w-auto [image-rendering:pixelated]" />
      <span class="absolute bottom-3 font-pixel text-[6px] text-muted-foreground">3D PAPER DOLL · RESERVED</span>
    </div>
    <div class="mt-2 flex items-center justify-between text-[9px] text-muted-foreground">
      <span>LOADOUTS</span>
      <span>01 / 05</span>
    </div>
    <div class="mt-1 grid grid-cols-5 gap-1">
      <span v-for="index in 5" :key="index" class="h-1 rounded-full" :class="index === 1 ? 'bg-primary' : 'bg-accent'" />
    </div>
  </aside>
</template>

<style scoped>
.vesper-avatar-bay {
  position: fixed;
  z-index: 5;
  top: 12rem;
  left: max(1rem, calc(50vw - 42rem));
  width: 10rem;
  pointer-events: none;
}
.avatar-bay-frame {
  position: relative;
  box-shadow:
    inset 0 0 24px color-mix(in srgb, var(--primary) 12%, transparent),
    0 0 18px color-mix(in srgb, var(--primary) 10%, transparent);
  background-image:
    linear-gradient(color-mix(in srgb, var(--primary) 9%, transparent) 1px, transparent 1px),
    linear-gradient(90deg, color-mix(in srgb, var(--primary) 9%, transparent) 1px, transparent 1px);
  background-size: 20px 20px;
}
@media (max-width: 1280px) {
  .vesper-avatar-bay { display: none; }
}
</style>
