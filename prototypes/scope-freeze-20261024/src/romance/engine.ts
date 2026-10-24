import type {State} from '../simulation';
import {ledger,remember,relationship,familyAction} from '../family/engine';
import {storyAction} from '../story/engine';
import {salary,jobs} from '../world/model';
export type Expression='neutral'|'happy'|'shy'|'angry'|'sad';
export type Bond={stage:'strangers'|'acquaintances'|'dating'|'relationship'|'separated';affection:number;trust:number;conflict:number;dates:number;available:boolean;expression:Expression;lastActions:Record<string,number>};
export type Romance={version:1;ownerId:number;seed:number;spentHours:number;partnerId:number|null;bonds:Record<string,Bond>;appointment:{id:number;until:number}|null;memories:{month:number;personId:number;text:string}[];lastNotice:string};
export const candidates=[
 {id:100,name:'陳美玲',gender:'女',style:0,interests:['散步','攝影'],values:{family:80,finance:65,career:55,autonomy:65},goal:'穩定工作，也保有自己的攝影時間',family:'與父母同住，協助長輩就醫',friends:[102,104],debt:0},
 {id:101,name:'吳志豪',gender:'男',style:1,interests:['咖啡','設計'],values:{family:55,finance:50,career:85,autonomy:90},goal:'累積創業能力，暫不急著生育',family:'與朋友合租，定期探望父母',friends:[103,100],debt:80000},
 {id:102,name:'黃心怡',gender:'女',style:2,interests:['閱讀','公園'],values:{family:70,finance:85,career:70,autonomy:60},goal:'先建立備用金，再考慮共同生活',family:'與姊姊互相照應，重視清楚分工',friends:[100,105],debt:0},
 {id:103,name:'蔡宇軒',gender:'男',style:3,interests:['健走','料理'],values:{family:85,finance:65,career:60,autonomy:65},goal:'兼顧家人照顧與自己的生活',family:'照顧父親，也需要伴侶尊重休息時間',friends:[101,104],debt:160000},
 {id:104,name:'張雅婷',gender:'女',style:4,interests:['藝術','旅行'],values:{family:50,finance:60,career:80,autonomy:95},goal:'保持職涯與個人空間，不把婚姻當作唯一目標',family:'獨立居住，常與家人和朋友聯絡',friends:[102,103],debt:0},
 {id:105,name:'李明哲',gender:'男',style:5,interests:['園藝','音樂'],values:{family:80,finance:90,career:55,autonomy:60},goal:'重視長久陪伴、務實財務與家庭責任',family:'協助母親生活，願意協商共同責任',friends:[101,102],debt:50000},
];
export function createRomance(s:State,newGame=false):Romance{const bonds:Record<string,Bond>={};for(const c of candidates){const n=s.world?.npcs.find(n=>n.id===c.id);if(newGame&&s.world?.mode==='free'&&n)n.household=c.family;bonds[c.id]={stage:'strangers',affection:0,trust:0,conflict:0,dates:0,available:!!n&&!n.household.includes('配偶'),expression:'neutral',lastActions:{}};}return {version:1,ownerId:s.clan.activeId,seed:20261024,spentHours:0,partnerId:null,bonds,appointment:null,memories:[],lastNotice:'成年角色都有自己的生活；邀約與交往需要彼此意願，不保證成功。'};}
function random(r:Romance){r.seed=(Math.imul(r.seed,1664525)+1013904223)>>>0;return r.seed/4294967296;}
function record(s:State,id:number,text:string){const r=s.romance!;r.memories.push({month:s.month,personId:id,text});r.lastNotice=text;remember(s,{kind:'perception',actor:s.clan.activeId,subject:s.clan.activeId,observer:null,text,category:'life'});}
const compat=(id:number)=>{const c=candidates.find(c=>c.id===id)!;return 100-(Math.abs(c.values.family-70)+Math.abs(c.values.finance-70)+Math.abs(c.values.career-65)+Math.abs(c.values.autonomy-70))/4;};
export type RomanceAction={type:'meet'|'chat'|'invite'|'date'|'commit'|'breakup';id:number}|{type:'spouse-time'};
export function romanceAction(input:State,a:RomanceAction):State{
 if(!input.world||input.dead||input.age<18)throw Error('需要成年且可主動遊玩的角色');let s=structuredClone(input);s.romance??=createRomance(s);const r=s.romance;
 if(a.type==='spouse-time'){
  const spouse=s.clan.links.find(l=>l.kind==='spouse'&&[l.from,l.to].includes(s.clan.activeId));const id=spouse?(spouse.from===s.clan.activeId?spouse.to:spouse.from):undefined;if(id===undefined||!s.clan.people.find(p=>p.id===id)?.alive)throw Error('沒有可互動的在世配偶');if(s.world?.place!==0)throw Error('請先回自己家');if(r.bonds.spouse?.lastActions.chat===s.month)throw Error('本月已安排夫妻陪伴');
  s=s.story?storyAction(s,{type:'visit',personId:id}):familyAction(s,{type:'visit',personId:id});s.romance!.bonds.spouse??={stage:'relationship',affection:50,trust:50,conflict:0,dates:0,available:false,expression:'neutral',lastActions:{}};s.romance!.bonds.spouse.lastActions.chat=s.month;record(s,id,'夫妻安排陪伴與談論分工，支出 1,200 元；彼此意願與財產權利仍獨立。');return s;
 }
 const c=candidates.find(c=>c.id===a.id),n=s.world!.npcs.find(n=>n.id===a.id),b=r.bonds[a.id];if(!c||!n||n.age<18||!b)throw Error('角色不存在或未成年');
 if(a.type!=='date'&&s.world!.place!==n.place)throw Error('請先到角色所在場所');
 if(b.lastActions[a.type]===s.month)throw Error('本月已進行這項互動，不能重抽結果');
 const dating=['invite','date','commit','breakup'].includes(a.type);
 const hasSpouse=s.clan.links.some(l=>l.kind==='spouse'&&[l.from,l.to].includes(s.clan.activeId)&&s.clan.people.find(p=>p.id===(l.from===s.clan.activeId?l.to:l.from))?.alive);
 if(dating&&(s.story||hasSpouse))throw Error('本階段劇情／已婚角色請經營夫妻關係，不啟用婚姻變動法律效果');
 const hours=a.type==='date'?4:a.type==='meet'||a.type==='chat'?2:1,cost=a.type==='date'?1500:a.type==='invite'?200:0;
 if(r.spentHours+hours>24)throw Error('本月社交時間不足，留些時間工作與休息');if(s.cash<cost)throw Error('現金不足');
 if(a.type==='date'&&(!r.appointment||r.appointment.id!==a.id||r.appointment.until<s.month||s.world!.place!==6))throw Error('需要有效約會與前往公園');
 if(a.type!=='meet'&&b.stage==='strangers')throw Error('請先相遇認識');
 r.spentHours+=hours;s.cash-=cost;s.expense+=cost;if(cost)ledger(s,'約會與邀約實際支出',[{account:`person:${s.clan.activeId}:cash`,delta:-cost},{account:'external:dating',delta:cost}]);b.lastActions[a.type]=s.month;
 if(a.type==='meet'){b.stage='acquaintances';b.trust+=8;b.affection+=6;n.met=true;record(s,a.id,`與${n.name}相遇，了解${c.goal}。`);}
 else if(a.type==='chat'){b.trust=Math.min(100,b.trust+8);b.affection=Math.min(100,b.affection+7);b.expression='happy';record(s,a.id,`${n.name}分享${c.interests.join('、')}與家庭責任；信任建立在理解而非送禮。`);}
 else if(a.type==='invite'){
  const busy=s.month%3===1&&n.place!==6&&n.place!==7;
  const score=b.trust*.4+b.affection*.2+compat(a.id)*.25+(random(r)-.5)*16-(busy?18:0)-(n.cash<c.debt?8:0);
  if(b.available&&score>=35){r.appointment={id:a.id,until:s.month+1};n.place=6;b.expression='shy';record(s,a.id,`${n.name}自主接受公園邀約，願意在自己的工作與家庭之外安排時間。`);}
  else {b.expression='sad';record(s,a.id,`${n.name}婉拒邀約：${!b.available?'目前有自己的感情安排':busy?'正在工作，需要先安排時間':'還想多認識彼此，暫不承諾約會'}。`);}
 }else if(a.type==='date'){b.dates++;b.trust=Math.min(100,b.trust+12);b.affection=Math.min(100,b.affection+10);b.stage=r.partnerId===a.id?'relationship':'dating';b.expression='happy';r.appointment=null;record(s,a.id,`與${n.name}完成公園約會，投入 4h、支出 1,500 元；討論未來、財務與照顧責任。`);}
 else if(a.type==='commit'){
  if(r.partnerId!==null&&r.partnerId!==a.id)throw Error('請先處理目前關係');
  if(b.available&&b.dates>=2&&b.trust>=50&&compat(a.id)>=60&&random(r)>.15){r.partnerId=a.id;b.stage='relationship';b.expression='shy';record(s,a.id,`${n.name}同意交往；這不是婚姻，不建立夫妻財產或繼承權。`);}else{b.expression='neutral';record(s,a.id,`${n.name}尚未同意交往，仍有自己的節奏與價值考量。`);}
 }else{b.stage='separated';b.expression='sad';if(r.partnerId===a.id)r.partnerId=null;r.appointment=null;record(s,a.id,`雙方結束交往，記憶保留；沒有婚姻或財產分配法律效果。`);}
 return s;
}
export function advanceRomance(s:State){const r=s.romance;if(!r||!s.world)return;if(r.ownerId!==s.clan.activeId){const history=r.memories;s.romance=createRomance(s);s.romance.memories=history;return;}
 if(!s.story){const lost=Math.min(salary(s.world),Math.max(0,r.spentHours-12)*200);if(lost){s.cash-=lost;s.income-=lost;ledger(s,'社交時間影響工作',[{account:`person:${s.clan.activeId}:cash`,delta:-lost},{account:'external:foregone-salary',delta:lost}]);}}
 for(const c of candidates){const b=r.bonds[c.id];if(!b)continue;if(b.stage==='relationship'&&(b.conflict>55||compat(c.id)<50)&&random(r)<.4){b.stage='separated';r.partnerId=null;record(s,c.id,`${c.name}因長期價值與相處壓力自主提出分手。`);}else if(b.stage==='acquaintances'&&b.trust>10&&random(r)<.15){b.trust=Math.min(100,b.trust+1);record(s,c.id,`${c.name}主動問候，仍繼續自己的工作與家庭生活。`);}else if(b.stage==='strangers'&&b.available&&random(r)<.015){b.available=false;record(s,c.id,`${c.name}在自己的生活圈開始交往；不是所有人都等待玩家。`);}}
 if(r.appointment){if(r.appointment.until<s.month){record(s,r.appointment.id,'錯過已約定的見面，對方的信任與期待受到影響。');r.bonds[r.appointment.id].trust=Math.max(0,r.bonds[r.appointment.id].trust-8);r.appointment=null;}else s.world.npcs.find(n=>n.id===r.appointment!.id)!.place=6;}r.spentHours=0;
}
export function validateRomance(r:Romance){if(!r||r.version!==1||!Number.isInteger(r.ownerId)||!Number.isInteger(r.seed)||!Number.isInteger(r.spentHours)||r.spentHours<0||r.spentHours>24||!(r.partnerId===null||candidates.some(c=>c.id===r.partnerId))||!r.bonds||!Array.isArray(r.memories)||!r.memories.every(m=>Number.isInteger(m.month)&&Number.isInteger(m.personId)&&typeof m.text==='string')||!Object.values(r.bonds).every(b=>['strangers','acquaintances','dating','relationship','separated'].includes(b.stage)&&[b.affection,b.trust,b.conflict,b.dates].every(Number.isFinite)&&typeof b.available==='boolean'&&['neutral','happy','shy','angry','sad'].includes(b.expression)&&b.lastActions&&Object.values(b.lastActions).every(Number.isInteger)))throw Error('戀愛存檔無效');}
