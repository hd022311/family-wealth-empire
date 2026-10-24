/** Specification boundary only. Never derive a competitive score from client State. */
export const boardDefinitions=[
 {id:'net-worth',name:'全服淨資產榜',unit:'元',rule:'標準時間期末的已驗證淨資產'},
 {id:'legacy',name:'家族傳承榜',unit:'分',rule:'已結算並成功接班的淨遺產累計；同一筆資產跨代不得重複計分'},
 {id:'generations',name:'經營世代榜',unit:'代',rule:'完成最低標準經營期間且通過接班驗證的世代數'},
 {id:'business',name:'企業經營榜',unit:'元',rule:'企業營運淨利，不含資本注入與資產重估；待企業模組'},
 {id:'risk',name:'風險管理榜',unit:'分',rule:'風險調整分數；最低投資暴露門檻、最大回撤及償債能力，公式待凍結'},
 {id:'returns',name:'投資績效榜',unit:'%',rule:'排除外部資金流入的時間加權報酬；同一基準與最低期間'}
] as const;
export type BoardId=typeof boardDefinitions[number]['id'];
export type Cohort={market:'virtual'|'real';difficulty:'standard'|'hard';scenarioHash:string;rulesVersion:string;standardMonths:number};
export type Season={id:string;name:string;startAt:string;endAt:string;cohort:Cohort;initialStateHash:string;seedCommitment:string;status:'planned'|'active'|'settled'};
export type PublicFamily={id:string;nickname:string;familyName:string;consentedAchievements:string[]};
export type RankingEntry={family:PublicFamily;rank:number;previousRank:number|null;score:number;percentile:number};
export type RankingPage={source:'demo'|'verified-server';board:BoardId;season:Season;total:number;entries:RankingEntry[];personal:RankingEntry|null;asOf:string};
// Read-only interface. No submitScore / uploadAssets method is permitted.
export interface RankingProvider {page(board:BoardId,seasonId:string):Promise<RankingPage>;personal(board:BoardId,seasonId:string):Promise<RankingEntry|null>;hallOfFame():Promise<RankingPage[]>}
export function sameCohort(a:Cohort,b:Cohort){return a.market===b.market&&a.difficulty===b.difficulty&&a.scenarioHash===b.scenarioHash&&a.rulesVersion===b.rulesVersion&&a.standardMonths===b.standardMonths;}
/** Percent of participants below this competition rank. Single entrant is 100. Ties share rank. */
export function percentile(rank:number,total:number){if(!Number.isInteger(rank)||!Number.isInteger(total)||total<1||rank<1||rank>total)throw Error('無效名次');return total===1?100:100*(total-rank)/(total-1);}
export function movement(entry:RankingEntry){return entry.previousRank===null?'新進榜':entry.previousRank===entry.rank?'持平':`${entry.previousRank>entry.rank?'↑':'↓'} ${Math.abs(entry.previousRank-entry.rank)}`;}
const demoSeason:Season={id:'demo-2026-10',name:'2026 年 10 月示意賽季',startAt:'2026-10-01T00:00:00+08:00',endAt:'2026-11-01T00:00:00+08:00',cohort:{market:'virtual',difficulty:'standard',scenarioHash:'demo-scenario-v1',rulesVersion:'draft-1',standardMonths:24},initialStateHash:'demo-equal-start',seedCommitment:'demo-not-competitive',status:'planned'};
export const demoRankings:RankingProvider={
 async page(board){const scores:Record<BoardId,number[]>={'net-worth':[8250000,7300000,6120000],legacy:[98,85,79],generations:[4,3,2],business:[520000,430000,390000],risk:[92,89,81],returns:[18.4,15.2,11.7]};const entries=scores[board].map((score,i)=>({family:{id:`demo-${i}`,nickname:['青禾旅人','慢慢累積','日光收藏家'][i],familyName:['青禾家族','長青家族','日光家族'][i],consentedAchievements:i===0?['三代傳承（示意）']:[]},rank:i+1,previousRank:[2,1,null][i],score,percentile:percentile(i+1,3)}));return {source:'demo',board,season:demoSeason,total:3,entries,personal:entries[2],asOf:'2026-10-23T00:00:00+08:00'};},
 async personal(board,seasonId){return (await this.page(board,seasonId)).personal;},
 async hallOfFame(){return [];} // No settled season exists; never manufacture historical winners.
};
