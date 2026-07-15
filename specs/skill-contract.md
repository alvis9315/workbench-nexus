# Skill Contract v0.1

> 這是 skill 之間的公共約定,不屬於任何單一 skill。
> 角色類比:前後端串接的 API spec——skill 照它產出、照它消費,實作各自可換,契約不變則互不影響。
> 維護規則見文末。

---

## 1. DESIGN.md 格式規範

design system 的標準交接格式。`design-system-codify` 照此產出;`new-project-quickstart`(及任何前端專案的 agent)照此消費。

### 1.1 必填段落(缺一即不合規)

```markdown
# Design System: <名稱>
> Category: <分類,如 Portfolio / Dashboard / Game-UI>
> <一句話定位:這套系統的氛圍與適用場景>

## 1. Visual Theme & Atmosphere
<視覺主題與氛圍描述:整體感覺、參考意象、情緒關鍵字。3-8 行,給 agent 讀的定性描述>

## 2. Color Tokens
<以 CSS variables 形式列出,含用途註解。至少:背景、前景、主色、強調色>
--color-bg: #______;        /* 主背景 */
--color-fg: #______;        /* 主文字 */
--color-primary: #______;   /* 主色 */
--color-accent: #______;    /* 強調/互動 */

## 3. Typography
<字體家族(標題/內文/等寬)、字級階層、字重使用規則>
```

### 1.2 選填段落(需要才加,順序不限)

- `## 4. Spacing / Radius / Shadow Tokens` — 間距尺標、圓角、陰影(CSS variables 形式)
- `## 5. Component Rules` — 按鈕、卡片、表單等元件的視覺規則
- `## 6. Motion` — 動效原則(duration/easing token、reduced-motion 對應)
- `## 7. Imagery` — 圖片/插畫/icon 方向
- `## 8. Do & Don't` — 這套系統的禁止事項(如「不用漸層」「不混第二種襯線」)
- `## 9. Reference Sources` — 風格來源記錄(參考網站/截圖描述/風格公式出處)

### 1.3 格式紀律

- Token 一律給**具體值**(hex、px、font name),不用「溫暖的」「現代感」等形容詞充當值;形容詞只能出現在 §1 氛圍描述
- 缺料而以假設補值時,在該行行尾標注 `<!-- 假設,可改 -->`
- 參考既有品牌時只提取**抽象特徵**(密度、對比、層級邏輯),不得複製 logo、吉祥物、受版權保護的視覺素材,產出檔內不得宣稱「即某品牌官方風格」

## 2. 存放路徑約定

```
<workbench repo>/design-systems/<slug>/DESIGN.md
```

- `slug`:英文小寫、`-` 分隔、ASCII only(如 `pixel-rpg`、`warm-editorial-portfolio`)
- 一個資料夾一套系統;附屬檔(token 匯出的 tokens.css、範例截圖)放同資料夾
- 消費端(quickstart 產的初始化 Prompt 等)一律以**路徑引用**,不得把 DESIGN.md 內容複製進其他文件

## 3. Skill I/O 宣告格式

每個零件 skill 的 SKILL.md,在 frontmatter 之後、正文之前,放一段:

```markdown
## I/O 契約
- **輸入**:<接受的輸入形式,依精度排序;標明必要 vs 可選>
- **輸出**:<產物格式(引用本契約章節)+ 存放路徑約定>
- **相鄰零件**:<常見上下游 skill 名,標注「僅為常見組合,非依賴」>
```

紀律:
- 「相鄰零件」是給**人**看的地圖線索,skill 本體不得依賴特定上游存在才可運作
- 這段同時是給未來的你的使用說明——寫到「半年後只讀這段就會用」的程度

## 4. 相容規則(契約自身的修改紀律)

1. 新需求一律以**選填**段落/欄位加入;必填段落不刪除、語意不變更
2. 只在「兩個 skill 對接失敗」或「產物格式實際不夠用」時修改本契約;無摩擦不修
3. 每次修改在文末 Changelog 加一行:日期 + 改了什麼 + 為什麼
4. 既有 DESIGN.md 產物不因契約升版而失效(v0.1 合規者永遠合規)

---

## Changelog

- 2026-07-15 v0.1 初版。定 DESIGN.md 必填三段(氛圍/色彩/字體)+ 選填六段、存放路徑 `design-systems/<slug>/`、I/O 宣告格式。動機:引入 open-design 的 DESIGN.md 概念,讓 visual 方法的產出標準化、可被 quickstart 引用。
