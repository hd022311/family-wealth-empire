import {Transport,BEATS,beatAt,shotAt,DURATION,OPTIONS,CHARACTERS} from './scene.mjs';
import {Renderer} from './renderer.mjs';
const $=id=>document.getElementById(id),screen=$('screen'),picture=document.querySelector('.picture'),transport=new Transport(),renderer=new Renderer($('stage')),media=matchMedia('(prefers-reduced-motion: reduce)');
let ready=false,raf=null,lastDraw=-Infinity,reduced=false,userReduced=false,portrait=innerHeight>innerWidth,previousMode='',captionKey='',pausedByVisibility=false,manualStep=false;
const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function cancelFrame(){if(raf!==null)cancelAnimationFrame(raf);raf=null;}
function pause(){transport.pause();cancelFrame();render();}
function applyMotion(){reduced=userReduced||media.matches;document.body.classList.toggle('reduced',reduced);$('motion').textContent=media.matches?'減少動態：依系統啟用':`減少動態：${userReduced?'開啟':'關閉'}`;$('motion').disabled=media.matches;$('motion').setAttribute('aria-pressed',String(reduced));$('system-motion').hidden=!media.matches;render();}
function sceneText(elapsed){const b=beatAt(elapsed);return {speaker:CHARACTERS[b.speaker].name,text:transport.running&&elapsed-b.start<b.delay?'……':b.text};}
function updateText(elapsed){const result=OPTIONS.find(o=>o.id===transport.choice),text=transport.mode==='result'?{speaker:CHARACTERS[result.actor].name,text:result.response}:sceneText(elapsed),key=JSON.stringify(text);if(key!==captionKey){$('speaker').textContent=text.speaker;$('line-space').textContent=transport.mode==='result'?text.text:beatAt(elapsed).text;$('line').textContent=text.text;captionKey=key;}}
function render(){if(!ready)return;const elapsed=transport.tick(),mode=transport.mode;screen.classList.toggle('choice-mode',mode==='choice');screen.classList.toggle('result-mode',mode==='result');$('reading').hidden=mode==='choice';$('controls').hidden=mode==='choice';$('decision').hidden=mode!=='choice';
 if(previousMode!==mode){previousMode=mode;if(mode==='choice'){
 $('options').innerHTML=OPTIONS.map((o,i)=>`<button class="option" data-option="${o.id}" aria-pressed="false"><b aria-hidden="true">${['A','B','C'][i]}</b><span><strong>${escape(o.title)}</strong><span class="hint">${escape(o.hint)}</span></span></button>`).join('');$('choice-status').textContent='請先選擇 A、B 或 C。';$('confirm').disabled=true;requestAnimationFrame(()=>document.querySelector('#decision h1').focus());}
 }
 if(mode==='choice'){for(const b of $('options').querySelectorAll('button'))b.setAttribute('aria-pressed',String(b.dataset.option===transport.draft));$('confirm').disabled=!transport.draft;if(transport.draft)$('choice-status').textContent=`已選 ${['A','B','C'][OPTIONS.findIndex(o=>o.id===transport.draft)]}，請確認。`;}
 updateText(elapsed);$('play').textContent=transport.running?'暫停演出':transport.elapsed>0&&mode==='scene'?'繼續演出':'播放演出';$('play').disabled=mode==='result';$('next').textContent=mode==='result'?'再看一次':'下一句';$('next').disabled=false;$('paused').hidden=transport.running||mode!=='scene'||elapsed===0;$('time').textContent=`00:${String(Math.floor(elapsed/1000)).padStart(2,'0')}／00:42`;
 const result=mode==='result'?OPTIONS.find(o=>o.id===transport.choice):null;let artTime=manualStep&&mode==='scene'?Math.min(beatAt(elapsed).start+2000,DURATION-1):elapsed;if(result)artTime=BEATS[{listen:4,clarify:5,break:6}[result.id]].start+2000;const shot=renderer.draw(artTime,portrait,reduced,result?.actor);$('shot-label').textContent=`${portrait?'直向':'橫向'}・${shot.name}`;$('stage').setAttribute('aria-label',`${shot.name}，${shot.cast.map(id=>CHARACTERS[id].name).join('、')}同框。人物概念素材，非正式美術。`);
}
function frame(now){raf=null;if(!transport.running)return;if(now-lastDraw>=(reduced?200:1000/30)){render();lastDraw=now;}if(transport.running)raf=requestAnimationFrame(frame);}
function start(){if(!ready||$('settings').open||transport.mode!=='scene')return;manualStep=false;transport.play();pausedByVisibility=false;render();if(raf===null)raf=requestAnimationFrame(frame);}
function resize(){portrait=matchMedia('(orientation: portrait)').matches;screen.dataset.orientation=portrait?'portrait':'landscape';const r=picture.getBoundingClientRect();renderer.resize(r.width,r.height,devicePixelRatio);render();}
$('play').addEventListener('click',e=>{if(e.detail>1||!ready)return;transport.running?pause():start();});
$('next').addEventListener('click',e=>{if(!ready||(transport.mode==='result'&&e.detail>1))return;cancelFrame();if(transport.mode==='result'){transport.restart();manualStep=false;}else{transport.next();manualStep=true;}render();});
$('settings-open').addEventListener('click',()=>{if(!ready)return;pause();$('settings').showModal();});
$('settings-close').addEventListener('click',()=>$('settings').close());
$('settings').addEventListener('click',e=>{const b=e.target.closest('button');if(b?.dataset.scale){screen.style.setProperty('--scale',b.dataset.scale);for(const n of document.querySelectorAll('[data-scale]'))n.setAttribute('aria-pressed',String(n===b));resize();}});
$('motion').addEventListener('click',()=>{userReduced=!userReduced;applyMotion();});
$('restart').addEventListener('click',()=>{cancelFrame();transport.restart();manualStep=false;$('settings').close();captionKey='';render();});
$('options').addEventListener('click',e=>{const b=e.target.closest('button');if(!b||!b.isConnected||e.detail>1||$('settings').open)return;transport.select(b.dataset.option);render();});
$('confirm').addEventListener('click',e=>{if(e.detail>1||$('confirm').disabled||$('settings').open)return;if(transport.confirm())render();});
media.addEventListener('change',applyMotion);
document.addEventListener('visibilitychange',()=>{if(document.hidden&&transport.running){pausedByVisibility=true;pause();}});
const observer=new ResizeObserver(resize);observer.observe(picture);window.addEventListener('resize',resize);
// Read-only diagnostics for reproducible acceptance. No persistence or game-state access.
Object.defineProperty(window,'__dualStage',{value:{snapshot:()=>({...transport.snapshot(),portrait,reduced,frames:renderer.frames,ready,pausedByVisibility,faces:renderer.faces||[],picture:{width:renderer.width,height:renderer.height},shot:(renderer.lastShot||shotAt(transport.time(),portrait)).name,beat:beatAt(transport.time()).id})}});
try{await renderer.load();ready=true;$('loading').hidden=true;for(const id of ['settings-open','play','next'])$(id).disabled=false;applyMotion();resize();}catch{$('loading').textContent='概念素材載入失敗。請重新整理；本場景不會修改任何存檔。';}
