# 電影式UI公開驗收

2026-10-27。功能提交eb20d45已成功部署：
https://github.com/hd022311/family-wealth-empire/actions/runs/40462594932

公開操作入口：
https://hd022311.github.io/family-wealth-empire/theatre-preview/dual-stage/?v=cinematic-2

外部Chromium重新執行：
- public-browser.json：27組UI尺寸字級、189個字幕安全區、對話與抉擇互斥、已選才金色、已讀回顧不暴雷、選單暫停／繼續及選取旋轉保持。
- public-progress.json：27組演出版面、189次台詞位置旋轉、播放中旋轉、選擇前後、觸控及重複確認防護，三人表情合成框外像素變化0。

首次公開測試使用cinematic-1入口，介面／演出功能與最新相同；後續只補靜態資源版本標記為cinematic-2，避免曾看舊版的瀏覽器混用renderer快取。這份補刊不新增遊戲或劇情。

Chromium使用ignoreHTTPSErrors以相容受管理環境的代理憑證；另以Python正常TLS獨立檢查HTTPS及公開檔案雜湊。實體iPhone／iPad Safari、Android低階機及Windows/Mac實機字型仍待人工驗收，不把視窗模擬當成實機驗收。

使用者確認的是UI設計參考方向；本輪不將人物概念佔位稿改標成正式素材，也不整合第一卷。正式經營模式、六次選擇八結局、State v4、法律與保險效果不變。
