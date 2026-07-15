# workbench-nexus

A **private** personal AI workstation that unifies Claude skills into one
game-styled launcher, built with Vue 3, Vite, Tailwind v4, and shadcn-vue.

> 私人工具,不部署、不公開。發射台不是引擎:本 app 不呼叫 AI API,
> 核心動作是「找到 skill → 複製調用 prompt」。

## Dev

```bash
pnpm install
pnpm dev
```

驗證門:`pnpm lint && pnpm typecheck && pnpm build`

## Docs

- 需求正本:`docs/sa-lite.md`(MVP 主線 + EXT backlog)
- 視覺公式:`docs/ux/visual-reference-guide.md`
- 工作紀錄:`docs/worklog.md`

## Skill Map

回答「我有哪些零件」——每個 skill 一行。怎麼用 → 看各 SKILL.md 開頭的 I/O 契約;
為什麼這樣設計 → [`specs/decisions.md`](specs/decisions.md);格式怎麼變的 →
[`specs/skill-contract.md`](specs/skill-contract.md) 文末 Changelog。
維護時機:新增 / 轉正 / 廢棄 skill 時各改一行。

### 零件 skill

| Skill | 一句話 | 吃什麼 | 吐什麼 | 狀態 | 最後用於 |
|---|---|---|---|---|---|
| new-project-quickstart | 三關提問產專案初始化 Prompt | 專案想法 | 可執行的初始化 Prompt | 已轉正(v3.5 spec-driven 觀察中) | |
| design-system-codify | 把視覺風格收斂成 DESIGN.md | 風格公式 / 參考 URL / 文字描述 | design-systems/&lt;slug&gt;/DESIGN.md | 觀察中 | |
| api-sa-merge | API 文件與 SA 文件整併 | 兩份文件 | 整併後文件 | 未建(規劃) | |
| self-prompting-pipeline | 四站管線(Planner→Executor→Critic→Refiner)工具建置 | 目標描述 | pipeline 工具 | 觀察中(已裝 self-prompting) | |
| agent-communication-pipeline-design | 多 agent 協作架構設計 | 協作需求 | 架構 / runner / config | 實驗中(repo 有,未部署為 skill) | |
| resume-audit-rewriter | 履歷體檢與重寫 | 履歷 + JD | 修訂履歷與分析 | 未建(規劃) | |
| resume-tailoring-web | 針對職缺產雙版客製履歷 | 履歷 + 職缺 | 中英雙版履歷 | 試用版(0 筆回填,觀察中) | |

> 「最後用於」欄各 skill 實際使用後回填。狀態依 2026-07-15 盤點,如有出入請更正。

### 執行者 skill(orchestrator)

| Skill | 管哪條鏈 | 狀態 |
|---|---|---|
| (無)| design 鏈固化與否,依 [`docs/dogfood-run-log.md`](docs/dogfood-run-log.md) 證據決定 | 觀察名單 |

### 產物資產

| 位置 | 內容 |
|---|---|
| [`design-systems/`](design-systems/)`<slug>/DESIGN.md` | 跨專案重用的設計系統(design-system-codify 產出) |
| [`specs/skill-contract.md`](specs/skill-contract.md) | skill 間公共契約(唯一改了會痛的東西) |
| [`specs/decisions.md`](specs/decisions.md) | 設計決策記錄 |
