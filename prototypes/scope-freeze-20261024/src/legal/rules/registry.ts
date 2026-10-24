import raw from '../../../rules/registry.json';
import {dateValid,statutoryShares,type SuccessionFacts} from '../engine';
import type {LawSource} from '../catalog';
import type {Rule,ReviewStatus,RuleEvent} from './types';
export const modules=['inheritance','marital-property','estate-tax','gift-tax','insurance','insurance-tax','estate-disputes'];
export const statuses:ReviewStatus[]=['draft','source_verified','calculation_tested','approved'];
export function validateRules(value:unknown):asserts value is {schema_version:1;rules:Rule[]}{
 const db=value as {schema_version:number;rules:Rule[]};const keys=new Set<string>();
 if(!db||db.schema_version!==1||!Array.isArray(db.rules))throw Error('規則資料庫格式無效');
 for(const r of db.rules){
  if(!r||!['rule_id','title','source_name','source_url','article','version'].every(k=>typeof r[k as keyof Rule]==='string'&&String(r[k as keyof Rule]).trim())||!modules.includes(r.module)||!statuses.includes(r.review_status)||!['statute','administrative_interpretation','court_decision','scenario_assumption'].includes(r.source_type)||![r.conditions,r.exceptions,r.maintainer_notes].every(a=>Array.isArray(a)&&a.every(s=>typeof s==='string'))||!r.calculation||!['review_only','inheritance_basic','estate_tax_parameters'].includes(r.calculation.engine)||typeof r.calculation.description!=='string'||typeof r.calculation.complete!=='boolean'||!r.calculation.parameters||!r.review||!Array.isArray(r.test_cases)||!r.test_cases.every(t=>typeof t.case_id==='string'&&t.input&&t.expected))throw Error('規則欄位缺漏');
  for(const d of [r.effective_from,r.effective_to,r.promulgated_on])if(d!==null&&!dateValid(d))throw Error('規則日期無效');
  if(r.effective_from&&r.effective_to&&r.effective_from>r.effective_to)throw Error('適用日期區間顛倒');
  const key=r.rule_id+'@'+r.version;if(keys.has(key))throw Error('規則版本重複');keys.add(key);
  const u=new URL(r.source_url);if(!['http:','https:'].includes(u.protocol))throw Error('來源網址無效');
  if(r.review_status!=='draft'){
   if(!u.hostname.endsWith('.gov.tw')||u.protocol!=='https:'||!r.review.source_verified_by||!dateValid(r.review.source_verified_at||'')||!/^[a-f0-9]{64}$/.test(r.review.source_sha256||''))throw Error('法源審核紀錄不完整');
  }
  if(['calculation_tested','approved'].includes(r.review_status)&&(!r.test_cases.length||!/^[a-f0-9]{64}$/.test(r.review.tested_sha256||'')))throw Error('缺少計算測試證據');
  if(r.review_status==='approved'&&(!r.effective_from||!r.review.approved_by||!dateValid(r.review.approved_at||'')||r.source_type==='scenario_assumption'))throw Error('人工核准或適用日期不完整，劇情假設不得當成法律');
  if(r.calculation.engine==='estate_tax_parameters')validateTax(r);
 }
}
function validateTax(r:Rule){const p=r.calculation.parameters as any;const tiers=p.brackets;if(!Number.isInteger(r.tax_year)||![p.exemption,p.spouse_deduction,p.descendant_basic_deduction_per_person,p.funeral_deduction].every(n=>Number.isSafeInteger(n)&&n>=0)||!Array.isArray(tiers)||!tiers.length||tiers.at(-1).up_to!==null)throw Error('年度稅務參數缺漏');let last=0;for(const [i,t] of tiers.entries()){if(!Number.isFinite(t.rate)||t.rate<0||t.rate>1||(t.up_to===null?i!==tiers.length-1:!Number.isSafeInteger(t.up_to)||t.up_to<=last))throw Error('級距參數無效');last=t.up_to??last;}}
validateRules(raw);export const rules:Rule[]=raw.rules as Rule[];
export function selectRule(id:string,eventDate:string,db:Rule[]=rules){
 if(!dateValid(eventDate))return {status:'pending' as const,rule:null,pending:['事件日期無效']};
 const matches=db.filter(r=>r.rule_id===id&&r.review_status==='approved'&&r.source_type!=='scenario_assumption'&&r.effective_from&&r.effective_from<=eventDate&&(!r.effective_to||r.effective_to>=eventDate));
 if(matches.length!==1)return {status:'pending' as const,rule:null,pending:[matches.length?'多個已核准版本適用範圍重疊，需人工確認':'沒有此日期可用的已核准規則，不沿用其他年度或最新草稿']};
 return {status:'approved' as const,rule:matches[0],pending:[]};
}
export function bracketMathForTests(net:number,tiers:{up_to:number|null;rate:number}[]){if(!Number.isSafeInteger(net)||net<0)throw Error('淨額必須為非負整數');let lower=0,total=0;for(const t of tiers){const upper=t.up_to??net;total+=Math.max(0,Math.min(net,upper)-lower)*t.rate;if(net<=upper)break;lower=upper;}return total;}
function source(r:Rule,id:string,test:boolean):LawSource{return {id,law:r.source_name,articles:[r.article],url:r.source_url,promulgatedOn:test?"1900-01-01":r.promulgated_on,effectiveFrom:r.effective_from,effectiveTo:r.effective_to?new Date(Date.parse(r.effective_to)+86400000).toISOString().slice(0,10):null,revision:r.version,verification:test?'test_fixture':'official_reviewed',verifiedOn:test?"2026-10-24":r.review.source_verified_at,conditions:r.conditions.join('；'),contentHash:test?"explicit-test-fixture-not-official-evidence":r.review.source_sha256,algorithmVersion:'tw-succession-engine-1'};}
export function testRule(r:Rule){return r.test_cases.map(c=>{try{
 let actual:any;
 if(r.calculation.engine==='estate_tax_parameters'){actual='taxable_net_estate' in c.input?{progressive_component:bracketMathForTests(c.input.taxable_net_estate as number,r.calculation.parameters.brackets as any)}:r.calculation.parameters;}
 else if(r.calculation.engine==='inheritance_basic'){
  const fixture={...r,effective_from:'1900-01-01',effective_to:null};const result=statutoryShares(c.input as SuccessionFacts,[source(fixture,'statutory',true),source(fixture,'representation',true)],true);actual={shares:result.shares?.map(s=>({id:s.id,...s.fraction}))};
 }else throw Error('此規則尚未有可執行測試器');
 const pass=Object.entries(c.expected).every(([k,v])=>JSON.stringify(actual[k])===JSON.stringify(v));return {case_id:c.case_id,pass,actual,label:'數學／邏輯測試，不代表法源或人工核准'};
 }catch(e){return {case_id:c.case_id,pass:false,error:(e as Error).message,label:'測試失敗'};}});}
