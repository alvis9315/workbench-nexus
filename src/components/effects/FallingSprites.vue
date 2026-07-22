<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import {
  Bodies,
  Body,
  Composite,
  Engine,
  Events,
  Mouse,
  MouseConstraint,
  type IEvent,
} from 'matter-js'
import PixelSprite from '@/components/PixelSprite.vue'
import type { PoseAsset } from '@/themes/types'

export interface FallingSpriteItem {
  id: string
  label: string
  idle: PoseAsset
  move?: PoseAsset
  grab?: PoseAsset
  /** 未套用 scale 前的顯示尺寸；不等於素材原生 cell。 */
  width: number
  height: number
}

const props = withDefaults(
  defineProps<{
    sprites: FallingSpriteItem[]
    scale?: number
    gravity?: number
    restitution?: number
    grabStiffness?: number
    uprightWhenFree?: boolean
    /** 落到下半部後在 2D 地面上以不同深度自由漫遊。 */
    wander?: boolean
    trigger?: 'auto' | 'click' | 'hover'
  }>(),
  {
    scale: 1,
    gravity: 1,
    restitution: 0.8,
    grabStiffness: 0.16,
    uprightWhenFree: false,
    wander: false,
    trigger: 'auto',
  },
)
const emit = defineEmits<{ prize: [id: string] }>()

const container = ref<HTMLElement | null>(null)
const started = ref(false)
const ready = ref(false)
const grabbedId = ref<string | null>(null)
const roamingIds = ref<Set<string>>(new Set())
const pointerInside = ref(false)
const clawPoint = ref({ x: 0, y: 0 })
const spriteElements = new Map<string, HTMLElement>()
const clawVisible = computed(() => pointerInside.value || grabbedId.value !== null)
const cableStyle = computed(() => ({
  left: `${clawPoint.value.x}px`,
  height: `${Math.max(clawPoint.value.y - 46, 0)}px`,
}))
const clawStyle = computed(() => ({
  left: `${clawPoint.value.x}px`,
  top: `${clawPoint.value.y}px`,
}))

let engine: Engine | null = null
let mouse: Mouse | null = null
let mouseConstraint: MouseConstraint | null = null
let resizeObserver: ResizeObserver | null = null
let animationFrame = 0
let lastTick = 0
let appliedScale = props.scale
let walls: Body[] = []
interface SpriteRecord {
  item: FallingSpriteItem
  body: Body
  roaming: boolean
  target: { x: number; y: number }
  speed: number
  facing: 1 | -1
  nextTurnAt: number
  prizeEligibleUntil: number
  collected: boolean
}
let records: SpriteRecord[] = []

const setSpriteElement = (id: string, element: unknown) => {
  if (element instanceof HTMLElement) spriteElements.set(id, element)
  else spriteElements.delete(id)
}

const displaySize = (item: FallingSpriteItem) => ({
  width: item.width * props.scale,
  height: item.height * props.scale,
})

const setRoaming = (record: SpriteRecord, value: boolean) => {
  if (record.roaming === value) return
  record.roaming = value
  const next = new Set(roamingIds.value)
  if (value) next.add(record.item.id)
  else next.delete(record.item.id)
  roamingIds.value = next
}

const chooseWanderTarget = (record: SpriteRecord, width: number, height: number, now: number) => {
  const size = displaySize(record.item)
  const halfW = Math.max(size.width / 2, 18)
  const halfH = Math.max(size.height / 2, 18)
  const floorTop = height * 0.58
  record.target = {
    x: halfW + Math.random() * Math.max(width - halfW * 2, 1),
    y: Math.min(
      height - halfH - 18,
      floorTop + halfH + Math.random() * Math.max(height - floorTop - halfH * 2 - 24, 1),
    ),
  }
  record.speed = 0.45 + Math.random() * 0.55
  record.nextTurnAt = now + 1800 + Math.random() * 3200
}

