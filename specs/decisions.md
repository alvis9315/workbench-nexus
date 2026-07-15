# Decisions Log

> 每個重要決定記 2-3 行:決定 + 理由。回答未來的你「當初為什麼這樣設計」,防止對著沒壞的東西重構。

- **2026-07-15|參考 open-design(nexu-io)只取格式不搬架構**:偷的是 DESIGN.md / SKILL.md spec 這層設計智慧;daemon、Electron、export pipeline 是「服務所有人的通用平台」的成本,對私有自用 workbench 是負債。
- **2026-07-15|design-system-codify 做成獨立零件,不併入 new-project-quickstart**:兩者生命週期不同——quickstart 是專案冷啟動跑一次;design system 是跨專案重用資產。quickstart 只以「提問 + 路徑引用」掛接。
- **2026-07-15|codify 刻意不綁上游**:接受三種輸入(visual-design 風格公式 / 截圖或 URL / 純文字描述),精度遞減但都能產出。零件不依賴特定上游才叫零件,visual-design 只是精度最高的常見上游。
- **2026-07-15|執行者(orchestrator)skill 暫不做,列觀察名單**:依 workbench Layer 2 原則,只固化「已手動跑過多次、順序固定、高頻」的鏈。先用 dogfood log 收集證據,固化訊號出現才用 agent-communication-pipeline-design 設計。
- **2026-07-15|契約住在 workbench repo 的 specs/,skill 本體不搬進 repo**:skill 是 agent 讀的零件(住 Claude skill 目錄),workbench 是人看的組裝台;repo 收契約、產物(design-systems/)、地圖(README)。引用不複製。
- **2026-07-15|文件分工定案**:README 答「有什麼」、SKILL.md I/O 契約答「怎麼用」、decisions.md 答「為什麼」、契約 Changelog 答「怎麼變的」。每份只答一個問句、輕到願意順手維護。
