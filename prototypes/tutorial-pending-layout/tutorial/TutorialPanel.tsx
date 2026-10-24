import type { State } from '../simulation';
import { newTutorial } from './model';
type Target = 'city'|'work'|'family'|'ledger'|'care'|'time';
export function TutorialPanel({state:s,onUpdate,onGuide,onAdvance}:{state:State;onUpdate:(s:State)=>void;onGuide:(target:Target)=>void;onAdvance:()=>void}) {
  if (!s.story) return null;
  const t=s.tutorial, step=(t?.done.length??0)+1;
  const change=(status: NonNullable<State['tutorial']>['status'])=>onUpdate({...s,tutorial:{...(t??newTutorial()),status}});
  if (!t || t.status!=='active') return <section className="tutorial-rest" aria-label="新手教學控制">
    <strong>{!t?'第一次玩？':t.status==='completed'?'五步教學已完成':t.status==='paused'?'教學已暫停':'已跳過教學，遊戲照常進行'}</strong>
    <button onClick={()=>onUpdate({...s,tutorial:newTutorial()})}>{t?'重新開始教學':'開啟五步新手教學'}</button>
    {t?.status==='paused'&&<button onClick={()=>change('active')}>接續教學</button>}
    <small>重新開始只重播引導；已做過的行動會依紀錄辨認，不重置人生。</small>
  </section>;
  const parent=s.clan.people.find(p=>[10,11].includes(p.id)&&p.alive);
  const titles=['認識城市','工作收入','家庭互動','時間與收支','人生決策'];
  const e=s.story.episode;
  const text=step===1?'先找到公司。拖曳地圖移動視角，雙指或＋／−縮放；點建築前往，也可用下方場所按鈕。'
    :step===2?s.world?.job?'你已有工作，無須重新求職。結算一個月，薪資與生活費才會真正入帳。':'先在公司應徵企劃專員，再結算一個月領薪。'
    :step===3?'前往父母自住房，點「陪伴」與父母互動一次。每次需 $1,200、4 小時，不會取得父母財產。'
    :step===4?'再結算一個月，然後開啟帳本，比較現金、收入與支出。每次結算都會推進年齡與家庭生活。'
    :e?'比較照顧方案的啟動費、每月支出與照顧時數，再親自選擇。分擔與健康結果會依真實遊戲狀態改變。':'到父母家陪同健檢（$3,000／4 小時），才會發現健康風險、開啟照顧選擇。';
  const target:Target=step===1?'city':step===2?'work':step===3?'family':step===4?'ledger':e?'care':'family';
  const unavailable=s.dead || ((step===3||step===5)&&(!parent||e?.status==='bereaved'));
  return <section className="tutorial-panel" aria-label="目前教學目標" data-tutorial-step={step}>
    <div className="tutorial-title"><strong>新手教學 {step}／5 · {titles[step-1]}</strong><span>已完成 {t.done.length} 步</span></div>
    <p>{text}</p>
    {unavailable?<p role="status">目前角色或父母狀況已不適合這段操作。可跳過或暫停教學繼續人生，不會把未做過的行動算成完成。</p>:<div className="tutorial-actions">
      <button className="primary" onClick={()=>onGuide(target)}>帶我前往{step===1?'公司':step===2?'職涯操作':step===3?'父母家':step===4?'帳本':e?'照顧選項':'健檢操作'}</button>
      {(step===2&&!!s.world?.job||step===4)&&<button onClick={onAdvance}>{step===2?'結算並領取首次薪資':'結算下一個月'}</button>}
    </div>}
    {step===4&&t.baseline&&<p className="tutorial-comparison">教學比較起點：第 {t.baseline.month} 月 · 現金 ${Math.round(t.baseline.cash).toLocaleString('zh-TW')}。目前第 {s.month} 月 · 現金 ${Math.round(s.cash).toLocaleString('zh-TW')} · 收入 ${Math.round(s.income).toLocaleString('zh-TW')} · 支出 ${Math.round(s.expense).toLocaleString('zh-TW')}。</p>}
    {(step===3||step===5)&&<details><summary>資金不足、時間用完或暫時不想處理？</summary><p>教學不會補錢、借貸或代選。請保留生活與照顧預算；有工作可先正常領薪。每月總安排上限40小時，請減少加班／陪伴安排，或結算下月重置已用時間（固定安排仍保留）。暫不照顧可跳過教學，實際事件仍依原規則繼續。</p><button onClick={()=>onGuide('time')}>前往時間安排</button></details>}
    <div className="tutorial-controls"><button onClick={()=>change('paused')}>暫停教學</button><button onClick={()=>change('skipped')}>跳過教學</button></div>
  </section>;
}
