# 架構與信任邊界

## 現有遊戲保留
React 管理繁體中文 UI、帳本與家族流程；Phaser 繪製等角城市、可點選建築和行人。`simulation.ts` 保持純函數交易與月度模擬；不需 Supabase 即可操作。`market.ts` 隔離 MarketProvider，目前僅 fictionalMarket。沒有導入真實行情或真實法院資料。

## 活躍時間與長期回訪
1 倍速每月 15 秒，25–85 歲為 720 個月 / 3 小時活躍遊玩，可分為多次 5–15 分鐘。只在頁面可見且有焦點、遊戲未暫停、未開啟存檔或排行榜面板時累積計時；delta 上限防止系統睡眠後追趕補算。離開頁面不推進年齡、收支、價格、死亡或事件。現在離線進展為零，沒有登入懲罰。

未來真實市場可在離線更新報價，但應保存上次價格快照與來源時間，回歸呈現「未實現估值差」與待審查事件，不能自動賣出、清算或推進人生。虛擬市場若引入離線進展，必須限定上限並由玩家確認；禁止長期未登入而死亡或破產。競賽價格另用固定封存路徑。

## 存檔分層
- `State`：角色、家族、財務、房產、股票及近期家族記事。
- `Slot`：UUID、名稱、State、owner、server revision、dirty、updatedAt、歷代完整結束快照。
- `Library`：version、active ID、多個互相獨立 Slot；儲存在 `fwe-library-v1`。初次讀取支援舊 `family-wealth-empire-v1`，不刪除原始資料。載入前結構驗證，損壞時不自動覆寫。
- `updateSlot`：保存遊戲變更；接班時將上一代加入 generations。家族記事目前每代保留最近 40 條，完整無限事件日誌待後續。
- 正式 build 產生 Service Worker，快取同源靜態 shell。只攔截同源 GET，不快取 Supabase 驗證或存檔 API。新版本資產更新後待舊分頁關閉再啟用。

## 雲端同步
`cloud.ts` 僅在兩個 VITE_SUPABASE_* 公開設定存在時初始化，否則訪客模式。Supabase Email auth 支援註冊、驗證、登入、登出和會話恢復。登入後讀取本人雲端家族；訪客上傳需明確按同步。帳號 owner 不符者不自動上傳。

`Account.tsx` 保存本機所有變更；已綁定的家族每 30 秒和 online 事件檢查雲端。`syncDecision` 分辨 upload / download / conflict / unchanged / foreign。下載會重建該家族 UI；開啟管理面板時遊戲暫停。同步中的後續本機月度變更保留 dirty，不會被較舊的上傳回應取代。登入帳號變動後丟棄舊請求回應。

資料表 `family_saves` 開 RLS，僅本人可 SELECT；寫入只走 security-definer `save_family`，固定空 search_path，以 auth.uid 綁定 owner。原子 expected_revision compare-and-swap 防止覆寫另一裝置版本。衝突沒有金錢合併或自動 last-write-wins；使用者保留本機副本後可採用雲端快照。

## 安全範圍
雲端快照僅為個人沙盒、固定 `unverified_sandbox`。雖有所有權隔離、大小限制、版本一致性及前端結構驗證，瀏覽器持有人仍能修改自己的財務數值。不能用此資料計算排行榜、兌換物品或進行多人交易。重要財務的權威驗證尚未完成：需後端命令驗證、雙式帳本、固定價格來源、伺服器活躍時段與可重播審計，所有操作同交易提交。service_role 永遠只在可信任伺服器。

## 內容擴充
`content.ts` 定義 EconomicEvent / CourtChallenge / ContentProvider；每週事件附來源，法院挑戰須有來源網址、管轄、日期、匿名摘要及人工審核旗標。當前空 provider，不產生假裝真實的判決或新聞。未來事件以穩定 ID 去重並列入待辦，玩家確認才影響人生或資產。

## 排名擴充
排行榜與沙盒完全獨立，`RankingProvider` 只有讀取介面。六榜、相同起點、同市場/難度/經濟情境與標準化時間、個人排名、百分位、變化、月賽季與名人堂規格見 [LEADERBOARDS.md](LEADERBOARDS.md)。第二份 SQL 僅預留資料表、驗證憑據及公開同意檢視，不會啟用排名服務。沒有從 State 計算競爭成績的捷徑。

