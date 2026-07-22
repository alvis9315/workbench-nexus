# workbench-nexus 待辦(backlog)

> 待辦唯一清單;需求正本仍是 sa-lite.md,本檔追蹤執行。做完標 ✓ 移文末。建立:2026-07-20。

## B. 功能

- [ ] **B4. npq 觀察矩陣視圖**(可選):讀 conclusion 矩陣呈現六項能力回填進度。

## C. 角色系統主線(正本 `docs/theme-mainline-v2.md`,§3 規範 vs 現行實作的落差;§5 優先序)

- ✓ 2026-07-21 **C1 主題 manifest 化**(§3.1):`scripts/gen-theme-manifest.mjs` 從素材+meta.json 產 `characters.json`(frame_w/h 分離、idle/move/hover/grab/action 語意槽位、pose_cells 與 pose_offset_y、idle_unsafe 裸素體防呆);`src/themes/manifest.ts` factory；SpriteTheme 契約含 slotPose/charFrame/poseOffsetY。
- ✓ 2026-07-21 **C2 casting 分層**(§3.2):`src/data/casting.json`(seed→各主題出廠角色,跨主題一層),guild SKILL_CHAR 遷出;未登記 seed 由 factory hash 決定性分配;使用者 CharPicker 手選(localStorage)優先於本表
- ✓ 2026-07-22 **C3 PixelSprite 接入**(§3.3):A–F 源 PNG 救援(反推+重配)→ guild 素材全面換 strip PNG(GIF 退役);PixelSprite.vue(width/height 分離,strip=CSS steps 播放/gif=<img> 雙模式);manifest 增 asset_kind/pose_frames/pose_ms(產生腳本讀 PNG 檔頭自動解析);SkillAvatar/Mascot/GlobalSearchDialog/CharPicker 四渲染點統一走 PixelSprite;主題 icon 用單幀 icon.png
- ✓ 2026-07-22 **C4. FallingSprites 夾娃娃機元件**(正本 `docs/falling-sprites-spec.md`):Matter.js 剛體 + activeTheme 五語意槽；箱頂纜線連接三爪夾具；60–160% 調整直接縮放既有 body、不重啟 Engine。容量依倍率為 30／24／18／14／10，既有角色不因放大自動刪除。每主題 roster 可新增、單隻移除、清空、技能卡拖入；角色落地後在多深度 2D 地面使用 move 隨機直走／斜走，抓取切 grab；左側 PRIZE OUT 在抓取後投入會移除角色。
- ✓ 2026-07-23 **C5. NEON PROTOCOL 本命主題第一版**(§4):首角 **Vesper**,機能軍事／霓虹特勤世界觀,Low Top-Down。19 組不重複透明 GIF 已依動作語意命名、歸檔至 `ui-asset-library/custom/sprites/vesper/animations/`,並建立 idle／move／hover／grab／action 可用主題。Workbench 外殼配色已與角色素材主題解耦；新增可獨立切換的科技白＋霓虹藍粉配色，原深藍＋黃字保留為 `NEXUS ARCADE`。
- [ ] **C5b. Vesper 3D 紙片人／換裝**:中左側 `AVATAR BAY` 已預留位置；待五套服裝的角色尺寸、關節與分層規格定稿後，再決定使用 Live2D 式 billboard 或 VRM/three.js。本階段不用靜態 PNG 假裝成已完成 3D。
- ✓ 2026-07-22 **C6. 舊主題補件**:guild 六位的官方產生器 `source/credits.txt` 已齊,ui-asset-library 總表與兩 repo metadata 已同步;Workbench 增 theme `CREDITS.md`。五位 hash complete,E 角仍缺一鍵重建 hash,但逐層署名完整。
- [ ] **C7. Marvel 主題完整化**:`Marvel: Cosmic Invasion` 六外觀已上線；`Marvel vs. Capcom 2` 28 位 fighter 的四語意 strip 目前只是可操作原型。現階段執行 Data-complete，僅處理 Spider-Man：保留來源、動畫群組／sprite／effect／hitbox／hurtbox 與無法確認報告，未確定映射不猜測。Spider-Man 完成後的固定順序為 **Venom → Psylocke → Wolverine-A → Captain America → Iron Man → 其餘 Marvel → 其餘 Capcom**；未完成 Spider-Man 前不開第二角。實機命中／防禦差異與 Assist／Tag 精確時序延後至第二階段。兩個 Marvel 主題皆 `shareable:false`。
- ✓ 2026-07-21 **shareable 欄位**(§3.4):SpriteTheme 契約 + 兩主題宣告(guild true / pokemon false)+ ThemePicker 私用標記(列表 badge + 啟用中圓點提醒)

## D. 盤點補登（尚未排入本次實作）

- [ ] **D1. EXT-003 skill sync 狀態提示**:顯示本地 skill repo 與工作站資料是否同步,定義狀態來源與更新時機。
- [ ] **D2. EXT-007 吉祥物任務三態**:ready／running／done 使用語意槽或專屬動畫,並定義由何種 app 狀態驅動。
- [ ] **D3. EXT-008 表單發射器**:把穩定高價值欄位組成答案卷再呼叫 skill;先選一個 skill 試做,不把工作站變成 AI 執行引擎。
- [ ] **D4. EXT-009 skills.json 自動生成**:從本地 skill repo 的 SKILL.md frontmatter 產 manifest,需先定義手寫欄位與自動欄位的合併規則。
- [ ] **D5. 履歷管線站 2 掛接**:`resume-tailoring` intake 接 `specs/resume-pipeline.md` 的職缺交接格式,完成一次真實 dry-run。
- [ ] **D6. 履歷管線站 3 掛接**:pandoc + reference-doc 產可編輯 docx,補依賴檢查、失敗 fallback 與歸檔流程。
- [ ] **D7. Skill Map 時效盤點**:README 目前仍是 2026-07-15 快照;逐 repo 核對「未建／實驗／觀察」與最後使用紀錄後再更新,避免猜測狀態。

## 已完成

- ✓ 2026-07-21 **A1 視覺重造收案**:核心痛點(像素人物怪)已由 sprite 主題層根治(LPC 公會 + 寶可夢圖鑑,SkillAvatar/slot 解耦);font-pixel 與 pixel-frame 經評估與現行遊戲風(MvC 選角格/圖鑑)已是一體,不再單獨調整——擁有者有新偏好時再開新條目,本項關閉
- ✓ 2026-07-21 **B1 素材庫圖鑑掛載**:/uilibrary 補 slug 欄位(ui-library.json 每筆必填)+ 卡片複製鈕 + 購物車一鍵複製多選(", " 相接貼進 prompt)
- ✓ 2026-07-21 **B2 履歷模板牆**:/resume-templates(resume-templates.json + ResumeTemplatesView),卡片=slug+路線+規格摘要+複製鈕,連結指到 TEMPLATE.md
- ✓ 2026-07-21 **B3 管線視圖**:/pipelines(pipelines.json + PipelinesView),站點卡含狀態(READY/WIP/PLANNED)、交接物、調用句複製;契約連到 specs/resume-pipeline.md
- ✓ 2026-07-20 skills.json 全卡補 usage(使用流程),SkillDetailDialog 加 USAGE FLOW 區塊
- ✓ 2026-07-20 repos.json 擴為 28 repo 全量(分類 / 公私 / fork 標記 + 一句話說明),ReposView 分組版面
