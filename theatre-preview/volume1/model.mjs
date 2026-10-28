import {rebuild as legacyBuild,validate as validateLegacy,KEY as LEGACY_KEY,passageKey} from '../reading-state.mjs';
import {CUES,VERSION as PROLOGUE_VERSION,KEY as PROLOGUE_KEY,validate as validatePrologue} from '../prologue/scene.mjs?v=integrated-1';
import {INTRO,VERSION,DECISIONS,choose,endingFor} from '../story.mjs';
export {LEGACY_KEY,CUES,DECISIONS};
export const KEY='fwe.theatre.volume1.reading.v2';
export function build(choices={},origin='integrated'){
 const old=legacyBuild(choices);if(origin==='legacy')return old;
 if(origin!=='integrated')throw Error('origin');
 const prefix=CUES.map((c,i)=>({kind:'dialogue',speaker:c.speaker||'narrator',date:c.date,scene:c.setting==='rental'?'home':c.setting,lines:[c.text],prologue:i,prologueId:c.id}));
 return{run:old.run,flow:[...prefix,...old.flow.slice(INTRO.length+1)]};
}
export function newData(){return{schema:2,story:VERSION,active:null,archive:[],bookmarks:[],seen:[],settings:{scale:'1',motion:true,emotion:true}};}
export const seenKey=(node,line)=>node.prologueId?JSON.stringify(['prologue',PROLOGUE_VERSION,node.prologueId,node.lines[line]]):passageKey(node,line);
export function validate(data){
 const d=structuredClone(data);if(d?.schema!==2||d.story!==VERSION||!Array.isArray(d.archive)||!Array.isArray(d.seen)||d.seen.length>100000||!d.seen.every(s=>typeof s==='string'&&s.length<2000))throw Error('version');
 if(!['1','1.25','1.5'].includes(d.settings?.scale)||typeof d.settings.motion!=='boolean'||typeof d.settings.emotion!=='boolean')throw Error('settings');
 const ids=new Set();for(const a of d.archive){if(typeof a.id!=='string'||ids.has(a.id))throw Error('archive');ids.add(a.id);const{run}=build(a.choices);if(endingFor(run).id!==a.ending)throw Error('ending');a.cash=run.cash;}
 if(d.active){const a=d.active,{flow}=build(a.choices,a.origin),count=Object.keys(a.choices).length;if(typeof a.id!=='string'||!Number.isInteger(a.cursor)||a.cursor<0||a.cursor>=flow.length||!Number.isInteger(a.line)||a.line<0||a.line>=(flow[a.cursor].lines?.length||1))throw Error('position');
  for(let i=0;i<flow.length;i++)if(flow[i].kind==='choice'&&((i<a.cursor&&flow[i].decision>=count)||(i>=a.cursor&&flow[i].decision<count)))throw Error('sequence');
  const node=flow[a.cursor];if(!Number.isFinite(a.elapsed)||a.elapsed<0||a.elapsed>(node.prologueId?CUES[node.prologue].seconds*1000:0))throw Error('elapsed');
  if(a.draft!==null&&(node.kind!=='choice'||!DECISIONS[node.decision].options.some(o=>o.id===a.draft)))throw Error('draft');
 }
 if(d.bookmarks===undefined)d.bookmarks=[];if(!Array.isArray(d.bookmarks))throw Error('bookmarks');for(const b of d.bookmarks){if(typeof b.id!=='string'||typeof b.savedAt!=='string')throw Error('bookmark');validate({...d,active:b.active,bookmarks:[]});}
 return d;
}
export function migrate(legacy){const old=validateLegacy(structuredClone(legacy)),d=newData();d.archive=old.archive;d.seen=old.seen;d.settings.scale=old.settings.scale;d.settings.motion=old.settings.motion;d.migratedFrom=LEGACY_KEY;if(old.active)d.active={...old.active,origin:'legacy',elapsed:0,draft:null};return validate(d);}
export function load(storage){try{const raw=storage?.getItem(KEY);if(raw!==null&&raw!==undefined)return{data:validate(JSON.parse(raw)),error:null,migrated:false};const old=storage?.getItem(LEGACY_KEY),data=old?migrate(JSON.parse(old)):newData();try{const rawPrologue=storage?.getItem(PROLOGUE_KEY);if(rawPrologue){const preview=validatePrologue(JSON.parse(rawPrologue));for(const id of preview.seen){const index=CUES.findIndex(c=>c.id===id),n=build().flow[index],key=seenKey(n,0);if(!data.seen.includes(key))data.seen.push(key);}if(!old){data.settings.scale=String(preview.scale);data.settings.motion=!preview.reduced;data.settings.emotion=preview.emotionEffects;}data.importedPrologueReadOnly=true;}}catch{data.prologueImportNote='略過無法驗證的獨立前言紀錄，原資料未改動';}return{data,error:null,migrated:!!old};}catch{return{data:newData(),error:'無法讀取劇場紀錄；原資料未覆寫。可暫時閱讀，請先備份原紀錄再處理。',migrated:false};}}
export function save(storage,data){try{const clean=validate(data);storage.setItem(KEY,JSON.stringify(clean));return true;}catch{return false;}}
export function backup(d,id,now=new Date().toISOString()){if(!d.active||d.archive.some(a=>a.id===d.active.id))return;d.bookmarks??=[];const snapshot=JSON.stringify(d.active);if(!d.bookmarks.some(b=>JSON.stringify(b.active)===snapshot))d.bookmarks.push({id,savedAt:now,active:structuredClone(d.active)});}
export function start(d,id){backup(d,id+'-previous');d.active={id,origin:'integrated',choices:{},cursor:0,line:0,elapsed:0,draft:null};return build();}
export function acknowledge(d,node,line){const key=seenKey(node,line);if(!d.seen.includes(key))d.seen.push(key);}
export function next(d){const a=d.active,{flow}=build(a.choices,a.origin),n=flow[a.cursor];if(n.kind!=='dialogue')return false;acknowledge(d,n,a.line);if(a.line<n.lines.length-1)a.line++;else{a.line=0;a.cursor++;}a.elapsed=0;a.draft=null;return true;}
export function skip(d){const a=d.active,seen=new Set(d.seen);let n=0;while(true){const node=build(a.choices,a.origin).flow[a.cursor];if(node.kind!=='dialogue'||!seen.has(seenKey(node,a.line)))break;next(d);n++;}return n;}
export function take(d,id){const a=d.active,{flow}=build(a.choices,a.origin),n=flow[a.cursor];if(n.kind!=='choice'||!DECISIONS[n.decision].options.some(o=>o.id===id)||id!==a.draft)return false;const run=choose(build(a.choices,a.origin).run,n.decision,id);a.choices=run.choices;a.cursor++;a.line=0;a.elapsed=0;a.draft=null;return true;}
export function finish(d,now=new Date().toISOString()){const a=d.active,{flow,run}=build(a.choices,a.origin);if(flow[a.cursor]?.kind!=='ending')return null;const ending=endingFor(run);if(!d.archive.some(r=>r.id===a.id))d.archive.push({id:a.id,ending:ending.id,choices:structuredClone(a.choices),cash:run.cash,date:now});return ending;}
