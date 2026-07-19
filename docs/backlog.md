# workbench-nexus 待辦(backlog)

> 待辦唯一清單;需求正本仍是 sa-lite.md,本檔追蹤執行。做完標 ✓ 移文末。建立:2026-07-20。

## A. 視覺重造(擁有者 2026-07-20 明確不滿,待調整——先記錄不動工)

- [ ] **A1. 整體風格重選**:擁有者反饋「現在樣式很醜、不喜歡紫色背景、像素風人物很怪」。
  建議路徑(吃自家狗糧):先用 `design-system-codify` 收斂新風格產 DESIGN.md → 依「主題 = token bundle」鐵則只換 `src/assets/main.css` CSS 變數,不動元件 DOM。
  範圍:配色(去紫)、字體(font-pixel 是否保留待問)、Mascot / SkillAvatar 像素人物(DiceBear 風格更換或移除)、pixel-frame 邊框風。
  **動工前先問擁有者偏好 / 參考**(npq 視覺必問慣例,不默默預設)。

## B. 功能

- [ ] **B1. 素材庫圖鑑掛載**:asset-library 建好後,圖鑑頁(slug 卡片 + 購物車複製)掛進本 app 路由——所有「眼睛用的頁面」集中於此。
- [ ] **B2. 履歷模板牆**:resume-templates/ 的模板預覽頁(同圖鑑模式)。
- [ ] **B3. 管線視圖**:README Skill Map 的管線表做成頁面(求職一條龍等,含站點狀態與調用句複製)。
- [ ] **B4. npq 觀察矩陣視圖**(可選):讀 conclusion 矩陣呈現六項能力回填進度。

## 已完成

- ✓ 2026-07-20 skills.json 全卡補 usage(使用流程),SkillDetailDialog 加 USAGE FLOW 區塊
- ✓ 2026-07-20 repos.json 擴為 28 repo 全量(分類 / 公私 / fork 標記 + 一句話說明),ReposView 分組版面
