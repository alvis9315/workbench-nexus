# FallingSprites 實作規格 — 夾娃娃機互動元件

> **歸檔位置**:`docs/falling-sprites-spec.md`(2026-07-21 歸檔)。關聯文件:
> [`theme-mainline-v2.md`](theme-mainline-v2.md)(上位方向文件,grab 槽位規範以它為準)、
> [`../../../ui-asset-library/docs/LPC-pipeline-summary.md`](../../../ui-asset-library/docs/LPC-pipeline-summary.md)(素材管線正本,在 ui-asset-library repo)。
> 實作項目已併入 `docs/backlog.md`(C 系列條目)。
>
> 本文件為獨立實作規格,交付 Claude Code。

## 0. 給 Claude Code:本文件的歸檔指示

請你先自行判斷這份規格在專案中的歸檔方式,再開始實作。判斷原則:

- 依 workbench-nexus repo 現有的文件慣例決定位置(若已有 `docs/`、`specs/` 或同類目錄則跟隨;
  若無,由你建立合理的結構並在 commit message 說明)。
- 檔名自行取,但需與 `LPC-pipeline-summary.md` 的歸檔位置相鄰或互相連結,
  兩份文件屬同一條管線的上下游。
- 若 summary 的待辦清單已被你轉成 issue/todo 形式,請把本規格的實作項目**併入同一套追蹤**,
  不要另起爐灶。
- 歸檔後在文件開頭補上你決定的路徑與關聯文件連結,保持自我描述完整。

## 1. 功能目標

一個 Vue 3 元件 `FallingSprites.vue`:像素角色(LPC sprite)從容器頂端掉落、彈跳、堆疊,
滑鼠可以像**夾娃娃機**一樣抓住任意角色拖曳甩動,放開後自然落回。
用於 workbench-nexus 的趣味互動區(例如進入畫面或 roster 頁的彩蛋區塊)。

## 2. 技術基礎

