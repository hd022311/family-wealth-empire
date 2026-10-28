import {PrologueRenderer} from '../prologue/renderer.mjs?v=integrated-1';
import {REGIONS} from '../dual-stage/renderer.mjs?v=framing-1';
export class OpeningRenderer extends PrologueRenderer{
 async load(){await super.load();this.currentKey='';this.entered=0;this.base.pose=(id,unused,reduced)=>this.pose(id,reduced);}
 draw(cue,index,portrait,reduced,safe,phase){if(this.currentKey!==cue.id){this.currentKey=cue.id;this.previous=this.target||'calm';this.target=cue.emotion==='anger'||cue.id==='cold4'?'tense':cue.mind||cue.id?.startsWith('meal')?'soft':'calm';this.entered=performance.now();}this.focus=cue.speaker;super.draw(cue,index,portrait,reduced,safe,phase);}
 pose(id,reduced){const base=this.base,c=base.poses[id],ctx=c.getContext('2d'),r=REGIONS[id],blend=reduced?1:Math.min(1,(performance.now()-this.entered)/380);ctx.clearRect(0,0,c.width,c.height);ctx.drawImage(base.master,...r.crop,0,0,c.width,c.height);ctx.globalCompositeOperation='source-atop';const layer=(key,alpha)=>{if(key==='calm')return;const l=base.layers[id][key];ctx.globalAlpha=alpha;ctx.drawImage(l.image,l.x,l.y);};layer(this.previous,1-blend);layer(this.target,blend);
 // Eye-only, asynchronous candidate eyelid layers; no body bob or automatic lip motion.
 const period={player:6100,brother:7300,sister:8300}[id],offset={player:1900,brother:3500,sister:4800}[id],t=(performance.now()+offset)%period;if(!reduced&&t<180)layer('blink',Math.max(0,1-Math.abs(t-90)/90));ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';return c;}
}
