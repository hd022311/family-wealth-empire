/** Standalone narrative prototype. Does not import or write GameState v4. */
export const VERSION='0.1.0-concept';
export const SCHEMA_VERSION=1;
export const CAST={
 player:{name:'林家安',age:30,role:'主角・企劃專員',sprite:0},
 spouse:{name:'陳怡君',age:31,role:'配偶・自己的工作與育兒責任',sprite:1},
 father:{name:'林建國',age:64,role:'父親・退休技師',sprite:2},
 mother:{name:'陳淑芬',age:62,role:'母親・自己的晚年規劃',sprite:3},
 brother:{name:'林家誠',age:35,role:'哥哥・工程工作、房貸與子女',sprite:4},
 sister:{name:'林雅婷',age:28,role:'妹妹・輪班工作與進修',sprite:5},
 narrator:{name:'旁白',role:'',sprite:null}
};
export const VOLUMES=[['v1','兩間房子的承諾','有限互動原型'],['v2','帳戶裡的1,309萬元','企劃中：金額不能單獨決定稅務'],['v3','被保險人不是保單主人？','企劃中：保單關係人與權利'],['v4','誰有權決定賣掉老家？','企劃中：所有權、共有與處分'],['v5','爸爸的公司，誰來接班？','企劃中：股權與經營權']];
const option=(id,title,hint,cost=0)=>({id,title,hint,cost});
export const DECISIONS=[
 {id:'care',title:'照顧，先從哪裡開始？',speaker:'mother',scene:'hospital',date:'2026-05-18',lines:['「爸爸出院後，你們也還有自己的生活。」','媽媽把出院單推過來，沒有替任何人作決定。'],options:[option('personal','我先親自陪伴','預留陪伴時間；生活預備金支出 $45,000',45000),option('shared','先和手足排出分工','需要協調；生活預備金支出 $20,000',20000),option('professional','詢問專業照顧安排','保留工作時間；預備金支出 $38,000',38000)]},
 {id:'budget',title:'哥哥說，他這個月真的拿不出來。',speaker:'brother',scene:'living',date:'2026-06-02',lines:['「房貸、孩子的學費，都還沒繳。」','他沒有看你，手裡捏著一張繳費單。'],options:[option('solo','這次我先墊，寫清楚範圍','付出 $60,000；其餘負擔仍要再談',60000),option('transparent','把各家的預算攤開談','支出 $20,000；也讓非金錢協助被看見',20000),option('promise','先答應全部，別讓爸媽擔心','付出 $95,000；尚未取得其他人分擔承諾',95000)]},
 {id:'wishes',title:'「兩間房，最後都留給你，好不好？」',speaker:'father',scene:'living',date:'2027-02-11',lines:['爸爸說得很輕，媽媽卻放下了茶杯。','這是他的心願，還不是你已取得的房產。'],options:[option('independent','請爸媽各自尋求專業協助','尊重各自意願；諮詢示例支出 $8,000',8000),option('meeting','先一起談晚年與居住需求','支出 $2,000；不先承諾房屋歸誰',2000),option('oral','把爸爸的話先記下來','不產生有效遺囑或財產移轉',0)]},
 {id:'insurance',title:'如果需要現金，要怎麼準備？',speaker:'spouse',scene:'office',date:'2027-03-06',lines:['「房子不能拿來付明天的生活費。」','怡君想談的是餘裕，不是要你買哪一種答案。'],options:[option('evaluate','請父親評估壽險安排','諮詢支出 $2,000；不代表承保或理賠',2000),option('reserve','先保留生活預備金','不投保也有完整故事；資產權利不因此改變',0),option('policy','先核對現有保單影本','查清關係人；資料未齊，不計保險金',1000)]},
 {id:'inventory',title:'先談爸爸留下什麼，還是先談房子歸誰？',speaker:'mother',scene:'office',date:'2029-07-20',lines:['父親離世後，媽媽把自己的權狀收回包裡。','「我的房子，和你爸爸的事，要分開說。」'],options:[option('separate','先分開盤點兩位屋主的權利','支出 $6,000；父親遺產先獨立建檔',6000),option('rushed','先談兩間房最後給誰','支出 $3,000；清冊與權利仍未釐清',3000),option('practical','先付眼前費用，再請專業盤點','支出 $12,000；不先假定誰取得房子',12000)]},
 {id:'response',title:'媽媽也離開了。這次，你想怎麼開始？',speaker:'sister',scene:'living',date:'2031-10-15',lines:['哥哥想請專業確認特留分主張，雅婷則把全家福放在桌上。','「我們可以先聽彼此說完，再決定怎麼主張權利嗎？」'],options:[option('mediate','先談大家承擔得起的協商方案','前置支出 $3,000；不代表已成立分割協議',3000),option('clarify','先請專業釐清主張，再談','前置諮詢 $8,000；法律結果仍待確認',8000),option('legal','暫不協商，各自尋求法律途徑','前置諮詢 $12,000；不預告裁判或凍結',12000)]}
];
export const ENDINGS=[
 {id:'E1',title:'留下可對話的家',story:['你們還沒有決定房子怎麼分，卻願意把同一張桌子留著。','照顧不是換房子的籌碼；這一次，沒有人得靠沉默證明付出。'],objective:'照顧分工、透明預算與協商，能改善溝通，但不能增加法定權利。',topics:['ownership','shares','partition'],alternative:'若協商涉及補償或出售，仍須核對權利、資金與有效協議。'},
 {id:'E2',title:'兩間房之外的生活',story:['你保留了工作和生活預備金，也為父母安排了需要的照顧。','房屋去向仍未確定。你和怡君先約好，這個週末陪孩子去海邊。'],objective:'流動性、界線與照顧可以並存；不購買保險也不等於規劃失敗。',topics:['ownership','insurance','tax'],alternative:'其他路線可評估保險或資產安排，但承保、權利及稅務需另行核實。'},
 {id:'E3',title:'遲來的一張餐桌',story:['那句「我以為你都可以」終於被說出口。你也承認，自己沒有真的說清楚。','和解還沒有簽字，但哥哥這次沒有提早離席。'],objective:'照顧記憶影響協商意願；補償與分割仍需明確合意及法律審查。',topics:['partition','support','shares'],alternative:'若有借貸、贈與或代墊爭議，需分別核對證據，不能只憑誰付出最多。'},
 {id:'E4',title:'照顧者也需要被照顧',story:['你以為自己撐得住。直到怡君說：「這次，換我們陪你。」','你們開始重新分工。留下來的不只有疲累，也有終於說出口的需要。'],objective:'自我犧牲不會自動增加應繼分；照顧費用與扶養問題須分別釐清。',topics:['support','shares','ownership'],alternative:'早些談預算或安排協助，可能保留不同的家庭與工作空間。'},
 {id:'E5',title:'文件很齊，心事未完',story:['你把文件逐張排好，哥哥卻問：「那我們以前沒說的那些呢？」','專業可以協助確認權利，不能替一個家庭補寫所有對話。'],objective:'文件存在、內容、形式、效力與可執行結果是不同層次；親情另需溝通。',topics:['will','reserved','partition'],alternative:'有遺囑文件也不代表兩間房已歸主角；仍有權利、效力與爭議待查。'},
 {id:'E6',title:'誰也沒有先退讓',story:['你們各自收好資料，約好先透過專業窗口聯絡。','下一次見面會在哪裡，還沒有人知道。故事停在裁判之前。'],objective:'選擇法律途徑不等於必然勝敗；訴訟、保全及費用必須具體判斷。',topics:['dispute','reserved','partition'],alternative:'是否有和解空間、哪些財產受限制，要看個案事實，不能假定全部凍結。'},
 {id:'E7',title:'走到談判桌之前',story:['清冊還缺一頁，誰也不再急著把兩間房寫成同一筆財產。','你決定先把不知道的事查清楚。這也是一種前進。'],objective:'父母先後死亡，必須各自建立事件；資料不全時不產生假精確結果。',topics:['ownership','marital','tax'],alternative:'補齊所有權、死亡日期、婚姻、債務與文件，才可能進入正式計算。'},
 {id:'E8',title:'把答案留給下一頁',story:['你沒有一次解決所有事，但開始把承諾、支出和未解的問題寫清楚。','孩子問起那兩間房時，你希望先告訴他，家人曾經怎麼一起生活。'],objective:'留下事實與待辦，不等於移轉財產；下一代不自動取得未處理權利。',topics:['ownership','partition','tax'],alternative:'下一步可以是補齊資料、重開協商或專業諮詢，未決事項不必假裝已解決。'}
];
export const KNOWLEDGE=[
 {id:'ownership',title:'誰的房子，就先查誰的權利',summary:'本故事中，父親持有出租屋、母親持有自住房；兩者不直接算玩家資產。正式歸屬須核對登記、財產制與其他事實。',law:'民法；相關所有權及繼承規則待逐條核對',url:'https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=B0000001'},
 {id:'shares',title:'感情與法定繼承權分開',summary:'原型不計應繼分。法定繼承人的認定及比例，需要家庭事實、事件日期與已審核規則；照顧或信任不能直接改寫。',law:'民法第1138、1139、1144條（法源線索，尚未完成審核）',url:'https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=B0000001'},
 {id:'will',title:'口頭心願不是已驗證的遺囑',summary:'父母的願望、文件存在、形式要件、意思能力、效力與權利效果要分開確認。本原型不認定任何文件已生效。',law:'民法遺囑章；形式及效力規則待審核',url:'https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=B0000001'},
 {id:'reserved',title:'特留分主張不是遊戲自訂比例',summary:'手足可能提出主張；誰有權、適用版本、範圍及爭議處理均待核實。本原型不輸出比例、金額或勝訴結論。',law:'民法第1223條及相關規範、沿革與施行規定待核對',url:'https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=B0000001'},
 {id:'marital',title:'夫妻財產與遺產分開確認',summary:'母親在父親死亡時可能涉及的財產權利，不可與她原有財產或法定繼承混為一談。原型未進行計算。',law:'民法夫妻財產制與相關請求權規定待審核',url:'https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=B0000001'},
 {id:'partition',title:'協商意願，不等於分割已完成',summary:'同意繼續談、提出方案、簽署協議與完成必要程序，是不同狀態。原型的和緩結局不代表已完成合法分產。',law:'民法遺產分割與共有規範待審核',url:'https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=B0000001'},
 {id:'insurance',title:'先分清保單關係人',summary:'要保人、被保險人、受益人及契約狀態需要逐項核對。詢問投保、保單影本或指定意願，都不等於承保或已取得保險金。',law:'保險法及契約條款待核實；不計理賠或保險稅務',url:'https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=G0390002'},
 {id:'tax',title:'金額與年度都不是完整稅額',summary:'遺產稅、贈與稅及保險稅務需依事件日期、資格、參數、扣除及例外判斷。本原型不套用固定免稅額或產生稅額。',law:'遺產及贈與稅法；財政部年度公告與相關解釋待核對',url:'https://www.dot.gov.tw/'},
 {id:'support',title:'照顧、代墊與扶養分開記錄',summary:'情感付出、家庭分工、代墊是否可請求及扶養義務是不同問題，不能以好感度給出確定法律效果。',law:'民法扶養、契約與相關費用規定待審核',url:'https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=B0000001'},
 {id:'dispute',title:'故事不代替法院作判決',summary:'不假定某方必然勝訴、保險必然免稅或全部遺產自動凍結。司法裁量與實質課稅爭議保留不確定性。',law:'民事程序、保全與相關稅務法源待審核',url:'https://law.moj.gov.tw/'}
].map(x=>({...x,review_status:'draft',effective_from:null,effective_to:null,verified_at:null,rule_version:null}));
export function freshRun(){return {schemaVersion:SCHEMA_VERSION,contentVersion:VERSION,choices:{},cash:180000,ledger:[],memories:[],documents:{fatherWill:'not_assessed',motherWill:'not_assessed',policy:'not_assessed'},estates:[{id:'father-2029',decedent:'father',date:'2029-07-12',status:'pending_verification',assets:['父親出租屋及其餘待盤點權利、債務']},{id:'mother-2031',decedent:'mother',date:'2031-10-08',status:'pending_verification',assets:['母親自住房及其餘待盤點權利、債務']}],legalResults:[]};}
export function choose(run,index,optionId){if(index!==Object.keys(run.choices).length)throw Error('Out-of-order decision');const d=DECISIONS[index],o=d?.options.find(x=>x.id===optionId);if(!o)throw Error('Unknown choice');const next=structuredClone(run);next.choices[d.id]=o.id;next.cash-=o.cost;next.ledger.push({transactionId:`v1-${d.id}`,date:d.date,kind:'fictional_player_expense',amount:-o.cost,balance:next.cash,reason:o.title,source:'劇情示例費用，非行情或法定費用'});next.memories.push({id:`memory-${d.id}`,date:d.date,participants:[d.speaker,'player'],objective:{action:o.title,cashPaid:o.cost,ownershipTransferred:false},subjective:{observer:d.speaker,interpretation:reaction(next,index)[0].lines.join('')},legalDocument:false,futureKeys:['wishes','inventory','response','ending']});
 if(d.id==='wishes'){next.documents.fatherWill=o.id==='independent'?'document_reported_validity_pending':'not_established';next.documents.motherWill=o.id==='independent'?'independent_wish_review_pending':'not_established';}
 if(d.id==='insurance')next.documents.policy=o.id==='evaluate'?'application_information_only':o.id==='policy'?'copy_found_parties_pending':'no_new_policy';
 return next;}