const isInsidePrizeMouth = (body: Body, height: number) => (
  body.position.x >= 24 &&
  body.position.x <= 166 &&
  body.position.y >= height - 92 &&
  body.position.y <= height - 10
)

const rebuildWalls = () => {
  if (!engine || !container.value) return
  if (walls.length) Composite.remove(engine.world, walls)

  const { clientWidth: width, clientHeight: height } = container.value
  const thickness = 96
  const wallOptions = { isStatic: true, restitution: 0.2, friction: 0.8, label: 'boundary' }
  walls = [
    Bodies.rectangle(width / 2, height + thickness / 2, width + thickness * 2, thickness, wallOptions),
    Bodies.rectangle(-thickness / 2, height / 2, thickness, height + thickness * 3, wallOptions),
    Bodies.rectangle(width + thickness / 2, height / 2, thickness, height + thickness * 3, wallOptions),
  ]
  Composite.add(engine.world, walls)

  for (const { body } of records) {
    const halfWidth = Math.max((body.bounds.max.x - body.bounds.min.x) / 2, 12)
    const halfHeight = Math.max((body.bounds.max.y - body.bounds.min.y) / 2, 12)
    Body.setPosition(body, {
      x: Math.min(Math.max(body.position.x, halfWidth), Math.max(width - halfWidth, halfWidth)),
      y: Math.min(body.position.y, height - halfHeight),
    })
  }
}

const resetBody = (body: Body, item: FallingSpriteItem, index: number) => {
  if (!container.value) return
  const size = displaySize(item)
  const padding = Math.max(size.width / 2, 12)
  const range = Math.max(container.value.clientWidth - padding * 2, 1)
  Body.setPosition(body, {
    x: padding + Math.random() * range,
    y: -size.height * (0.6 + (index % 4) * 0.45),
  })
  Body.setVelocity(body, { x: (Math.random() - 0.5) * 3, y: Math.random() * 1.2 })
  Body.setAngularVelocity(body, (Math.random() - 0.5) * 0.12)
  Body.setAngle(body, (Math.random() - 0.5) * 0.5)
}

const onStartDrag = (event: IEvent<MouseConstraint>) => {
  // Matter 在 startdrag/enddrag runtime event 上附 body，但 @types 未列這個欄位。
  const body = (event as IEvent<MouseConstraint> & { body?: Body }).body
  if (!body) return
  const record = records.find((entry) => entry.body.id === body.id)
  if (!record) return
  setRoaming(record, false)
  record.prizeEligibleUntil = 0
  grabbedId.value = record.item.id
  body.frictionAir = 0.05
}

const onEndDrag = (event: IEvent<MouseConstraint>) => {
  const body = (event as IEvent<MouseConstraint> & { body?: Body }).body
  if (body) {
    body.frictionAir = 0.02
    const record = records.find((entry) => entry.body.id === body.id)
    if (record) record.prizeEligibleUntil = performance.now() + 1800
  }
  grabbedId.value = null
}

