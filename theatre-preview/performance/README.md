# 本輪：自然度改善與高品質美術候選稿

先看 `review.html` 的男女候選圖與修改前後43秒影片。`art-samples/` 有每人六種表情、兩種姿勢與13.5秒有限分鏡；尚未完成正式分層與綁定，不宣稱是正式動畫素材。

本輪技術／方案比較：`reports/NATURALNESS.html`。原 `TECHNICAL`、`ACCEPTANCE` 留為前次歷史紀錄。

`before/` 保存上一輪錄影與互動版本。正式遊戲、第一卷與State v4沒有改動。原七段台詞／三選項／42秒總時長由新增回歸測試保護。

測試：`node --test theatre-preview/*.test.mjs theatre-preview/performance/scripts/*.test.mjs`；瀏覽器與錄影腳本需設定PLAYWRIGHT_MODULE及本機4187埠，見下方原操作方式。

---

# 動態演出測試：遺囑公布

獨立入口 `theatre-preview/performance/`，不接入第一卷完整預覽或正式經營模式。

- 開啟頁面後選「開始閱讀」手動操作；選「播放演出」才會自動換句，約42秒後停在選擇。
- 設定可調文字大小、逐字、人物／鏡頭動態，以及3位成年角色的6種表情檢視。
- 所有角色都是固定幾何的原創分層向量佔位稿，**不是已完成的精緻2.5D正式素材**。
- 無配音，嘴型是文字節奏佔位。法律未核實，沒有分產、保險金、稅額、裁判或新結局。
- 不依賴任何新套件，不讀寫正式存檔，不修改 `../story.mjs`／`../app.mjs`。

技術與素材規格：[reports/TECHNICAL.html](reports/TECHNICAL.html)。驗收：[reports/ACCEPTANCE.html](reports/ACCEPTANCE.html)。影片與畫面：[review.html](review.html)。

本機從儲存庫根目錄啟動 `python3 -m http.server 4187 --bind 127.0.0.1`，再開啟 `/theatre-preview/performance/`。

驗證命令（在儲存庫根目錄）：

```sh
node --test theatre-preview/*.test.mjs theatre-preview/performance/scripts/scene.test.mjs
PLAYWRIGHT_MODULE=file:///絕對路徑/node_modules/playwright-core/index.mjs node theatre-preview/performance/scripts/browser.mjs
```

本地測試預設網址為 127.0.0.1:4187，Chromium 預設 `/usr/bin/chromium`；可用 `PERFORMANCE_URL`、`CHROMIUM_PATH` 調整。公開回歸加上 `PUBLIC_CHECK=1`。瀏覽器測試會捲動真實面板操作，不用隱藏按鈕或直接跳過分鏡。

只有使用者確認人物美術與動態方向後，才評估第一卷正式接入。
