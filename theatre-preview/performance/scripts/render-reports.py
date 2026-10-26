from pathlib import Path
import re,html
base=Path(__file__).resolve().parents[1]/'reports'
def inline(s):
 s=html.escape(s)
 s=re.sub(r'`([^`]+)`',r'<code>\1</code>',s)
 s=re.sub(r'\*\*([^*]+)\*\*',r'<strong>\1</strong>',s)
 return s
mainbase=base
for base,name,title in [(mainbase,'TECHNICAL','動態演出・前次技術紀錄'),(mainbase,'ACCEPTANCE','動態演出・前次驗收紀錄'),(mainbase,'NATURALNESS','自然度改善・技術比較與驗收'),(mainbase.parent/'art-samples'/'reports','ART_REVIEW','角色美術候選稿・一致性檢閱'),(mainbase.parent/'art-samples'/'male-pilot'/'reports','REVIEW','林家安・局部圖層樣機與驗收')]:
 lines=(base/(name+'.md')).read_text().splitlines();out=[];table=False
 for line in lines:
  if line.startswith('|'):
   cells=[c.strip() for c in line.strip('|').split('|')]
   if all(re.fullmatch('[-:]+',c) for c in cells):continue
   if not table:out.append('<div class="table-scroll" tabindex="0" aria-label="可左右捲動的比較表"><table>');table=True
   out.append('<tr>'+''.join('<td>'+inline(c)+'</td>' for c in cells)+'</tr>');continue
  if table:out.append('</table></div>');table=False
  if not line.strip():continue
  m=re.match(r'^(#{1,3}) (.*)',line)
  if m:out.append(f'<h{len(m[1])}>{inline(m[2])}</h{len(m[1])}>')
  else:out.append('<p>'+inline(line)+'</p>')
 if table:out.append('</table></div>')
 home='../' if base==mainbase else '../../../' if name=='REVIEW' else '../../'
 nav='<nav><a href="'+home+'">演出測試</a><a href="'+home+'review.html">美術與影片比較</a><a href="'+home+'reports/NATURALNESS.html">本輪技術評估</a><a href="'+home+'art-samples/">角色樣板</a></nav>'
 if name=='REVIEW':nav='<nav><a href="../">操作局部圖層樣機</a><a href="../../../review.html#male-pilot">角色與影片比較</a><a href="../assets/master.png">半身基準原圖</a></nav><p>實際瀏覽器錄影約14秒，含結尾；沒有音訊，未做全身骨架或音素對嘴。</p><video controls playsinline preload="none" poster="../screenshots/desktop-base.webp" style="width:100%;max-height:75dvh;background:#0b2027"><source src="../screenshots/male-pilot-14s.mp4" type="video/mp4"></video><a href="../screenshots/male-pilot-14s.mp4">直接開啟錄影</a><details><summary>手機實際畫面</summary><a href="../screenshots/mobile-closed.png"><img src="../screenshots/mobile-closed.webp" alt="林家安局部閉眼幀的手機實際畫面" style="max-width:390px;width:100%;height:auto" loading="lazy"></a></details>'+nav
 page='<!doctype html><html lang="zh-TW"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>'+title+'</title><style>*{box-sizing:border-box}body{margin:0;background:#102726;color:#fff4de;font:18px/1.9 "Noto Sans TC","PingFang TC","Microsoft JhengHei",sans-serif}main{max-width:1080px;margin:auto;padding:26px 22px}h1{font-size:1.7em}h2{font-size:1.35em;margin-top:38px;color:#e8d3a6}h3{font-size:1.1em;margin-top:28px}a{color:#eed6a1;min-height:48px;display:inline-block;padding:10px 0;margin-right:24px}code{overflow-wrap:anywhere}.table-scroll{overflow:auto}table{border-collapse:collapse;min-width:650px;width:100%}td{padding:12px;border-bottom:1px solid #80978466;vertical-align:top}tr:first-child{background:#2b4540;color:#efd6a0}p{overflow-wrap:anywhere}strong{color:#ffdfac}</style></head><body><main>'+nav+''.join(out)+'</main></body></html>'
 (base/(name+'.html')).write_text(page)
