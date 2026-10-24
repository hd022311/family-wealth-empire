import { settings, closeSettings, account, home, showCity } from '../ui-helpers';
import {test,expect} from '@playwright/test';
test('公開子路徑版本：兩章、資源、手機操作、本機續玩與模式隔離',async({page,baseURL},info)=>{
 const errors:string[]=[],badAssets:string[]=[];page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.url().startsWith(new URL(baseURL!).origin)&&r.status()>=400)badAssets.push(r.url()+' '+r.status());});
 await page.goto(baseURL!);await settings(page);await expect(page.getByText('開發測試版 · 本機存檔模式',{exact:true})).toBeVisible();await closeSettings(page);await page.getByRole('button',{name:'開始劇情人生',exact:true}).click();await expect(page.locator('canvas')).toBeVisible();
 const current=()=>page.evaluate(()=>{const l=JSON.parse(localStorage.getItem('fwe-library-v1')!);return l.slots.find((s:any)=>s.id===l.active).state;});
 const go=async(name:string)=>page.getByRole('navigation',{name:'城市場所'}).getByRole('button',{name,exact:true}).click();
 const location=page.getByRole('region',{name:'劇情場所互動'});
 await go('父母自住房');await location.getByRole('button',{name:'陪伴林建國 · $1,200 / 4h',exact:true}).click();await go('住宅區');await location.getByRole('button',{name:'陪伴林知夏 · $1,200 / 4h',exact:true}).click();await location.getByRole('button',{name:'陪伴林晨 · $1,200 / 4h',exact:true}).click();
 await go('父母出租房');await location.getByRole('button',{name:'整理出租屋近況 · 2h',exact:true}).click();await page.getByRole('button',{name:'結算一個月並繼續人生',exact:true}).click();expect((await current()).world.paid).toBe(1);
 await go('父母自住房');await location.getByRole('button',{name:'陪父親健檢 · $3,000 / 4h',exact:true}).click();await page.getByRole('button',{name:'安排家庭共同照顧',exact:true}).click();expect((await current()).story.episode.responses).toHaveLength(2);
 for(let i=0;i<3;i++)await page.getByRole('button',{name:'結算一個月並繼續人生',exact:true}).click();await expect(page.getByText(/本階段追蹤完成，繼續自由經營/)).toBeVisible();
 await page.getByRole('button',{name:'股票',exact:true}).click();await page.getByRole('button',{name:'買 100 股',exact:true}).first().click();await page.getByRole('button',{name:'房產',exact:true}).click();await page.getByRole('button',{name:/購入 · 頭期款/}).click();await page.getByRole('button',{name:'出租收租',exact:true}).click();
 const saved=await current();await page.reload();await expect(page.locator('canvas')).toBeVisible();expect(await current()).toEqual(saved);
 await page.evaluate(async()=>{const registration=await navigator.serviceWorker.ready;if(!registration.active?.scriptURL.includes('/family-wealth-empire/sw.js'))throw Error('Service worker not scoped to project');});
 if(!process.env.PAGES_TEST_URL){await page.context().setOffline(true);await page.reload();await expect(page.locator('canvas')).toBeVisible();expect(await current()).toEqual(saved);await page.context().setOffline(false);}
 await home(page);await page.getByRole('button',{name:/自由模式.*自訂背景/}).click();await page.getByRole('button',{name:'開始自由人生',exact:true}).click();await expect(page.getByRole('heading',{name:'自由人生 · 自己決定方向'})).toBeVisible();expect((await current()).story).toBeUndefined();
 await page.evaluate(()=>{const l=JSON.parse(localStorage.getItem('fwe-library-v1')!);if(l.slots.length!==2)throw Error('Mode save isolation failed');});
 await showCity(page);await page.locator('canvas').scrollIntoViewIfNeeded();await page.screenshot({path:info.outputPath('public-pages-'+info.project.name+'.png')});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);expect(errors).toEqual([]);expect(badAssets).toEqual([]);
});
