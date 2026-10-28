// Independent prologue candidate. Canonical first-volume data is read-only.
import {CAST,DECISIONS} from '../story.mjs';
export {CAST};
export const VERSION='prologue-82s-v1';
export const KEY='fwe.theatre.prologue.preview.v1';
const cue=(id,seconds,speaker,text,date,cast,shot='duo',setting='living')=>({id,seconds,speaker,text,date,cast,shot,setting});
export const CUES=[
 cue('unseen-years',6,'brother','等等。以前家裡有事，我也沒有少做。你們……已經談好了？','2029-08-01',['player','brother'],'duo'),
 cue('not-only-houses',6,'brother','我不是只在說房子。我想知道，這些年你們有沒有看見我。','2029-08-01',['brother','sister'],'close'),
 cue('same-table',5,'father','家安，回來就吃飯，手機先放下。','2026-04-26',['father','player','mother'],'group'),
 cue('son-again',5,'player','好，今天不當企劃，當你兒子。','2026-04-26',['father','player'],'duo'),
 cue('also-father',3,'spouse','也別忘了，你還是爸爸。','2026-04-26',['player','spouse'],'duo'),
 cue('familiar-window',7,'mother','這間房子，我住慣了。窗邊漏水，也捨不得搬。','2026-04-26',['mother','father'],'duo'),
 cue('rental-window',7,'father','出租那間的窗戶？我明天找人看，別讓雨潑進去。','2026-04-26',['father'],'close','rental'),
 cue('two-keys',4,'father','這兩間房，以後都是你們的靠山。','2026-04-26',['father','mother','player'],'group'),
 cue('new-year-table',4,'father','過年記得回來吃飯。這張桌子，你們的位子都留著。','2026-04-26',['father','mother'],'duo'),
 cue('brother-has-a-life',5,'brother','下星期孩子有活動，我可能晚點才能過來。','2026-04-26',['brother','father'],'duo'),
 cue('soup-first',3,'father','知道，湯先喝。','2026-04-26',['brother','father'],'duo'),
 cue('sister-shift',5,'sister','我等等還要上班。媽，別裝了，真的吃不完。','2026-04-26',['sister','mother'],'duo'),
 cue('fruit-to-share',3,'mother','那就帶去分同事。','2026-04-26',['sister','mother'],'duo'),
 cue('not-just-a-house',4,'spouse','房子是靠山。可爸媽需要的，不會只有房子。','2026-04-26',['spouse','player'],'duo'),
 cue('hospital',5,null,'2026年5月18日。一次住院，讓探望變成每天都要安排的事。','2026-05-18',['mother','player'],'duo','hospital'),
 cue('discharge',4,'mother','爸爸出院後，你們也還有自己的生活。','2026-05-18',['mother','player'],'duo','hospital'),
 cue('first-care',6,null,'媽媽把出院單推過來，沒有替任何人作決定。','2026-05-18',['mother','player'],'duo','hospital'),
];
export const DURATION=CUES.reduce((n,c)=>n+c.seconds*1000,0);
export const CARE=DECISIONS[0];
export function state(){return {version:VERSION,index:0,seen:[],mode:'scene',draft:null,choice:null,scale:1,reduced:false,emotionEffects:true};}
export function validate(s){
 if(!s||s.version!==VERSION||!Number.isInteger(s.index)||s.index<0||s.index>=CUES.length||!Array.isArray(s.seen)||s.seen.some(id=>!CUES.some(c=>c.id===id))||!['scene','choice','result'].includes(s.mode)||![1,1.25,1.5].includes(s.scale)||typeof s.reduced!=='boolean')throw Error('invalid preview');
 if(s.emotionEffects!==undefined&&typeof s.emotionEffects!=='boolean')throw Error('invalid effects');
 if(s.mode!=='scene'&&s.index!==CUES.length-1)throw Error('invalid gate');
 const valid=id=>id===null||CARE.options.some(o=>o.id===id);
 if(!valid(s.draft)||!valid(s.choice)||(s.mode==='result'&&!s.choice)||(s.mode!=='result'&&s.choice!==null))throw Error('invalid choice');return {...structuredClone(s),emotionEffects:s.emotionEffects??true};
}
export function next(s){if(s.mode!=='scene')return false;const id=CUES[s.index].id;if(!s.seen.includes(id))s.seen.push(id);if(s.index<CUES.length-1)s.index++;else s.mode='choice';return true;}
export function skipRead(s){if(s.mode!=='scene')return 0;let n=0;while(s.mode==='scene'&&s.seen.includes(CUES[s.index].id)){next(s);n++;}return n;}
export function select(s,id){if(s.mode!=='choice'||!CARE.options.some(o=>o.id===id))return false;s.draft=id;return true;}
export function confirm(s){if(s.mode!=='choice'||!s.draft)return false;s.choice=s.draft;s.mode='result';return true;}
export function replay(s){s.index=0;s.mode='scene';s.draft=null;s.choice=null;}
