/** Existing line only. The sample has no voice audio and never awards an ending. */
export const LINE='哥，我沒有說房子已經是我的。我以為……我們今天是來一起看資料。';
export const DURATION=13500;
export const BASE_STATE={eyes:'base',mouth:'base'};
export function speechDelay(char,index){return /[。！？]/.test(char)?490:/[，、]/.test(char)?310:char==='…'?350:[88,74,102,82,95][index%5];}
export function buildTake(){const events=[{at:0,kind:'frame',...BASE_STATE,label:'先聽對方說完'},{at:720,kind:'frame',eyes:'down',label:'先把視線落到資料上'}];
 function blink(at,rest='base'){for(const[delay,eyes]of[[0,'half'],[48,'closed'],[112,'half'],[168,rest]])events.push({at:at+delay,kind:'frame',eyes,label:delay===0?'眨眼一次，隨後停住':null});}
 blink(1750,'down');events.push({at:2450,kind:'frame',eyes:'base',label:'看回對方，停一下再說'});let at=2860,shown='';Array.from(LINE).forEach((char,i)=>{shown+=char;const punctuation=/[\s。，！？、；：…]/.test(char);const mouth=punctuation?'base':['narrow','base','open','narrow','base','narrow','open','base'][i%8];events.push({at,kind:'speech',text:shown,mouth,label:punctuation?'標點停頓，嘴型停止':'原台詞・文字節奏嘴型，沒有配音'});at+=speechDelay(char,i);});events.push({at,kind:'frame',mouth:'base',label:'說完後停住，不循環張嘴'});blink(10200);events.push({at:11600,kind:'frame',eyes:'down',mouth:'base',label:'將視線放回文件上'});events.push({at:DURATION,kind:'end',eyes:'down',mouth:'base',label:'樣機演出結束・不會自動重播'});return events.sort((a,b)=>a.at-b.at);}