概念源自 react-bits 的 Falling Text(https://reactbits.dev/text-animations/falling-text),
其原始碼機制已確認:

- Matter.js 建立 Engine + 四面靜態牆(地板/左右/天花板)= 娃娃機箱體
- 每個掉落物是一個 `Bodies.rectangle` 剛體,`restitution: 0.8` 產生彈跳
- `MouseConstraint` 提供抓取拖曳(核心互動,引擎原生)
- `requestAnimationFrame` 迴圈把剛體 position/angle 同步回 DOM 元素的 `left/top/transform`

原版唯一與「文字」相關的部分是把 text split 成 span——**本規格把 span 換成 sprite 元素,
其餘架構照搬**。React → Vue 3 翻譯:lifecycle 對應 `onMounted`/`onBeforeUnmount`,
狀態用 `ref`,Matter.js 本身框架無關。

## 3. 元件 API

```
props:
  sprites: Array<{
    id: string,
    src: string,        // 透明背景 strip PNG(idle_down)
    grabSrc?: string,   // 被抓取時的 strip(建議 jump_down 或 hurt_down),省略則沿用 src
    frames: number, grabFrames?: number,
    size?: number,      // 原始格子尺寸,預設 64
    fps?: number,       // 預設 4(idle 節奏)
  }>
  scale?: number            // 顯示放大倍數,預設 2,nearest-neighbor
  gravity?: number          // 預設 1
  restitution?: number      // 彈性,預設 0.8
  grabStiffness?: number    // MouseConstraint stiffness,預設 0.2(越小越 Q 彈)
  uprightWhenFree?: boolean // true 時未被抓取的角色鎖直立(見 §4.3),預設 false
  trigger?: 'auto' | 'click' | 'hover'   // 沿用原版三種啟動方式
```

角色渲染沿用既有的 `PixelSprite.vue`(strip + CSS `steps()`),外層包一個絕對定位的
wrapper div 作為物理同步目標。**素材必須是透明背景 strip**(白底 GIF 會出白框,
產法見 pipeline summary §2.3 與 §5)。

## 4. 實作細節

### 4.1 剛體與同步

- 每個 sprite 的剛體尺寸 = 顯示尺寸(size × scale),可略縮 10% 讓堆疊更緊密。
- 初始位置:沿容器頂部隨機 x、y 為負值(從畫面外掉入),
  加入原版的隨機初速與角速度(`setVelocity` / `setAngularVelocity`)。
- rAF 迴圈同步 `left/top` + `translate(-50%,-50%) rotate(angle)`;
  wrapper 上必須有 `image-rendering: pixelated`。
- 效能:六~十二隻剛體對 Matter.js 是零負擔;rAF 迴圈在元件卸載時務必取消,
  並照原版做 Render/Runner/World/Engine 的完整清理。
- 容器 resize 需重建牆體(原版未處理,是已知缺陷,請補上 ResizeObserver)。

### 4.2 抓取垂墜感(本規格的重點需求)

需求:抓住角色時,要有「布偶被拎起、頭/手腳垂下晃動」的感覺。
採**兩層疊加**方案,皆為低成本:

**A. 自然垂墜擺盪(物理層,幾乎免費)**
MouseConstraint 抓取點保留在滑鼠實際按下的位置(原版預設行為,勿改成鎖定質心)。
抓取點偏離質心時,剛體會自然旋轉成「抓點朝上、重心垂下」並隨滑鼠移動擺盪——
這正是夾娃娃機公仔被爪子拎著晃的物理。要點:

- 被抓取期間**不得鎖旋轉**(inertia 保持有限值),否則垂墜感消失。
- `grabStiffness` 調低(0.1~0.2)會有延遲跟手的 Q 彈感,更像軟綿綿的布偶。
- 可選加成:抓取期間把該剛體的 `frictionAir` 稍調高(如 0.02→0.05),
  放開後恢復,擺盪會多一點「布料阻尼」的鈍感。

**B. 抓取換姿勢(表現層,一個狀態判斷)**
`mousedown` 抓到剛體時(監聽 MouseConstraint 的 `startdrag` 事件)把該角色的
strip 換成 `grabSrc`(jump/hurt 的四肢張開姿勢),`enddrag` 換回 idle。
四肢張開 + 整體垂墜擺盪,視覺上即為「手腳無力下垂」的布偶暗示。

**明確不做:真 ragdoll**(頭/軀幹/四肢獨立剛體 + 關節)。
LPC sprite 是整張 frame 而非可拆骨架,拆件重組的工程量與 64px 下的視覺回報完全不成比例。
若未來想強化,優先方向是替 grabSrc 增加專用的「被拎起」自繪 frame,而非物理拆件。

### 4.3 直立選項

`uprightWhenFree: true` 時,角色落地靜止後以緩動轉回 angle 0(或對靜止剛體
`Body.setAngle(0)` + 鎖 inertia),被抓起時解鎖。像素圖旋轉有鋸齒感,
若成品觀感不佳,此開關是後路。預設關閉(翻滾更有娃娃機味)。

### 4.4 觸發與邊界

- `trigger` 三模式照原版:auto 立即、click/hover 啟動。
- 建議在 workbench 的用法:進入畫面載入完成後 auto 掉落六隻 roster 角色。
- 角色被甩出容器的保險:每個 tick 檢查剛體位置,超出邊界過遠則 reset 回頂部重掉
  (原版牆體理論上擋得住,但高速甩動可能穿隧,Matter.js 已知行為)。

## 5. 驗收標準

1. 六隻角色從頂部掉落、互相碰撞堆疊,idle 動畫在翻滾中持續播放
2. 滑鼠按住角色任意位置可拎起,角色自然轉為抓點朝上、垂墜擺盪,跟手有 Q 彈延遲
3. 拎起瞬間換成四肢張開姿勢,放開落下後換回 idle
4. 深色背景下無白框(素材透明)
5. 元件卸載無 memory leak(rAF、Matter 實體、ResizeObserver 全清)
6. 容器 resize 後牆體正確,角色不會掉出畫面

## 6. 實作紀錄（2026-07-22）

- 元件:`src/components/effects/FallingSprites.vue`
- 接入點:`src/views/HomeView.vue` 的 `SPRITE DROP`;使用者可從「夾娃娃」按鈕開關
- 資料來源:直接讀 `activeTheme` 的 `idle`／`grab` 語意槽,不依賴特定主題姿勢名
- 顯示策略:各主題 frame 等比例正規化到 72px；每主題 roster 各自記憶，建議 12–18 隻、硬上限 24 隻；切主題或修改 roster 時以 key 重建物理世界
- 夾具視覺:容器頂部金屬導軌 + 隨 pointer 伸縮的纜線 + 三爪 SVG；成功抓取時三爪收合，原生 cursor 在箱體內隱藏
- 尺寸控制:`wn-toybox-scale` 記憶 60–160% 顯示倍率；調整後重建對應大小的 Matter 剛體
- roster 操作:新增角色、只顯示已加入角色的清單、單隻 × 移除與全部清空；技能卡僅在夾娃娃區開啟時提供原生 drag，drop 後依目前主題角色加入
- Guild grab 槽位優先序:`hurt_down` → `jump_down` → `walk_down`；目前六角全數命中 `hurt_down`
- 驗證:lint／typecheck／build 全綠;Chrome headless 實測六隻移動、按住切 grab、拖曳位移、放開回 idle;Guild／Pokémon／Marvel 分別載入 6／12／6 隻
