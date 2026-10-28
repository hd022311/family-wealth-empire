import {PrologueRenderer,FAMILY} from '../prologue/renderer.mjs?v=integrated-1';
import {REGIONS,loadImage} from '../dual-stage/renderer.mjs?v=framing-1';
import {CUES} from './model.mjs';
export class VolumeRenderer extends PrologueRenderer{
 async load(){await super.load();this.atlas=await loadImage(new URL('../assets/scenes-concept.png',import.meta.url));}
 drawNode(node,portrait,reduced,safe,phase=0){
 if(node.prologueId){super.draw(CUES[node.prologue],node.prologue,portrait,reduced,safe,phase);return;}
 const ctx=this.ctx,w=this.width,h=this.height;this.frames++;this.faces=[];ctx.setTransform(this.dpr,0,0,this.dpr,0,0);ctx.fillStyle='#10212e';ctx.fillRect(0,0,w,h);
 const scene=node.scene||'living',bg=scene==='living'?this.room:scene==='hospital'?this.places:this.atlas;
 const crop=scene==='living'?[0,0,bg.width,bg.height]:scene==='hospital'?[0,0,bg.width,474]:scene==='home'?[0,0,bg.width/2,bg.height/2]:[bg.width/2,bg.height/2,bg.width/2,bg.height/2];
 const scale=Math.max(w/crop[2],h/crop[3])*1.02,bw=crop[2]*scale,bh=crop[3]*scale;ctx.drawImage(bg,...crop,(w-bw)*.5,(h-bh)*.5,bw,bh);
 // Narration is a scene cutaway. Never resurrect a deceased parent as a reaction extra.
 const speaker=node.speaker;const cast=!speaker||speaker==='narrator'?[]:speaker==='player'?['player','spouse']:['player',speaker];
 for(let i=0;i<cast.length;i++){const id=cast[i],r=REGIONS[id]||FAMILY[id],f=r.face;const room=Math.max(32,safe.bottom-safe.top),hair=(f[1]-45)/f[3];let fh=Math.min(w*(portrait?.3:.145)*f[3]/f[2],room/(1+hair+.04));const fw=fh*f[2]/f[3],sh=fh*1024/f[3],sw=sh*r.crop[2]/1024,cx=w*(portrait?[.25,.79][i]:[.36,.64][i]),ft=safe.top+hair*fh,x=cx-(f[0]-r.crop[0]+f[2]/2)/r.crop[2]*sw,y=ft-f[1]/1024*sh;
 const body=REGIONS[id]?this.base.pose(id,0,reduced):null;if(body)ctx.drawImage(body,x,y,sw,sh);else ctx.drawImage(this.family,...r.crop,x,y,sw,sh);this.faces.push({id,left:cx-fw/2,right:cx+fw/2,top:ft,bottom:ft+fh});}
 if(scene==='living'){const ty=(h-bh)*.5+647*scale;ctx.save();ctx.beginPath();ctx.rect(0,ty,w,h-ty);ctx.clip();ctx.drawImage(bg,...crop,(w-bw)*.5,(h-bh)*.5,bw,bh);ctx.restore();}this.cast=cast;
 }
}
