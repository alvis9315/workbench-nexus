# Worklog

## 2026-07-22
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
