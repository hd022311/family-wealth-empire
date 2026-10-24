import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {rules,validateRules,testRule,statuses} from '../src/legal/rules/registry';
import type {Rule,ReviewStatus} from '../src/legal/rules/types';
const file='rules/registry.json';const args=process.argv.slice(2),cmd=args[0]||'check';
const digest=(r:Rule)=>createHash('sha256').update(JSON.stringify({...r,review:undefined,review_status:undefined})).digest('hex');
const load=async(path:string)=>{const data=JSON.parse(await readFile(path,'utf8'));validateRules(data);return data;};
const today=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Taipei'}).format(new Date());
if(cmd==='list')console.table(rules.map(r=>({id:r.rule_id,version:r.version,module:r.module,status:r.review_status,from:r.effective_from,to:r.effective_to})));
else if(cmd==='check'||cmd==='test'){
 validateRules({schema_version:1,rules});let failed=false;
 for(const r of rules){const results=testRule(r);if(results.some(c=>!c.pass))failed=true;if(['calculation_tested','approved'].includes(r.review_status)&&r.review.tested_sha256!==digest(r))throw Error(`測試後內容已變更：${r.rule_id}`);if(r.review_status==='approved'&&(!results.length||results.some(c=>!c.pass)))throw Error('已核准規則測試未通過');console.log(`${r.rule_id}@${r.version}: ${r.review_status}; ${results.filter(c=>c.pass).length}/${results.length} cases`);}
 if(failed)process.exitCode=1;
}else if(cmd==='export'){if(!args[1])throw Error('請指定輸出檔');await writeFile(args[1],JSON.stringify({schema_version:1,rules},null,2)+'\n');}
else if(cmd==='diff'){const other=await load(args[1]);const map=new Map(other.rules.map((r:Rule)=>[r.rule_id+'@'+r.version,r]));for(const r of rules){const key=r.rule_id+'@'+r.version;if(JSON.stringify(r)!==JSON.stringify(map.get(key)))console.log('CHANGED or NEW',key);map.delete(key);}for(const key of map.keys())console.log('REMOVED',key);}
else if(cmd==='import'){
 const incoming=await load(args[1]);const db=await load(file);for(const raw of incoming.rules){const r=structuredClone(raw);r.review_status='draft';r.review={source_verified_by:null,source_verified_at:null,source_sha256:null,tested_sha256:null,approved_by:null,approved_at:null};const idx=db.rules.findIndex((x:Rule)=>x.rule_id===r.rule_id&&x.version===r.version);if(idx>=0&&db.rules[idx].review_status==='approved')throw Error('不得覆寫已核准版本，請建立新版本');if(idx>=0)db.rules[idx]=r;else db.rules.push(r);}validateRules(db);await writeFile(file,JSON.stringify(db,null,2)+'\n');
}else if(cmd==='review'){
 const [_,id,version,target,reviewer,evidence]=args;const db=await load(file);const r:Rule=db.rules.find((r:Rule)=>r.rule_id===id&&r.version===version);if(!r||!reviewer||statuses.indexOf(target as ReviewStatus)!==statuses.indexOf(r.review_status)+1)throw Error('必須逐級審核並指定維護者');
 if(target==='source_verified'){if(!evidence)throw Error('須提供已人工核對的官方來源存檔');r.review.source_sha256=createHash('sha256').update(await readFile(evidence)).digest('hex');r.review.source_verified_by=reviewer;r.review.source_verified_at=today;}
 if(target==='calculation_tested'){const results=testRule(r);if(!results.length||results.some(c=>!c.pass))throw Error('測試不足或未通過');r.review.tested_sha256=digest(r);}
 if(target==='approved'){if(r.review.tested_sha256!==digest(r)||testRule(r).some(c=>!c.pass))throw Error('計算測試已過期');r.review.approved_by=reviewer;r.review.approved_at=today;}
 r.review_status=target as ReviewStatus;validateRules(db);await writeFile(file,JSON.stringify(db,null,2)+'\n');
}else if(cmd==='check-updates'){
 const baselinePath=args[1]||'rules/source-baselines.json';let baseline:Record<string,string>={};try{baseline=JSON.parse(await readFile(baselinePath,'utf8'));}catch{}
 const report:any[]=[];for(const url of new Set(rules.map(r=>r.source_url))){const affected=rules.filter(r=>r.source_url===url);try{const res=await fetch(url,{signal:AbortSignal.timeout(15000)});if(!res.ok)throw Error('HTTP '+res.status);const content=await res.text(),sha=createHash('sha256').update(content).digest('hex');const changed=!!baseline[url]&&baseline[url]!==sha;report.push({url,status:baseline[url]?(changed?'changed':'unchanged'):'baseline_needed',sha256:sha,affected_rules:affected.map(r=>r.rule_id),drafts:changed?affected.map(r=>({...r,version:r.version+'-update-draft',review_status:'draft',review:{source_verified_by:null,source_verified_at:null,source_sha256:null,tested_sha256:null,approved_by:null,approved_at:null},maintainer_notes:[...r.maintainer_notes,'官方頁面雜湊有變化，可能只是版面更新，須人工核實實際法規差異']})):[]});}catch(e){report.push({url,status:'unavailable',error:(e as Error).message,affected_rules:affected.map(r=>r.rule_id)});}}
 await mkdir('artifacts',{recursive:true});await writeFile('artifacts/legal-update-report.json',JSON.stringify({checked_at:today,notice:'本報告不修改正式規則、不自動核准；變更需維護者審核',sources:report},null,2));console.log('差異與新版草稿已寫入 artifacts/legal-update-report.json；正式 registry 未修改。');
}else throw Error('支援 list/check/test/export/import/diff/review/check-updates');
