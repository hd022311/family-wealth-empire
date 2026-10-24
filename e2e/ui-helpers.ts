import { expect, type Page } from '@playwright/test';
export async function settings(page:Page) {
 const dialog=page.getByRole('dialog',{name:'設定與存檔',exact:true});
 if(!await dialog.isVisible()) {
  const inGame=page.getByRole('button',{name:'設定',exact:true});
  await (await inGame.isVisible()?inGame:page.getByRole('button',{name:'設定與存檔',exact:true})).click();
 }
 await expect(dialog).toBeVisible();return dialog;
}
export async function closeSettings(page:Page) { await page.getByRole('button',{name:'關閉設定',exact:true}).click(); }
export async function account(page:Page) {
 const dialog=await settings(page);
 const back=dialog.getByRole('button',{name:'返回遊戲',exact:true});
 if(await back.isVisible()) await back.click();
 else await dialog.getByRole('button',{name:'開啟存檔與會員',exact:true}).click();
}
export async function home(page:Page) { const dialog=await settings(page);await dialog.getByRole('button',{name:'首頁 / 新人生',exact:true}).click(); }
export async function showCity(page:Page) { await page.getByRole('navigation',{name:'主要功能'}).getByRole('button',{name:'開啟城市功能',exact:true}).click(); }
