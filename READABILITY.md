# V0.1 易讀性改善與驗收

範圍：只調整介面、資訊層次與閱讀偏好，未改動財務、NPC、事件或法律規則。State v4 不變。

## 操作與改善

- 頁首「文字大小」提供100%、125%、150%，標準內文桌面／平板18px、手機16px，主要操作1.125rem。設定儲存在`fwe-reading-size-v1`，不寫入遊戲存檔；儲存不可用時仍可當次調整。
- 所有HTML文字採rem；放大後欄位減為單欄、按鈕換行，保留頁內捲動。按鈕至少44px高。法律查詢改放帳戶列，避免浮動入口遮住遊戲按鈕。
- 深化次要文字對比，選取模式內文使用對應淺色文字，不再以淺灰小字表達金額／限制。
- 當前未完成目標置於城市上方，提供前往場所及任務區連結；任務完成條件保持原有規則。
- 章節總覽、家人近況、歷史記憶及收入計算說明可自行展開。市民能力／財務亦可展開，交流操作仍可直接使用。
- 照顧事件保留各方案啟動費、每月需求、玩家上限、時間與重新付費風險，選擇前可閱讀。未刪法律警告或假裝正式分產。
- 城市保留拖曳、縮放與人物互動。只顯示選取建築名稱及狀態，以免大量標籤相疊；其文字補償地圖縮放、畫布尺寸與全域字級。人物點選回饋、完整場所／人物資料在HTML面板可讀。財務浮字有同步的持續事件文字。
- 關係圖改用編號與可放大的姓名／信任／衝突明細，避免圖內小字。家族樹改採rem座標與卡片尺寸，卡片不因放大而重疊；大型家族樹本身保留區域平移捲動，不擴張頁面寬度。

## 實際修改檔案

| 檔案 | 用途 |
|---|---|
| `src/ReadingSettings.tsx` | 三種字級、獨立偏好儲存及容錯 |
| `src/style.css`、`src/readability.css` | 字級、對比、換行、響應式欄位、觸控尺寸與視窗 |
| `src/main.tsx` | 共用設定入口、目前目標 |
| `src/Account.tsx` | 法律入口納入操作列，避免遮擋 |
| `src/City.tsx` | 減少地圖文字重疊、選取標籤及浮字縮放 |
| `src/story/StoryPanel.tsx` | 次要資訊展開、計算說明分層 |
| `src/family/FamilyPanel.tsx` | 可放大家族樹卡片及座標 |
| `src/world/WorldPanel.tsx` | 市民次要資料分層 |
| `e2e/readability.spec.ts` | 三字級×三裝置、操作、重載、版面檢查與截圖 |
| `playwright.pages.config.ts`、`.github/workflows/deploy-pages.yml` | 公開部署亦驗證閱讀矩陣、保留截圖產物 |

## 驗收矩陣與限制

Chromium：桌面1440×1000、平板820×1180、手機390×844，分別測試100／125／150%。包含首頁、城市、劇情第一／二章照顧決策、股票、房產、帳本、家族、法律視窗及存檔；檢查頁面水平溢出、操作控制項文字裁切，實際點擊前往、健檢、照顧及存讀檔。字級重載保持、存檔仍為v4。

尚未驗證實體Windows、Mac、iPhone Safari、Android及iPad；Chromium裝置模擬不能替代實體驗收。長篇資料在特大字級需要更多垂直捲動。大型家族樹保留專用橫向捲動區；其餘一般遊戲頁面不應水平溢出。不是全遊戲逐像素或所有歷史存檔組合的形式證明。

## 截圖

以下截圖使用相同新劇情開局；before來自修改前提交2090d49，after來自本輪介面。照顧截圖為健檢後選共同照顧的狀態。完整九組新截圖亦隨Actions測試產物提供。

| 畫面 | 改善前 | 改善後100% |
|---|---|---|
| 桌面首頁 | [前](docs/readability/before-desktop-home.png) | [後](docs/readability/after-desktop-100-home.png) |
| 桌面城市 | [前](docs/readability/before-desktop-city.png) | [後](docs/readability/after-desktop-100-city.png) |
| 桌面劇情 | [前](docs/readability/before-desktop-story.png) | [後](docs/readability/after-desktop-100-story.png) |
| 手機首頁 | [前](docs/readability/before-mobile-home.png) | [後](docs/readability/after-mobile-100-home.png) |
| 手機城市 | [前](docs/readability/before-mobile-city.png) | [後](docs/readability/after-mobile-100-city.png) |
| 手機劇情 | [前](docs/readability/before-mobile-story.png) | [後](docs/readability/after-mobile-100-story.png) |

[手機150%照顧決策](docs/readability/after-mobile-150-care.png) · [平板150%城市](docs/readability/after-tablet-150-city.png)

## 本機測試結果

- `npm test`：61／61；TypeScript＋Vite production build成功。既有Phaser主程式大於500KB的建置提示仍在，本次未擴大為打包優化。
- `npm run test:e2e`：42／42（33項既有功能回歸＋9組字級／裝置矩陣）。
- 關係圖明細與自由開局的最後調整後，再執行`npx playwright test e2e/readability.spec.ts e2e/family.spec.ts --workers=1`：15／15，包含三字級下自由模式新檔不覆蓋劇情進度。
- 前述已測頁面沒有整頁水平溢出、被裁切的操作控制項文字，關鍵操作實際可點擊。這不等同於全部實體瀏覽器或任意歷史存檔狀態均已驗證。
- 最後的城市標籤／事件動畫保留修正後，再建置並執行`npx playwright test e2e/city.spec.ts --workers=1`：6／6，涵蓋三裝置城市操作與財務動畫。

## 公開部署驗收

程式提交`24406de`：[GitHub Actions](https://github.com/hd022311/family-wealth-empire/actions/runs/40064163591)建置、部署、公開網址驗證三個工作均success。工作包含三裝置的公開遊戲流程與三字級矩陣；另由開發環境向公開HTTPS確認200及新版程式的字級／關係圖標記，沒有以localhost當公開網址。

試玩：[https://hd022311.github.io/family-wealth-empire/](https://hd022311.github.io/family-wealth-empire/)。開啟後可在最上方選文字大小，再點「開始劇情人生」。既有玩家可直接接續原存檔，不必重開遊戲；若仍是舊畫面，重新整理頁面，不要清除網站資料。

建置／公開驗證的完整截圖在該次Actions的`pages-browser-tests`／`public-device-verification`產物；目前保留7天。本文件連結的主要前後畫面則保存在Git，不依賴產物保存期限。
