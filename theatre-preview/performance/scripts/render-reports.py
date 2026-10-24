from pathlib import Path
import re,html
base=Path(__file__).resolve().parents[1]/'reports'
def inline(s):
 s=html.escape(s)
 s=re.sub(r'`([^`]+)`',r'<code>\1</code>',s)
 s=re.sub(r'\*\*([^*]+)\*\*',r'<strong>\1</strong>',s)
 return s
for name in ['TECHNICAL','ACCEPTANCE']:
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
 title='動態演出・'+('技術與素材規格' if name=='TECHNICAL' else '驗收紀錄')
 page='<!doctype html><html lang="zh-TW"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>'+title+'</title><style>*{box-sizing:border-box}body{margin:0;background:#102726;color:#fff4de;font:18px/1.9 "Noto Sans TC","PingFang TC","Microsoft JhengHei",sans-serif}main{max-width:1080px;margin:auto;padding:26px 22px}h1{font-size:1.7em}h2{font-size:1.35em;margin-top:38px;color:#e8d3a6}h3{font-size:1.1em;margin-top:28px}a{color:#eed6a1;min-height:48px;display:inline-block;padding:10px 0;margin-right:24px}code{overflow-wrap:anywhere}.table-scroll{overflow:auto}table{border-collapse:collapse;min-width:650px;width:100%}td{padding:12px;border-bottom:1px solid #80978466;vertical-align:top}tr:first-child{background:#2b4540;color:#efd6a0}p{overflow-wrap:anywhere}strong{color:#ffdfac}</style></head><body><main><nav><a href="../">返回演出測試</a><a href="../review.html">影片與畫面</a><a href="'+('ACCEPTANCE' if name=='TECHNICAL' else 'TECHNICAL')+'.html">'+('驗收紀錄' if name=='TECHNICAL' else '技術與素材規格')+'</a></nav>'+''.join(out)+'</main></body></html>'
 (base/(name+'.html')).write_text(page)
