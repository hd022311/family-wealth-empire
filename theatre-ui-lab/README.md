# 《傳承人生劇場》三套UI比較

獨立預覽：a/電影式字幕、b/經典視覺小說、c/沉浸式劇情。各包含一般對話、既有家庭衝突、重要選擇與結局樣本；不整合完整第一卷。

玩家字串統一zh-TW；程式化掃描與語意紀錄見reports/ZH_TW.md。真人編輯與法律審核仍待簽核。

只讀取原第一卷story.mjs，不修改六次選擇、八種結局條件、法律效果或State v4。無正式存檔、成就或分析追蹤。

本機可在儲存庫根目錄執行python3 -m http.server 4185，開啟 /theatre-ui-lab/。公開網址另由發布流程驗證。

檢查：node theatre-ui-lab/scripts/zh-tw.mjs；node --test theatre-ui-lab/scripts/zh-tw.test.mjs。
瀏覽器檢查：node theatre-ui-lab/scripts/browser.mjs（需既有playwright-core與Chromium，CHROMIUM_PATH可設定）。
