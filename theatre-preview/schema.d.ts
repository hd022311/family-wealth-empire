/** Future TypeScript contract, specification only; not integrated into GameState v4. */
export type ReviewStatus='draft'|'source_verified'|'calculation_tested'|'approved';
export interface RuleReference {ruleId:string;version:string;sourceName:string;sourceURL:string;article:string;promulgatedOn:string|null;effectiveFrom:string;effectiveTo:string|null;reviewStatus:ReviewStatus;reviewedBy:string|null;reviewedAt:string|null;sourceSHA256:string;}
export interface KnownFact {id:string;kind:'fictional_case_fact'|'document_reported'|'verified_fact';description:string;asOf:string;ownerId?:string;verifiedBy?:string;}
export interface NarrativeMemory {id:string;date:string;participants:string[];objective:{action:string;cashPaid:number;ownershipTransferred:false};subjective:{observer:string;interpretation:string};legalDocument:false;futureKeys:string[];}
export type LegalEventEnvelope=
 | {status:'pending_verification';eventDates:string[];applicableVersions:readonly [];calculations:readonly [];uncertainties:string[];fictionalNarrativeOnly:true}
 | {status:'approved';eventId:string;eventDate:string;confirmedFacts:KnownFact[];rules:(RuleReference&{reviewStatus:'approved'})[];calculations:{id:string;ruleIds:string[];steps:string[];result:string}[];uncertainties:string[]};
export interface VolumeDefinition {id:string;contentVersion:string;title:string;entryNodeId:string;nodes:SceneNode[];endings:EndingDefinition[];legalReviewStatus:ReviewStatus;}
export type SceneNode=
 | {id:string;kind:'dialogue';scene:string;speaker:string;date:string;lines:string[];next:string}
 | {id:string;kind:'decision';scene:string;date:string;prompt:string;options:{id:string;title:string;costDisclosure:string;next:string;consequences:string[]}[]}
 | {id:string;kind:'ending';endingId:string};
export interface EndingDefinition {id:string;title:string;narrativeConditions:string[];legalEffect:'none_in_prototype';educationalTopics:string[];}
export interface TheatreProfileV1 {schemaVersion:1;namespace:'theatre-profile-v1';runs:{runId:string;volumeId:string;contentVersion:string;nodeId:string;choices:Record<string,string>}[];seenEndings:string[];}
