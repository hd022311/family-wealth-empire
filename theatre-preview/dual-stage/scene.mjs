import {SCENE,OPTIONS,CHARACTERS,DURATION} from '../performance/scene.mjs';
export {OPTIONS,CHARACTERS,DURATION};
export const BEATS=SCENE.map((beat,i)=>({...beat,start:SCENE.slice(0,i).reduce((s,b)=>s+b.duration,0),delay:[0,0,650,900,650,350,300][i]}));
export function beatAt(elapsed){let current=BEATS[0];for(const beat of BEATS){if(elapsed<beat.start)break;current=beat;}return current;}
export const CUTS={
 landscape:[['全景',['player','sister','brother']],[ '中景',['player','sister','brother']],['哥哥特寫',['player','brother']],['主角特寫',['player','brother']],['雙人反應',['sister','brother']],['妹妹特寫',['sister','brother']],['全景',['player','sister','brother']]],
 portrait:[['雙人開場',['sister','brother']],['主角與妹妹',['player','sister']],['哥哥特寫',['player','brother']],['主角特寫',['player','brother']],['哥哥與妹妹',['sister','brother']],['妹妹特寫',['sister','brother']],['手足同框',['player','brother']]]
};
export function shotAt(elapsed,portrait){const i=BEATS.indexOf(beatAt(elapsed));const [name,cast]=CUTS[portrait?'portrait':'landscape'][i];return {name,cast,index:i,portrait};}
export class Transport{
 constructor(now=()=>performance.now()){this.now=now;this.elapsed=0;this.running=false;this.anchor=0;this.mode='scene';this.draft=null;this.choice=null;this.commits=0;}
 time(){return Math.min(DURATION,this.elapsed+(this.running?this.now()-this.anchor:0));}
 play(){if(this.mode!=='scene'||this.running)return;this.anchor=this.now();this.running=true;}
 pause(){this.elapsed=this.time();this.running=false;}
 tick(){if(this.mode==='scene'&&this.time()>=DURATION){this.pause();this.mode='choice';}return this.time();}
 next(){if(this.mode!=='scene')return;this.pause();const b=beatAt(this.elapsed);this.elapsed=Math.min(DURATION,b.start+b.duration);if(this.elapsed===DURATION)this.mode='choice';}
 select(id){if(this.mode==='choice'&&OPTIONS.some(o=>o.id===id))this.draft=id;}
 confirm(){if(this.mode!=='choice'||!OPTIONS.some(o=>o.id===this.draft))return false;this.choice=this.draft;this.mode='result';this.commits++;return true;}
 restart(){this.pause();this.elapsed=0;this.mode='scene';this.draft=null;this.choice=null;this.commits=0;}
 snapshot(){return {elapsed:this.time(),running:this.running,mode:this.mode,draft:this.draft,choice:this.choice,commits:this.commits};}
}
