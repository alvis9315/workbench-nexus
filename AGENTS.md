# AGENTS.md — workbench-nexus

給 AI Coding Agent 的工作規範。需求正本 `docs/sa-lite.md`;視覺公式 `docs/ux/visual-reference-guide.md`。

## 專案定位

私人 AI 工作站(skill launcher):把散落的 Claude skill 收進單一遊戲風入口。
**發射台不是引擎**——本 app 不呼叫任何 AI API,skill 卡片的主要動作 = 複製調用 prompt。

## 鐵則

- **私有專案**:禁止任何公開部署(GitHub Pages / Vercel / …),repo 保持 private
- 禁止 commit:API key、token、`.env`、個資
- 無後端、無 DB、無 auth:資料來源 = `src/data/*.json`(manifest 即 source of truth);跨重整狀態用 localStorage
- **資料驅動、零硬編碼**:技能牆/分類/hotbar 全從 JSON 迭代渲染;新增 skill = skills.json 加一行,不改元件程式碼
- **跨 repo 內容一律連結,不搬進本 repo**:本 app 是索引/發射台,不是內容正本。任何指向外部 repo 的資料
  (`ui-library.json`、`repos.json`、`projects.json` 等)只要條目對應到有實體檔案的外部來源,
  **`url` 欄位為必填**,精準指到可點開的位置(GitHub 檔案/資料夾路徑,不是只指到 repo 根目錄);
  沒有 `url` 等於「看得到存在、找不到本體」,是資料缺陷不是可接受狀態。
  範例:`ui-library.json` 的 `custom` 項目(元件正本在 `ui-asset-library` repo)必須指到
  `github.com/alvis9315/ui-asset-library/tree/main/custom/<tech>/<Name>`,不能只寫描述文字帶過
- 只用 pnpm;不混包管、不刪 lockfile
- UI 只用 shadcn-vue(Reka UI)+ Tailwind v4 token;不混其他 UI library
- **主題 = token bundle**:換風格改 `src/assets/main.css` 的 CSS 變數,不動元件(不整套換皮 NES.css/RPGUI 的 DOM)
- App.vue 不寫主要畫面;components/ 不當垃圾桶;效果類元件放 `components/effects/`
- 角色頭像走 `<slot name="avatar">` 解耦;素材來源走 **SpriteTheme 主題層**(`src/themes/`,
  元件只呼叫介面不碰檔案)。引入新素材來源照 `docs/theme-source-spec.md` 的規範走,不得繞過
- **第三方素材授權**:pokemon 主題的圖像是任天堂/Creatures/Game Freak IP(非 MIT 範圍),
  僅限本機自用——這是「禁止公開部署、repo 保持 private」鐵則的加重理由;每隻角色的
  meta.json `license` 欄必填來源與授權狀態
- 函式一律 `const` + arrow function(ESLint 強制);TDZ 注意 immediate watcher
- 不過度初始化:不上 Docker/CI/CD/測試框架(驗證門 = lint + typecheck + build)

## 驗證門

```bash
pnpm lint && pnpm typecheck && pnpm build
```

## Git

- Conventional Commits(feat/fix/docs/style/refactor/chore/build)。
- 本專案目前為單人開發，預設只在 `main` 直接開發、commit 與 push。
- 除非使用者明確要求，否則不得自行建立或切換到 feature branch。
