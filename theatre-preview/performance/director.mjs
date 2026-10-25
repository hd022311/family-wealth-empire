import{FACE_POSES,blendFace,paintFace}from'./faces.mjs';
import{RehearsalClock}from'./clock.mjs';
/** Bounded character cues. Nothing repeats at idle; raf exists only during a finite morph. */
export class ActingDirector{
 constructor(rigs){this.rigs=rigs;this.clocks=new Set();this.animations=new Set();this.tweens=new Set();this.raf=null;this.paused=false;this.reduced=false;this.last=0;}
 after(ms,fn){const clock=new RehearsalClock();this.clocks.add(clock);clock.arm(ms,()=>{this.clocks.delete(clock);fn();});if(this.paused)clock.pause();return clock;}
 tween(duration,update){if(this.reduced){update(1);return;}this.tweens.add({elapsed:0,duration,update});this.ensureFrame();}
 ensureFrame(){if(this.raf!==null||this.paused||!this.tweens.size)return;this.last=performance.now();this.raf=requestAnimationFrame(time=>this.frame(time));}
 frame(time){this.raf=null;const delta=Math.max(0,time-this.last);this.last=time;for(const t of this.tweens){t.elapsed+=delta;const p=Math.min(1,t.elapsed/t.duration);t.update(p*p*(3-2*p));if(p>=1)this.tweens.delete(t);}if(this.tweens.size&&!this.paused)this.raf=requestAnimationFrame(t=>this.frame(t));}
 animate(el,frames,duration,fill='forwards'){if(this.reduced||!el){if(fill==='forwards'&&el)Object.assign(el.style,frames.at(-1));return;}const a=el.animate(frames,{duration,easing:'cubic-bezier(.25,.6,.25,1)',fill,iterations:1});this.animations.add(a);a.onfinish=()=>{if(fill==='forwards'){try{a.commitStyles();}catch{Object.assign(el.style,frames.at(-1));}a.cancel();}this.animations.delete(a);};if(this.paused)a.pause();}
 expression(id,name,ms=900){const el=this.rigs[id];const from=structuredClone(el._facePose||FACE_POSES.calm);el.dataset.expression=name;el.setAttribute('aria-label',`${el.getAttribute('aria-label').split('，')[0]}，${({calm:'平靜',happy:'開心',angry:'憤怒',sad:'悲傷',shocked:'震驚',skeptical:'懷疑'})[name]}，分層向量佔位立繪`);this.tween(ms,t=>paintFace(el,blendFace(from,FACE_POSES[name],t)));}
 gaze(id,x,y){const el=this.rigs[id];el.querySelectorAll('.iris,.pupil').forEach(p=>{this.animate(p,[{transform:p.style.transform||'translate(0px,0px)'},{transform:`translate(${x}px,${y}px)`}],540);});}
 posture(id,head,shoulder){const el=this.rigs[id],h=el.querySelector('.rig-head'),b=el.querySelector('.rig-body');this.animate(h,[{transform:h.style.transform||'rotate(0deg)'},{transform:`rotate(${head}deg)`}],1000);this.animate(b,[{transform:b.style.transform||'translateY(0px)'},{transform:`translateY(${shoulder}px)`}],1350);}
 blink(id){if(this.reduced)return;const el=this.rigs[id];this.animate(el.querySelector('.rig-eyes'),[{transform:'scaleY(1)'},{transform:'scaleY(.08)',offset:.43},{transform:'scaleY(1)'}],190,'none');this.animate(el.querySelector('.rig-lids'),[{opacity:0},{opacity:1,offset:.43},{opacity:0}],190,'none');}
 breath(id,amount){if(this.reduced)return;const body=this.rigs[id].querySelector('.rig-body');const rest=body.style.transform||'translateY(0px)';this.animate(body,[{transform:rest},{transform:`translateY(${-amount}px)`,offset:.42},{transform:rest}],2500,'none');}
 lip(id,amount){if(this.reduced||this.paused||!id)return;for(const el of Object.values(this.rigs))if(el!==this.rigs[id])el.style.setProperty('--lip-open','0');const el=this.rigs[id];el.style.setProperty('--lip-open',String(amount));el.classList.toggle('voicing',amount>0);}
 closeMouth(){for(const el of Object.values(this.rigs)){el.style.setProperty('--lip-open','0');el.classList.remove('voicing');}}
 pause(){if(this.paused)return;this.paused=true;for(const c of this.clocks)c.pause();for(const a of this.animations)a.pause();if(this.raf!==null)cancelAnimationFrame(this.raf);this.raf=null;this.closeMouth();}
 resume(){if(!this.paused)return;this.paused=false;for(const c of this.clocks)c.resume();for(const a of this.animations)a.play();this.ensureFrame();}
 cancel(){for(const c of this.clocks)c.cancel();this.clocks.clear();for(const a of this.animations)a.cancel();this.animations.clear();this.tweens.clear();if(this.raf!==null)cancelAnimationFrame(this.raf);this.raf=null;this.closeMouth();}
 setReduced(value){if(value===this.reduced)return;this.reduced=value;if(value){for(const t of this.tweens)t.update(1);this.cancel();for(const el of Object.values(this.rigs))for(const p of el.querySelectorAll('.rig-head,.rig-body,.iris,.pupil,.rig-eyes,.rig-lids'))p.style.removeProperty('transform');}}
}
