import {Renderer,REGIONS,loadImage} from '../dual-stage/renderer.mjs?v=framing-1';
export const FAMILY={father:{crop:[0,0,570,1024],face:[145,120,230,230]},mother:{crop:[570,0,480,1024],face:[683,140,216,224]},spouse:{crop:[1050,0,486,1024],face:[1190,142,218,225]}};
export class PrologueRenderer{
 constructor(canvas){this.canvas=canvas;this.ctx=canvas.getContext('2d',{alpha:false});this.base=new Renderer(document.createElement('canvas'));this.width=1;this.height=1;this.frames=0;this.faces=[];}
 async load(){await Promise.all([this.base.load(),loadImage(new URL('assets/table-room-candidate.webp',import.meta.url)).then(i=>this.room=i),loadImage(new URL('assets/family-candidates.webp',import.meta.url)).then(i=>this.family=i),loadImage(new URL('assets/places-candidates.webp',import.meta.url)).then(i=>this.places=i)]);}
 resize(w,h){this.width=w;this.height=h;this.dpr=Math.min(devicePixelRatio||1,1.5);this.canvas.width=Math.round(w*this.dpr);this.canvas.height=Math.round(h*this.dpr);}
 draw(cue,index,portrait,reduced,safe,phase=0){const ctx=this.ctx,w=this.width,h=this.height;this.frames++;this.faces=[];ctx.setTransform(this.dpr,0,0,this.dpr,0,0);ctx.fillStyle='#15212b';ctx.fillRect(0,0,w,h);
 const bg=cue.setting==='living'?this.room:this.places;const crop=cue.setting==='living'?[0,0,bg.width,bg.height]:[0,cue.setting==='hospital'?0:474,bg.width,cue.setting==='hospital'?474:bg.height-474];
 const zoom=cue.shot==='close'?1.12:1.02;const scale=Math.max(w/crop[2],h/crop[3])*zoom;const bw=crop[2]*scale,bh=crop[3]*scale;const pan=portrait?(cue.setting==='rental'?.72:cue.setting==='hospital'?.55:.48):.5;ctx.drawImage(bg,...crop,(w-bw)*pan,(h-bh)*.5,bw,bh);
 let cast=cue.cast;if(portrait&&cast.length===3){const other=cast.find(id=>id!==cue.speaker);cast=[other,cue.speaker];}
 let centers;if(portrait){centers=cast.length===1?[.5]:cue.shot==='close'?[.48,1.15]:[.25,.79];}else centers=cast.length===3?[.28,.5,.72]:cast.length===2?(cue.shot==='close'?[.54,.88]:[.36,.64]):[.54];
 // Fixed per-shot face anchors keep faces above subtitles, rather than fitting whole seated sprites.
 for(let n=0;n<cast.length;n++){const id=cast[n],r=REGIONS[id]||FAMILY[id],f=r.face;const isFocus=id===cue.speaker;let faceWidth=w*(portrait?(cast.length===1?.42:cue.shot==='close'&&isFocus?.43:.3):(cast.length===3?.115:cue.shot==='close'&&isFocus?.2:.145));const room=Math.max(32,safe.bottom-safe.top);const hair=(f[1]-45)/f[3];let faceHeight=Math.min(faceWidth*f[3]/f[2],room/(1+hair+.04));faceWidth=faceHeight*f[2]/f[3];const spriteHeight=faceHeight*1024/f[3],spriteWidth=spriteHeight*r.crop[2]/1024;const faceTop=safe.top+hair*faceHeight;const x=w*centers[n]-(f[0]-r.crop[0]+f[2]/2)/r.crop[2]*spriteWidth,y=faceTop-f[1]/1024*spriteHeight;
 ctx.globalAlpha=1;const body=REGIONS[id]?this.base.pose(id,index<2?(index===0?13000:25000):0,reduced):null;if(body)ctx.drawImage(body,x,y,spriteWidth,spriteHeight);else ctx.drawImage(this.family,...r.crop,x,y,spriteWidth,spriteHeight);this.faces.push({id,left:w*centers[n]-faceWidth/2,right:w*centers[n]+faceWidth/2,top:faceTop,bottom:faceTop+faceHeight});
 }
 // Reuse the same table pixels as a foreground plate, so seated sprite edges stay behind the tabletop.
 if(cue.setting==='living'){const tableTop=(h-bh)*.5+647*scale;ctx.save();ctx.beginPath();ctx.rect(0,tableTop,w,h-tableTop);ctx.clip();ctx.drawImage(bg,...crop,(w-bw)*pan,(h-bh)*.5,bw,bh);ctx.restore();}
 if(index<2){ctx.fillStyle='#10283e30';ctx.fillRect(0,0,w,h);}if(index===2&&!reduced){const a=Math.max(0,.18-phase*.18);ctx.fillStyle=`rgba(255,217,166,${a})`;ctx.fillRect(0,0,w,h);}this.cast=cast;
 }
}