export function endingFor(run){const c=run.choices;if(Object.keys(c).length!==6)throw Error('Incomplete run');let id;
 if(c.response==='legal')id='E6';
 else if(c.response==='clarify'&&c.inventory==='rushed')id='E7';
 else if(c.care==='personal'&&c.budget==='promise')id='E4';
 else if(c.wishes==='independent'&&c.budget!=='transparent'&&c.response==='clarify')id='E5';
 else if(c.response==='mediate'&&(c.budget==='promise'||c.inventory==='rushed'))id='E3';
 else if(c.care==='professional'&&c.budget==='transparent'&&c.insurance==='reserve'&&c.inventory!=='rushed'&&c.response==='mediate')id='E2';
 else if(c.care==='shared'&&c.budget==='transparent'&&c.wishes!=='oral'&&c.inventory!=='rushed'&&c.response==='mediate')id='E1';
 else id='E8';return ENDINGS.find(x=>x.id===id);}
const line=(speaker,scene,date,...lines)=>({kind:'dialogue',speaker,scene,date,lines});
export function reaction(run,index){const c=run.choices;switch(index){
 case 0:return [c.care==='personal'?line('father','hospital','2026-05-18','「你來，我當然高興。可是工作怎麼辦？」','他想有人陪，也不想你失去自己的生活。'):c.care==='shared'?line('sister','hospital','2026-05-18','「我夜班後不能開車，但能接送媽媽。」','分工不是平均分錢，而是先知道彼此做得到什麼。'):line('mother','hospital','2026-05-18','「有人幫忙，我也能睡一下。」','你還是會探望，只是不再把照顧都排在自己身上。'),line('spouse','living','2026-05-24',c.care==='personal'?'「晚飯我先顧。你也得留一點時間休息。」':c.care==='shared'?'「把大家的時間寫下來，別讓約好的事又落空。」':'「我們把探望排好，別讓專業照顧變成不再見面。」')];
 case 1:return [c.budget==='transparent'?line('brother','living','2026-06-02','「我這個月能拿的不多，但星期日可以陪診。」','第一次，你們聽見每個家庭裡沒有說出口的難處。'):c.budget==='solo'?line('brother','living','2026-06-02','「我會記得你先墊。什麼時候還、算不算借款，我們要說清楚。」','你把金額寫下來，也留下了還沒說好的部分。'):line('spouse','living','2026-06-02','「你說你都可以，所以大家以為你真的可以。」','她擔心的不是那兩間房，是你們下個月的生活。')];
 case 2:return [c.wishes==='independent'?line('father','office','2027-02-11','「我願意找專業的人，把我自己的意思說清楚。」','父親後來交來一份寫下心願的文件，仍有細節要請專業的人確認。'):c.wishes==='meeting'?line('mother','living','2027-02-11','「我想先住在熟悉的地方，不急著答應房子給誰。」','父親也同意先談居住與照顧，沒有要求你換取承諾。'):line('father','living','2027-02-11','「我說的，你記得就好。」','紙上寫著他的心願。你忽然想起，媽媽剛才一直沒有開口。'),line('brother','living','2027-02-20',c.budget==='transparent'?'「上次談預算時，我才知道你也有壓力。這次我願意聽。」':'「上次的費用還沒說清楚，現在就要談房子嗎？」',c.care==='personal'?'那些請假的下午，也和這句話一起回到心裡。':'你們帶著不同的疲累，坐在同一張桌子前。')];
 case 3:return [c.insurance==='evaluate'?line('father','office','2027-03-06','「我願意問問，但能不能承保、條款怎麼寫，要看清楚。」','那天帶回的是申請資料。父親說，要先看懂，再決定。'):c.insurance==='reserve'?line('spouse','living','2027-03-06','「先留一筆生活錢，至少不用每次都硬撐。」','你把那筆錢留在生活帳戶裡，沒有把未來寫成保證。'):line('sister','office','2027-03-06','「影本上的三個名字不一樣。我們先別猜誰能領。」','你們列了幾個問題，沒有把一張影本當成答案。')];
 case 4:return [c.inventory==='rushed'?line('brother','office','2029-07-20','「媽媽還在，怎麼就把兩間房一起算了？」','母親把兩本資料夾分開。你才發現，自己說得太快了。'):line('mother','office','2029-07-20','「先把你爸爸的事查清楚，我自己的意思，也讓我自己說。」','你把爸爸那本清冊標上日期，也另外留下媽媽的資料夾。'),line('narrator','living','2029-08-01',c.wishes==='independent'?'信封寫著父親希望出租屋由你承接。母親看了很久，沒有替自己的房子答應什麼。':'父親說過的話重新被提起，你才發現，每個人記得的片段都不一樣。',c.insurance==='evaluate'?'申請資料停在待確認的地方；眼前的生活費，仍要從自己的預備金安排。':c.insurance==='policy'?'影本還有未釐清的資料，你們決定先把關係人與條款查清。':'你動用了預備金。看著帳上的餘額，怡君輕輕說了聲：「慢慢來。」')];
 case 5:return [line('sister','living','2031-10-15',c.response==='mediate'?(c.budget==='transparent'?'「我們以前能談預算，這次也許可以先把需求說完。」':'「我願意先坐下來，但之前沒說的事，也要一起談。」'):c.response==='clarify'?'「先把不知道的事列出來，再決定怎麼談。」':'「那就先透過專業窗口聯絡吧。誰也別替法院先下結論。」','雅婷沒有把全家福收回去。那張桌子，暫時還留著每個人的位置。')];default:return [];}}
