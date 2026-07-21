# workbench-nexus 待辦(backlog)

> 待辦唯一清單;需求正本仍是 sa-lite.md,本檔追蹤執行。做完標 ✓ 移文末。建立:2026-07-20。

## B. 功能

- [ ] **B4. npq 觀察矩陣視圖**(可選):讀 conclusion 矩陣呈現六項能力回填進度。

## C. 角色系統主線(正本 `docs/theme-mainline-v2.md`,§3 規範 vs 現行實作的落差;§5 優先序)

- ✓ 2026-07-21 **C1 主題 manifest 化**(§3.1):`scripts/gen-theme-manifest.mjs` 從素材+meta.json 產 `characters.json`(frame_w/h 分離、idle/hover/grab/action 語意槽位、pose_cells 尺寸、idle_unsafe 裸素體防呆);`src/themes/manifest.ts` factory,兩主題模組縮成 <30 行 glob+manifest;SpriteTheme 契約加 slotPose/charFrame。素材仍 GIF,strip 換裝時只動 manifest 資料(C3 先決)
- ✓ 2026-07-21 **C2 casting 分層**(§3.2):`src/data/casting.json`(seed→各主題出廠角色,跨主題一層),guild SKILL_CHAR 遷出;未登記 seed 由 factory hash 決定性分配;使用者 CharPicker 手選(localStorage)優先於本表
- ✓ 2026-07-22 **C3 PixelSprite 接入**(§3.3):A–F 源 PNG 救援(反推+重配)→ guild 素材全面換 strip PNG(GIF 退役);PixelSprite.vue(width/height 分離,strip=CSS steps 播放/gif=<img> 雙模式);manifest 增 asset_kind/pose_frames/pose_ms(產生腳本讀 PNG 檔頭自動解析);SkillAvatar/Mascot/GlobalSearchDialog/CharPicker 四渲染點統一走 PixelSprite;主題 icon 用單幀 icon.png
- [ ] **C4. FallingSprites 夾娃娃機元件**(正本 `docs/falling-sprites-spec.md`):Matter.js 剛體 + grab 槽位;**先決已全就位**(manifest grab 槽位 + strip 素材 + PixelSprite)。
- [ ] **C5. 本命主題採樣**(§4):兩段式 AI 管線(立繪→像素化);先做一隻吉祥物驗證,通過才量產。世界觀三選一待擁有者定案。
- [ ] **C6. 舊主題補件**:guild 逐層 CREDITS(ui-asset-library CREDITS.md 行動項)。
- ✓ 2026-07-21 **shareable 欄位**(§3.4):SpriteTheme 契約 + 兩主題宣告(guild true / pokemon false)+ ThemePicker 私用標記(列表 badge + 啟用中圓點提醒)

## 已完成

- ✓ 2026-07-21 **A1 視覺重造收案**:核心痛點(像素人物怪)已由 sprite 主題層根治(LPC 公會 + 寶可夢圖鑑,SkillAvatar/slot 解耦);font-pixel 與 pixel-frame 經評估與現行遊戲風(MvC 選角格/圖鑑)已是一體,不再單獨調整——擁有者有新偏好時再開新條目,本項關閉
- ✓ 2026-07-21 **B1 素材庫圖鑑掛載**:/uilibrary 補 slug 欄位(ui-library.json 每筆必填)+ 卡片複製鈕 + 購物車一鍵複製多選(", " 相接貼進 prompt)
- ✓ 2026-07-21 **B2 履歷模板牆**:/resume-templates(resume-templates.json + ResumeTemplatesView),卡片=slug+路線+規格摘要+複製鈕,連結指到 TEMPLATE.md
- ✓ 2026-07-21 **B3 管線視圖**:/pipelines(pipelines.json + PipelinesView),站點卡含狀態(READY/WIP/PLANNED)、交接物、調用句複製;契約連到 specs/resume-pipeline.md
- ✓ 2026-07-20 skills.json 全卡補 usage(使用流程),SkillDetailDialog 加 USAGE FLOW 區塊
- ✓ 2026-07-20 repos.json 擴為 28 repo 全量(分類 / 公私 / fork 標記 + 一句話說明),ReposView 分組版面
