import {subtitleText} from './subtitle-style.mjs?v=punctuation-1';
import {ENDINGS} from './story.mjs';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
/** Locked entries intentionally contain no ending name, story, criteria or reveal control. */
export function galleryBody(archive){
 const unlocked=new Set(archive.map(a=>a.ending));
 return `<section class="ending-collection" aria-label="第一卷結局收藏"><header class="collection-intro"><p class="collection-kicker">兩間房子的承諾</p><h3>每一次選擇，都留下另一種人生。</h3><p>已收藏 ${unlocked.size}／8 種結局。未讀篇章不透露名稱與內容。</p></header><div class="ending-shelf">${ENDINGS.map((e,i)=>{
 const number=String(i+1).padStart(2,'0');
 if(!unlocked.has(e.id))return `<article class="ending-leaf is-locked" aria-label="篇章 ${number}・尚未讀過"><span class="leaf-number" aria-hidden="true">${number}</span><div class="leaf-motif" aria-hidden="true">◇</div><h4>尚未讀過</h4><p>留給下一次選擇的故事。</p></article>`;
 return `<details class="ending-leaf is-collected"><summary><span class="leaf-number" aria-hidden="true">${number}</span><span class="leaf-state">已收藏</span><h4>${esc(e.title)}</h4><span class="leaf-open">翻閱這一頁 <span aria-hidden="true">↗</span></span></summary><div class="leaf-story">${e.story.map(s=>`<p>${esc(subtitleText(s))}</p>`).join('')}<p class="leaf-caption">${esc(e.objective)}</p><p class="leaf-caption">敘事結果；法律效果仍待核實。</p></div></details>`;
 }).join('')}</div><p class="collection-note">收藏保存在此瀏覽器，清除網站資料會遺失；沒有雲端同步。</p><details class="collection-history"><summary>翻閱歷次人生（${archive.length}輪）</summary>${archive.slice().reverse().map(a=>`<p>${esc(a.date?.slice(0,10)||'')}・${esc(ENDINGS.find(e=>e.id===a.ending)?.title||'')}<br>生活預備金 $${Number(a.cash).toLocaleString()}（虛構支出後餘額）</p>`).join('')||'<p>尚無完成紀錄。先讀完屬於你的第一段人生。</p>'}</details></section>`;
}
