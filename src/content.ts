// Future content providers must declare provenance and approval; never imply legal advice.
export interface EconomicEvent { id:string; week:string; title:string; source:'fictional'|'licensed'; description:string; requiresConfirmation:true }
export interface CourtChallenge { id:string; jurisdiction:string; sourceUrl:string; judgmentDate:string; anonymizedSummary:string; editorialApproved:boolean }
export interface ContentProvider { weeklyEvents(week:string):Promise<EconomicEvent[]>; courtChallenges():Promise<CourtChallenge[]> }
export const offlineContent:ContentProvider={async weeklyEvents(){return [];},async courtChallenges(){return [];}};