## 驗證
Vitest 驗證模擬、存檔、繼承、衝突、排行榜契約；PGlite 執行真實 PostgreSQL 語意的遷移/RLS/CAS/權限測試。Playwright 使用桌面、平板及手機 Chromium 驗證城市 canvas、房產與股票操作、多家族切換、重新載入及離線開啟。遠端 Supabase Auth / PostgREST / 多裝置實連需設定後另驗收。

## 動態城市擴充（0.2）
`cityModel.ts` 定義 CityEvent、環境週期、縮放限制、年齡外觀及獨立偏好設定。`simulation.ts` 在成功交易／月度結算／人生轉換時遞增事件序號；事件限存最近 40 筆。房產新增 level、operating、renovationUntil，存檔載入時相容舊欄位；家族庫及世代典藏亦套用相同遷移。

`City.tsx` 透過 React refs 將狀態送入長存的 Phaser Scene，不因普通交易重新建立 Phaser Game。渲染只讀狀態，首次進入不重播舊事件，新增事件以 ID 去重。建築顯示施工、出租／空置、公司級別；客流只在已開業且未施工時啟用。Camera 處理單指拖曳、雙指、滾輪及按鈕縮放；拖曳／捏合不視為點選。

紋理集中生成並重用 Sprite，移動角色採固定物件池；手機預設省電與渲染 30 FPS 上限。日夜、天氣及一般交通採獨立可見頁面時鐘，家庭移動另受遊戲 speed/paused/dead/焦點控制。停止背景動畫不會停止或重複財務結算。更完整規則見 DYNAMIC_CITY.md。

## 家族人性與台灣法律引擎（本次實作計畫）
- `family/` 保存獨立 NPC、個人資產、關係、種子決策、照顧事件、客觀／主觀／文件記憶與交易紀錄；父母資產不列入玩家淨資產。
- `legal/` 為不讀取好感度的純法律引擎，輸入死亡日期、親屬及財產事實，回傳規則依據、已知事實、爭議與待確認事項。資料未核實時禁止輸出正式金額或移轉遺產。
- 法源版本具公布／生效／失效日期、官方來源與核對狀態；不假設 2026 年修法內容。年度稅額不沿用上一年，也不以零稅額代替缺資料。
- 法律面板固定可開啟，與家庭會議、家族樹及城市人物整合。舊存檔保留原資產及世代典藏，不追溯改寫既有交易。
- 目前官方法律網站連線遭環境代理拒絕（CONNECT 403），已另存四個官方目的地主機至環境草稿；正式法源核對尚待網路設定生效。程式與測試可先建立，不能因此標示法律已驗證。

### 0.3 實作結構與資料契約
State 為 v2，Clan 自有 version 1；外層 Library／Supabase envelope 保留 version 1。parseSave 只對舊 State v1 產生 legacy Clan，不改原資產，v2 缺少 Clan 則拒絕載入。世代典藏沿用同一遷移入口。

法律引擎只讀 SuccessionFacts，不能讀 NPC 信任或親密度；LawSource 包含官方連結、公布／施行／失效區間、hash、核對與演算法版本。未知及重疊區間封鎖。正式目錄預設 pending；測試注入明示 test_fixture 且不匯入 app，不能轉成 confirmed。年度稅表空白時回傳 null，不填零。

Clan 包含 Person、Link、Relation、Memory（fact/perception/document）、Promise、Loan、平衡 FamilyTransaction、照顧 Episode 及獨立 Estate。遊戲財務紀錄不代表法律效力。family/engine.ts 以保存在存檔的 LCG 種子，綜合能力、責任、目標、風險、家人意見與承諾記憶做決策，並產生真實資金／生活變化。

死亡接班只切換成年後代的經營視角及個人帳戶；原財產與債務保管在 Estate，已有產權未處理的地圖房產加鎖，不能重複購入。不是以遊戲成人資格排除法律上的未成年繼承人。未啟用正式分割、稅務、法院結果或生前產權交棒。完整情境和已知限制見 FAMILY_LAW.md。


