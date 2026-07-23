# Worklog

## 2026-07-23
- **娃娃機步態／爪子操作**:Guild 角色依 2.5D 移動向量即時切換 `walk_up/down/left/right`；實機模式拆為 DROP／GRAB 兩鍵，下降改為不受前後深度影響的 82px/s 固定慢速，上升 128px/s。
- **PosePicker 定位**:選定項只保留打勾 icon；重開下拉時自動把當前 pose 捲到可視中央。
- **Vesper 比例修正**:新增不篡改原始畫布尺寸的 `display_scale:2`，技能卡與娃娃機皆接近 Guild 角色的視覺高度；`Breathing idle A` 實體與 metadata 從雙 repo 移除，舊 localStorage 會自動回退至有效預設姿勢。
- **NEON PROTOCOL 上線**:Vesper 18 組不重複 128×128 透明 GIF 完成語意命名與雙 repo 歸檔，建立單角 18-pose 主題與 idle／move／hover／grab／action 五樽位；`Breathing idle A` 已依擁有者指示從兩個 repo 移除。
- **背景主題解耦**:原深宇宙藍＋街機黃保留為 `NEXUS ARCADE`；新增獨立按鈕切換的 Vesper 科技白＋霓虹青藍／粉紅配色與電路網格，不改各頁排版。
- **Vesper 紙片人預留**:寬螢幕中左側新增 `AVATAR BAY`，明確標示為五套服裝的未來 3D 紙片人位置，本版僅放比例預覽，未假裝已有 rig。
- **MVC2 Spider-Man 資料蒐集**:仍只執行 Spider-Man，actor animation GIF 已完成 316/316，去除 39 個完全重複別名後有 277 個 selector-ready、0 個待下載；hitbox GIF 已完成 51/317，後續繼續抓剩餘 hitbox／sprite／effect 媒體。無可靠證據的招式對應維持 `needs_game_verification`。角色順序固定為 Venom → Psylocke → Wolverine-A → Captain America → Iron Man → 其餘 Marvel → Capcom。

## 2026-07-22
- **MVC2 還原稽核**:確認原 sheet 是會跨透明橫帶換行的 packed sprite stream，不是一列一招；既有四槽降級標示為 WIP prototype。28 角共 2,433 band 建立零遺漏 inventory，後續逐角對照 command list 與 60fps 實機畫面，補完整動作與 actor／projectile timing。
- **夾娃娃機升級**:箱頂導軌＋纜線＋三爪夾具；角色 60–160% 直接縮放現存剛體，修正連按縮放時重建競態與上方牆面卡住角色。容量隨倍率降為 30／24／18／14／10；多層 2D 地面加入隨機左右／斜向漫遊與 walk 動畫；左側 PRIZE OUT 接住抓取後投入的角色即從 roster 移除。大體型寶可夢保留原生 2x cell 比例；READY 移到卡片資訊列，不再蓋圖。
- **小幫手訊息框**:改成淺灰藍、雙框與指向角色的寶可夢式對話框；提供可記憶的開啟／關閉按鈕。
- **娃娃機地面／步態修正**:地面改為水平中性灰格板；正式加入 `move` 語意槽（Guild/Pokémon 真 walk、Cosmic Invasion 的 Walk_* strip、MVC2 暫用 neutral 等待逐角驗證），移動加入停頓、步速脈衝、2.2px 踏步起伏與左右翻面，不再等速滑行。
- **Marvel 姿勢視覺校正**:對 Cosmic 6 外觀與 MVC2 28 角的每條 strip 逐格掃 alpha bbox，將垂直視覺中心 offset 寫入 meta／manifest；卡片、小幫手與全域搜尋套用，Venom grab 等底部偏移不再壓進名條。小幫手訊息開關改為相對角色框絕對定位，開關訊息前後位置不動。
- **Career 分頁整併**:頂層 Pipelines＋Resume 合併為 Career Workshop；三步驟白話引導、等高 station 卡、模板選擇與現況說明集中在同一頁，舊網址保留 redirect。
- **Marvel 其餘 PNG 歸納**:Avengers Alliance 拆 Browser 5 角／Mobile HD 單角；Spider-Verse 再拆 GBA Spider-Man 3 雙角、SNES Maximum Carnage 雙角與跨遊戲單角池，待 bbox／atlas 正規化，不硬混畫風
- **游標主題化**:全站加入金黃像素箭頭／可點擊手套；FallingSprites 區改用吊鉤，抓住角色時切成藍色收緊鉤，文字輸入仍保留 I-beam
- **C4 完成**:`FallingSprites.vue` + Matter.js 接入主頁 `SPRITE DROP`;activeTheme 取 6–12 角,支援碰撞／拖曳擺盪／grab 換姿勢／resize／越界與卸載清理;Chrome headless 實測拖放語意切換及三主題載入
- **新來源收件**:Vesper 149 檔分成 concept-art／pixel-concepts／pixel-rotations／motion-studies／raw;定案主題 `NEON PROTOCOL`、首角 `Vesper`、機能軍事／霓虹特勤、Low Top-Down。因缺四語意連續幀,只歸檔不建立假主題
- **Marvel 私用主題**:`Marvel: Cosmic Invasion` 六外觀 × 四語意 strip 上線;其餘原始素材分 MVC2／Avengers Alliance／跨平台 Spider-Verse 候選族;全部 `shareable:false`
- **C6 完成**:guild 六份逐圖層 credits 已核對;ui-asset-library 總表與 Workbench metadata 同步;E 角 generator hash 缺口保留
- **backlog 漏項補登**:EXT-003／007／008／009、履歷管線站 2/3、README Skill Map 時效盤點
- **C3 完成**:guild 素材 GIF→strip PNG(v2 重配版,透明底);PixelSprite.vue 統一渲染(strip steps 播放/gif 原樣);manifest 增 asset_kind/pose_frames/pose_ms(PNG 檔頭自動解析,oversize cell 不再靠 meta 手填);四個渲染元件改造;icon.png 單幀主題圖示
- 前置:A–F 源檔救援(lpc_identify 反推 + fork 產生器重配,A/E 擁有者手動、B/C/D/F 自動),ui-asset-library 每角 source/+gif/+strip/ 齊備、hash 5/6 回填
- 驗證:lint/typecheck/build 綠 + Playwright(公會牆 strip 動畫/選角彈窗/寶可夢迴歸)

