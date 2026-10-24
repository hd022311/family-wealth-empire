# V0.1 公開試玩部署

## 已完成
- 原本為空的GitHub儲存庫已推送main，保留完整遊戲原始碼與既有功能。
- `.github/workflows/deploy-pages.yml`：鎖定main／手動觸發，Node24、npm ci、單元測試、公開版建置、產物檢查、三尺寸Playwright、Pages artifact與部署。
- `verify-public`在GitHub runner從外部HTTPS再測兩章、資源、買股／購屋、存檔刷新與模式隔離；只有此工作成功才視為外部驗收通過。
- 正確base `/family-wealth-empire/`。無React Router，使用單一頁面與遊戲面板，不需要假設SPA深層路由。
- Service Worker註冊、快取、離線fallback及清理都限制在本專案路徑，不清除其他Pages專案快取或玩家localStorage。
- 公開版強制 `VITE_PUBLIC_DEMO=true`，Supabase URL／公開key留空，畫面標示開發測試與本機存檔。沒有service_role、資料庫密碼或伺服器秘密。

## 唯一必要的管理員操作
目前建立Pages API回覆 `403 Resource not accessible by integration`，而GET Pages為404。此整合授權不能啟用站台，不能藉新增workflow權限取代repo管理權。

1. 開啟 https://github.com/hd022311/family-wealth-empire/settings/pages
2. Build and deployment → Source 選 **GitHub Actions**。
3. 開啟 https://github.com/hd022311/family-wealth-empire/actions/workflows/deploy-pages.yml ，選 Run workflow（main），或重新執行失敗的部署。
4. 確認 build、deploy、verify-public 全部成功，才交付遊玩連結。

預定網址：`https://hd022311.github.io/family-wealth-empire/`。**目前不是已成功部署／已可使用的保證**；以實際Actions與外部HTTP／瀏覽器結果為準。本次不使用Tunnelmole、不依賴玩家電腦開機。

## 手機開始方式（部署及驗收成功後）
開啟上述HTTPS網址 → 劇情模式 → 開始劇情人生。前往父母自住房／住宅區陪伴家人，整理出租屋近況，按「結算一個月並繼續人生」領薪；陪父親健檢，再選照顧方案並逐月追蹤。完整操作見STORY_PROMISE.md。另開自由模式會建立獨立家族。

存檔在當前瀏覽器；刷新可續玩，但清除網站資料、私密模式或換裝置不保證保留。正式雲端尚未驗證。法律結果未核實的功能不啟用。後四章、戀愛／勳章／營運後台原型均不在公開V0.1中。

## 本機重現部署版本
```sh
npm ci
npm test
VITE_BASE_PATH=/family-wealth-empire/ VITE_PUBLIC_DEMO=true npm run build
node scripts/check-pages-build.mjs
PLAYWRIGHT_CHROMIUM_EXECUTABLE=/usr/bin/chromium npx playwright test --config playwright.pages.config.ts
```
CI使用Playwright官方安裝的Chromium，不需設定最後一行的系統執行檔變數。

公開站點驗收：設定 `PAGES_TEST_URL` 為完整HTTPS站址，再執行同一個pages.config測試；本機子路徑通過不等於公開驗收成功。
