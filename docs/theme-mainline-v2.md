# workbench-nexus 角色系統 — 主線方向總結 v2

> **歸檔位置**:`docs/theme-mainline-v2.md`(2026-07-21 歸檔)。關聯文件:
> - [`../../../ui-asset-library/docs/LPC-pipeline-summary.md`](../../../ui-asset-library/docs/LPC-pipeline-summary.md)(素材下載/轉換管線/六角色紀錄;正本在 ui-asset-library repo)
> - [`falling-sprites-spec.md`](falling-sprites-spec.md)(夾娃娃機互動元件,同日歸檔)
> - [`theme-source-spec.md`](theme-source-spec.md)(現行 SpriteTheme 引入流程——實作層規範,與本文件衝突時以本文件為準)
>
> 本文件是主線方向的最新總結;架構規範與舊文件衝突時**以本文件為準**(反映主題制上線後的最新決策)。
> §5 待辦已併入 `docs/backlog.md`(C 系列條目),不另起爐灶。

---

## 1. 現況(已完成)

- LPC 六隻角色(A~F)已上線 workbench,取代原 DiceBear 頭像
- 角色系統已升級為**主題制(theme-based)**:
  - 主題一:**冒險者公會**(LPC 六隻)
  - 主題二:**寶可夢**(像素角色)
  - 主題三:**Marvel: Cosmic Invasion**(私用遊戲素材)
  - 主題四:**Marvel vs. Capcom 2 · Restoration WIP**(28 位 Marvel fighter,四槽原型／完整招式還原中,私用遊戲素材)
  - 下一個原創主題:**NEON PROTOCOL**(Vesper 打樣中)
  - 任何像素素材整理後即可作為新主題擴充
- spritesheet→GIF/strip 轉換管線已驗證量產(規格見 pipeline summary §2)

## 2. 主線定調

**主題制是角色系統的核心架構,此後所有角色素材以「主題」為單位進出。**

原本的「LPC 路線 vs AI 二次元路線」二選一問題,由主題制正式化解:
兩者不衝突、不互相取代,各自成為可切換的主題。roadmap:

| 主題 | 素材來源 | 狀態 |
|---|---|---|
| 冒險者公會 | LPC generator(白名單隨機 → 下載 → 管線轉換) | 已上線 |
| 寶可夢 | 現成像素素材 | 已上線 |
| Marvel: Cosmic Invasion | The Spriters Resource 遊戲素材 | 已上線,私人不可分享 |
| Marvel vs. Capcom 2 | The Spriters Resource 遊戲素材 | 28 角四槽原型已上線；完整招式與特效時序還原中，私人不可分享 |
| **NEON PROTOCOL** | 兩段式 AI 生成(§4),Vesper 原創角色 | 素材採樣完成,動畫幀待補 |

「本命主題」是當初定案的角色形象方向(原創女性角色、御姐/少女、人形高頭身、
參考現代二次元手遊審美)的正式落地位置——LPC 主題解決「有沒有」,本命主題解決「像不像想要的」。

## 3. 主題系統規範(本次新增,請 Claude Code 核對現況、缺的補上)

### 3.1 主題 manifest 資料化

每個主題一份 `characters.json`,UI 只讀 manifest 渲染,不寫死任何角色:

```json
{
  "theme_id": "adventurers-guild",
  "theme_name": "冒險者公會",
  "shareable": true,
  "credits": "CREDITS.md",
  "characters": [
    {
      "id": "A_sword_red",
      "label": "紅髮劍士",
      "accent": "#c0392b",
      "frame_w": 64, "frame_h": 64,
      "anims": {
        "idle":  { "src": "sprites/A/idle_down.png",  "frames": 2, "fps": 2 },
        "hover": { "src": "sprites/A/run_down.png",   "frames": 8, "fps": 10 },
        "grab":  { "src": "sprites/A/jump_down.png",  "frames": 5, "fps": 8 },
        "action":{ "src": "sprites/A/slash_down.png", "frames": 6, "fps": 9 }
      }
    }
  ]
}
```

要點:
- **`frame_w` / `frame_h` 分離**——不再假設正方形。LPC 是 64×64,
  本命主題的高頭身角色會是**直式**(64×128 或 96×160),寶可夢素材尺寸另計。
- 動畫以**語意槽位**(idle/move/hover/grab/action)宣告,不綁死 LPC 的動作名——
  新主題填五個槽即可接上漫遊步行、roster hover、夾娃娃機 grabSrc 與點擊演出。
- `shareable` 欄位見 §3.4。

### 3.2 skill↔角色 mapping 獨立於主題

選角合約(哪個 skill 對應哪種角色原型)是**跨主題**的一層,獨立存放
(如 `casting.json`:skill_id → slot_id);每個主題的 manifest 負責提供
slot_id → character_id 的填角。**切換主題時 mapping 不需改動**,只換 cast。

