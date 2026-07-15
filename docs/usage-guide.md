# 白話使用指南 — skill 契約體系

> 給忘記這一切是什麼的未來的你。一句話:**skill 們從「散裝工具」升級成「有共同規格的樂高零件組」。**
> 有什麼零件 → README「Skill Map」;為什麼這樣設計 → `specs/decisions.md`;本檔只答「怎麼用」。

## 三個東西是什麼

1. **skill contract**(`specs/skill-contract.md`)——零件之間的「插頭規格」:設計系統文件(DESIGN.md)長什麼樣、放哪裡。像 USB 規格,照它做的零件互相接得上,改一個不壞另一個。**唯一改了會痛的東西,沒摩擦不要動它。**
2. **design-system-codify skill**——「風格翻譯機」:丟給它模糊的東西(參考網站 / 截圖 / 一句「像素風 RPG 感」),吐出具體規格(色碼、字體、圓角 px),存成 `design-systems/<slug>/DESIGN.md`。一次定義,之後每個新專案直接套。
3. **quickstart 的 DESIGN.md 入口**——new-project-quickstart 問視覺風格時多了優先分支:「我已經有 DESIGN.md」→ 直接路徑引用,跳過整段風格討論。

## 三個使用場景

**A. 把喜歡的風格存起來**
對 Claude 說:「幫我把 X 的風格產成 DESIGN.md」。它拆解 → 最多追問 1-2 個問題 → 寫出 `design-systems/<slug>/DESIGN.md`,並列出哪些值是它猜的(行尾標「假設,可改」)。

**B. 開新專案套現成風格**
「我要建立新專案」→ 走到視覺提問時回答「我有 DESIGN.md,在 design-systems/xxx/」→ quickstart 確認必填三段齊全後直接引用,產出的初始化 Prompt 會叫 Coding Agent 以那份文件的 token 為準,不另創平行規範。

**C. Claude 額度用完切 Codex**
以任務為單位切,每完成一項就 commit;Codex 從乾淨 commit + AGENTS.md 接手(各 repo 規範正本都在 AGENTS.md,CLAUDE.md 只是指標)。額度回來讓 Claude review Codex 寫的部分,特別盯「慣例有沒有被遵守」。

## 唯一要持續做的事

每跑一次「風格收斂 → codify → quickstart」的鏈,在 `docs/dogfood-run-log.md` 記 3-5 行(Claude 會主動起草,你只補體感)。**跑滿 3-5 次**回頭看檔頭的固化判定:每次順序都一樣 + 都在手動複製貼上 → 才做 orchestrator;每次跑法都不同 → 本來就不該自動化,什麼都不用做。

## 鐵則(忘記細節時至少記住這三條)

- **引用不複製**:DESIGN.md 只用路徑引用,不把內容抄進其他文件
- **加選項不改流程**:掛接都是 additive,不帶 DESIGN.md 時一切行為照舊
- **固化延遲**:orchestrator 等 dogfood log 的證據,不憑感覺蓋工廠
