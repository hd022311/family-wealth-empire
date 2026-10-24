import { settings, closeSettings, account, home } from './ui-helpers';
import { initial } from "../src/simulation";
import { test, expect, type Page } from "@playwright/test";
async function state(page: Page) {
  return page.evaluate(() => {
    const lib = JSON.parse(localStorage.getItem("fwe-library-v1")!);
    return lib.slots.find((s: { id: string }) => s.id === lib.active).state;
  });
}
test.beforeEach(async ({ page }) => {
  await page.addInitScript((state) => {
    if (!localStorage.getItem("fwe-library-v1")) {
      const id = crypto.randomUUID();
      localStorage.setItem(
        "fwe-library-v1",
        JSON.stringify({
          version: 1,
          active: id,
          slots: [
            {
              id,
              name: "林家・第一個家族",
              state,
              revision: 0,
              owner: null,
              dirty: true,
              updatedAt: Date.now(),
              generations: [],
            },
          ],
        }),
      );
    }
  }, initial());
});

test("家庭互動到父親遺產協商，真實費用、獨立資產與跨重載記憶", async ({
  page,
}, info) => {
  test.setTimeout(60000);
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  await expect(page.locator("canvas")).toBeVisible();
  await page.getByRole("navigation",{name:"主要功能"}).getByRole("button",{name:"開啟家庭功能",exact:true}).click();
  await page.getByRole("button", { name: /C · 一般家庭/ }).click();
  expect((await state(page)).cash).toBe(600000);
  await page
    .getByRole("button", { name: "林建國 人物卡", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "林建國 · 父母", exact: true }),
  ).toBeVisible();
  await expect(page.getByRole("img", { name: "家人關係圖" })).toBeVisible();
  await page.getByRole("button", { name: /探望 ·/ }).click();
  expect((await state(page)).cash).toBe(598800);
  await page
    .getByRole("button", { name: "開始照顧故事：父親重大疾病" })
    .click();
  await page.getByRole("button", { name: /親自照顧：1.8 萬/ }).click();
  expect((await state(page)).cash).toBe(580800);
  await page.getByRole("button", { name: "12×", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "手足的房貸與教育費困境", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Ⅱ 暫停", exact: true }).click();
  const before = (await state(page)).cash;
  await page.getByRole("button", { name: /家庭會議 · ＄2,000/ }).click();
  expect((await state(page)).cash).toBe(before - 2000);
  await page.getByRole("button", { name: "12×", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "林建國的遺產與祖厝", exact: true }),
  ).toBeVisible({ timeout: 25000 });
  await page.getByRole("button", { name: "Ⅱ 暫停", exact: true }).click();
  const beforeMeeting = await state(page);
  expect(beforeMeeting.clan.estates[0].finances.home).toBe(4800000);
  await page.getByRole("button", { name: "整理遺產清冊", exact: true }).click();
  await page.getByRole("button", { name: /提案共同保留祖厝/ }).click();
  const after = await state(page);
  expect(after.cash).toBe(beforeMeeting.cash - 2000);
  expect(after.clan.estates[0].proposal).toBe("keep");
  expect(after.clan.estates[0].responses.length).toBeGreaterThan(0);
  await expect(page.getByText(/不自動加進玩家現金/).first()).toBeVisible();
  await page.screenshot({
    path: `/tmp/fwe-family-${info.project.name}.png`,
    fullPage: true,
  });
  await page.getByRole("button", { name: "存檔", exact: true }).click();
  const saved = await state(page);
  await page.reload();
  expect(await state(page)).toEqual(saved);
  await page.getByRole("button", { name: "家族", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "林建國的遺產與祖厝", exact: true }),
  ).toBeVisible();
  expect(errors).toEqual([]);
});
test("固定法律入口、條號搜尋、官方來源與資料不足無虛構數字", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.locator("canvas")).toBeVisible();
  await settings(page);
  await page.getByRole("button", { name: "⚖ 台灣法律", exact: true }).click();
  const dialog = page.getByRole("dialog", { name: "台灣法律查詢中心" });
  await expect(dialog).toBeVisible();
  await dialog.getByLabel("法律搜尋", { exact: true }).fill("民法第1138條");
  await expect(
    dialog.getByRole("heading", { name: "法定繼承人與應繼分", exact: true }),
  ).toBeVisible();
  await dialog
    .locator(".law-topics article")
    .filter({
      has: page.getByRole("heading", {
        name: "法定繼承人與應繼分",
        exact: true,
      }),
    })
    .getByText("官方法源、版本與爭議", { exact: true })
    .click();
  await expect(
    dialog.getByRole("link", { name: /民法 第 1138/ }),
  ).toHaveAttribute(
    "href",
    "https://law.moj.gov.tw/LawClass/LawSingle.aspx?pcode=B0000001&flno=1138",
  );
  await expect(dialog.getByText(/沒有可確認適用的官方版本/)).toBeVisible();
  await expect(dialog.getByText(/待確認，非 0 元/)).toBeVisible();
  await page.getByRole("button", { name: "關閉台灣法律" }).click();
  await closeSettings(page);
  await expect(dialog).not.toBeVisible();
  await expect(page.locator("canvas")).toBeVisible();
});
