/** Landscape blocking is anchored to face size, not the seated full-body height. */
export function landscapeFraming(index,width,actorTop,safeHeight,regions){
 const kind=index===0||index===6?'ensemble':index===1?'medium':index===2||index===4?'duo':'close';
 const cast=index===0||index===1||index===6?['player','sister','brother']:index===2||index===3?['player','brother']:['sister','brother'];
 const lead=index===2||index===4?'brother':index===5?'sister':'player';
 const desired=kind==='ensemble'?{player:.112,sister:.106,brother:.114}:kind==='medium'?{player:.125,sister:.115,brother:.12}:kind==='duo'?{player:.155,sister:.155,brother:.18}:{player:index===3?.23:.115,sister:.22,brother:.115};
 const specs={};
 for(const id of cast){const r=regions[id],f=r.face,ratio=f[2]/f[3];const hair=kind==='close'&&id===lead?.16:kind==='duo'?.26:(f[1]-65)/f[3];const maxFaceHeight=Math.max(1,safeHeight-8)/(1+hair+.08);const faceHeight=Math.min(width*desired[id]/ratio,maxFaceHeight);specs[id]={faceHeight,faceWidth:faceHeight*ratio,hair};}
 const avg=cast.reduce((s,id)=>s+specs[id].faceWidth,0)/cast.length;
 const spacing=Math.min(width*(cast.length===3?.235:.35),avg*(cast.length===3?1.85:2.12));
 const centers=kind==='close'?(lead==='player'?{player:width*.44,brother:width*1.04}:{sister:width*.45,brother:width*1.04}):cast.length===3?{player:width*.5-spacing,sister:width*.5,brother:width*.5+spacing}:{[cast[0]]:width*.5-spacing/2,[cast[1]]:width*.5+spacing/2};
 const actors=cast.map(id=>{const r=regions[id],f=r.face,s=specs[id];const height=s.faceHeight*r.crop[3]/f[3],spriteWidth=height*r.crop[2]/r.crop[3];const x=centers[id]-(f[0]-r.crop[0]+f[2]/2)/r.crop[2]*spriteWidth;const faceTop=actorTop+4+s.hair*s.faceHeight;const y=faceTop-f[1]/r.crop[3]*height;return{id,x,y,width:spriteWidth,height,face:{id,left:centers[id]-s.faceWidth/2,top:faceTop,right:centers[id]+s.faceWidth/2,bottom:faceTop+s.faceHeight}};});
 return{kind,name:kind==='ensemble'?'三人中景':kind==='medium'?'三人近中景':kind==='duo'?'衝突雙人':lead==='player'?'主角特寫':'妹妹特寫',backgroundZoom:kind==='close'?1.3:kind==='duo'?1.2:1.1,actors};
}
