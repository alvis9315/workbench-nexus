# sa-lite — workbench-nexus 需求正本

> 來源:workbench-nexus-implementation-brief.md(2026-07-15 輸入)。Lite 軌(單人、無多角色/生命週期)。

## 核心敘事(MVP 主線,一條龍)

> 進場 → 看到技能牆 → ⌘K 或分類篩選找到skill → 點開 → 複製它的調用 prompt

## MVP 需求

| 編號 | 需求 | 對應畫面 |
|------|------|----------|
| REQ-001 | Splash 進場動畫:像素進度條→100→滑入主頁;≤1.5s、可跳過、每 session 僅首次 | `/` splash |
| REQ-002 | 技能牆:skill 卡片 grid,資料源 `src/data/skills.json`,零硬編碼 | `/` main |
| REQ-003 | 每卡:角色頭像(DiceBear pixel-art,slot 解耦)+ 名稱 + 一句話 + 分類 Badge;名稱+分類文字必須恆在(可用性硬規則) | 卡片 |
| REQ-004 | 分類 filter:全部/前端/後端/SA・文件/pipeline(ToggleGroup 單選) | `/` main |
| REQ-005 | ⌘K command palette:模糊搜尋(名稱/描述/triggerKeywords)+ 鍵盤選取 | 全域 |
| REQ-006 | skill 詳情 Dialog:用途、觸發關鍵字、調用 prompt + 複製鈕(useClipboard + Sonner toast) | Dialog |
| REQ-007 | 吉祥物:角落固定佔位(idle 靜態圖) | `/` main |
| REQ-008 | 空狀態/搜尋無結果:Empty 元件 | — |

## 非功能

- NFR-001 私有:不部署、repo private、不呼叫任何 AI API
- NFR-002 無後端/DB/auth;狀態持久化只用 localStorage
- NFR-003 主題 = token bundle,可換皮不動元件
- NFR-004 可用性:角色再花,名稱+分類文字標籤恆在

## Phase 2 backlog(EXT)

| 編號 | 內容 |
|------|------|
| EXT-001 | hotbar 快捷列(釘選常用 skill) |
| EXT-002 | 使用紀錄 / log |
| EXT-003 | skill 本地↔網頁版 sync 狀態提示 |
| EXT-004 | 每 skill 私人筆記 |
| EXT-005 | GitHub repos 頁(v1.5,仿 GitHub 介面、點擊複製網址) |
| EXT-006 | side project 連結島(v1.5) |
| EXT-007 | 吉祥物 ready/running/done 三態動畫 |
| EXT-008 | advanced launcher pattern:表單發射器(穩定高價值欄位 → 產答案卷 → skill 照常關卡但讀到即自動過關) |
| EXT-009 | skills.json 由本地 skill repo 的 SKILL.md frontmatter script 自動生成 |
| EXT-010 | 多 theme bundle 切換(pixelact/8bitcn/RPGUI 借 token) |
