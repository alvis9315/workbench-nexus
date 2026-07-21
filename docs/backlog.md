# workbench-nexus 待辦(backlog)

> 待辦唯一清單;需求正本仍是 sa-lite.md,本檔追蹤執行。做完標 ✓ 移文末。建立:2026-07-20。

## B. 功能

- [ ] **B4. npq 觀察矩陣視圖**(可選):讀 conclusion 矩陣呈現六項能力回填進度。

## 已完成

- ✓ 2026-07-21 **A1 視覺重造收案**:核心痛點(像素人物怪)已由 sprite 主題層根治(LPC 公會 + 寶可夢圖鑑,SkillAvatar/slot 解耦);font-pixel 與 pixel-frame 經評估與現行遊戲風(MvC 選角格/圖鑑)已是一體,不再單獨調整——擁有者有新偏好時再開新條目,本項關閉
- ✓ 2026-07-21 **B1 素材庫圖鑑掛載**:/uilibrary 補 slug 欄位(ui-library.json 每筆必填)+ 卡片複製鈕 + 購物車一鍵複製多選(", " 相接貼進 prompt)
- ✓ 2026-07-21 **B2 履歷模板牆**:/resume-templates(resume-templates.json + ResumeTemplatesView),卡片=slug+路線+規格摘要+複製鈕,連結指到 TEMPLATE.md
- ✓ 2026-07-21 **B3 管線視圖**:/pipelines(pipelines.json + PipelinesView),站點卡含狀態(READY/WIP/PLANNED)、交接物、調用句複製;契約連到 specs/resume-pipeline.md
- ✓ 2026-07-20 skills.json 全卡補 usage(使用流程),SkillDetailDialog 加 USAGE FLOW 區塊
- ✓ 2026-07-20 repos.json 擴為 28 repo 全量(分類 / 公私 / fork 標記 + 一句話說明),ReposView 分組版面
