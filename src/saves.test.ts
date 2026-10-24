import {describe,it,expect} from 'vitest';
import {makeSlot,updateSlot,readLibrary,syncDecision,returnSummary,fromCloud,LIBRARY_KEY} from './saves';
import {initial,inherit} from './simulation';
describe('持續經營存檔',()=>{
 it('家族獨立、舊存檔遷移不修改原檔',()=>{const old=JSON.stringify(initial());const slot=readLibrary({getItem:k=>k==='family-wealth-empire-v1'?old:null});expect(slot.slots[0].state).toEqual(initial());expect(makeSlot('另一家族').id).not.toBe(slot.active);});
 it('第二代接班保留上一代完整快照',()=>{const s=initial();s.dead=true;s.family[1].age=60;const slot=makeSlot('家族',s);const next=updateSlot(slot,inherit(s,2));expect(next.generations[0].state.dead).toBe(true);expect(next.state.generation).toBe(2);expect(slot.generations).toHaveLength(0);});
 it('長期離線不會老化、死亡或破產',()=>{const slot=makeSlot('家族');const before=JSON.stringify(slot);expect(returnSummary(slot,slot.updatedAt+365*86400000)).toContain('未離線推進');expect(JSON.stringify(slot)).toBe(before);});
 it('並行裝置變更不能靜默覆蓋，未登入帳戶不混用',()=>{const local={...makeSlot('甲'),owner:'a',revision:2};const remote={...local,revision:3,dirty:false};expect(syncDecision(local,remote,'a')).toBe('conflict');expect(syncDecision({...local,dirty:false},remote,'a')).toBe('download');expect(syncDecision(local,remote,'b')).toBe('foreign');expect(syncDecision({...local,dirty:false},{...remote,revision:2},'a')).toBe('unchanged');});
 it('損壞家族庫及遠端快照會被拒絕',()=>{expect(()=>readLibrary({getItem:k=>k===LIBRARY_KEY?'{}':null})).toThrow();expect(()=>fromCloud({id:'bad',name:'x',revision:1,owner_id:'a',updated_at:new Date().toISOString(),snapshot:{}})).toThrow();});
});
