# Resume Template: ats-en-v1(外商 / ATS 英文版)

> slug: `ats-en-v1`。視覺層規格——內容層規則(段落結構/寫法)屬 resume-tailoring `resume-criteria.md`,本檔只管排版樣式。骨架基準:Jake's Resume / Harvard 格式單欄極簡(criteria 指定)。

## 樣式規格(reference-doc 依此生成)

```text
版面:A4 / Letter 皆可;單欄;邊界 0.5–0.75 in;禁表格/文字框/雙欄/圖形
字體:Calibri(整份單一字體);正文 10.5pt;行距 1.0–1.15
姓名:16–18pt 粗體置中,文件正文第一行(不放頁首頁尾)
聯絡列:9.5–10pt 置中一行:email | phone | LinkedIn | GitHub(純文字,超連結可留)
段落標題(H2):11pt 粗體全大寫 + 底線分隔線;順序固定:
  SUMMARY / WORK EXPERIENCE / EDUCATION / SKILLS / CERTIFICATIONS(無則省)
經歷條目:職稱粗體 + 公司 | 起訖年月靠右;bullet 用標準圓點,每條一行為原則
顏色:全黑;無底色、無 icon、無照片
頁數:1 頁(criteria 規則,10 年資歷以上可 2)
```

## reference-doc 生成

首次 render 時由執行 agent 生成 `reference.docx` 進本資料夾(之後重用):
`pandoc -o reference.docx --print-default-data-file reference.docx` 取得基底後,依上表調整樣式(Word 開啟改樣式集,或 python-docx 腳本);生成後與一份假資料 md 試渲,通過 criteria 格式檢查清單(單欄/字體/標題/純文字貼出測試)才算就緒。

## Changelog

- 2026-07-20 v1 初版,規格自 resume-criteria.md ATS 檢查清單導出。
