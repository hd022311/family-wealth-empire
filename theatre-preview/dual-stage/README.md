> 電影式UI已依使用者指定參考更新：半透明字幕、獨立抉擇、已選才亮金色；功能選單提供本頁已讀回顧。選取可查看完整說明，確認才送出。[橫直實際畫面](reports/cinematic-ui/REVIEW.html)。

# 傳承人生劇場 V0.2・橫直雙模式單場景原型

公開入口：https://hd022311.github.io/family-wealth-empire/theatre-preview/dual-stage/

按「播放演出」觀看42秒演出，或「點擊繼續」不限時閱讀。旋轉裝置會自動重新構圖，保留台詞、時間及選取。演出結束停在A／B／C，選好後按確認。設定可調100/125/150%與減少動態；開啟設定會暫停，不自動恢復。

- 獨立目錄，沿用既有演出scene資料；不接入正式第一卷、不讀寫存檔、沒有帳號、分析或雲端。刷新會重置本原型。
- 全部美術是原創AI概念佔位稿，正式核准素材數為0。人物背景分層，跨表情只合成固定臉部區域；不是完整動畫骨架或語音對嘴。
- 已參考使用者附上兩張概念圖的光影、多人關係與橫直鏡頭；素材仍獨立分層製作，沒有直接使用整張圖，也未照搬圖中的法律情節。
- 法律／稅務／保險結果仍待核實，三個回應只是獨立敘事示範，未改六次選擇及八結局。
- [錄影與驗收](reports/REVIEW.html)、[技術與驗收詳情](reports/REVIEW.md)、[素材清單](reports/assets.json)。

在儲存庫根目錄執行靜態伺服器後，開啟 /theatre-preview/dual-stage/。這是本機開發方法；公開網址由Pages持續提供，不需使用者電腦開機。

測試：`node --test theatre-preview/dual-stage/scene.test.mjs`。瀏覽器／錄影腳本位於scripts；可用PLAYWRIGHT_MODULE設定既有Playwright模組路徑。無新增付費動畫依賴。
