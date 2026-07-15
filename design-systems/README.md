# design-systems/

跨專案重用的設計系統資產。每個子資料夾一套系統,結構與存放路徑約定見
[`../specs/skill-contract.md`](../specs/skill-contract.md) §2:

```
design-systems/<slug>/DESIGN.md   # 必填三段見契約 §1;附屬檔(tokens.css、範例截圖)放同資料夾
```

由 `design-system-codify` skill 產出。消費端(new-project-quickstart 產的初始化 Prompt 等)一律**路徑引用**,不複製內容。