const sync = (now: number) => {
  if (!engine || !container.value) return
  // Matter.js 建議單步不超過 60fps 的 16.67ms，避免大 delta 穿牆與 console 警告。
  const delta = lastTick ? Math.min(now - lastTick, 1000 / 60) : 1000 / 60
  lastTick = now
  Engine.update(engine, delta)

  const width = container.value.clientWidth
  const height = container.value.clientHeight
  records.forEach((record, index) => {
    const { item, body } = record
    if (record.collected) return
    if (
      body.position.x < -200 ||
      body.position.x > width + 200 ||
      body.position.y < -300 ||
      body.position.y > height + 220
    ) {
      setRoaming(record, false)
      record.prizeEligibleUntil = 0
      resetBody(body, item, index)
    }

    // PRIZE OUT 只接受「使用者抓起後 1.8 秒內放進出口」的角色，漫遊路過不會誤刪。
    if (
      record.prizeEligibleUntil >= now &&
      grabbedId.value !== item.id &&
      isInsidePrizeMouth(body, height)
    ) {
      record.collected = true
      setRoaming(record, false)
      Composite.remove(engine!.world, body)
      const element = spriteElements.get(item.id)
      if (element) element.style.opacity = '0'
      emit('prize', item.id)
      return
    }

    if (record.prizeEligibleUntil && record.prizeEligibleUntil < now) record.prizeEligibleUntil = 0

    const canWander = props.wander && grabbedId.value !== item.id && record.prizeEligibleUntil === 0
    if (canWander && !record.roaming && body.position.y >= height * 0.58) {
      setRoaming(record, true)
      chooseWanderTarget(record, width, height, now)
      Body.setVelocity(body, { x: 0, y: 0 })
      Body.setAngularVelocity(body, 0)
    }
    if (canWander && record.roaming) {
      const dx = record.target.x - body.position.x
      const dy = record.target.y - body.position.y
      const distance = Math.hypot(dx, dy)
      if (distance < 20 || now >= record.nextTurnAt) {
        chooseWanderTarget(record, width, height, now)
      } else {
        const desiredX = (dx / distance) * record.speed
        const desiredY = (dy / distance) * record.speed * 0.72
        if (Math.abs(desiredX) > 0.05) record.facing = desiredX >= 0 ? 1 : -1
        Body.setVelocity(body, {
          x: body.velocity.x * 0.45 + desiredX * 0.55,
          y: body.velocity.y * 0.25 + desiredY * 0.75,
        })
      }
      Body.setAngularVelocity(body, 0)
      Body.setAngle(body, body.angle * 0.55)
    }

    if (
      props.uprightWhenFree &&
      grabbedId.value !== item.id &&
      body.speed < 0.35 &&
      body.angularSpeed < 0.05
    ) {
      Body.setAngularVelocity(body, body.angularVelocity * 0.7)
      Body.setAngle(body, body.angle * 0.88)
    }

    const element = spriteElements.get(item.id)
    if (element) {
      element.style.left = `${body.position.x}px`
      element.style.top = `${body.position.y}px`
      element.style.transform = `translate(-50%, -50%) rotate(${body.angle}rad) scaleX(${record.facing})`
      element.style.zIndex = String(30 + Math.round(body.position.y))
    }
  })

  ready.value = true
  animationFrame = requestAnimationFrame(sync)
}

const stop = () => {
  cancelAnimationFrame(animationFrame)
  resizeObserver?.disconnect()
  resizeObserver = null

  if (mouseConstraint) {
    Events.off(mouseConstraint, 'startdrag', onStartDrag)
    Events.off(mouseConstraint, 'enddrag', onEndDrag)
  }
  if (mouse) Mouse.clearSourceEvents(mouse)
  if (engine) {
    Composite.clear(engine.world, false, true)
    Engine.clear(engine)
  }

  engine = null
  mouse = null
  mouseConstraint = null
  records = []
  walls = []
  grabbedId.value = null
  roamingIds.value = new Set()
  ready.value = false
  lastTick = 0
  appliedScale = props.scale
}

const start = async () => {
  if (started.value || !container.value || !props.sprites.length) return
  started.value = true
  await nextTick()

  engine = Engine.create()
  engine.gravity.y = props.gravity
  appliedScale = props.scale
  rebuildWalls()

  records = props.sprites.map((item, index) => {
    const size = displaySize(item)
    const body = Bodies.rectangle(0, 0, size.width * 0.9, size.height * 0.9, {
      restitution: props.restitution,
      friction: 0.35,
      frictionAir: 0.02,
      density: 0.002,
      label: item.id,
    })
    resetBody(body, item, index)
    return {
      item,
      body,
      roaming: false,
      target: { x: 0, y: 0 },
      speed: 0.6,
      facing: Math.random() > 0.5 ? 1 : -1,
      nextTurnAt: 0,
      prizeEligibleUntil: 0,
      collected: false,
    }
  })
  Composite.add(engine.world, records.map(({ body }) => body))

  mouse = Mouse.create(container.value)
  mouseConstraint = MouseConstraint.create(engine, {
    mouse,
    constraint: { stiffness: props.grabStiffness, damping: 0.12, render: { visible: false } },
  })
  Composite.add(engine.world, mouseConstraint)
  Events.on(mouseConstraint, 'startdrag', onStartDrag)
  Events.on(mouseConstraint, 'enddrag', onEndDrag)

  resizeObserver = new ResizeObserver(rebuildWalls)
  resizeObserver.observe(container.value)
  animationFrame = requestAnimationFrame(sync)
}

