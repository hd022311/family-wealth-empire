import {CUES,DURATION,KEY,CARE,CAST,state,validate,next,skipRead,select,confirm,replay} from './scene.mjs';
import {reaction} from '../story.mjs';
import {PrologueRenderer} from './renderer.mjs';
const $=id=>document.getElementById(id),screen=$('screen'),renderer=new PrologueRenderer($('stage')),os=matchMedia('(prefers-reduced-motion: reduce)');
let s=state(),blocked=false,ready=false,running=false,offset=0,anchor=0,raf=null,lastFrame=0,portrait=false;
try{const raw=localStorage.getItem(KEY);if(raw!==null)s=validate(JSON.parse(raw));}catch{blocked=true;$('save-note').textContent='前言紀錄無法讀取，暫以不覆寫模式觀看；原資料保持不變。';}
function save(){if(blocked)return;try{localStorage.setItem(KEY,JSON.stringify(s));$('save-note').textContent='僅保存本前言的已讀與閱讀位置，不影響正式存檔。';}catch{$('save-note').textContent='裝置無法儲存前言紀錄；仍可繼續觀看，關閉後可能無法續讀。';}}
function localTime(){return Math.min(CUES[s.index].seconds*1000,offset+(running?performance.now()-anchor:0));}
function stop(){if(running)offset=localTime();running=false;if(raf!==null)cancelAnimationFrame(raf);raf=null;}
function pause(){stop();render();}
function move(){if(next(s)){offset=0;save();}}
function tick(now){raf=null;if(!running)return;if(localTime()>=CUES[s.index].seconds*1000){move();anchor=now;if(s.mode!=='scene'){stop();offset=0;render();return;}}if(now-lastFrame>=(s.reduced||os.matches?200:1000/24)){render();lastFrame=now;}if(running)raf=requestAnimationFrame(tick);}
function play(){if(!ready||s.mode!=='scene'||running||document.querySelector('dialog[open]'))return;anchor=performance.now();running=true;render();raf=requestAnimationFrame(tick);}
function render(){if(!ready)return;portrait=matchMedia('(orientation:portrait)').matches;screen.dataset.orientation=portrait?'portrait':'landscape';screen.style.setProperty('--scale',s.scale);for(const d of document.querySelectorAll('dialog'))d.style.setProperty('--scale',s.scale);const c=CUES[s.index];
 $('caption').hidden=s.mode!=='scene';$('reading-controls').hidden=s.mode!=='scene';$('decision').hidden=s.mode!=='choice';$('result').hidden=s.mode!=='result';
 $('era').textContent=s.index<2?'2029年8月・那些沒說清楚的事':s.index===2?'三年前・2026年4月26日':s.index<14?'2026年4月26日・同一張餐桌':'2026年5月18日・準備出院';
 $('name').textContent=c.speaker?`${CAST[c.speaker].name}（${{father:'父親',mother:'母親',brother:'哥哥',sister:'妹妹',spouse:'配偶',player:'主角'}[c.speaker]}）`:'那一天';$('text').textContent=c.text;
 $('progress').textContent=`${String(Math.floor((CUES.slice(0,s.index).reduce((n,c)=>n+c.seconds*1000,0)+localTime())/1000)).padStart(2,'0')}／82秒`;
 $('full').hidden=$('text').scrollHeight<=$('text').clientHeight+1;$('auto').textContent=running?'Ⅱ':'▷';$('auto').setAttribute('aria-label',running?'暫停演出':'自動播放前言');$('auto').title=running?'暫停演出':'自動播放前言';$('auto').disabled=s.mode!=='scene';
 for(const b of document.querySelectorAll('[data-scale]'))b.setAttribute('aria-pressed',String(Number(b.dataset.scale)===s.scale));$('motion').textContent=os.matches?'減少動態：依系統啟用':`減少動態：${s.reduced?'開啟':'關閉'}`;$('motion').disabled=os.matches;document.body.classList.toggle('reduced',s.reduced||os.matches);
 if(s.mode==='choice'){for(const b of $('options').querySelectorAll('button'))b.setAttribute('aria-pressed',String(b.dataset.id===s.draft));$('confirm').disabled=!s.draft;$('draft-label').textContent=s.draft?`已選 ${['A','B','C'][CARE.options.findIndex(o=>o.id===s.draft)]}，請確認。`:'先選擇，再確認。';}
 if(s.mode==='result'){$('response').textContent=reaction({choices:{care:s.choice}},0)[0].lines.join('\n');}
 const bounds=screen.getBoundingClientRect(),header=document.querySelector('header').getBoundingClientRect();const top=header.bottom-bounds.top+2,bottom=s.mode==='scene'?$('caption').getBoundingClientRect().top-bounds.top-4:bounds.height*.64;renderer.draw(c,s.index,portrait,s.reduced||os.matches,{top,bottom},localTime()/1000);$('stage').setAttribute('aria-label',`${portrait?'直向':'橫向'}${c.shot==='group'?'多人中景':c.shot==='close'?'人物特寫':'雙人鏡頭'}；${renderer.cast.map(id=>CAST[id].name).join('、')}。候選素材演出。`);
}
function resize(){const r=screen.getBoundingClientRect();renderer.resize(r.width,r.height);render();}
$('options').replaceChildren(...CARE.options.map((o,i)=>{const b=document.createElement('button');b.className='option';b.dataset.id=o.id;b.setAttribute('aria-pressed','false');const mark=document.createElement('b');mark.textContent=['A','B','C'][i];const span=document.createElement('span');span.textContent=o.title;const small=document.createElement('small');small.textContent=o.hint;span.append(small);b.append(mark,span);return b;}));
$('auto').onclick=e=>{if(e.detail>1)return;running?pause():play();};$('next').onclick=e=>{if(!ready||s.mode!=='scene')return;stop();move();render();};
$('menu-open').onclick=()=>{pause();$('menu').showModal();};$('result-menu').onclick=()=>{$('menu').showModal();};$('menu-close').onclick=()=>$('menu').close();
$('full').onclick=()=>{pause();$('full-name').textContent=$('name').textContent;$('full-text').textContent=CUES[s.index].text;$('full-dialog').showModal();};$('full-close').onclick=()=>$('full-dialog').close();
for(const b of document.querySelectorAll('[data-scale]'))b.onclick=()=>{s.scale=Number(b.dataset.scale);save();resize();};$('motion').onclick=()=>{s.reduced=!s.reduced;save();render();};
$('skip').onclick=()=>{stop();const n=skipRead(s);offset=0;save();$('menu').close();render();$('save-note').textContent=n?'已略過已讀內容；停在未讀段落或照顧選擇。':'目前是未讀內容，請先閱讀。';};
function restart(event){if(event?.detail>1)return;stop();replay(s);offset=0;save();if($('menu').open)$('menu').close();render();}$('replay').onclick=restart;$('replay-result').onclick=restart;
$('options').onclick=e=>{const b=e.target.closest('button');if(!b||e.detail>1||!select(s,b.dataset.id))return;save();render();};$('confirm').onclick=e=>{if(e.detail>1||$('confirm').disabled)return;if(confirm(s)){save();render();}};
window.addEventListener('resize',resize);new ResizeObserver(resize).observe(screen);os.addEventListener('change',render);document.addEventListener('visibilitychange',()=>{if(document.hidden)pause();});
Object.defineProperty(window,'__prologue',{value:{snapshot:()=>({index:s.index,id:CUES[s.index].id,mode:s.mode,draft:s.draft,choice:s.choice,seen:[...s.seen],running,elapsed:localTime(),portrait,scale:s.scale,ready,faces:renderer.faces,cast:renderer.cast,frames:renderer.frames,key:KEY})}});
try{await renderer.load();ready=true;$('loading').hidden=true;for(const id of['auto','menu-open','next'])$(id).disabled=false;resize();}catch{$('loading').textContent='候選素材載入失敗，請重新整理。本預覽不影響任何正式存檔。';}
