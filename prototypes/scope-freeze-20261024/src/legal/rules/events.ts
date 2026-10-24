import type {Estate} from '../../family/types';
import type {RuleEvent} from './types';
export function estateRuleEvent(e:Estate):RuleEvent{return {event_id:'legal-review:'+e.id,estate_id:e.id,owner_id:e.ownerId,event_date:e.deathDate,facts:structuredClone(e.facts),ownership_snapshot:structuredClone(e.storyProperties??e.portfolio??e.finances),marriage_snapshot:e.facts.heirs.filter(h=>h.relation==='spouse').map(h=>({...h})),uncertainties:[...(!e.facts.ownershipConfirmed?['財產權利尚未核實']:[]),...(e.facts.will==='unknown'?['遺囑效力待確認']:[]),...(e.facts.maritalProperty==='unknown'?['夫妻財產權利待確認']:[])]};}