### 3.3 PixelSprite 元件

- props 的 `size` 拆成 `width` / `height`(或直接吃 manifest 的 frame_w/frame_h)
- 其餘不變:strip + CSS `steps()`、`image-rendering: pixelated`、`playing` 控制
- 卡片容器需容納不同比例:同一主題內尺寸一致即可,**主題整組切換、不混排**
  ——不同頭身比的角色不同台,就不會有身高參差的違和

### 3.4 可公開性標記(重要)

manifest 的 `shareable` 欄位:

- `true`:原創或授權允許展示的主題(冒險者公會 ✅、本命主題 ✅)
- `false`:含第三方 IP、僅限私人使用的主題(**寶可夢／Marvel = false**)

規則:**截圖、錄影、demo、放 portfolio 之前,一律切換到 shareable 主題。**
可加一個開發輔助:偵測到 `shareable: false` 主題啟用時,UI 角落顯示低調的「私用主題」標記。
主題制讓可公開性變成「切一下」的事,這個欄位把邊界固化進資料層。

### 3.5 素材與授權規範

- 素材一律**透明背景 strip PNG**(白底 GIF 只作預覽,不進 UI)
- 命名:`sprites/{char_id}/{anim}_{dir}.png`,manifest 內以相對路徑引用
- 每個主題附自己的 `CREDITS.md`(LPC 主題彙整六隻的 credits.txt;
  現成素材主題註明來源與授權)

## 4. 本命主題 NEON PROTOCOL 實作規劃

### 4.1 前置(已定案,直接沿用)

- 角色方向:原創、全女性、御姐/少女(排除蘿莉)、人形高頭身、非 chibi
- 作品／主題名:**NEON PROTOCOL(霓虹協議)**;首位角色名:**Vesper**
- 世界觀:**機能軍事系／霓虹特勤**;視覺記憶點是銀白高馬尾、粉青霓虹、特勤裝
- 視角:**Low Top-Down(微俯視)**,保留正臉、服裝與腿部比例並與既有 roster 對齊
- 採「統一制服底 + 個人差分(髮型髮色/剪影/配件)」維持一致性
- 選角表:每 skill 一個女性職位原型,髮色或制服 accent 綁 skill 分類色

### 4.2 技術規格

- Canvas:直式 64×128 或 96×160;頭身比 少女 5–6 / 御姐 6–7
- Palette:32–64 色(二次元像素不用 16 色復古盤,會髒)
- 動畫:idle 6–10 frames、10–12 fps 起步;之後依 §3.1 槽位補 hover/grab/action

### 4.3 兩段式 AI 生成管線

1. **立繪段**:一般 anime 風格 image AI 產全身立繪(固定風格 prompt 區塊 + 角色變數區塊)
2. **像素化段**:立繪餵 reference-image 型像素動畫工具 → spritesheet:
   - 首選 PixelLab(pixellab.ai,免費 40 次生成可完成打樣)
   - 備選 Retro Diffusion(palette 控制最強)、pixelmotion.art(需先驗品質)
3. **接管線**:spritesheet → 既有轉換腳本切透明 strip → 填入本命主題 manifest

### 4.4 打樣流程

1. 先做**一隻**(吉祥物優先:本來就規劃 AI 生成、單一角色、辨識度優先)
2. 立繪 → 像素動畫 → strip → 上機看實際效果
3. 通過 → 依選角表逐隻量產填滿 roster;不通過 → 換工具或調規格重打樣,
   冒險者公會主題持續服役,零損失

### 4.5 2026-07-22 素材盤點與路線

- 正本:`ui-asset-library/custom/sprites/vesper/`
- 已有:五組立繪概念、五張高解析像素概念、八方向白底稿、六組 PixelLab 旋轉候選、三段動態立繪
- 尚缺:透明背景且能穩定對應 `idle`／`hover`／`grab`／`action` 的多張連續幀;補齊前不把靜態方向稿包裝成正式主題
- 路線優先序:PixelLab 像素主線 → PixAI 動態立繪支線 → image-to-3D 十分鐘偵察 → 成功條件不足時改走 VRoid/VRM + three-vrm
- 命名規則:主題以世界／作品命名(如 `NEON PROTOCOL`),角色以專名命名(如 `Vesper`),媒材差異放 variant／asset kind,不拆成互相競爭的世界觀主題

## 5. 待辦優先序(建議)

1. 核對 §3 規範與現有實作的落差,補齊 manifest schema / casting 分層 / PixelSprite 非正方形 / shareable 欄位
2. FallingSprites(夾娃娃機)實作時直接吃 §3.1 的 grab 槽位
3. NEON PROTOCOL 打樣(§4.4)——世界觀已定,等 Vesper 四語意連續幀補齊後接 manifest
4. 既有主題 CREDITS 與 shareable 標記已補;新增來源沿同規格驗收
