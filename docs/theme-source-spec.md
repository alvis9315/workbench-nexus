# 主題(角色素材來源)引入規範

> 目的:任何新素材來源(LPC、寶可夢、未來的任何圖包)都照同一套流程接進 workbench,
> 元件層零改動。契約正本:`src/themes/types.ts` 的 `SpriteTheme` 介面。

## 架構總覽

```
src/themes/types.ts        ← SpriteTheme 介面(契約正本)
src/themes/index.ts        ← 註冊表 THEMES + activeTheme(localStorage wn-theme)
src/themes/<id>/index.ts   ← 每個主題一個模組,實作 SpriteTheme
src/assets/themes/<id>/<角色>/<姿勢>.gif   ← 素材
src/assets/themes/<id>/<角色>/meta.json    ← 角色中繼資料
```

元件(SkillAvatar / CharPicker / PosePicker / Mascot / GlobalSearchDialog / SkillCard)
**只呼叫 `activeTheme.value.<方法>`,一律不 import 主題模組、不碰素材路徑**。
使用者偏好按主題分 key(`wn-sprite-chars:<id>`、`wn-sprite-poses:<id>`),切換主題各自記憶。

## 引入新來源的步驟

1. **素材落地**:`src/assets/themes/<id>/<角色>/<姿勢>.gif`
   - 一角色一資料夾;姿勢檔名即姿勢 id(`idle.gif`、`walk_down.gif`…)
   - 有方向的姿勢用 `_down/_left/_right/_up` 字尾(PosePicker 會自動分組);無方向就不加
   - 建議寫匯入腳本放 `scripts/import-<id>.mjs`(參考 `scripts/import-pokemon.mjs`),不要手搬
2. **meta.json**(每角色一份,必填):
   ```json
   {
     "display_name": "顯示名",
     "generation": "分類 id(選填,給 charGroupOf 用)",
     "source": "素材出處 URL",
     "license": "授權狀態;非自由授權必須寫明「僅限本機自用,不得公開部署」"
   }
   ```
3. **主題模組** `src/themes/<id>/index.ts`:實作 `SpriteTheme` 十二個成員
   (參考 `guild`=有 oversize/裸素體特例的複雜版;`pokemon`=最簡版)。特別注意:
   - `defaultPoseOf` 必須回「安全」姿勢(不裸素體、不缺件)
   - `clothedPosesOf` 給小幫手隨機輪播用,把不宜輪播的姿勢濾掉
   - `poseScale` 素材畫布比標準大時回倍率(會做破格溢出效果),否則回 1
   - `groups`/`charGroupOf` 給選角彈窗的分類頁籤(公會=職業、寶可夢=世代)
4. **註冊**:`src/themes/index.ts` 的 `THEME_META`(id+顯示名+代表角色小圖 `icon`,
   單張靜態 import)與 `loaders`(dynamic import)各加一行——主題本體**必須懶載入**,
   禁止 eager import 進主包(主包零成長鐵則)
5. **排序**:主題的 `chars` 陣列順序=選角彈窗顯示順序(全部/分類頁籤都沿用),
   有官方序(如圖鑑編號)就在 meta.json 存序號欄並照它排
6. **原生尺寸**:來源素材尺寸不一時(官方刻意的體型差,如寶可夢 32/64px),
   匯入腳本解析每張 GIF 的檔頭尺寸寫進 meta.json `sizes`,主題以
   `poseScale = 原生尺寸 / 基準格` 呈現——所有角色共用同一放大倍率(像素密度一致),
   大隻的就顯示大隻,禁止用 object-contain 把大家壓成一樣大

## 各主題新增角色

- **guild(冒險者公會)**:角色產線在 `~/ui-asset-library`(LPC generator 設定檔+透明去背
  pipeline,注意 [PIL 透明 GIF 陷阱]),產好後把 `<角色>/` 資料夾(GIF+meta.json)放進
  `src/assets/themes/guild/`,並在 `src/themes/guild/index.ts` 補 `DEFAULT_POSE`(全裝安全姿勢)、
  `CHAR_GROUP`(職業分類);要固定配對某 skill 就加 `SKILL_CHAR`
- **pokemon(寶可夢圖鑑)**:不手動加。重跑
  `node scripts/import-pokemon.mjs <vscode-pokemon路徑> [gen…]`,編號/顯示名/世代/尺寸
  全自動從來源 repo 解析;來源新增世代時只要在主題 `groups` 補一個世代頁籤
5. **驗證門**:`pnpm lint && pnpm typecheck && pnpm build`,再手動/Playwright 檢查:
   切主題後技能牆、Hotbar、小幫手、選角彈窗(分類頁籤+搜尋)、姿勢選單、全域搜尋右側動畫全部正常

## 授權紅線

- 非自由授權素材(如寶可夢=任天堂 IP):**repo 不得轉 public、不得公開部署**,
  meta.json 的 `license` 欄必須寫明;規則正本在 AGENTS.md 鐵則
- 自由授權素材(如 LPC=CC-BY/OGA-BY)要補 credits(guild 主題的 credits 缺口
  記錄在 ~/ui-asset-library)

## 現有主題

| id | 名稱 | 來源 | 角色數 | 授權 |
|---|---|---|---|---|
| `guild` | 冒險者公會 | LPC generator(正本 ~/ui-asset-library) | 6 | CC-BY / OGA-BY(credits 待補) |
| `pokemon` | 寶可夢圖鑑 | jakobhoeg/vscode-pokemon | 565(gen1-4) | Nintendo IP — 僅限本機自用 |
