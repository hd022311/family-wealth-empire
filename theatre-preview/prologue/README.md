# 那張餐桌｜82秒獨立前言候選預覽

只供《兩間房子的承諾》前言審閱，尚未整合第一卷。正式美術簽核數量：0。

## 預覽

從儲存庫根目錄執行：

```sh
python3 -m http.server 4191 --bind 0.0.0.0
```

開啟 `http://localhost:4191/theatre-preview/prologue/`，旋轉視窗會自動重新構圖，不重啟故事。
`4191` 是開發預覽埠，不是公開託管。`prologue-review.html` 是內含全部必要素材的單檔審閱版；已驗證透過HTTP只請求該HTML即可運作，直接file://開啟因本環境瀏覽器政策尚未驗證。

公開預覽：https://hd022311.github.io/family-wealth-empire/theatre-preview/prologue/

部署與外部HTTPS完整性驗證通過：https://github.com/hd022311/family-wealth-empire/actions/runs/40612087781

互動測試為本機Chromium；本環境代理封鎖GitHub Pages，公開網址瀏覽器操作與實體iPhone仍待人工驗收。發布明細記錄於 `reports/publication.json`。

## 操作

- 預設手動閱讀；按右上播放鍵可按82秒節奏自動播放。
- 底部字幕橫向1～2行，直向最多4行。超出時「閱讀完整台詞」會暫停演出、顯示完整原文，返回後不強制自動播放。
- 選單提供100%、125%、150%、減少動態、略過已讀與重新觀看。
- 略過只跨越已讀節拍；遇到未讀或第一個照顧選擇立即停止，不代選。
- A／B／C為原第一個照顧選擇，不是新增第七次選擇；選取後仍須確認。
- 本地儲存只操作 `fwe.theatre.prologue.preview.v1`，不讀寫第一卷正式閱讀鍵或State v4。
- 重新整理回到目前節拍，暫停等待玩家；自動演出的節拍內秒數不跨重新整理保存。旋轉則保留節拍內播放時間。
- 壞掉或不相容的預覽紀錄不覆寫；本次改為暫時觀看。

## 技術與限制

原生ES模組、Canvas分層合成、CSS字幕；沒有新增套件、Live2D、語音服務、帳號、分析或正式法律計算。

父母與配偶每人目前只有一張坐姿候選稿；手足有限表情沿用既有概念素材。前言以鏡頭、構圖、稀疏臉部層與一次淡入呈現節奏，不是已完成的動畫影集，也未實作端湯、遞出院單、握手機或嘴型演出。人物手持物與台詞不一定逐項同步，需正式分層美術再製作。

`scene.mjs`只讀取第一卷人物與第一個選擇。八種結局不在本原型畫面出現；沒有重寫正式法律效果、費用或第一卷分支。

## 驗收與錄影

- `node --test theatre-preview/prologue/scene.test.mjs`
- `node theatre-preview/prologue/scripts/browser.mjs`
- `node theatre-preview/prologue/scripts/extra-browser.mjs`
- `node theatre-preview/prologue/scripts/record.mjs`

測試腳本目前引用此雲端環境的Playwright安裝路徑；遊戲本身不依賴此路徑。

錄影是實際Chromium播放畫面：82秒故事後停在照顧選擇，影片額外保留短暫尾畫面，無配音與音樂。24fps是影片編碼規格，並非24張／秒人物動畫。

## 字幕閱讀與情緒小型測試

- 姓名20px、對話24px基準，三種字級等比例放大；短高度不縮字。
- 六名人物有固定識別色，搭配姓名、身分與色條；對話保持白色，未改人物亮度與素材。
- `emotions.mjs`是可重用六狀態字幕元件，只有3句套用憤怒／悲傷／堅定，其餘14句維持平靜。
- 特效只作用於字幕內層，不影響攝影機安全區、Canvas、選項或劇情計時；震幅上限2.5 CSS px，180ms單次。
- 新增獨立前言的可選設定 `emotionEffects`，舊紀錄缺少時預設開啟，不變更版本／日期／已讀位置。
- 系統或手動減少動態優先於此設定，關閉立即恢復文字；切回開啟不重播目前句，重看可重新比較。
- 新驗收與四支比較短片：`reports/emotions/REVIEW.html`。原82秒影片保留作上一版基線。
- `node --test theatre-preview/prologue/*.test.mjs`
- `node theatre-preview/prologue/scripts/emotion-browser.mjs`
- `node theatre-preview/prologue/scripts/readability-browser.mjs`
- `node theatre-preview/prologue/scripts/emotion-record.mjs`

## 字幕句尾標點

對話與劇情旁白段末不顯示中文句號，保留情緒標點與句中標點。全文及回顧一致；法律與系統文字不套用。這只是顯示格式，原始台詞及已讀／續讀識別保持原值。後續劇情標準見 `../docs/TEXT_STYLE.md`，驗收見 `../reports/punctuation/REVIEW.md`。