const onClick = () => {
  if (props.trigger === 'click') void start()
}
const onHover = () => {
  if (props.trigger === 'hover') void start()
}
const updateClawPoint = (event: PointerEvent) => {
  if (!container.value) return
  const rect = container.value.getBoundingClientRect()
  clawPoint.value = {
    x: Math.min(Math.max(event.clientX - rect.left, 0), rect.width),
    y: Math.min(Math.max(event.clientY - rect.top, 48), rect.height),
  }
}
const onPointerEnter = (event: PointerEvent) => {
  pointerInside.value = true
  updateClawPoint(event)
  onHover()
}
const onPointerLeave = () => {
  pointerInside.value = false
}

onMounted(() => {
  if (props.trigger === 'auto') void start()
})
onBeforeUnmount(stop)

watch(() => props.scale, (nextScale) => {
  if (!engine || !container.value || appliedScale <= 0) {
    appliedScale = nextScale
    return
  }
  // 只縮放既有剛體，不重啟 Engine；連續按 +/- 不會讓非同步重建互相踩掉而少角色。
  const ratio = nextScale / appliedScale
  for (const record of records) {
    Body.scale(record.body, ratio, ratio)
    if (record.roaming) chooseWanderTarget(record, container.value.clientWidth, container.value.clientHeight, performance.now())
  }
  appliedScale = nextScale
  rebuildWalls()
})
watch(() => props.gravity, (gravity) => {
  if (engine) engine.gravity.y = gravity
})
watch(() => props.restitution, (restitution) => {
  for (const { body } of records) body.restitution = restitution
})
watch(() => props.grabStiffness, (stiffness) => {
  if (mouseConstraint) mouseConstraint.constraint.stiffness = stiffness
})
</script>

