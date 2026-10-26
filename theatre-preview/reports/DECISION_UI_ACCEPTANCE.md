# 對話與重要抉擇介面驗收

2026-10-26。基於3173dc9第一卷，純UI／防誤觸改善，不擴充遊戲系統。

## 修改
- 一般對話：維持電影式底部字幕，人物名稱、台詞及「點擊繼續」。移除常駐重複法律註記及日期；法律入口仍隨時可開啟，法律內容沒有改寫。略過停下時才有簡短原因提示。
- 重要抉擇：獨立置中場景層、背景降亮度、醒目標題、選擇次數、A／B／C標記；三個方案及原有費用／後果完全保留。選項區可捲動，底部確認固定可見。
- 選取有反白、金色側線、桌面勾選、aria-pressed、觸控按壓與鍵盤焦點；可以改選，必須按「確認這個選擇」才會送出。沒有自動倒數或延時提交。
- 選擇畫面不包含字幕點擊區／繼續按鈕；next()亦以狀態防護。只接受當前抉擇的有效選項，拒絕失效按鈕、停用按鈕及雙擊後續點擊；提交後立即離開抉擇狀態，重複事件不再扣支出。
- 尚未確認的選項只在本頁暫存；刷新後回到原抉擇，確認按鈕停用、需要重選。確認後刷新則讀到後續台詞，沒有第二次扣款。

## 驗收
- 43項單元／回歸通過：六組抉擇A/B/C、有效選取才啟用確認；原729路線、八結局、法律pending、讀檔、無劇透收藏及人物樣機保護。
- 對話及抉擇各18組（共36組）：1440×900、1366×768、820×1180、390×844、320×568、844×390 ×100/125/150%。無文件或選項面板水平溢出，選項可捲動查看、確認按鈕在畫面內且至少44px。
- 選項前背景點擊／空白鍵不能推進；改選／雙擊選項不提交；雙擊確認只產生一次care選擇與一次支出，後續第一句保持不動。確認前後刷新驗證，另以Chromium觸控模擬連點選項不提交、確認才提交一次。decision-ui/browser.json。
- 三條完整路線、逐段刷新、第二輪、壞檔與儲存受阻：reading/browser.json。收藏18組及已讀略過停在未讀分支／重要選擇：collection/browser.json。測試已更新為明確選取再確認，沒有繞過新操作流程。
- 新文案候選字掃描0個高可信簡體錯誤；金額、法律限制與故事文字沒有刪除或重寫。

## 前後截圖
前版由3173dc9的實際瀏覽器擷取，同為100%字級與相同劇情位置：
- 桌面：[前對話](decision-ui/before-desktop-dialogue.png)／[後對話](decision-ui/after-desktop-dialogue.png)；[前選擇](decision-ui/before-desktop-choice.png)／[後抉擇](decision-ui/after-desktop-choice.png)。
- 手機：[前對話](decision-ui/before-mobile-dialogue.png)／[後對話](decision-ui/after-mobile-dialogue.png)；[前選擇](decision-ui/before-mobile-choice.png)／[後抉擇](decision-ui/after-mobile-choice.png)。
- [手機150%](decision-ui/after-mobile-choice-150.png)、[平板125%](decision-ui/after-tablet-choice-125.png)。大字與短視窗保留面板捲動，不以縮字塞入畫面。

## 保護範圍與待驗收
修改 app.mjs、cinematic.css、index.html，新增choice-controls.mjs及測試；更新瀏覽器驗收腳本、文件與授權runtime hash基準。story.mjs SHA256保持40ad0811db5bf480eaff437611a38e5b43fa3906f0397559c849806ea0c5bb35。正式經營模式、State v4、續讀資料格式及人物動畫樣機不變。

僅Chromium viewport／滑鼠與鍵盤測試；實體iPhone/iPad Safari、Android觸控／低階效能及輔助科技仍待人工驗收。公開部署與外部測試另見最終交付與GitHub Actions。原型仍僅本機存檔，清除網站資料會遺失；未核實法律效果不作確定結算。