## 雙模式與小型開放世界：第一階段
- 保留 Phaser、React、財務與家族核心，新增獨立 world／modes 模組。
- 劇情模式 30 歲、父母及兩名手足，五階段依狀態判定；自由模式開放三種背景及角色設定。
- 新模式使用職涯薪資、具種子的 NPC 月度自主生活、場所探索、社交及服務商機；舊存檔保持原規則。
- 模式隨各自 UUID 存檔保存，共用既有本機、雲端衝突及世代機制。法律未驗證時不分產、不計稅。
- 驗收：開局與資產隔離、固定種子、自主生活、工作收入與商機、模式讀檔、城市與既有功能回歸。
- 後續：更多職涯、企業人才、城市區域與第二至第五章事件；法律與稅務須專業審核。

### 0.4 實作邊界
`modes/create.ts` 純開局工廠建立獨立玩家帳戶與 clan，`StartScreen` 管理首頁表單。`world/model.ts` 儲存模式、職涯、種子、技能、八名市民、人才與人生記憶；`world/engine.ts` 的純行動 reducer 檢查場所、月份、能力與資金，所有財務變動記入既有平衡交易日誌。`simulation.tick` 在活躍月份呼叫自主世界，再計算薪資及工作室收支；Phaser 不控制時間或財務。`world/navigation.ts` 提供四向 BFS；City 插值人物路徑，場所可快速前往。NPC 自主選擇使用保存的 LCG 種子；社交不更改法律權利。五章由 generation、estate、照顧事件、年齡與經營事實推導，不使用固定事件順序。

v3 仍允許無 world 的經典存檔；v1/v2 遷移不自動改模式或薪資。新模式不自動產生台灣退休金。工作室數值是服務經營的虛構收支，不代表法律上公司股權。雲端及排行榜仍不信任瀏覽器競爭性財務數字。

## 第二階段：劇情《兩間房子的承諾》（State v4）
`story/setup.ts` 僅於新的劇情開局建立獨立房屋清冊及完整手足家庭，不改自由模式或舊劇情存檔。`types.ts` 定義房屋、時間、照顧事件與自主回應；`definitions.ts` 定義六章、可玩任務、場所及三種照顧方案。`story/engine.ts` 是可重現的純行動 reducer 與月度模擬；`validation.ts` 拒絕不合法房屋、人物、時間或事件資料。`StoryPanel` 顯示進度、時間、家庭近況及記憶，`StoryLocation` 為場所限定互動。

`simulation.tick` 順序為世界／市場、玩家原有收支、家族自主生活，再 `advanceStory`。新增房屋不進玩家四筆 Property 或淨資產公式。屋主租金、維護、修繕、醫療與自主工作取捨分開入平衡交易日誌。`lastSettledMonth` 防止劇情月結重入，房屋也保存 `lastRentMonth`。UI 選擇只在有效場所、時間與資金條件下原子提交；失敗不改原輸入。NPC 沿用多維決策與保存的亂數種子，當月回應去重，讀檔不重抽。

Phaser 在原 8×8 城市加兩棟程序建築；尋路只在新劇情增加兩個障礙，不改舊存檔通行規則。家人有居家、社區、照顧路徑，屋主收租及施工由實際狀態觸發。畫面只消費 CityEvent，新增 `placeId` 與玩家 `propertyId` 分開，避免把父母收入動畫當成玩家交易。短提示限制同時數量，完整訊息留在劇情紀錄。

`openEstate` 每名死者各一份日期、婚姻／親屬及房屋快照；仍由既有法律引擎封鎖未驗證效果。`legalEvents.ts` 是第三至六章唯讀事件審查介面；所有數額／分配結果為 null、effects 為空，不是生效的法律規則。`restrictions` 只預留逐筆程序證據，沒有整包自動凍結。

v1–v3 → v4 只遷移既有資料。帳戶啟動先備份成功的舊家族庫，再寫回遷移結果；新劇情另開 UUID。雲端封套與 SQL RLS／CAS 不需變更，本次未聲稱已連接正式 Supabase。可攜 HTML 由 `scripts/package-demo.mjs` 打包，不含外部資源與雲端設定；不變更一般網站的分包與離線架構。
