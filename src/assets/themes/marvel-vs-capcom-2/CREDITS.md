# Marvel vs. Capcom 2 素材來源與限制

- 角色與遊戲素材權利屬 Marvel、Capcom 及相關權利人。
- 原始 Dreamcast fighter sheets 來自 The Spriters Resource：
  https://www.spriters-resource.com/dreamcast/marvelvscapcom2newageofheroes/
- 正本、來源檔名與自動抽取列記錄位於
  `~/ui-asset-library/custom/sprites/marvel/normalized/mvc2/`；本目錄是 Workbench runtime 匯入副本。

目前的 `idle`／`hover`／`grab`／`action` 是可操作的四槽原型，不是完整招式還原。原始 sheet
是固定寬度 packed sprite stream，同一動作可能跨越多個透明橫帶；完整版本會依遊戲內 command
list 與實機錄影，逐段補齊 normals、specials、hypers、受擊、team 動作及獨立 projectile／特效時序。
所有 28 張來源 sheet 已建立零遺漏 inventory，還原規格位於
`~/ui-asset-library/custom/sprites/marvel/MVC2-RESTORATION.md`。

本主題只限私人、未發布、非商業的本機使用，`shareable: false`。禁止公開部署、portfolio、
公開影片、社群截圖與 marketplace 發布；正式對外展示前必須切回可分享主題。
