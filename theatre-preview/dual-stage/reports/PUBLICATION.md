# 公開發布與外部驗收

2026-10-27。功能提交：b0381c4。

- 公開預覽：https://hd022311.github.io/family-wealth-empire/theatre-preview/dual-stage/?v=dual-1
- 功能部署Actions：https://github.com/hd022311/family-wealth-empire/actions/runs/40458244332 （success）
- 橫向錄影：../screenshots/landscape-16x9.mp4，1280×720，44秒。
- 直向錄影：../screenshots/portrait-9x16.mp4，432×768，44秒。

公開網址重新執行完整場景瀏覽器腳本：27組尺寸字級、189次暫停旋轉、播放中旋轉、確認前後旋轉、不同回應人物鏡頭、觸控模擬、減少動態、背景暫停、素材失敗及存檔不寫入均通過。機器紀錄：public-browser.json（base為公開HTTPS網址）。

另以Python正常TLS驗證公開HTTPS，逐一比對新執行檔、報告、兩支MP4、母圖WebP及原有第一卷／43秒演出／人物局部樣機執行檔，共13個檔案與本機SHA256一致。正式遊戲7個已發布檔案亦與釘選清單完全相同。

Chromium驗收使用ignoreHTTPSErrors以相容受管理環境的代理憑證；上述獨立Python正常TLS驗證已成功，沒有以忽略憑證當作唯一公開可用證據。

這是外部瀏覽器與視窗尺寸／觸控模擬驗收，**不是實體iPhone、iPad Safari或Android硬體驗收**。全部新美術為原創AI概念佔位稿，正式核准數0；仍待美術與演出品質確認，不整合完整第一卷。

本頁及公開瀏覽器紀錄屬驗收文件補刊，不變更功能提交的執行程式。
