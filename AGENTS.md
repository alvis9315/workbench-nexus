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
- 只用 pnpm;不混包管、不刪 lockfile
- UI 只用 shadcn-vue(Reka UI)+ Tailwind v4 token;不混其他 UI library
- **主題 = token bundle**:換風格改 `src/assets/main.css` 的 CSS 變數,不動元件(不整套換皮 NES.css/RPGUI 的 DOM)
- App.vue 不寫主要畫面;components/ 不當垃圾桶;效果類元件放 `components/effects/`
- 角色頭像走 `<slot name="avatar">` 解耦,預設 DiceBear pixel-art(npm 本地生成,不打 HTTP API)
- 函式一律 `const` + arrow function(ESLint 強制);TDZ 注意 immediate watcher
- 不過度初始化:不上 Docker/CI/CD/測試框架(驗證門 = lint + typecheck + build)

## 驗證門

```bash
pnpm lint && pnpm typecheck && pnpm build
```

## Git

Conventional Commits(feat/fix/docs/style/refactor/chore/build);branch `feature/*`。
