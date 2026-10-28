import {NODES} from './story.mjs';
export const KEY='fwe.theatre.opening.v02.v1';
export const LABELS={player:'我',father:'爸爸',mother:'媽媽',brother:'哥哥',sister:'妹妹',spouse:'怡君'};
export function normalizeName(value){const text=String(value??'').normalize('NFC').trim();if(!text)return'家安';if([...text].length>8||/[\p{C}\p{Zl}\p{Zp}<>]/u.test(text))throw Error('請使用八個字以內的名字，不含換行或特殊控制符號');return text;}
export const initial=()=>({schema:1,version:'opening-v02-1',active:null,runs:[],seen:[],settings:{scale:'1',motion:true,emotion:true}});
export function flow(route){return NODES.filter(n=>!n.route||n.route===route);}
export function node(data){return data.active?flow(data.active.route).find(n=>n.id===data.active.position):null;}
export function text(data,n=node(data)){return n?.text.replaceAll('{name}',data.active?.name||'家安')||'';}
export function readKey(n){return n.id+':'+n.text;}
export function begin(data,name,id){const clean=normalizeName(name);if(data.active)data.runs.push(structuredClone(data.active));data.active={id,name:clean,position:NODES[0].id,route:null,draft:null,careDraft:null,careConfirmed:null,memories:[],startedAt:new Date().toISOString()};}
export function next(data){const n=node(data);if(!n||['lifestyle','care'].includes(n.id)||data.active.careConfirmed)return false;if(!data.seen.includes(readKey(n)))data.seen.push(readKey(n));const f=flow(data.active.route),i=f.findIndex(x=>x.id===n.id);data.active.position=f[i+1].id;return true;}
export function skip(data){let count=0;while(node(data)&&!['lifestyle','care'].includes(node(data).id)&&data.seen.includes(readKey(node(data)))){next(data);count++;}return count;}
export function commit(data){if(node(data)?.id!=='lifestyle'||!['A','B','C'].includes(data.active.draft)||data.active.route)return false;const a=data.active;a.route=a.draft;a.draft=null;a.memories.push({event:'weekend-response',date:'2026-04-26',action:a.route,participants:['player','father','spouse'],legalEffect:false,cashChange:0});const f=flow(a.route);a.position=f[f.findIndex(n=>n.id==='lifestyle')+1].id;return true;}
export function confirmCare(data){if(node(data)?.id!=='care'||data.active.careConfirmed||!['personal','shared','professional'].includes(data.active.careDraft))return false;data.active.careConfirmed=data.active.careDraft;return true;}
export function validate(d){if(d?.schema!==1||d.version!=='opening-v02-1'||!Array.isArray(d.seen)||d.seen.some(x=>typeof x!=='string')||!Array.isArray(d.runs)||!['1','1.25','1.5'].includes(d.settings?.scale)||typeof d.settings.motion!=='boolean'||typeof d.settings.emotion!=='boolean')throw Error('這份原型紀錄無法辨識，已停止寫入，沒有清除原資料');
 const run=a=>{if(!a||typeof a.id!=='string'||normalizeName(a.name)!==a.name||![null,'A','B','C'].includes(a.route)||![null,'A','B','C'].includes(a.draft)||![null,'personal','shared','professional'].includes(a.careDraft)||![null,'personal','shared','professional'].includes(a.careConfirmed)||!Array.isArray(a.memories)||!flow(a.route).some(n=>n.id===a.position))throw Error('原型閱讀位置無法辨識，原資料已保留');if(a.careConfirmed&&a.position!=='care')throw Error('原型位置與選擇不一致');};if(d.active)run(d.active);d.runs.forEach(run);return d;}
