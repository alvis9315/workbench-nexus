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

type WalkDirection = 'up' | 'down' | 'left' | 'right'
type ClawCommand = 'left' | 'right' | 'up' | 'down' | 'confirm' | 'drop' | 'grab'

export interface FallingSpriteItem {
  id: string
  label: string
  idle: PoseAsset
  move?: PoseAsset
  /** 有四方向素材的主題依 2.5D 移動向量切換步態。 */
  moveByDirection?: Partial<Record<WalkDirection, PoseAsset>>
  grab?: PoseAsset
  action?: PoseAsset
  /** 同角色切換姿勢時用來增量更新，不重建整個物理世界。 */
  poseKey?: string
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
    controlMode?: 'free' | 'direct' | 'arcade'
    command?: { sequence: number; action: ClawCommand }
  }>(),
  {
    scale: 1,
    gravity: 1,
    restitution: 0.8,
    grabStiffness: 0.16,
    uprightWhenFree: false,
    wander: false,
    trigger: 'auto',
    controlMode: 'free',
  },
)
const emit = defineEmits<{ prize: [id: string] }>()

const container = ref<HTMLElement | null>(null)
const started = ref(false)
const ready = ref(false)
const grabbedId = ref<string | null>(null)
const walkingIds = ref<Set<string>>(new Set())
const walkingDirections = ref<Record<string, WalkDirection>>({})
const battlingIds = ref<Set<string>>(new Set())
const pointerInside = ref(false)
const clawPoint = ref({ x: 0, y: 0 })
const clawAnchorX = ref(0)
const clawSupportY = ref(8)
const clawAngle = ref(0)
const clawClosed = ref(false)
const arcadeStatus = ref<'aim' | 'descending' | 'lifting' | 'holding'>('aim')
const spriteElements = new Map<string, HTMLElement>()
const clawVisible = computed(() => started.value && (props.controlMode === 'arcade' || pointerInside.value || Math.abs(clawAngle.value) > 0.012 || grabbedId.value !== null))
const cableStyle = computed(() => ({
  left: `${clawAnchorX.value}px`,
  top: `${clawSupportY.value}px`,
  height: `${Math.max(Math.hypot(clawPoint.value.x - clawAnchorX.value, clawPoint.value.y - clawSupportY.value), 0)}px`,
  transform: `translateX(-50%) rotate(${-Math.atan2(clawPoint.value.x - clawAnchorX.value, Math.max(clawPoint.value.y - clawSupportY.value, 1))}rad)`,
}))
const clawStyle = computed(() => ({
  left: `${clawPoint.value.x}px`,
  top: `${clawPoint.value.y}px`,
  transform: `translateX(-50%) rotate(${-clawAngle.value}rad) scale(${props.controlMode === 'arcade' ? 0.88 + clawDepth.value * 0.12 : 1})`,
}))
const depthGantryStyle = computed(() => ({
  left: `${clawAnchorX.value}px`,
  top: '8px',
  height: `${Math.max(clawSupportY.value - 8, 0)}px`,
}))

