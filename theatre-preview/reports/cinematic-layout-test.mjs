import {chromium} from 'playwright-core';
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',headless:true});
const base=process.env.URL_BASE||'http://127.0.0.1:4185/theatre-preview/';
const results=[];
for(const [width,height] of [[1440,900],[820,1180],[390,844],[320,568]])for(const scale of ['1','1.25','1.5']){
 const page=await browser.newPage({viewport:{width,height}});const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto(base);await page.locator('[data-overlay=menu]').click();await page.locator(`[data-scale="${scale}"]`).click();await page.locator('[data-action=typing]').click();await page.keyboard.press('Escape');await page.locator('#start-button').click();let choices=0,steps=0;
 while(await page.locator('#ending-review').count()===0){if(++steps>200)throw Error('stuck');
 if(await page.locator('[data-choice]').count()){choices++;await page.locator('[data-choice]').first().click();}else await page.locator('#next-button').click();
 const dims=await page.evaluate(()=>({w:innerWidth,sw:document.documentElement.scrollWidth,buttons:[...document.querySelectorAll('.reader-footer button')].map(e=>({top:e.getBoundingClientRect().top,bottom:e.getBoundingClientRect().bottom}))}));if(dims.sw>dims.w+1||dims.buttons.some(b=>b.bottom>height+1||b.top<0))throw Error(JSON.stringify({width,height,scale,dims}));
 if(steps===1&&scale==='1'&&width!==320)await page.screenshot({path:`theatre-preview/screenshots/a-integrated-${width}.png`});
 }
 if(choices!==6||errors.length)throw Error(JSON.stringify({choices,errors}));await page.locator('#ending-review').click();await page.keyboard.press('Escape');await page.locator('[data-overlay=restart]').click();await page.locator('[data-action=restart]').click();if(!(await page.locator('#next-button').count()))throw Error('restart');results.push({width,height,scale,choices,steps,pass:true});await page.close();
}
await browser.close();console.log(JSON.stringify(results,null,2));
