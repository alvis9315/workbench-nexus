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
import hookCursor from '@/assets/cursors/crane-hook.svg?url'
import hookGrabCursor from '@/assets/cursors/crane-hook-grab.svg?url'

export interface FallingSpriteItem {
  id: string
  label: string
  idle: PoseAsset
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
    trigger?: 'auto' | 'click' | 'hover'
  }>(),
  {
    scale: 1,
    gravity: 1,
    restitution: 0.8,
    grabStiffness: 0.16,
    uprightWhenFree: false,
    trigger: 'auto',
  },
)

const container = ref<HTMLElement | null>(null)
const started = ref(false)
const ready = ref(false)
const grabbedId = ref<string | null>(null)
const spriteElements = new Map<string, HTMLElement>()
const cursorStyle = computed(() => ({
  cursor: grabbedId.value
    ? `url("${hookGrabCursor}") 8 27, grabbing`
    : `url("${hookCursor}") 6 27, grab`,
}))

let engine: Engine | null = null
let mouse: Mouse | null = null
let mouseConstraint: MouseConstraint | null = null
let resizeObserver: ResizeObserver | null = null
let animationFrame = 0
let lastTick = 0
let walls: Body[] = []
let records: { item: FallingSpriteItem; body: Body }[] = []

const setSpriteElement = (id: string, element: unknown) => {
  if (element instanceof HTMLElement) spriteElements.set(id, element)
  else spriteElements.delete(id)
}

const displaySize = (item: FallingSpriteItem) => ({
  width: item.width * props.scale,
  height: item.height * props.scale,
})

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
    Bodies.rectangle(width / 2, -thickness * 1.5, width + thickness * 2, thickness, wallOptions),
  ]
  Composite.add(engine.world, walls)

  for (const { body } of records) {
    Body.setPosition(body, {
      x: Math.min(Math.max(body.position.x, 12), Math.max(width - 12, 12)),
      y: Math.min(body.position.y, height - 12),
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
  grabbedId.value = record.item.id
  body.frictionAir = 0.05
}

const onEndDrag = (event: IEvent<MouseConstraint>) => {
  const body = (event as IEvent<MouseConstraint> & { body?: Body }).body
  if (body) body.frictionAir = 0.02
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
  records.forEach(({ item, body }, index) => {
    if (
      body.position.x < -200 ||
      body.position.x > width + 200 ||
      body.position.y < -300 ||
      body.position.y > height + 220
    ) {
      resetBody(body, item, index)
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
      element.style.transform = `translate(-50%, -50%) rotate(${body.angle}rad)`
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
  ready.value = false
  lastTick = 0
}

const start = async () => {
  if (started.value || !container.value || !props.sprites.length) return
  started.value = true
  await nextTick()

  engine = Engine.create()
  engine.gravity.y = props.gravity
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
    return { item, body }
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

onMounted(() => {
  if (props.trigger === 'auto') void start()
})
onBeforeUnmount(stop)

watch(
  () => [props.gravity, props.restitution, props.grabStiffness] as const,
  () => {
    if (!started.value) return
    stop()
    started.value = false
    void start()
  },
)
</script>

<template>
  <div
    ref="container"
    class="falling-sprites relative size-full min-h-64 overflow-hidden select-none"
    role="application"
    aria-label="可拖曳的像素角色夾娃娃機"
    :style="cursorStyle"
    @click="onClick"
    @pointerenter="onHover"
  >
    <div
      v-for="item in sprites"
      :key="item.id"
      :ref="(element) => setSpriteElement(item.id, element)"
      class="pointer-events-none absolute will-change-transform [image-rendering:pixelated]"
      :class="ready ? 'opacity-100' : 'opacity-0'"
      :title="item.label"
    >
      <PixelSprite
        :asset="grabbedId === item.id ? (item.grab ?? item.idle) : item.idle"
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
}
</style>
