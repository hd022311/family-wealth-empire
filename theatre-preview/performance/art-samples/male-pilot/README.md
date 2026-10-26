# 林家安・高品質局部圖層樣機

獨立預覽：`theatre-preview/performance/art-samples/male-pilot/`。

本輪先做單一成年角色的局部眼皮、目光與嘴型，未接入完整第一卷、43秒家庭場景、正式經營模式或State v4。沒有新增劇情或人物。

- 同一張半身基準圖固定，眼睛／嘴巴附近才替換為已生成的局部像素。
- 睜眼、半閉、閉眼、目光向下；閉口、輕張口、張口。這些是局部狀態，不是六種情緒已完成綁定。
- 13.5秒一次性演出，實際錄影約14秒含結尾；沒有配音或音素對嘴。
- 預設手動閱讀不限時，玩家主動播放。可暫停、重看、近景／半身、單幀檢視、100／125／150%字級及減少動態。
- Canvas2D只在狀態改變時繪圖，沒有常駐requestAnimationFrame或整張人物循環晃動。
- PNG小圖層由既有合成器輸出封裝；來源原圖保留。封裝前後影像比較在`reports/pack-comparison.json`。

正式分層母檔、六情緒的統一圖層、全身骨架、連續姿勢變形、自然呼吸與語音對嘴均未完成；候選稿尚未正式簽核。

## 本機與測試

從儲存庫根目錄啟動：`python3 -m http.server 4189 --bind 127.0.0.1`。

```sh
node --test theatre-preview/performance/art-samples/male-pilot/scripts/pilot.test.mjs
PLAYWRIGHT_MODULE=file:///絕對路徑/node_modules/playwright-core/index.mjs node theatre-preview/performance/art-samples/male-pilot/scripts/browser.mjs
```

瀏覽器測試可用`PILOT_URL`改網址；`PUBLIC_CHECK=1`使用公開驗證範圍（桌面／手機三字級）。預設Chromium為`/usr/bin/chromium`。

封裝重建：`scripts/pack-layers.mjs`會呼叫同一合成器的原始來源模式，序列化已計算好的局部Canvas為PNG，不重新生成美術、不覆蓋來源。`compare-pack.mjs`逐像素比對封裝前後。

權利與素材範圍、效能、驗收、錄影請見`reports/REVIEW.html`。