let engine: Engine | null = null
let mouse: Mouse | null = null
let mouseConstraint: MouseConstraint | null = null
let resizeObserver: ResizeObserver | null = null
let animationFrame = 0
let lastTick = 0
let appliedScale = props.scale
let walls: Body[] = []
let clawAnchorTarget = 0
let clawAnchorVelocity = 0
let clawRopeLength = 120
let clawRopeTarget = 120
let clawAngularVelocity = 0
let lastAnchorVelocity = 0
const clawDepth = ref(0.5)
let clawDepthTarget = 0.5
let manualGrabbedId: string | null = null
let arcadeAutoGrabAt = 0
const ARCADE_DROP_SPEED = 82
const ARCADE_LIFT_SPEED = 128
interface SpriteRecord {
  item: FallingSpriteItem
  body: Body
  roaming: boolean
  walking: boolean
  target: { x: number; y: number }
  speed: number
  facing: 1 | -1
  stepPhase: number
  pausedUntil: number
  nextTurnAt: number
  prizeEligibleUntil: number
  collected: boolean
  battlingUntil: number
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

const setWalking = (record: SpriteRecord, value: boolean) => {
  if (record.walking === value) return
  record.walking = value
  const next = new Set(walkingIds.value)
  if (value) next.add(record.item.id)
  else next.delete(record.item.id)
  walkingIds.value = next
}

const setWalkingDirection = (record: SpriteRecord, direction: WalkDirection) => {
  if (walkingDirections.value[record.item.id] === direction) return
  walkingDirections.value = { ...walkingDirections.value, [record.item.id]: direction }
}

const setBattling = (record: SpriteRecord, until: number) => {
  record.battlingUntil = until
  const next = new Set(battlingIds.value)
  next.add(record.item.id)
  battlingIds.value = next
  setWalking(record, false)
}

const clearBattling = (record: SpriteRecord) => {
  if (!battlingIds.value.has(record.item.id)) return
  const next = new Set(battlingIds.value)
  next.delete(record.item.id)
  battlingIds.value = next
}

const playBounds = (item: FallingSpriteItem, width: number, height: number) => {
  const size = displaySize(item)
  // 旋轉中的整張圖也不得越過左右銀色滑軌，因此用外接圓而非剛體寬度。
  const halfW = Math.max(Math.hypot(size.width, size.height) / 2, 18)
  const halfH = Math.max(size.height / 2, 18)
  return {
    minX: 14 + halfW,
    maxX: Math.max(width - 14 - halfW, 14 + halfW),
    maxY: height - 24 - halfH,
  }
}

const setRoaming = (record: SpriteRecord, value: boolean) => {
  record.roaming = value
  if (!value) setWalking(record, false)
}

// HomeView 的洞口位於 left:24px、bottom:20px、176x92px。角色本體不能進入
// 洞口及擋板後方；只有使用者抓著角色時能跨進這個保留區並投入出口。
const prizeChuteBounds = (item: FallingSpriteItem, height: number) => {
  const size = displaySize(item)
  return {
    right: 24 + 176 + 12 + size.width / 2,
    top: height - 20 - 92 - 16 - size.height / 2,
  }
}

const chooseWanderTarget = (record: SpriteRecord, width: number, height: number, now: number) => {
  const size = displaySize(record.item)
  const halfW = Math.max(size.width / 2, 18)
  const halfH = Math.max(size.height / 2, 18)
  const floorTop = height * 0.53
  const target = {
    x: 14 + halfW + Math.random() * Math.max(width - 28 - halfW * 2, 1),
    y: Math.min(
      height - halfH - 24,
      floorTop + halfH + Math.random() * Math.max(height - floorTop - halfH * 2 - 24, 1),
    ),
  }
  const chute = prizeChuteBounds(record.item, height)
  if (target.x < chute.right && target.y > chute.top) {
    target.x = Math.min(chute.right + Math.random() * 70, width - halfW - 14)
  }
  record.target = target
  record.speed = 0.45 + Math.random() * 0.55
  record.pausedUntil = now + 280 + Math.random() * 900
  record.nextTurnAt = now + 1800 + Math.random() * 3200
}

const isInsidePrizeMouth = (body: Body, height: number) => (
  body.position.x >= 24 &&
  body.position.x <= 205 &&
  body.position.y >= height - 92 &&
  body.position.y <= height - 10
)

const keepOutsidePrizeChute = (record: SpriteRecord, width: number, height: number) => {
  if (grabbedId.value === record.item.id || manualGrabbedId === record.item.id) return
  const chute = prizeChuteBounds(record.item, height)
  if (record.body.position.x >= chute.right || record.body.position.y <= chute.top) return

  const size = displaySize(record.item)
  const safeX = Math.min(chute.right, width - Math.max(size.width / 2, 18) - 14)
  Body.setPosition(record.body, { x: safeX, y: record.body.position.y })
  Body.setVelocity(record.body, {
    x: Math.max(Math.abs(record.body.velocity.x) * 0.35, 0.28),
    y: record.body.velocity.y * 0.45,
  })
  record.facing = 1
  if (record.target.x < chute.right && record.target.y > chute.top) {
    record.target.x = Math.min(chute.right + 36, width - Math.max(size.width / 2, 18) - 14)
  }
}

const updateClawPhysics = (deltaSeconds: number, width: number, height: number) => {
  if (!clawAnchorX.value) {
    clawAnchorX.value = width / 2
    clawAnchorTarget = width / 2
  }
  clawAnchorTarget = Math.min(Math.max(clawAnchorTarget, 48), width - 48)
  clawRopeTarget = Math.min(Math.max(clawRopeTarget, 46), height - 72)
  clawDepthTarget = Math.min(Math.max(clawDepthTarget, 0), 1)
  clawDepth.value += (clawDepthTarget - clawDepth.value) * Math.min(deltaSeconds * 3.2, 1)
  clawSupportY.value = props.controlMode === 'arcade' ? 8 + clawDepth.value * 38 : 8

  if (props.controlMode === 'direct') {
    clawAnchorX.value = clawAnchorTarget
    clawAnchorVelocity = 0
    clawAngularVelocity = 0
    clawAngle.value = 0
  } else {
    // 較低的彈簧係數與較高阻尼，讓滑車和金屬爪呈現有重量的遲滯。
    const anchorAcceleration = (clawAnchorTarget - clawAnchorX.value) * 16 - clawAnchorVelocity * 7
    clawAnchorVelocity += anchorAcceleration * deltaSeconds
    clawAnchorX.value += clawAnchorVelocity * deltaSeconds
  }

  // 固定 px/s：指數追蹤會讓目標越遠的前景爪初速越快，導致前／後深度速度不一致。
  const ropeSpeed = arcadeStatus.value === 'descending'
    ? ARCADE_DROP_SPEED
    : arcadeStatus.value === 'lifting'
      ? ARCADE_LIFT_SPEED
      : props.controlMode === 'direct' ? 190 : 145
  const ropeDelta = clawRopeTarget - clawRopeLength
  const ropeStep = Math.sign(ropeDelta) * Math.min(Math.abs(ropeDelta), ropeSpeed * deltaSeconds)
  clawRopeLength += ropeStep

  if (props.controlMode !== 'direct') {
    // 支點加速會把爪子甩向反方向；較慢的回復力保留厚重金屬爪的擺幅。
    const supportAcceleration = (clawAnchorVelocity - lastAnchorVelocity) / Math.max(deltaSeconds, 0.001)
    const angularAcceleration = -7.5 * Math.sin(clawAngle.value) - supportAcceleration / Math.max(clawRopeLength, 60) - clawAngularVelocity * 0.62
    clawAngularVelocity += angularAcceleration * deltaSeconds
    clawAngle.value += clawAngularVelocity * deltaSeconds
    clawAngle.value = Math.min(Math.max(clawAngle.value, -0.62), 0.62)
  }
  lastAnchorVelocity = clawAnchorVelocity

  clawPoint.value = {
    x: clawAnchorX.value + Math.sin(clawAngle.value) * clawRopeLength,
    y: clawSupportY.value + Math.cos(clawAngle.value) * clawRopeLength,
  }
}

const clawTipPoint = () => ({ x: clawPoint.value.x, y: clawPoint.value.y + 52 })

const nearestRecordToClaw = () => {
  let nearest: SpriteRecord | null = null
  let nearestDistance = 92
  for (const record of records) {
    if (record.collected) continue
    const tip = clawTipPoint()
    const distance = Math.hypot(record.body.position.x - tip.x, record.body.position.y - tip.y)
    if (distance < nearestDistance) {
      nearest = record
      nearestDistance = distance
    }
  }
  return nearest
}

const closeArcadeClaw = () => {
  if (arcadeStatus.value !== 'descending') return
  clawClosed.value = true
  const record = nearestRecordToClaw()
  if (record) {
    manualGrabbedId = record.item.id
    grabbedId.value = record.item.id
    setRoaming(record, false)
    record.prizeEligibleUntil = 0
    record.body.frictionAir = 0.12
  }
  arcadeStatus.value = 'lifting'
  clawRopeTarget = 72
}

const releaseManualGrab = () => {
  const record = records.find((entry) => entry.item.id === manualGrabbedId)
  if (record) {
    record.body.frictionAir = 0.02
    record.prizeEligibleUntil = performance.now() + 1800
    Body.setVelocity(record.body, { x: clawAnchorVelocity * 0.04, y: 0.6 })
  }
  manualGrabbedId = null
  grabbedId.value = null
  clawClosed.value = false
  arcadeStatus.value = 'aim'
}

const beginArcadeDrop = () => {
  if (!container.value || arcadeStatus.value !== 'aim') return
  clawClosed.value = false
  arcadeStatus.value = 'descending'
  const floorY = container.value.clientHeight * 0.53 + clawDepth.value * (container.value.clientHeight * 0.47 - 24)
  clawRopeTarget = Math.max(floorY - clawSupportY.value - 52, 80)
  const travelMs = Math.abs(clawRopeTarget - clawRopeLength) / ARCADE_DROP_SPEED * 1000
  arcadeAutoGrabAt = performance.now() + travelMs + 500
}

const runArcadeCommand = (action: ClawCommand) => {
  if (props.controlMode !== 'arcade' || !container.value) return
  if (action === 'left' || action === 'right') {
    if (arcadeStatus.value === 'descending' || arcadeStatus.value === 'lifting') return
    clawAnchorTarget += action === 'left' ? -54 : 54
    return
  }
  if (action === 'up' || action === 'down') {
    if (arcadeStatus.value === 'descending' || arcadeStatus.value === 'lifting') return
    // 上／下代表 2.5D 場景的後／前，不再直接收放繩子。
    clawDepthTarget += action === 'up' ? -0.14 : 0.14
    return
  }
  if (action === 'drop') {
    if (arcadeStatus.value === 'holding') releaseManualGrab()
    else beginArcadeDrop()
    return
  }
  if (action === 'grab') {
    closeArcadeClaw()
    return
  }
  if (arcadeStatus.value === 'descending') closeArcadeClaw()
  else if (arcadeStatus.value === 'holding') releaseManualGrab()
  else beginArcadeDrop()
}

const rebuildWalls = () => {
  if (!engine || !container.value) return
  if (walls.length) Composite.remove(engine.world, walls)

  const { clientWidth: width, clientHeight: height } = container.value
  const thickness = 96
  const railInset = 12
  const floorInset = 22
  const wallOptions = { isStatic: true, restitution: 0.2, friction: 0.8, label: 'boundary' }
  walls = [
    Bodies.rectangle(width / 2, height - floorInset + thickness / 2, width + thickness * 2, thickness, wallOptions),
    Bodies.rectangle(railInset - thickness / 2, height / 2, thickness, height + thickness * 3, wallOptions),
    Bodies.rectangle(width - railInset + thickness / 2, height / 2, thickness, height + thickness * 3, wallOptions),
  ]
  Composite.add(engine.world, walls)

  for (const { body, item } of records) {
    const bounds = playBounds(item, width, height)
    Body.setPosition(body, {
      x: Math.min(Math.max(body.position.x, bounds.minX), bounds.maxX),
      y: Math.min(body.position.y, bounds.maxY),
    })
  }
}

const resetBody = (body: Body, item: FallingSpriteItem, index: number) => {
  if (!container.value) return
  const size = displaySize(item)
  const padding = Math.max(size.width / 2, 12) + 14
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
  if (props.controlMode === 'arcade') return
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

const onCollisionStart = (event: IEvent<Engine> & { pairs?: Array<{ bodyA: Body; bodyB: Body }> }) => {
  const now = performance.now()
  for (const pair of event.pairs ?? []) {
    const first = records.find((entry) => entry.body.id === pair.bodyA.id)
    const second = records.find((entry) => entry.body.id === pair.bodyB.id)
    if (
      !first ||
      !second ||
      first.collected ||
      second.collected ||
      grabbedId.value === first.item.id ||
      grabbedId.value === second.item.id
    ) continue
    setBattling(first, now + 560)
    setBattling(second, now + 560)
    const direction = first.body.position.x <= second.body.position.x ? -1 : 1
    first.facing = direction === -1 ? 1 : -1
    second.facing = direction === -1 ? -1 : 1
  }
}

const sync = (now: number) => {
  if (!engine || !container.value) return
  // Matter.js 建議單步不超過 60fps 的 16.67ms，避免大 delta 穿牆與 console 警告。
  const delta = lastTick ? Math.min(now - lastTick, 1000 / 60) : 1000 / 60
  lastTick = now
  Engine.update(engine, delta)

  const width = container.value.clientWidth
  const height = container.value.clientHeight
  updateClawPhysics(delta / 1000, width, height)
  if (
    arcadeStatus.value === 'descending' &&
    (Math.abs(clawRopeTarget - clawRopeLength) < 5 || now >= arcadeAutoGrabAt)
  ) closeArcadeClaw()
  if (arcadeStatus.value === 'lifting' && clawRopeLength <= 82) arcadeStatus.value = 'holding'
  records.forEach((record, index) => {
    const { item, body } = record
    if (record.collected) return
    const bounds = playBounds(item, width, height)
    if (body.position.x < bounds.minX || body.position.x > bounds.maxX || body.position.y > bounds.maxY) {
      Body.setPosition(body, {
        x: Math.min(Math.max(body.position.x, bounds.minX), bounds.maxX),
        y: Math.min(body.position.y, bounds.maxY),
      })
      Body.setVelocity(body, {
        x: body.position.x <= bounds.minX || body.position.x >= bounds.maxX ? body.velocity.x * -0.25 : body.velocity.x,
        y: body.position.y >= bounds.maxY ? Math.min(body.velocity.y, 0) : body.velocity.y,
      })
    }
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

    // 洞口是場景中的實體缺口，不是可站立的背景層。完成投入判定後，把一般
    // 掉落／漫遊角色擋在洞口與兩面擋板之外，避免從透明區域穿到後方。
    keepOutsidePrizeChute(record, width, height)

    if (record.battlingUntil && record.battlingUntil <= now) {
      record.battlingUntil = 0
      clearBattling(record)
    }

    // 實機按鍵夾取與滑鼠自由甩爪都必須把獎品綁在「實際爪尖」，不能只讓
    // Matter 的 mouse constraint 把角色留在游標／最初抓取點，否則爪子繼續
    // 鐘擺運動時會和角色分離。直上直下模式也沿用相同的爪尖座標。
    const heldByClaw = manualGrabbedId === item.id || (
      props.controlMode !== 'arcade' &&
      grabbedId.value === item.id
    )
    if (heldByClaw) {
      const size = displaySize(item)
      const tip = clawTipPoint()
      Body.setPosition(body, { x: tip.x, y: Math.min(tip.y + size.height * 0.25, bounds.maxY) })
      Body.setVelocity(body, { x: 0, y: 0 })
      Body.setAngularVelocity(body, 0)
      Body.setAngle(body, 0)
    }

    const canWander = props.wander && grabbedId.value !== item.id && record.prizeEligibleUntil === 0 && record.battlingUntil === 0
    if (canWander && !record.roaming && body.position.y >= height * 0.53) {
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
        setWalking(record, false)
        chooseWanderTarget(record, width, height, now)
      } else if (now < record.pausedUntil) {
        setWalking(record, false)
        Body.setVelocity(body, { x: body.velocity.x * 0.62, y: body.velocity.y * 0.45 })
      } else {
        setWalking(record, true)
        // 每一步略有快慢與上下起伏，不再像固定速度的貼圖平移。
        const cadence = 0.76 + (Math.sin(now * 0.016 + record.stepPhase) + 1) * 0.12
        const depth = Math.min(Math.max((body.position.y - height * 0.53) / (height * 0.47), 0), 1)
        const perspectiveSpeed = 0.78 + depth * 0.22
        const desiredX = (dx / distance) * record.speed * cadence * perspectiveSpeed
        const desiredY = (dy / distance) * record.speed * 0.72 * cadence * perspectiveSpeed
        const walkDirection: WalkDirection = Math.abs(desiredY) > Math.abs(desiredX)
          ? (desiredY >= 0 ? 'down' : 'up')
          : (desiredX >= 0 ? 'right' : 'left')
        setWalkingDirection(record, walkDirection)
        // Guild 有真實左右圖時不再鏡像第二次；其餘主題仍用 facing 翻面。
        if (record.item.moveByDirection) record.facing = 1
        else if (Math.abs(desiredX) > 0.05) record.facing = desiredX >= 0 ? 1 : -1
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
      const stepBob = record.walking ? Math.sin(now * 0.016 + record.stepPhase) * 2.2 : 0
      const depth = Math.min(Math.max((body.position.y - height * 0.53) / (height * 0.47), 0), 1)
      const perspectiveScale = record.roaming ? 0.82 + depth * 0.18 : 1
      element.style.left = `${body.position.x}px`
      element.style.top = `${body.position.y + stepBob}px`
      element.style.transform = `translate(-50%, -50%) rotate(${body.angle}rad) scale(${perspectiveScale}) scaleX(${record.facing})`
      element.style.zIndex = String(30 + Math.round(body.position.y))
      element.classList.toggle('is-roaming', record.roaming)
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
  if (engine) Events.off(engine, 'collisionStart', onCollisionStart)
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
  walkingIds.value = new Set()
  walkingDirections.value = {}
  battlingIds.value = new Set()
  ready.value = false
  lastTick = 0
  appliedScale = props.scale
  started.value = false
  manualGrabbedId = null
  clawClosed.value = false
  arcadeStatus.value = 'aim'
}

const createRecord = (item: FallingSpriteItem, index: number): SpriteRecord => {
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
    walking: false,
    target: { x: 0, y: 0 },
    speed: 0.6,
    facing: Math.random() > 0.5 ? 1 : -1,
    stepPhase: Math.random() * Math.PI * 2,
    pausedUntil: 0,
    nextTurnAt: 0,
    prizeEligibleUntil: 0,
    collected: false,
    battlingUntil: 0,
  }
}

const reconcileSprites = () => {
  if (!engine) return
  const nextItems = new Map(props.sprites.map((item) => [item.id, item]))
  const removed = records.filter((record) => !nextItems.has(record.item.id))
  for (const record of removed) Composite.remove(engine.world, record.body)
  records = records.filter((record) => nextItems.has(record.item.id))
  const remainingIds = new Set(records.map((record) => record.item.id))
  walkingIds.value = new Set([...walkingIds.value].filter((id) => remainingIds.has(id)))
  battlingIds.value = new Set([...battlingIds.value].filter((id) => remainingIds.has(id)))
  if (manualGrabbedId && !remainingIds.has(manualGrabbedId)) releaseManualGrab()
  for (const record of records) {
    const nextItem = nextItems.get(record.item.id)
    if (!nextItem) continue
    if (record.item.width !== nextItem.width || record.item.height !== nextItem.height) {
      Body.scale(record.body, nextItem.width / record.item.width, nextItem.height / record.item.height)
    }
    record.item = nextItem
  }

  const existing = new Set(records.map((record) => record.item.id))
  const added = props.sprites.filter((item) => !existing.has(item.id)).map((item, index) => createRecord(item, records.length + index))
  if (added.length) {
    records.push(...added)
    Composite.add(engine.world, added.map((record) => record.body))
  }
}

const start = async () => {
  if (started.value || !container.value || !props.sprites.length) return
  started.value = true
  await nextTick()

  engine = Engine.create()
  engine.gravity.y = props.gravity
  appliedScale = props.scale
  rebuildWalls()

  records = props.sprites.map(createRecord)
  Composite.add(engine.world, records.map(({ body }) => body))

  mouse = Mouse.create(container.value)
  mouseConstraint = MouseConstraint.create(engine, {
    mouse,
    constraint: { stiffness: props.grabStiffness, damping: 0.12, render: { visible: false } },
  })
  mouseConstraint.collisionFilter.mask = props.controlMode === 'arcade' ? 0 : 0xffffffff
  Composite.add(engine.world, mouseConstraint)
  Events.on(mouseConstraint, 'startdrag', onStartDrag)
  Events.on(mouseConstraint, 'enddrag', onEndDrag)
  Events.on(engine, 'collisionStart', onCollisionStart)

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
  if (!container.value || props.controlMode === 'arcade') return
  const rect = container.value.getBoundingClientRect()
  clawAnchorTarget = Math.min(Math.max(event.clientX - rect.left, 48), rect.width - 48)
  // 滑鼠對準的是爪尖；繩長終點固定在爪子頂部關節，兩者相差約 52px。
  clawRopeTarget = Math.min(Math.max(event.clientY - rect.top - 60, 46), rect.height - 72)
}
const onPointerEnter = (event: PointerEvent) => {
  pointerInside.value = true
  updateClawPoint(event)
  onHover()
}
const onPointerLeave = () => {
  pointerInside.value = false
}
const onKeydown = (event: KeyboardEvent) => {
  if (props.controlMode !== 'arcade') return
  const keys: Record<string, ClawCommand> = {
    ArrowLeft: 'left',
    ArrowRight: 'right',
    ArrowUp: 'up',
    ArrowDown: 'down',
    Enter: 'confirm',
    ' ': 'confirm',
  }
  const action = keys[event.key]
  if (!action) return
  if (action === 'confirm' && event.target !== container.value) return
  event.preventDefault()
  runArcadeCommand(action)
}

onMounted(() => {
  window.addEventListener('keydown', onKeydown)
  if (props.trigger === 'auto') void start()
})
onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeydown)
  stop()
})

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
watch(() => props.sprites.map((item) => [item.id, item.poseKey, item.width, item.height, item.idle.url].join(':')).join('|'), () => {
  if (!started.value) void start()
  else reconcileSprites()
})
watch(() => props.command?.sequence, (sequence, previous) => {
  if (sequence && sequence !== previous && props.command) runArcadeCommand(props.command.action)
})
watch(() => props.controlMode, (mode) => {
  if (mouseConstraint) mouseConstraint.collisionFilter.mask = mode === 'arcade' ? 0 : 0xffffffff
  if (mode !== 'arcade' && manualGrabbedId) releaseManualGrab()
  if (mode === 'arcade' && container.value) {
    clawAnchorTarget = clawAnchorX.value || container.value.clientWidth / 2
    clawRopeTarget = 100
    clawDepthTarget = clawDepth.value
    container.value.focus()
  } else if (mode === 'direct') {
    clawAngle.value = 0
    clawAngularVelocity = 0
  }
})
</script>

<template>
  <div
    ref="container"
    class="falling-sprites relative size-full min-h-64 overflow-hidden select-none"
    role="application"
    tabindex="0"
    aria-label="可拖曳的像素角色夾娃娃機"
    @click="onClick"
    @pointerenter="onPointerEnter"
    @pointermove="updateClawPoint"
    @pointerleave="onPointerLeave"
  >
    <div class="claw-top-rail pointer-events-none absolute inset-x-0 top-0 z-[800] h-2" />
    <div
      v-if="controlMode === 'arcade'"
      class="pointer-events-none absolute right-4 top-4 z-[860] rounded border border-slate-500/60 bg-slate-950/75 px-2 py-1 font-pixel text-[7px] text-slate-300"
    >
      CLAW {{ arcadeStatus.toUpperCase() }}
    </div>
    <div
      v-show="clawVisible"
      class="claw-cable pointer-events-none absolute z-[820] w-0.5"
      :style="cableStyle"
    />
    <div
      v-if="controlMode === 'arcade'"
      class="claw-depth-gantry pointer-events-none absolute z-[815] w-1 -translate-x-1/2"
      :style="depthGantryStyle"
    />
    <svg
      v-show="clawVisible"
      class="claw-machine pointer-events-none absolute z-[840] h-[58px] w-[64px] overflow-visible drop-shadow-[0_2px_3px_rgb(0_0_0/0.5)]"
      :class="{ 'is-closed': grabbedId || clawClosed }"
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
      <path d="M28 0h8v12h-8z" fill="url(#claw-metal)" stroke="#334155" stroke-width="1.5" />
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
      <div class="sprite-ground-shadow" />
      <PixelSprite
        :asset="grabbedId === item.id
          ? (item.grab ?? item.idle)
          : (battlingIds.has(item.id)
            ? (item.action ?? item.grab ?? item.idle)
            : (walkingIds.has(item.id)
              ? (item.moveByDirection?.[walkingDirections[item.id] ?? 'down'] ?? item.move ?? item.idle)
              : item.idle))"
        :width="item.width * scale"
        :height="item.height * scale"
        class="relative z-10"
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
  transform-origin: 50% 0;
}
.claw-depth-gantry {
  background: linear-gradient(90deg, #1e293b, #cbd5e1 42%, #475569 64%, #0f172a);
  box-shadow: 0 0 3px rgb(0 0 0 / 0.55);
}
.claw-machine {
  transform-origin: 50% 0;
}
.claw-arm {
  transition: transform 220ms cubic-bezier(0.22, 0.8, 0.25, 1);
}
.claw-arm-left {
  transform-origin: 27px 20px;
  transform: rotate(26deg);
}
.claw-arm-right {
  transform-origin: 37px 20px;
  transform: rotate(-26deg);
}
.claw-arm-center {
  transform-origin: 32px 22px;
  opacity: 0.72;
  transform: translateY(4px) scaleY(1.12);
}
.claw-machine.is-closed .claw-arm-left {
  transform: rotate(-7deg);
}
.claw-machine.is-closed .claw-arm-right {
  transform: rotate(7deg);
}
.claw-machine.is-closed .claw-arm-center {
  transform: translateY(-4px) scaleY(0.82);
}
.sprite-ground-shadow {
  position: absolute;
  z-index: 0;
  right: 13%;
  bottom: -4px;
  left: 13%;
  height: 10px;
  border-radius: 50%;
  opacity: 0;
  background: rgb(2 6 23 / 0.5);
  filter: blur(2px);
  transform: scaleX(1.15);
  transition: opacity 180ms ease;
}
.is-roaming .sprite-ground-shadow {
  opacity: 0.48;
}
</style>
