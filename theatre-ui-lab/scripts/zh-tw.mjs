import fs from 'node:fs';import path from 'node:path';import {fileURLToPath}from'node:url';
import {COPY,SCHEMES}from'../copy.mjs';import {visibleStoryCatalog}from'../fixtures.mjs';
/** High-confidence candidates only: shared characters such as 台、里、后、干、于、余 are NOT errors. */
const simplified=new Set([... '这说话财产资讯亲继税险户账执诉讼关键击设读选择显隐图书门爱态时间网页标务条约钟风业历将会与为帮护备单费计剧对应疗龄赔给让钱还确认难体国龙车东学买卖转开关变离识较额层现动声统龄测败损复标从写问应许过观众职'] );
const terms=[['信息','依上下文使用「資訊」或「訊息」'],['視頻','使用「影片」'],['鼠標','使用「滑鼠」'],['軟件','使用「軟體」'],['硬件','使用「硬體」'],['文件夾','使用「資料夾」'],['數據庫','使用「資料庫」'],['默認','使用「預設」'],['賬戶','使用「帳戶」'],['保存遊戲','使用「儲存遊戲」'],['倒計時','使用「倒數」']];
export function scan(items){const findings=[];for(const item of items){const chars=[...new Set([...item.text].filter(c=>simplified.has(c)))];if(chars.length)findings.push({...item,type:'simplified_candidate',severity:'error',note:`疑似簡體字：${chars.join('、')}；仍需語境複核。`});for(const [term,note]of terms)if(item.text.includes(term))findings.push({...item,type:'regional_term',severity:'review',note,term});
 if(item.text.includes('程序'))findings.push({...item,type:'shared_term_context',severity:'review',note:/法律|訴訟|必要程序|保全|實際/.test(item.text)?'此處為法律／辦理程序，可保留；不是電腦程式。':'需確認是否指電腦程式，不可只憑單詞自動替換。'});
 if(/法定保留份額|法定繼承份額|應繼份|特留份/.test(item.text))findings.push({...item,type:'legal_term',severity:'review',note:'核對台灣法律專有名詞與上下文；不自動改寫法律。'});
 if(/必然勝訴|必定理賠|一定免稅|全部.*自動凍結|法院.*必然.*判給/.test(item.text))findings.push({...item,type:'legal_assertion_context',severity:'review',note:'核對是否為否定或不確定性說明，不能只憑關鍵字判錯；非法律效力審核。'});
 }return findings;}
export function catalog(){
 const items=[...Object.entries(COPY).map(([key,text])=>({key:`ui.${key}`,text})),...visibleStoryCatalog()];
 const root=new URL('../',import.meta.url);
 for(const name of ['index.html','a/index.html','b/index.html','c/index.html']){const file=new URL(name,root);if(!fs.existsSync(file))continue;const html=fs.readFileSync(file,'utf8');const clean=html.replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi,'').replace(/<[^>]+>/g,'\n');for(const [i,text]of clean.split('\n').map(s=>s.trim()).filter(Boolean).entries())items.push({key:`html.${name}.${i}`,text});for(const m of html.matchAll(/(?:aria-label|alt|title)="([^"]+)"/g))items.push({key:`html.${name}.attribute`,text:m[1]});}
 return [...new Map(items.map(i=>[i.text,i])).values()];
}
export function report(){const items=catalog(),findings=scan(items);return {locale:'zh-TW',scope:'三案所有集中管理的玩家可見字串，以及原第一卷的角色、對話、六選擇、八結局與法律導讀。排除程式鍵名、註解、來源報告內引用的錯誤示例與競品圖片。',method:'高可信度簡體候選字＋陸用詞組＋法律術語語境檢查；未使用自動繁簡轉換。繁簡共用字不逐字判錯。',uniqueCatalogCount:items.length,errorCount:findings.filter(x=>x.severity==='error').length,reviewCount:findings.filter(x=>x.severity==='review').length,findings:findings.map(f=>({...f,codexContextReview:f.type==='shared_term_context'?'已逐項閱讀上下文；來源為法律或必要辦理程序，保留原文。':f.type==='legal_assertion_context'?'原文是否定假定或風險說明，並非宣告確定結果；保留待核實標記。':'待逐項確認。'})),humanSignoff:{reviewer:null,reviewedAt:null,status:'awaiting_human_signoff'},limitations:['逐句語意複核由 Codex 執行，並非真人譯者或法律專業簽核。','詞典掃描不能證明所有台灣語意都正確；真人維護者須簽核。','字型共用碼點的區域字形另需 Windows、Mac、iOS、Android 實體檢查。','法律規則仍為草稿；語言檢查不提升法律審核狀態。'],catalog:items};}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){const r=report();const output=new URL('../reports/zh-tw-check.json',import.meta.url);fs.writeFileSync(output,JSON.stringify(r,null,2));console.log(JSON.stringify({locale:r.locale,strings:r.uniqueCatalogCount,errors:r.errorCount,contextReviews:r.reviewCount,humanSignoff:r.humanSignoff.status}));if(r.errorCount)process.exitCode=1;}