export const INTRO=[line('father','living','2026-04-26','「這兩間房，以後都是你們的靠山。」','爸爸把鑰匙放到茶几上，像放下一個很簡單的答案。'),line('spouse','living','2026-04-26','「你聽見的是房子。我聽見的，是以後要怎麼一起生活。」','窗外傳來機車聲。你還不知道，這句話會陪你多久。')];
export function bridge(index){return {0:[],1:[line('narrator','hospital','2026-05-18','一次住院，讓原本說好的探望變成每天都要安排的事。','費用與時間開始累積，沒有人同時看得到所有人的難處。')],2:[line('narrator','living','2027-02-11','幾個月後，爸爸恢復了一些精神，開始談起房子的未來。','自住房登記在母親名下，出租屋由父親持有；都不是你的資產。')],3:[line('spouse','office','2027-03-06','「我們談過房子，還沒有談如果需要現金怎麼辦。」','你們把預備金與保單資料帶到諮詢桌前。')],4:[line('narrator','hospital','2029-07-12','2029年，父親離世。故事在這裡跨過兩年。','母親仍在世；先建立父親這一次的遺產事件，不合併兩人的財產。')],5:[line('narrator','home','2031-10-08','兩年後，母親也離世。又是一個獨立的死亡與遺產事件。','先前未確定的權利，不能在這裡被假裝已經分好。')]}[index]||[];}
export function legalEnvelope(run){return {status:'pending_verification',eventDates:run.estates.map(x=>x.date),applicableVersions:[],calculations:[],officialSources:KNOWLEDGE.map(x=>x.url),uncertainties:['所有權、婚姻及繼承人事實待補齊','遺囑、保單、分割協議效力待核實','法律歷史版本、稅務參數與例外尚未 approved','裁判及行政判斷不確定'],fictionalNarrativeOnly:true};}
