# Dogfood Run Log — design 鏈手動執行紀錄

> 目的:用證據決定「要不要做 orchestrator skill」。每跑一次鏈就記一筆,**每筆只寫 3-5 行**,寫多就不會維護。
> 鏈:visual-design 風格收斂 → design-system-codify 產 DESIGN.md → new-project-quickstart 引用產初始化 Prompt
> 第一個 dogfood 對象:portfolio-site(作品集網站)。

## 固化判定(跑滿 3-5 次後回來看)

- 每次順序都一樣 + 交接時都在手動複製貼上 / 重複輸入 → **固化訊號**,用 agent-communication-pipeline-design 設計 pipeline skill
- 每次跑法都不同(有時跳過收斂、有時只重產 DESIGN.md)→ 本來就不該固化,**什麼都不用做**
- 卡點集中在某一站內部 → 修那個零件 skill,跟 orchestration 無關

---

## Run 1

- 日期:
- 專案:portfolio-site
- 輸入精度(A 公式 / B 參考 / C 文字):
- 實際跑的順序:
- 摩擦點(哪裡卡、哪段重複輸入):
- 交接方式(路徑引用順利?還是手動貼內容?):

## Run 2

- 日期:
- 專案:
- 輸入精度:
- 實際跑的順序:
- 摩擦點:
- 交接方式:

## Run 3

- 日期:
- 專案:
- 輸入精度:
- 實際跑的順序:
- 摩擦點:
- 交接方式:

<!-- 需要就往下複製區塊 -->

---

## 判定結果(跑滿後填)

- 固化?(是 / 否 / 再觀察):
- 理由:
- 若是 → 下一步:用 agent-communication-pipeline-design 設計執行者 skill,引用三個零件、不改零件
