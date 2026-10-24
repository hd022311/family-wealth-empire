/** Read-only adapter: do not edit the first volume or its branching rules. */
import {CAST,INTRO,DECISIONS,ENDINGS,KNOWLEDGE,choose,reaction,freshRun,endingFor,legalEnvelope,bridge} from '../theatre-preview/story.mjs';
export {CAST,DECISIONS,ENDINGS,KNOWLEDGE,legalEnvelope};
export const DEFAULT_ROUTE=['shared','transparent','meeting','reserve','separate','mediate'];
export function prefix(index){let run=freshRun();for(let i=0;i<index;i++)run=choose(run,i,DEFAULT_ROUTE[i]);return run;}
export function fixture(scene,index=0,endingId='E1'){
 if(scene==='normal')return {...INTRO[0],key:'normal'};
 if(scene==='conflict'){let run=choose(choose(choose(freshRun(),0,'shared'),1,'solo'),2,'meeting');return {...reaction(run,2).at(-1),key:'conflict'};}
 if(scene==='choice'){const d=DECISIONS[index];return {...d,key:'choice',decision:index,kind:'choice'};}
 const e=ENDINGS.find(x=>x.id===endingId)||ENDINGS[0];return {key:'ending',kind:'ending',scene:'living',speaker:'player',lines:e.story,ending:e};
}
export function sampleResponse(index,id){const run=choose(prefix(index),index,id);return {...reaction(run,index)[0],key:'response',sample:true};}
export function visibleStoryCatalog(){
 const items=[],add=(key,text)=>{if(typeof text==='string')items.push({key,text});};
 for(const [id,c]of Object.entries(CAST)){add(`cast.${id}.name`,c.name);add(`cast.${id}.role`,c.role);}
 INTRO.forEach((n,i)=>n.lines.forEach((t,j)=>add(`intro.${i}.${j}`,t)));
 DECISIONS.forEach((d,i)=>{add(`decision.${i}.title`,d.title);d.lines.forEach((t,j)=>add(`decision.${i}.line.${j}`,t));d.options.forEach(o=>{add(`decision.${i}.${o.id}.title`,o.title);add(`decision.${i}.${o.id}.hint`,o.hint);});bridge(i).forEach((n,j)=>n.lines.forEach((t,k)=>add(`bridge.${i}.${j}.${k}`,t)));});
 function visit(run,index){if(index===6)return;for(const o of DECISIONS[index].options){const next=choose(run,index,o.id);reaction(next,index).forEach((n,j)=>n.lines.forEach((t,k)=>add(`reaction.${index}.${o.id}.${j}.${k}`,t)));visit(next,index+1);}}
 visit(freshRun(),0);
 ENDINGS.forEach(e=>{add(`ending.${e.id}.title`,e.title);e.story.forEach((t,i)=>add(`ending.${e.id}.story.${i}`,t));add(`ending.${e.id}.objective`,e.objective);add(`ending.${e.id}.alternative`,e.alternative);});
 KNOWLEDGE.forEach(k=>{add(`knowledge.${k.id}.title`,k.title);add(`knowledge.${k.id}.summary`,k.summary);add(`knowledge.${k.id}.law`,k.law);});
 return [...new Map(items.map(x=>[x.text,x])).values()];
}
