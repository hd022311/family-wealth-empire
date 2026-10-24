# 研究來源、可用證據與排除紀錄

存取日期：2026-10-24。公開截圖的遊戲拍攝日期／版本多未標註；不得因此宣稱代表 2026 最新介面。未創建競品帳號、未執行外掛／機器人、未把競品圖片放進本專案正式素材。

## F1｜Forge of Empires 官方介面指南：文字已核實、圖片未讀取

- [Basics + Interface](https://support.innogames.com/kb/ForgeOfEmpires/en_DK/1167/Basics-%2B-Interface)
- 本地：`references/foe-interface.html`。
- 官方文字明確說明頂部中央 Forge Points、左側顧問肖像及任務；頁尾有 Browser、Mobile 介面分別展示。
- 圖片地址在 `tools-files.innogamescdn.com/support-knowledgebase/article/1167/`。8 個圖片請求遭 CONNECT 403；沒有看到便不能分析它們的 HUD 風格、按鈕尺寸或手機手勢。
- [Google Play](https://play.google.com/store/apps/details?id=com.innogames.foeandroid&hl=en) 的 `foe-play-1..6.png` 為本輪取得的商店圖片；已檢視 1–3 為標語＋城市宣傳編排，缺少完整 HUD。不作實際操作證據。
- `ThScEo/AutoForge` 的 `img/map.PNG`、`img/hidden_rewards.png` 是機器人軟體自己的介面，**不是 FoE 原生介面**，已排除。未執行該軟體。

## E1｜Elvenar 實際桌面城市與交易視窗（含第三方覆蓋）

- [原始圖](https://raw.githubusercontent.com/paviad/elvenar-helper-extension/f3488b50ff14ec997e656b4c9b2bb0d0dca62533/docs/ss2.jpg)
- [來源專案](https://github.com/paviad/elvenar-helper-extension/tree/f3488b50ff14ec997e656b4c9b2bb0d0dca62533)
- 本地：`references/elvenar-helper-ss2.jpg`，已目視確認。
- 可觀察原生部分：等角城市、頂部資源列、左側肖像、底部功能列、Grand Trader 窗口。
- 左上白色 Helper Window 是外掛，不列為 Elvenar 原生設計。`ss1.jpg` 為外掛規劃格線圖，同樣排除。
- 未證明當前正式版本、手機互動及任務展開流程。
- [官方支援](https://support.innogames.com/kb/Elvenar/en_DK) 可存取；[Google Play](https://play.google.com/store/apps/details?id=com.innogames.elvenar&hl=en) 本輪取得圖片偏宣傳合成，不用來證明手機布局或手勢。

## B1｜Goodgame Big Farm：實際操作畫面未驗證

- [瀏覽器版官方入口](https://bigfarm.goodgamestudios.com)，本地 `references/bigfarm-site.html`。
- HTML 嵌入 `https://bigfarm-html5.goodgamestudios.com/default/prototype.html?...`；入口頁不等於進入農場後的遊戲畫面，本輪沒有可核實的完整農場 HUD 截圖或操作紀錄。
- `bigfarm.fandom.com` 回應 402，不能作已閱讀的遊戲畫面依據。
- `bigfarm.com` 實際為 Big Farm Mobile Harvest 商店；JS 的 logo／商店連結可確認。**與指定瀏覽器遊戲不同，不混用**。
- Steam 搜尋命中 Big Farm Story（1329510），同樣是另一款產品，排除。
- 所以本報告不對 Big Farm 的任務位置、事件視窗、手機手勢或視覺細節做未經證實的敘述；補齊這款的真實桌面畫面是研究未完成事項。

## S1｜Sim Companies 實際生產頁（含第三方覆蓋）

- [原始生產頁圖](https://raw.githubusercontent.com/mirceaman56/sim-companies-helper/3cafa82ffd8d57948fa6c91a4f2c182ce41bb3c8/docs/screenshots/Production.png)
- [來源專案](https://github.com/mirceaman56/sim-companies-helper/tree/3cafa82ffd8d57948fa6c91a4f2c182ce41bb3c8)
- 本地：`references/sim-production.png`，已目視確認。
- 觀察原生建築生產頁的黑色頂部狀態列、左建築資料、中央生產需求／數量／狀態。右側 Production Helper 白色區塊是第三方外掛，已排除。
- 不從該頁推定城市任務或手機實際操作；拍攝版本未標明。

## S2｜Sim Companies 官方商店圖：局部介面可辨識、屬宣傳合成

- [Google Play](https://play.google.com/store/apps/details?id=com.simcompanies.simcompaniespwa&hl=en)
- 本地 `sim-play-1.png`、`sim-play-2.png` 已目視確認。
- 可辨識地圖、資源條、底部 Map／Warehouse／Search／Chat／Exchange，以及市場表格片段。
- 圖上另有大型宣傳標語及多畫面編排；只能說圖片中存在這些元件，不能稱未剪輯手機實機截圖，也不能聲稱點擊、捲動、縮放已驗證。
- [官方網站](https://www.simcompanies.com) 可存取，但本輪未登入遊玩。

## O1｜本專案公開遊戲：實際操作截圖

- [公開版](https://hd022311.github.io/family-wealth-empire/)
- 新的隔離瀏覽器環境，點選「開始劇情人生」，拍攝 1440×900、390×844 城市及事件面板；未登入、未改動其他人的存檔。
- `references/current-public-desktop.png`、`current-public-mobile.png`、各 `-panel.png`，另有實際 canvas 素材截圖。
- 本機程式與 GitHub 對照：正式部署遊戲 `51da864`、本機 HEAD `7861a4e`（後者為文件）。工作區未提交教學修改保留，未部署。

## 素材使用界線

競品截圖只作內部研究證據，不放入正式遊戲或三套原創設計稿。交付的便攜設計包不含競品下載圖片／HTML，僅提供來源連結。三套城市與人物圖為 AI 生成的原創概念素材，仍需正式製作、品牌相似性檢查、拆件、尺寸／壓縮／效能與觸控驗證；不可當作已完成可遊玩的城市資產。
