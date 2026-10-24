import {describe,it,expect} from 'vitest';
import {rules,validateRules,selectRule,testRule,estateTaxReview,modules,evaluateInheritance} from './registry';
import type {Rule} from './types';
import {estateRuleEvent} from './events';
import {initial} from '../../simulation';
import {openEstate} from '../../family/engine';
const approved=(r:Rule,from='2026-01-01',to:string|null='2026-12-31'):Rule=>({...structuredClone(r),effective_from:from,effective_to:to,review_status:'approved',review:{source_verified_by:'測試維護者（非正式法源核實）',source_verified_at:'2026-10-24',source_sha256:'a'.repeat(64),tested_sha256:'b'.repeat(64),approved_by:'測試維護者',approved_at:'2026-10-24'}});
describe('人工維護規則庫（fixture 不代表官方驗證）',()=>{
 it('七模組與指定欄位完整，正式資料全部 draft',()=>{validateRules({schema_version:1,rules});expect(new Set(rules.map(r=>r.module)).size).toBe(modules.length);expect(rules.every(r=>r.review_status==='draft')).toBe(true);});
 it('維護者2026參數及級距數學案例通過，不輸出完整遺產稅',()=>{const r=rules.find(r=>r.tax_year===2026)!;expect(testRule(r).every(t=>t.pass)).toBe(true);expect(estateTaxReview('2026-10-24').parameters).toBeNull();const result=estateTaxReview('2026-10-24',[approved(r)]);expect(result.parameters?.exemption).toBe(13333000);expect(result.final_tax).toBeNull();expect(estateTaxReview('2027-01-01',[approved(r)]).parameters).toBeNull();});
 it('僅 approved、事件日期適用的唯一版本可選；未施行、重疊和缺漏封鎖',()=>{const raw=rules[0],old=approved(raw,'2020-01-01','2026-12-31'),future={...approved(raw,'2027-01-01',null),version:'2.0.0'};expect(selectRule(raw.rule_id,'2026-12-31',[old,future]).rule?.version).toBe(old.version);expect(selectRule(raw.rule_id,'2027-01-01',[old,future]).rule?.version).toBe('2.0.0');expect(selectRule(raw.rule_id,'2026-10-24',[raw]).rule).toBeNull();expect(selectRule(raw.rule_id,'2026-10-24',[old,{...old,version:'3'}]).rule).toBeNull();});
 it('未核實的1223修法線索沒有自動施行日或可選版本',()=>{const variants=rules.filter(r=>r.rule_id==='tw.inheritance.reserved');expect(variants).toHaveLength(2);expect(variants.every(r=>r.effective_from===null)).toBe(true);expect(selectRule(variants[0].rule_id,'2027-02-18').rule).toBeNull();});
 it('基本應繼分 fixture：配偶與三子女各四分之一，NPC關係無輸入欄位',()=>{const r=rules.find(r=>r.calculation.engine==='inheritance_basic')!;expect(testRule(r)[0].pass).toBe(true);const e=estateRuleEvent(openEstate(initial(),0));expect(evaluateInheritance(e).shares).toBeNull();expect(e).not.toHaveProperty('closeness');});
 it('來源類型與審核不可混淆，劇情假設不能當成正式法源',()=>{const invalid=approved(rules[0]);invalid.source_type='scenario_assumption';expect(()=>validateRules({schema_version:1,rules:[invalid]})).toThrow();const missing=approved(rules[0]);missing.review.approved_by=null;expect(()=>validateRules({schema_version:1,rules:[missing]})).toThrow();});
 it('兩名死者分別保存事件、日期與清冊，查詢不改玩家財產',()=>{const s=initial();s.clan.people[1].age=70;const cash=s.cash,a=estateRuleEvent(openEstate(s,0)),b=estateRuleEvent(openEstate(s,1));expect(a.estate_id).not.toBe(b.estate_id);expect(a.owner_id).not.toBe(b.owner_id);expect(s.cash).toBe(cash);});
});
