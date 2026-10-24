# 家族財富帝國 0.3 驗收紀錄

> **目前公開版（2026-10-24）**：主畫面重排第一階段程式`51da864`已部署至[https://hd022311.github.io/family-wealth-empire/](https://hd022311.github.io/family-wealth-empire/)。[Actions](https://github.com/hd022311/family-wealth-empire/actions/runs/40075521882)的build、deploy、verify-public全部success，包含兩組公開瀏覽器驗證；另確認HTTPS 200及新版game-shell／設定入口／ResizeObserver程式已載入。詳見[前後截圖與本輪驗收](LAYOUT_ACCEPTANCE.md)。五步互動教學尚未啟用，留待第二階段；State v4及模擬規則不變。以下較早部署狀態為歷史紀錄。


> **最新部署驗收（2026-10-24）**：V0.1易讀性版程式24406de已公開至 [https://hd022311.github.io/family-wealth-empire/](https://hd022311.github.io/family-wealth-empire/)。[GitHub Actions](https://github.com/hd022311/family-wealth-empire/actions/runs/40064163591) 的build、deploy、verify-public均success；公開HTTPS另行確認200且新版字級與關係圖程式已載入。先前403／404為歷史紀錄，已解除。State v4不變，仍為本機存檔的開發測試版；實體裝置尚待人工驗收。


## 本輪V0.1易讀性驗收（2026-10-24）

- 單元61／61、建置成功、完整瀏覽器回歸42／42。
- 最後關係圖與自由開局檢查15／15，最後城市檢查6／6。
- 三種字級×桌面／平板／手機，包含金融、家族、法律視窗、存檔與重載；無整頁水平溢出或操作控制項文字裁切。
- 實體裝置與其他瀏覽器尚待驗證。詳見[修改檔案、截圖與限制](READABILITY.md)。


> 2026-10-24 易讀性更新：本輪只修改V0.1 UI／UX，詳見 [READABILITY.md](READABILITY.md)。GitHub Pages已由管理端啟用，舊候選版網址目前回應HTTPS 200；以下較早的403／404紀錄為當時結果。本輪新版部署與測試結果會另外列明。


日期：2026-10-23。Node 24.19.0、TypeScript、Vite、Vitest、系統 Chromium。

## 通過的程式驗收
- `npm run build` 成功，TypeScript 無錯誤。
- `npm test`：7 個檔案、42 個測試通過。
- `npx playwright test`：18 個測試通過，桌面 1440×1000、平板 820×1180、手機 390×844；每個尺寸 6 個情境。
- 預覽伺服器 4173 埠 HTML 請求成功。

### 新家庭與法律測試
- 三背景與父母／玩家資產隔離、禁止覆蓋已有紀錄；獨立 NPC 財務、固定種子決策及財務能力影響。
- 探望、照顧、贈與、借款、承諾的資金／時間／健康／工作／記憶；交易平衡、退休金不被工作時間事件扣除。
- 重大疾病 → 手足負擔 → 父親死亡 → 遺產清冊 → 祖厝協商／爭議；清冊財產不自動加給玩家。
- 家族樹及關係圖、人物卡、NPC 回應與理由、記憶及交易存檔重載。
- 接班保留原家主資產、負債、記憶及爭議，下一代只接續個人帳戶；保管房產不可再買一次。
- State v1→v2 遷移不改舊資產，v2 保存與損壞交易拒絕。
- 固定法律入口、條號／關鍵字搜尋、官方連結、未驗證狀態與缺資料不能顯示虛構數字。
- 法定順位、配偶與三子女 1/4、配偶與不同順位、按支系代位、口頭承諾／文件不當成有效遺囑、日期選版及重疊封鎖、不同死亡年度稅務缺漏、關係不能改變份額、來源可追溯。

**法律演算法測試使用 TEST-ONLY / test_fixture 資料；沒有冒充官方法源核對或法律專業審查。正式 app 不匯入該測試資料，預設也拒絕用測試來源計算。特留分與年度稅額測試驗證的是缺資料時不產生數字，並非已完成真實稅務計算。**

### 保留並通過的回歸
城市銀行及人物點選、拖曳／滾輪／雙指縮放、日夜／天氣、減少動態畫面凍結且不改財務、房產／股票交易、收租／翻修／企業營運、新生兒、多家族、離線重開、排行榜示意、世代快照，皆在三個尺寸通過。沒有未處理的頁面例外。

## 已知阻擋與待審核
1. 法源網站存取遭環境代理 CONNECT 403，未取得可核對本文或施行沿革。已保存四個官方網域至環境草稿，尚不代表運行環境已套用或發布。
2. 未啟用正式應繼分、特留分、遺產稅／贈與稅、夫妻財產、保險、個別遺囑效力及依法實際分產。沒有 2026 修法或年度金額的假造資料。完整審查清單見 legal-review/VERIFICATION.md。
3. 遺產事件目前可玩到清冊、家人協商及保存意向／爭議；不是已依法完成分產的驗收。法院結果未預設，口頭承諾與未審查文件不視為有效遺囑。
4. NPC 及醫療／生活／會議金額為遊戲模型，非醫療或法律責任認定。未實作生前所有權交棒、正式不動產登記或完整保險稅務。
5. Supabase 尚缺實際專案設定與遠端驗收；PGlite 權限測試不是正式雲端已連線證明。長期家族歷史可能超過既有 1 MB 雲端快照或本機配額，拆分／壓縮與大型世代壓力測試待後續。
6. Chromium 模擬通過不代表 iOS Safari／低階手機實機效能保證；Phaser 大型 chunk 警告仍存在。

## 操作重現
參閱 FAMILY_LAW.md。完整程式驗收可執行 `npm test` 與 `npm run test:e2e`；後者先 build 再執行同一組 18 個瀏覽器測試。預設 Chromium 路徑 /usr/bin/chromium，可用 PLAYWRIGHT_CHROMIUM_EXECUTABLE 指定。

## 0.4 雙模式與開放世界驗收（2026-10-23）
- `npm run build`：通過 TypeScript 與 Vite 建置；Phaser 約 1.48 MB 原始分包（gzip 約 340 KB），仍有分包大小提示，後續持續優化首屏載入。
- `npm test`：8 檔 48 項通過，含既有法律資料缺漏封鎖、RLS/CAS、家庭與新增人生模組。
- 原有三組瀏覽器回歸及雙模式流程：21 項通過，覆蓋桌面、平板、手機 Chromium。保留原有完整斷言，僅注入經典存檔作為既有玩家回歸條件。
- 新增地面尋路驗收：點公園前往、角色沿格網移動、點地面改目的地、暫停時不扣款不老化、重新載入目的地保存。結果於下方追加。
- 測試為本機 Chromium/PGlite，未代表已驗證真實 iOS Safari、正式 Supabase 或台灣法律正確性。正式法源及法律審核仍未完成，所有相關分產與稅額維持 pending。
- 最終新增世界瀏覽器驗收：`npx playwright test e2e/world.spec.ts --workers=1`，6/6 通過（雙模式循環與地面步行各跨三種裝置）。連同既有 18 項回歸，共 24 個不同的瀏覽器案例通過；不是一次全套 24 項的執行紀錄。
- 預覽截圖：`/tmp/fwe-openworld-desktop.png`、`/tmp/fwe-openworld-tablet.png`、`/tmp/fwe-openworld-mobile.png`；已實際檢視平板畫面。4173 埠提供最新建置，無正式外部部署。

## 第二階段 0.5：兩間房子的承諾（2026-10-24）

### 實際完成的驗收
- 開工前基線：`npm test` 48/48；`npm run build` 通過；`npx playwright test --workers=1` 24/24。
- 最終單元／資料庫：`npm test` **9 檔 61/61 通過**。新增 13 項劇情測試涵蓋個別房屋／租金、完整手足家庭、場所與時間限制、職涯收入、三種可完成的照顧安排、固定種子、NPC 能力與實際分擔、預算不足、健康耗盡時的個別清冊、修繕停租、月結冪等、v1–v3 遷移、模式隔離、後續法律事件無效果與父母先後死亡不同日期／婚姻快照。
- 最終標準指令：`npm run test:e2e` **33/33 通過**（單一完整執行，桌面／平板／手機各 11 項）。此指令已修正為先建置、打包 standalone，再跑瀏覽器，不依賴前次殘留的輸出檔。
- `npm run build`：TypeScript 與 Vite 成功。一般網站延續分包，Phaser 原始約 1.48 MB、gzip 約 340 KB，仍有既知分包大小提示；不是本次功能失敗。
- `npm run package:demo`：成功產生約 2.1 MB 的完整 HTML，以及 `dist/standalone.html`；資源與樣式全部內嵌，不啟用 Supabase 或 Service Worker。
- 額外實機瀏覽器檢查：桌面與手機尺寸各以 canvas 座標點父母自住房與出租屋，皆能開啟對應互動；單純前往不改現金。將存檔標為 v3 後重新載入，確認原 v3 家族庫備份存在。
- 新場景截圖：`artifacts/promise-desktop-city.png`、`promise-mobile-city.png`、`promise-tablet-city.png`；照顧介面另有各裝置 `-care.png`，兩棟建築互動另有桌面／手機 `-buildings.png`。已實際檢視桌面與手機截圖。

### 已診斷的限制（不可當作通過）
1. 最初以 `file://` 開啟 standalone 的三個裝置案例均被受管理 Chromium 以 `ERR_BLOCKED_BY_ADMINISTRATOR` 封鎖，沒有遊戲例外可修正，也未停用瀏覽器政策。最終測試改為從 HTTP 載入**同一份原樣 HTML**，確認只請求文件本身；離線續玩與重新載入透過原樣檔案的路由回覆驗證。這證明內容無外部依賴，**不代表已驗證 OS／瀏覽器允許直接開啟本機 HTML**。
2. 桌面、平板與手機是 Chromium viewport／觸控模擬，未驗證實體 iOS Safari。
3. 正式 Supabase、實際跨裝置會員同步、台灣法律官方有效版本與專業審核，均未完成；資料庫測試是 PGlite。本次沒有正式遺囑分配、特留分、保險理賠、稅額或法院勝敗。
4. 4173 預覽有 HTTP 回應與完整功能測試，但只確認環境內可達。公開預覽尚未成功。早期外部連線 CONNECT 403；網域規則生效後 Pinggy 的 SSH 代理連線仍關閉。已另外保存 `service.tunnelmole.com`、`*.tunnelmole.net` 的 HTTPS／WebSocket 預覽需求，第一次測試仍是 403，不能宣稱草稿已套用或 tunnel 已建立。外部網址必須另行產生並實際驗證，不以 loopback／私有 IP 代替。

## V0.1 範圍凍結與Pages候選版（2026-10-24）
- 新增的未驗收任務、戀愛與規則工具已保存在prototypes，不接入遊戲。Vitest明確限定 `src/**/*.test.ts`，避免誤將保存的原型當正式測試；未刪除既有核心斷言。
- 凍結後核心：61/61 單元／資料庫通過；TypeScript/Vite公開子路徑建置通過；產物base／SW／秘密檢查通過。
- 公開候選版的桌面、平板、手機尺寸各完成一次兩章、股票、購屋出租、刷新續玩、離線shell與模式隔離：3/3通過。這不是實體iOS Safari測試，也不是公開HTTPS驗收。
- main首輪Actions： https://github.com/hd022311/family-wealth-empire/actions/runs/40056370336 ，建置及瀏覽器步驟通過，configure-pages因Pages尚未啟用而失敗。
- 中間凍結提交曾因Vitest路徑匹配到原型而失敗： https://github.com/hd022311/family-wealth-empire/actions/runs/40058080722 。已新增明確測試include並本機重跑61/61，沒有把這輪失敗描述成部署成功。
- GitHub API在網域設定生效後可存取；GET Pages 404，POST建立Pages回覆403 `Resource not accessible by integration`。不是缺少遊戲功能，也不是必須提供金鑰給前端；需要repo管理員在Settings/Pages選GitHub Actions。
- workflow已拆分build／deploy／verify-public。沒有公開部署成功或外部遊玩已驗證的宣稱，後續實際結果須另行記錄。

- 範圍凍結後再次完整執行 `npm run test:e2e`：33/33通過，包含城市鏡頭／動畫、股票／房產、家庭／接班、舊檔遷移、兩章照顧結案與單檔離線內容。這只驗證既有流程，沒有驗證未接入原型或長期遊戲性。
- 最新遠端執行：https://github.com/hd022311/family-wealth-empire/actions/runs/40058348015 。透過GitHub API確認build成功（含npm ci、單元、建置、產物檢查、三尺寸Pages測試與artifact），deploy在configure-pages失敗，verify-public跳過；外部站址實際HTTP404。需管理員啟用Pages，不能稱已公開。