<template>
  <div
    ref="container"
    class="falling-sprites relative size-full min-h-64 overflow-hidden select-none"
    role="application"
    aria-label="可拖曳的像素角色夾娃娃機"
    @click="onClick"
    @pointerenter="onPointerEnter"
    @pointermove="updateClawPoint"
    @pointerleave="onPointerLeave"
  >
    <div class="claw-top-rail pointer-events-none absolute inset-x-0 top-0 z-[900] h-2" />
    <div
      v-show="clawVisible"
      class="claw-cable pointer-events-none absolute top-0 z-[900] w-0.5 -translate-x-1/2"
      :style="cableStyle"
    />
    <svg
      v-show="clawVisible"
      class="claw-machine pointer-events-none absolute z-[950] h-[58px] w-[64px] -translate-x-1/2 -translate-y-full overflow-visible drop-shadow-[0_2px_3px_rgb(0_0_0/0.5)]"
      :class="{ 'is-closed': grabbedId }"
      :style="clawStyle"
      viewBox="0 0 64 58"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="claw-metal" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#f8fafc" />
          <stop offset="0.42" stop-color="#94a3b8" />
          <stop offset="0.72" stop-color="#e2e8f0" />
          <stop offset="1" stop-color="#64748b" />
        </linearGradient>
      </defs>
      <path d="M28 2h8v10h-8z" fill="url(#claw-metal)" stroke="#334155" stroke-width="1.5" />
      <rect x="23" y="10" width="18" height="13" rx="5" fill="url(#claw-metal)" stroke="#334155" stroke-width="2" />
      <circle cx="32" cy="17" r="3" fill="hsl(var(--primary))" />
      <g class="claw-arm claw-arm-left">
        <path d="M27 20C22 25 15 28 12 38C10 45 13 51 20 53" fill="none" stroke="#334155" stroke-width="7" stroke-linecap="round" />
        <path d="M27 20C22 25 15 28 12 38C10 45 13 51 20 53" fill="none" stroke="url(#claw-metal)" stroke-width="4" stroke-linecap="round" />
        <path d="M20 53l-5-1 4-5" fill="url(#claw-metal)" stroke="#334155" stroke-width="1.5" stroke-linejoin="round" />
      </g>
      <g class="claw-arm claw-arm-right">
        <path d="M37 20C42 25 49 28 52 38C54 45 51 51 44 53" fill="none" stroke="#334155" stroke-width="7" stroke-linecap="round" />
        <path d="M37 20C42 25 49 28 52 38C54 45 51 51 44 53" fill="none" stroke="url(#claw-metal)" stroke-width="4" stroke-linecap="round" />
        <path d="M44 53l5-1-4-5" fill="url(#claw-metal)" stroke="#334155" stroke-width="1.5" stroke-linejoin="round" />
      </g>
      <g class="claw-arm claw-arm-center">
        <path d="M32 22v22c0 5-3 8-7 10" fill="none" stroke="#334155" stroke-width="6" stroke-linecap="round" />
        <path d="M32 22v22c0 5-3 8-7 10" fill="none" stroke="url(#claw-metal)" stroke-width="3" stroke-linecap="round" />
      </g>
    </svg>

    <div
      v-for="item in sprites"
      :key="item.id"
      :ref="(element) => setSpriteElement(item.id, element)"
      class="pointer-events-none absolute will-change-transform [image-rendering:pixelated]"
      :class="ready ? 'opacity-100' : 'opacity-0'"
      :title="item.label"
    >
      <PixelSprite
        :asset="grabbedId === item.id
          ? (item.grab ?? item.idle)
          : (roamingIds.has(item.id) ? (item.move ?? item.idle) : item.idle)"
        :width="item.width * scale"
        :height="item.height * scale"
      />
    </div>

    <button
      v-if="!started && trigger !== 'auto'"
      type="button"
      class="absolute inset-0 grid place-items-center bg-background/30 font-pixel text-xs text-muted-foreground"
      @click.stop="start"
    >
      {{ trigger === 'hover' ? 'HOVER TO DROP' : 'CLICK TO DROP' }}
    </button>
  </div>
</template>

<style scoped>
.falling-sprites {
  touch-action: none;
  cursor: none;
}
.claw-top-rail {
  background:
    linear-gradient(90deg, transparent, hsl(var(--primary) / 0.8), transparent),
    linear-gradient(180deg, #64748b, #e2e8f0 45%, #334155 55%, #0f172a);
  box-shadow: 0 2px 5px rgb(0 0 0 / 0.35);
}
.claw-cable {
  background: linear-gradient(90deg, #334155, #f8fafc 45%, #64748b);
  box-shadow: 0 0 4px hsl(var(--primary) / 0.45);
}
.claw-arm {
  transition: transform 120ms ease-out;
}
.claw-arm-left {
  transform-origin: 27px 20px;
}
.claw-arm-right {
  transform-origin: 37px 20px;
}
.claw-arm-center {
  transform-origin: 32px 22px;
  opacity: 0.72;
}
.claw-machine.is-closed .claw-arm-left {
  transform: rotate(-17deg);
}
.claw-machine.is-closed .claw-arm-right {
  transform: rotate(17deg);
}
.claw-machine.is-closed .claw-arm-center {
  transform: translateY(-3px) scaleY(0.88);
}
</style>
