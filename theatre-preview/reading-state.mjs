import {INTRO,DECISIONS,bridge,reaction,freshRun,choose,endingFor,VERSION} from './story.mjs';
export const KEY='fwe.theatre.volume1.reading.v1';
export function rebuild(choices={}){
 let run=freshRun();const prelude=i=>({kind:'dialogue',speaker:DECISIONS[i].speaker,scene:DECISIONS[i].scene,date:DECISIONS[i].date,lines:DECISIONS[i].lines});
 const flow=[...INTRO,...bridge(0),prelude(0),{kind:'choice',decision:0}];
 let gap=false;for(let i=0;i<6;i++){const id=choices[DECISIONS[i].id];if(id===undefined){gap=true;continue;}if(gap)throw Error('sequence');run=choose(run,i,id);flow.push(...reaction(run,i),...(i<5?[...bridge(i+1),prelude(i+1),{kind:'choice',decision:i+1}]:[{kind:'ending'}]));}
 if(Object.keys(choices).some(k=>!DECISIONS.some(d=>d.id===k)))throw Error('choice');return {run,flow};
}
export function validate(data){
 if(!data||data.schema!==1||data.story!==VERSION||!Array.isArray(data.archive)||!Array.isArray(data.seen))throw Error('version');
 if(data.seen.length>5000)throw Error('size');
 const ids=new Set();for(const a of data.archive){if(typeof a.id!=='string'||ids.has(a.id))throw Error('archive');ids.add(a.id);const {run}=rebuild(a.choices);if(endingFor(run).id!==a.ending)throw Error('ending');a.cash=run.cash;}
 if(data.active){const a=data.active,{flow}=rebuild(a.choices);if(typeof a.id!=='string'||!Number.isInteger(a.cursor)||a.cursor<0||a.cursor>=flow.length||!Number.isInteger(a.line)||a.line<0||a.line>=(flow[a.cursor].lines?.length||1))throw Error('position');const completed=Object.keys(a.choices).length;for(let i=0;i<flow.length;i++)if(flow[i].kind==='choice'&&((i<a.cursor&&flow[i].decision>=completed)||(i>=a.cursor&&flow[i].decision<completed)))throw Error('position');}
 if(!data.seen.every(s=>typeof s==='string'&&s.length<1000))throw Error('seen');
 if(!['1','1.25','1.5'].includes(data.settings?.scale)||typeof data.settings.typing!=='boolean'||typeof data.settings.motion!=='boolean')throw Error('settings');return data;
}
export function load(storage){try{const raw=storage.getItem(KEY);return {data:raw?validate(JSON.parse(raw)):null,error:null};}catch{return {data:null,error:'無法讀取劇場紀錄；原資料未覆寫。可暫時閱讀，或在選單確認重設劇場紀錄。'};}}
export function save(storage,data){try{validate(structuredClone(data));storage.setItem(KEY,JSON.stringify(data));return true;}catch{return false;}}
export const passageKey=(node,line)=>JSON.stringify([node.speaker,node.date,node.lines?.[line]]);
