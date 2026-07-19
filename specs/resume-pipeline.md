# Resume Pipeline Spec v0.1(求職履歷一條龍)

> 這是跨 skill 管線的公共約定,不屬於任何單一 skill。執行引擎 = Claude Code **或 Codex**(規範全 md、agent 無關);workbench 只存本 spec 與模板,不執行。
> 設計原則:瀏覽器當螢幕、Claude Code 當鍵盤——UI 只做「看與複製」,狀態與產物全在 repo。

## 1. 管線總覽(三站)

```text
[站 1] 職缺收集(job-search-secret Dashboard,人操作 UI)
   └─ 交接:104 職缺連結(使用者複製貼回)
[站 2] 履歷客製(resume-tailoring skill,品質迴圈 Planner→Executor→Critic→Refiner)
   └─ 交接:雙版履歷 md(內容正本)
[站 3] 渲染歸檔(render:md + 模板 → .docx 可編輯交付)
   └─ 產出:resumes/final/<slug>/ 內 md + docx(+ 投遞用 PDF 可選)
```

一次人工輸入(貼連結)、一次人工確認(docx 預覽);其餘自動。

## 2. 站間契約

### 2.1 職缺交接(站 1 → 站 2)

**主路徑**:使用者貼 104 職缺連結 → 執行 agent 從 URL 抽 job ID → 呼叫本機 dashboard 後端 `http://127.0.0.1:8000`(FastAPI,路由以 `/docs` 自查;前端代理路徑 `/api`)取完整明細。

**fallback(非阻塞)**:本機 API 沒開 → 提示使用者「啟動 dashboard 後端,或直接貼職缺全文」,照 2.2 schema 對映後繼續。**禁止直接爬 104 網頁**(resume-tailoring 既有規則:104/LinkedIn 反爬蟲,不嘗試抓網頁)。任一路徑成功即繼續,不中斷管線。

### 2.2 job-posting 標準格式(adapter 目標,來源無關)

```markdown
# Job: <職稱> @ <公司>
- source_url:
- captured_at: <YYYY-MM-DD>
- location: / salary: / experience: / education:
## Job Description
<原文>
## Requirements
<條件原文;必備與加分分開(來源有分則保留)>
```

104 JSON → 此格式的對映由站 2 的 intake 步驟做;未來換來源(LinkedIn / Cake)只加 adapter,站 2 之後全不動。職缺檔存 resume-tailoring repo `jobs/<slug>.md`(含個資紅線內,不進 workbench)。

### 2.3 渲染交接(站 2 → 站 3)

- 輸入:雙版履歷 md(依 resume-tailoring criteria 產出)
- 模板:workbench `resume-templates/<slug>/`(視覺層 reference-doc;內容層規則屬 criteria,兩層分離)
- 指令:`pandoc <resume>.md -o <out>.docx --reference-doc=<template>.docx`
- 產出命名(依 criteria):`resume_<名>_<姓>.docx`;中文版依台灣慣例命名
- 預覽:開啟 docx(或先產 HTML 預覽)給使用者過目 → 確認後歸檔;**使用者手改後的 docx 是交付正本,md 是內容正本**——後續內容修訂先改 md 再重渲,純排版微調可只改 docx 並註記

## 3. 執行規範(agent 無關)

1. 個資紅線:候選人資料、產出履歷、職缺檔只進 resume-tailoring private repo;workbench 只有本 spec 與無個資模板
2. 品質迴圈照 resume-tailoring 現行規則(score≥8 或滿 3 輪即停),本 spec 不改動
3. 每次產出回填 resume-tailoring `tracking.md`(職缺/日期/版本/投遞狀態)
4. Codex 執行:進 resume-tailoring repo 讀 AGENTS.md → 依指標讀本 spec 照站執行;Claude Code 由 resume-tailoring skill 觸發,讀同一份 spec
5. 工具依賴:pandoc(一次性安裝);缺 → 提示安裝指令後暫停 render 站,站 2 產物不受影響

## 4. 相容規則

同 skill-contract v0.1 紀律:新需求以選填欄位加入;只在對接實際失敗時修改;修改記文末 Changelog;既有產物不因升版失效。

---

## Changelog

- 2026-07-20 v0.1 初版。動機:三站原流程有兩個壞跳轉(職缺手動搬運、md 貼網頁版 Claude/GPT 排版),後者不可重現且個資外流,亦違反 criteria「輸出 .docx 優先」;收斂為連結貼回 + 本機渲染。同日修正:fallback 移除「直接爬 104」(牴觸 resume-tailoring 反爬蟲既有規則),改為提示啟動後端或貼全文;補後端位址 127.0.0.1:8000。