## 2026-07-21(深夜)
- **lpc-generator-fork 開工**(~/Projects/lpc-generator-fork,GitHub fork):🎲 隨機生成面板(尊重授權/動作過濾+body type 素材檢查)、動作過濾嚴格模式(AND,防裸體)、主 UI 中文化;取代 ui-asset-library 的離線 randomizer
- **C1 manifest 化 ✓**:gen-theme-manifest.mjs → characters.json(語意槽位/pose_cells/idle_unsafe),manifest factory,兩主題模組縮成 glob+manifest;pokemon chunk 372→336KB
- **C2 casting 分層 ✓**:casting.json 跨主題選角層,SKILL_CHAR 遷出 guild 模組
- 驗證:lint/typecheck/build 全綠 + Playwright 實測兩主題(公會排版復原、寶可夢貼底、casting 保留)

## 2026-07-21(晚)
- 修排版回歸:oversize 錨定入 SpriteTheme 契約(oversizeAnchor)——pokemon 'bottom'(體型差貼底)、guild 'center'(武器大格置中),公會人物不再上飄
- 歸檔 theme-mainline-v2.md + falling-sprites-spec.md 進 docs/,與 ui-asset-library LPC-pipeline-summary 互相連結
- shareable 欄位落地(§3.4):契約 + 兩主題 + ThemePicker 私用標記
- §3/§5 落差核對完成,轉為 backlog C1–C6 條目(manifest 化/casting 分層/PixelSprite/FallingSprites/本命主題/CREDITS)

## 2026-07-21
- SkillAvatar oversize 姿勢改底部對齊(大隻寶可夢下緣與小隻齊平,溢出往上不壓名條)
- backlog B1–B3 清空:/uilibrary 補 slug+購物車複製;/resume-templates 模板牆;/pipelines 管線視圖(NavTabs 6 分頁)
- A1 視覺重造收案(sprite 主題層已根治像素人物問題,font-pixel/pixel-frame 維持)
- 配套:npq skill v3.10 掛接素材庫(dev repo 見其 CHANGELOG),素材庫三部曲全數完成

## 2026-07-15
- 開工(work-shift 夜班):骨架 + 主題 token + shadcn-vue + 文件組
- MVP 主線完成:技能牆(SkillCard+DiceBear)/分類 filter/⌘K palette/詳情+複製調用/Splash/吉祥物佔位;驗證門全綠
- W1-W4:Hotbar(數字鍵發射)/使用紀錄/repos 頁/工具島/私人筆記
