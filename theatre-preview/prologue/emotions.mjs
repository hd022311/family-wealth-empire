/** Subtitle-only finite effects. No timers, transport, storage, canvas or branch access. */
export const EMOTIONS=Object.freeze({
 calm:{label:'平靜',duration:0},
 anger:{label:'憤怒',duration:180},
 surprise:{label:'震驚',duration:340,pause:150},
 sadness:{label:'悲傷',duration:460,pause:120},
 whisper:{label:'低語',duration:240},
 firm:{label:'堅定',duration:280},
});
// Only these three existing lines are staged. All other lines stay calm.
export const CUE_EMOTIONS=Object.freeze({'unseen-years':'anger','not-only-houses':'sadness','new-year-table':'firm'});
export function emotionFor(id){return CUE_EMOTIONS[id]||'calm';}
export function framesFor(emotion){switch(emotion){
 case 'anger':return [{transform:'translateX(0)'},{transform:'translateX(-2.5px)'},{transform:'translateX(2px)'},{transform:'translateX(-1px)'},{transform:'translateX(0)'}];
 case 'surprise':return [{opacity:0,transform:'translateY(0)',offset:0},{opacity:0,transform:'translateY(0)',offset:150/340},{opacity:1,transform:'translateY(-1px)',offset:.8},{opacity:1,transform:'translateY(0)',offset:1}];
 case 'sadness':return [{opacity:.92,offset:0},{opacity:.92,offset:120/460},{opacity:1,offset:1}];
 case 'whisper':return [{textShadow:'0 2px 3px #000,0 0 7px #000'},{textShadow:'0 2px 3px #000,0 0 7px #000,0 0 9px #cbdde144'},{textShadow:'0 2px 3px #000,0 0 7px #000'}];
 case 'firm':return [{textShadow:'0 2px 3px #000,0 0 7px #000'},{textShadow:'0 2px 3px #000,0 0 5px #eef5ff99'},{textShadow:'0 2px 3px #000,0 0 7px #000'}];
 default:return [];
}}
export class EmotionalCaption{
 constructor(container,surface,text){this.container=container;this.surface=surface;this.text=text;this.animations=[];this.key=null;this.plays=0;this.enabled=false;this.emotion='calm';}
 cancel(){for(const a of this.animations)a.cancel();this.animations=[];}
 reset(){this.cancel();this.key=null;}
 update(key,emotion='calm',enabled=true){this.enabled=enabled;this.emotion=EMOTIONS[emotion]?emotion:'calm';if(!enabled){this.cancel();this.key=key;return;}if(key===this.key)return;this.cancel();this.key=key;const frames=framesFor(this.emotion);if(!frames.length||!this.container.animate)return;this.plays++;
 const target=this.emotion==='firm'||this.emotion==='whisper'?this.text:this.container;
 this.animations.push(target.animate(frames,{duration:EMOTIONS[this.emotion].duration,easing:'ease-out',iterations:1,fill:'none'}));
 if(this.emotion==='anger')this.animations.push(this.surface.animate([{boxShadow:'inset 0 -2px #d16b5c00'},{boxShadow:'inset 0 -2px #d16b5caa'},{boxShadow:'inset 0 -2px #d16b5c00'}],{duration:180,easing:'ease-out',iterations:1,fill:'none'}));
 }
 snapshot(){return {emotion:this.emotion,enabled:this.enabled,plays:this.plays,active:this.animations.filter(a=>a.playState==='running').length};}
}
