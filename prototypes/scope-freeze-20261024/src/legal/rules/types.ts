import type {SuccessionFacts} from '../engine';
export type RuleModule='inheritance'|'marital-property'|'estate-tax'|'gift-tax'|'insurance'|'insurance-tax'|'estate-disputes';
export type ReviewStatus='draft'|'source_verified'|'calculation_tested'|'approved';
export type Rule={
 rule_id:string;title:string;module:RuleModule;source_type:'statute'|'administrative_interpretation'|'court_decision'|'scenario_assumption';
 source_name:string;source_url:string;article:string;promulgated_on:string|null;effective_from:string|null;effective_to:string|null;
 conditions:string[];calculation:{engine:'review_only'|'inheritance_basic'|'estate_tax_parameters';description:string;complete:boolean;parameters:Record<string,unknown>};exceptions:string[];review_status:ReviewStatus;version:string;tax_year:number|null;
 test_cases:{case_id:string;input:Record<string,unknown>;expected:Record<string,unknown>}[];
 review:{source_verified_by:string|null;source_verified_at:string|null;source_sha256:string|null;tested_sha256:string|null;approved_by:string|null;approved_at:string|null};maintainer_notes:string[];
};
export type RuleEvent={event_id:string;estate_id:string;owner_id:number;event_date:string;facts:SuccessionFacts;ownership_snapshot:unknown;marriage_snapshot:unknown;uncertainties:string[]};
