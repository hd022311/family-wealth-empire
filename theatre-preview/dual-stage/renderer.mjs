import {beatAt,shotAt} from './scene.mjs';
export const REGIONS={player:{crop:[0,0,550,1024],face:[142,135,224,210],eyes:[[210,218,39,22],[297,202,39,22]]},sister:{crop:[550,0,480,1024],face:[654,155,210,210],eyes:[[717,240,39,22],[801,222,37,22]]},brother:{crop:[1030,0,506,1024],face:[1194,150,230,220],eyes:[[1252,222,37,22],[1333,236,39,22]]}};
const clamp=x=>Math.max(0,Math.min(1,x));
export function loadImage(url){return new Promise((resolve,reject)=>{const i=new Image();i.onload=()=>resolve(i);i.onerror=()=>reject(Error('asset'));i.src=url;});}
function faceLayer(source,region,eyeOnly=false){const c=document.createElement('canvas');const [fx,fy,fw,fh]=region.face;c.width=fw;c.height=fh;const ctx=c.getContext('2d');ctx.translate(-fx,-fy);if(eyeOnly){for(const [x,y,rx,ry]of region.eyes){const g=ctx.createRadialGradient(x,y,Math.min(rx,ry)*.3,x,y,rx);g.addColorStop(0,'#fff');g.addColorStop(.65,'#fff');g.addColorStop(1,'#fff0');ctx.save();ctx.translate(x,y);ctx.scale(1,ry/rx);ctx.translate(-x,-y);ctx.fillStyle=g;ctx.fillRect(x-rx,y-rx,rx*2,rx*2);ctx.restore();}}else{const [x,y,w,h]=region.face;ctx.save();ctx.translate(x+w/2,y+h/2);ctx.scale(1,h/w);const g=ctx.createRadialGradient(0,0,w*.24,0,0,w*.5);g.addColorStop(0,'#fff');g.addColorStop(.68,'#fff');g.addColorStop(1,'#fff0');ctx.fillStyle=g;ctx.fillRect(-w/2,-w/2,w,w);ctx.restore();}ctx.globalCompositeOperation='source-in';ctx.drawImage(source,0,0);return {image:c,x:fx-region.crop[0],y:fy};}
export class Renderer{
 constructor(canvas){this.canvas=canvas;this.ctx=canvas.getContext('2d',{alpha:false});this.frames=0;this.dpr=1;this.width=1;this.height=1;}
 async load(){const names=['cast-master','cast-tense','cast-soft','cast-blink','living-room'];const images=await Promise.all(names.map(n=>loadImage(new URL(`assets/${n}.webp`,import.meta.url))));[this.master,this.tense,this.soft,this.blink,this.room]=images;this.layers={};for(const [id,r]of Object.entries(REGIONS))this.layers[id]={tense:faceLayer(this.tense,r),soft:faceLayer(this.soft,r),blink:faceLayer(this.blink,r,true)};this.poses={};for(const [id,r]of Object.entries(REGIONS)){const c=document.createElement('canvas');c.width=r.crop[2];c.height=r.crop[3];this.poses[id]=c;}this.tense=null;this.soft=null;this.blink=null;}
 resize(width,height,dpr=1){this.width=Math.max(1,width);this.height=Math.max(1,height);this.dpr=Math.min(1.5,dpr);this.canvas.width=Math.round(this.width*this.dpr);this.canvas.height=Math.round(this.height*this.dpr);}
 pose(id,elapsed,reduced){const b=beatAt(elapsed),local=elapsed-b.start;let from='calm',to='calm',mix=0;
 if(b.id==='memory'&&id==='player'){to='soft';mix=clamp((local-300)/850);}
 if(b.id==='objection'){from=id==='player'?'soft':'calm';to='tense';mix=clamp((local-(id==='player'?380:id==='sister'?520:0))/650);}
 if(b.id==='surprise'){from='tense';to='tense';mix=1;}
 if(b.id==='pressure'){from='tense';to='soft';mix=clamp((local-180)/1100);}
 if(b.id==='listen'){from='soft';to='soft';mix=1;}
 if(b.id==='pause'){from='soft';to='calm';mix=clamp((local-200)/1100);}
 const c=this.poses[id],ctx=c.getContext('2d');ctx.clearRect(0,0,c.width,c.height);ctx.drawImage(this.master,...REGIONS[id].crop,0,0,c.width,c.height);ctx.globalCompositeOperation='source-atop';const drawLayer=key=>{const l=this.layers[id][key];ctx.drawImage(l.image,l.x,l.y);};
 const blend=reduced?(mix>.5?1:0):mix;
 if(from!=='calm'&&from===to){drawLayer(from);}
 if(from!=='calm'&&from!==to){ctx.globalAlpha=1-blend;drawLayer(from);}
 if(to!=='calm'&&from!==to){ctx.globalAlpha=blend;drawLayer(to);}
 ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';
 // Sparse non-synchronous eyelid events; never loop the whole body or mouth.
 const blinks={player:[3700,10200,30000,38900],sister:[4900,11100,28000,39700],brother:[2400,9100,25200,36600]}[id];if(!reduced){let opacity=0;for(const t of blinks){const d=elapsed-t;if(d>=0&&d<180)opacity=Math.max(opacity,1-Math.abs(d-80)/100);}if(opacity>0){ctx.globalCompositeOperation='source-atop';ctx.globalAlpha=clamp(opacity);drawLayer('blink');ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';}}
 const cw=c.width;const edge=ctx.createLinearGradient(0,0,cw,0);edge.addColorStop(0,'#fff0');edge.addColorStop(.035,'#fff');edge.addColorStop(.965,'#fff');edge.addColorStop(1,'#fff0');ctx.globalCompositeOperation='destination-in';ctx.fillStyle=edge;ctx.fillRect(0,0,cw,1024);ctx.globalCompositeOperation='source-over';return c;}
 draw(elapsed,portrait,reduced,focusOverride=null,safeRect=null){if(!this.room)return;this.frames++;this.faces=[];const ctx=this.ctx,w=this.width,fullH=this.height,actorTop=safeRect?.top||0,h=Math.max(1,(safeRect?.bottom??fullH)-actorTop);ctx.setTransform(this.dpr,0,0,this.dpr,0,0);ctx.fillStyle='#17221e';ctx.fillRect(0,0,w,fullH);const shot=shotAt(elapsed,portrait),beat=beatAt(elapsed),i=shot.index;this.lastShot=shot;
 const cover=Math.max(w/this.room.width,fullH/this.room.height);const rw=this.room.width*cover,rh=this.room.height*cover;const roomPan=portrait?[-.49,-.38,-.69,-.29,-.67,-.45,-.5][i]:-.5;ctx.drawImage(this.room,(rw-w)*roomPan,(fullH-rh)*.46,rw,rh);
 let placements;
 if(!portrait){placements=i===0||i===6?{player:[.31,1.02,1.03],sister:[.52,1.03,.98],brother:[.75,1.04,1.04]}:i===1?{player:[.27,1.13,1.12],sister:[.51,1.13,1.1],brother:[.77,1.15,1.12]}:i===2?{player:[.15,1.32,1.35],brother:[.65,1.5,1.58]}:i===3?{player:[.36,1.53,1.6],brother:[.91,1.32,1.35]}:i===4?{sister:[.29,1.3,1.32],brother:[.7,1.34,1.36]}:{sister:[.42,1.47,1.52],brother:[.88,1.26,1.27]};}
 else{placements=i===0?{sister:[.28,1.08,1.13],brother:[.79,1.1,1.13]}:i===1?{player:[.38,1.24,1.4],sister:[.99,1.11,1.2]}:i===2?{player:[-.16,1.15,1.25],brother:[.6,1.26,1.48]}:i===3?{player:[.41,1.28,1.52],brother:[1.12,1.12,1.2]}:i===4?{sister:[-.1,1.12,1.23],brother:[.62,1.25,1.4]}:i===5?{sister:[.44,1.27,1.48],brother:[1.1,1.12,1.23]}:{player:[.25,1.09,1.13],brother:[.82,1.1,1.14]};}
 for(const id of shot.cast){const [cx,bottom,scale]=placements[id];const r=REGIONS[id].crop;let height=h*scale,width=height*r[2]/r[3];if(portrait&&width<w*.52){width=Math.min(w*.52,h*2*r[2]/r[3]);height=width*r[3]/r[2];}const x=w*cx-width/2,y=actorTop+Math.max(h*bottom-height,h*.04-height*(65/1024));const f=REGIONS[id].face;this.faces.push({id,left:x+(f[0]-r[0])/r[2]*width,top:y+f[1]/r[3]*height,right:x+(f[0]-r[0]+f[2])/r[2]*width,bottom:y+(f[1]+f[3])/r[3]*height});ctx.globalAlpha=id===(focusOverride||beat.speaker)?1:.92;ctx.drawImage(this.pose(id,elapsed,reduced),x,y,width,height);ctx.globalAlpha=1;}
 // A separate simple foreground tabletop and unlettered document, not a legal result.
 if(i===0||i===6){ctx.save();ctx.beginPath();ctx.rect(0,actorTop,w,h);ctx.clip();ctx.fillStyle='#3f3028';ctx.beginPath();ctx.moveTo(w*.12,actorTop+h*.94);ctx.lineTo(w*.85,actorTop+h*.94);ctx.lineTo(w*1.05,actorTop+h*1.07);ctx.lineTo(-w*.08,actorTop+h*1.07);ctx.closePath();ctx.fill();ctx.fillStyle='#d8d0bc';ctx.save();ctx.translate(w*.5,actorTop+h*.97);ctx.rotate(-.045);ctx.fillRect(-w*.06,-h*.015,w*.12,h*.045);ctx.restore();ctx.restore();}
 if(i>=2&&i<=4){ctx.fillStyle='#0c21322b';ctx.fillRect(0,0,w,fullH);}const fade=ctx.createLinearGradient(0,actorTop+h*.82,0,fullH);fade.addColorStop(0,'#06120f00');fade.addColorStop(1,'#06120f');ctx.fillStyle=fade;ctx.fillRect(0,actorTop+h*.82,w,fullH-actorTop-h*.82);
 return shot;
 }
}
