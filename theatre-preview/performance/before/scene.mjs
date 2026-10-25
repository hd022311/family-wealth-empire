/** Independent rehearsal: no game/save/first-volume engine imports. */
// Rehearsal date: fictional 2029-08-01; ages approximate opening ages + 3 years, not a legal-age calculation.
export const EXPRESSIONS=['calm','happy','angry','sad','shocked','skeptical'];
export const EXPRESSION_LABELS={calm:'平靜',happy:'開心',angry:'憤怒',sad:'悲傷',shocked:'震驚',skeptical:'懷疑'};
export const CHARACTERS={
 player:{name:'林家安',age:33,role:'主角',hair:'#282e33',jacket:'#737e67',shirt:'#e5ddce',face:'#e2ad8c',style:'player'},
 brother:{name:'林家誠',age:38,role:'哥哥',hair:'#30353b',jacket:'#293e52',shirt:'#c9c8bf',face:'#d8a482',style:'brother'},
 sister:{name:'林雅婷',age:31,role:'妹妹',hair:'#382e2d',jacket:'#b37d67',shirt:'#efe0cb',face:'#e6b492',style:'sister'},
};
/** Duration is direction for optional rehearsal only. Manual reading never times out. */
export const SCENE=[
 {id:'quiet',duration:6500,speaker:'sister',text:'這是爸爸留下的文件。我們先一起看，有不明白的地方，再請專業的人確認。',actors:{player:'calm',brother:'calm',sister:'calm'},positions:{player:'left',brother:'right',sister:'center'},camera:'wide',light:'warm',direction:'家人入座，平靜地看向文件。'},
 {id:'memory',duration:6500,speaker:'player',text:'我記得爸爸提過出租屋的心願。但媽媽的房子，還是要讓她自己說。',actors:{player:'sad',brother:'skeptical',sister:'calm'},camera:'player',light:'warm',direction:'家安低下眉眼，鏡頭緩緩靠近。'},
 {id:'objection',duration:6000,speaker:'brother',text:'等等。你們已經談好了？以前那些沒說清楚的事，就這樣算了嗎？',actors:{player:'shocked',brother:'angry',sister:'shocked'},positions:{player:'left',brother:'forward',sister:'center'},camera:'brother',light:'tense',shake:true,direction:'家誠向前一步；鏡頭輕微晃動一次。'},
 {id:'surprise',duration:5500,speaker:'player',text:'哥，我沒有說房子已經是我的。我以為……我們今天是來一起看資料。',actors:{player:'shocked',brother:'skeptical',sister:'sad'},camera:'player',light:'cool',direction:'焦點轉回家安，留一個呼吸的空白。'},
 {id:'pressure',duration:6500,speaker:'brother',text:'我不是只在說房子。我也有孩子、房貸，卻一直不知道，你們到底怎麼看我。',actors:{player:'sad',brother:'sad',sister:'sad'},camera:'brother',light:'cool',direction:'怒氣退去，家誠的嘴角與肩膀落下。'},
 {id:'listen',duration:6000,speaker:'sister',text:'我們先停一下，好嗎？把每個人的話聽完，不要替爸爸、媽媽，也不要替彼此作決定。',actors:{player:'calm',brother:'skeptical',sister:'sad'},positions:{player:'left',brother:'right',sister:'center'},camera:'sister',light:'warm',direction:'雅婷靠近兩人，讓對話慢下來。'},
 {id:'pause',duration:5000,speaker:'player',text:'好。先不談誰拿到什麼。我想知道，你最在意的是哪一件事。',actors:{player:'calm',brother:'calm',sister:'happy'},positions:{player:'left',brother:'right',sister:'off'},camera:'wide',light:'warm',direction:'雅婷退到畫面外，家安與家誠重新面向彼此。'},
];
export const OPTIONS=[
 {id:'listen',title:'先聽哥哥說完',hint:'暫停文件討論，讓他說出在意的事。',response:'家誠坐回椅子上。「我想知道，我以前做的那些，你們有沒有看見。」',actor:'brother',expression:'sad'},
 {id:'clarify',title:'一起列出待確認的事',hint:'分開記錄文件、所有權與每個人的疑問。',response:'雅婷把紙移到桌子中央。「先寫下不知道的，不急著替任何人下結論。」',actor:'sister',expression:'calm'},
 {id:'break',title:'先休息，再約時間談',hint:'保留各自的空間；這次不作財產決定。',response:'家誠點了點頭。「今天先到這裡。下次，我希望我們都準備好再談。」',actor:'brother',expression:'calm'},
];
export const DURATION=SCENE.reduce((n,x)=>n+x.duration,0);
export function validateScene(scene=SCENE){
 const errors=[];for(const beat of scene){if(!CHARACTERS[beat.speaker])errors.push(`${beat.id}:speaker`);if(beat.duration<1000)errors.push(`${beat.id}:duration`);for(const [id,expression]of Object.entries(beat.actors))if(!CHARACTERS[id]||!EXPRESSIONS.includes(expression))errors.push(`${beat.id}:actor`);}return errors;
}
