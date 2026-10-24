import { settings, closeSettings, account, home } from './ui-helpers';
import { test, expect, type Page } from '@playwright/test';
async function layout(page: Page) {
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  const clipped = await page.locator('button, input:not([type=checkbox]), select, summary').evaluateAll(elements => elements.filter(el => {
    const e = el as HTMLElement;
    if (!e.getClientRects().length || e.closest('details:not([open])') && e.tagName !== 'SUMMARY') return false;
    return e.clientWidth > 0 && e.scrollWidth > e.clientWidth + 2;
  }).map(el => el.textContent?.slice(0,80)));
  expect(clipped).toEqual([]);
}
for (const size of ['100','125','150']) test(`易讀性 ${size}%：首頁、城市、劇情決策、財務、家族與存檔`, async ({ page }, info) => {
  await page.goto('./');
  await settings(page);
  await page.getByLabel('文字大小', {exact:true}).selectOption(size);
  await closeSettings(page);
  await expect(page.locator('html')).toHaveAttribute('data-text-size',size);
  expect(await page.locator('.start-screen p').first().evaluate(el=>parseFloat(getComputedStyle(el).fontSize))).toBeGreaterThanOrEqual(info.project.name === 'desktop' ? 18 : 16);
  await layout(page);
  await page.screenshot({path:`artifacts/readability/after-${info.project.name}-${size}-home.png`});
  await page.getByRole('button',{name:'開始劇情人生',exact:true}).click();
  await expect(page.locator('canvas')).toBeVisible();
  await layout(page);
  await page.locator('.map-panel').screenshot({path:`artifacts/readability/after-${info.project.name}-${size}-city.png`});
  await page.locator('.detail-panel').screenshot({path:`artifacts/readability/after-${info.project.name}-${size}-story.png`});
  await page.getByRole('navigation',{name:'城市場所'}).getByRole('button',{name:'父母自住房',exact:true}).click();
  await page.getByRole('button',{name:'陪父親健檢 · $3,000 / 4h',exact:true}).click();
  await page.getByRole('button',{name:'安排家庭共同照顧',exact:true}).click();
  await layout(page);
  await page.locator('.detail-panel').screenshot({path:`artifacts/readability/after-${info.project.name}-${size}-care.png`});
  for(const tab of ['房產','股票','帳本','家族']) {
    const button=page.getByRole('button',{name:tab,exact:true});
    if(await button.count()) {await button.click();await layout(page);}
  }
  await page.locator('.promise-story').getByText('家人近況 · 每個人都有自己的生活',{exact:true}).click();
  await layout(page);
  await settings(page);
  await page.getByRole('button',{name:'台灣法律',exact:false}).click();
  await expect(page.getByRole('dialog',{name:'台灣法律查詢中心',exact:true})).toBeVisible();
  await page.getByLabel('法律搜尋').fill('1138');
  await layout(page);
  await page.getByRole('button',{name:'關閉台灣法律',exact:true}).click();
  await closeSettings(page);
  await account(page);
  await layout(page);
  await page.reload();
  await settings(page);
  await expect(page.getByLabel('文字大小',{exact:true})).toHaveValue(size);
  await closeSettings(page);
  expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('fwe-library-v1')!).slots.every((s:any)=>s.state.version===4))).toBe(true);
  await layout(page);
  const savedStory = await page.evaluate(() => JSON.stringify(JSON.parse(localStorage.getItem('fwe-library-v1')!).slots[0].state));
  await home(page);
  await page.getByRole('button',{name:/自由模式.*自訂背景/}).click();
  await layout(page);
  await page.getByRole('button',{name:'開始自由人生',exact:true}).click();
  await layout(page);
  expect(await page.evaluate(() => JSON.stringify(JSON.parse(localStorage.getItem('fwe-library-v1')!).slots[0].state))).toBe(savedStory);
});