export function evaluateInheritance(event:RuleEvent,db:Rule[]=rules){
 const basis=selectRule('tw.inheritance.basic',event.event_date,db),representation=selectRule('tw.inheritance.representation',event.event_date,db);
 const trace={event_id:event.event_id,estate_id:event.estate_id,owner_id:event.owner_id,event_date:event.event_date,legal_options:['確認清冊與文件','協商並記錄提案','尋求專業法律意見'],sources:[basis.rule,representation.rule].filter(Boolean).map(r=>({rule_id:r!.rule_id,version:r!.version,source_url:r!.source_url,article:r!.article})),uncertainties:event.uncertainties};
 if(!basis.rule||!representation.rule||event.uncertainties.length||event.facts.deathDate!==event.event_date)return {...trace,status:'pending',shares:null,calculation:[],pending:[...basis.pending,...representation.pending,...event.uncertainties,'尚未核實資料不產生確定分配']};
 const result=statutoryShares(event.facts,[source(basis.rule,'statutory',false),source(representation.rule,'representation',false)]);return {...trace,...result};
}
export function estateTaxReview(eventDate:string,db:Rule[]=rules){const year=eventDate.slice(0,4),selected=selectRule('tw.estate-tax.parameters.'+year,eventDate,db);return {...selected,event_date:eventDate,parameters:selected.rule?.calculation.parameters??null,final_tax:null,status:'pending',calculation:[],pending:[...selected.pending,'首批參數不是完整稅額公式；資格、其他扣除額、扣抵與例外待核實']};}
