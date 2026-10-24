import { settings, closeSettings, account, home, showCity } from './ui-helpers';
import { test, expect, type Page } from "@playwright/test";
const library = async (page: Page) =>
  page.evaluate(() => JSON.parse(localStorage.getItem("fwe-library-v1")!));
const current = async (page: Page) => {
  const l = await library(page);
  return l.slots.find((s: any) => s.id === l.active).state;
};
async function travel(page: Page, place: string) {
  await page
    .getByRole("navigation", { name: "城市場所" })
    .getByRole("button", { name: place, exact: true })
    .click();
}
const advance = async (page: Page) =>
  page
    .getByRole("button", { name: "結算一個月並繼續人生", exact: true })
    .click();
test("第一、二章：城市家人日常、照顧協商、結案與自由模式隔離", async ({
  page,
}, info) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  await page.getByRole("button", { name: "開始劇情人生", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "第 1 章：平凡的日子", exact: true }),
  ).toBeVisible();
  await expect(page.locator("canvas")).toBeVisible();
  const canvas = page.locator("canvas");
  await showCity(page);
  await canvas.scrollIntoViewIfNeeded();
  const box = await canvas.boundingBox();
  if (!box) throw Error("城市未載入");
  await canvas.click({
    position: { x: (420 / 840) * box.width, y: (45 / 570) * box.height },
  });
  const location = page.getByRole("region", { name: "劇情場所互動" });
  await expect(
    location.getByRole("heading", { name: "父母自住房", exact: true }),
  ).toBeVisible();
  await location
    .getByRole("button", { name: "陪伴林建國 · $1,200 / 4h", exact: true })
    .click();
  await travel(page, "住宅區");
  await location
    .getByRole("button", { name: "陪伴林知夏 · $1,200 / 4h", exact: true })
    .click();
  await location
    .getByRole("button", { name: "陪伴林晨 · $1,200 / 4h", exact: true })
    .click();
  await travel(page, "父母出租房");
  await location
    .getByRole("button", { name: "整理出租屋近況 · 2h", exact: true })
    .click();
  await travel(page, "社區中心");
  await location
    .getByRole("button", { name: "陪伴林承安 · $1,200 / 4h", exact: true })
    .click();
  await location
    .getByRole("button", { name: "陪伴林予晴 · $1,200 / 4h", exact: true })
    .click();
  expect((await current(page)).story.contacts).toEqual(
    expect.arrayContaining([1, 2, 10, 12, 15]),
  );
  const parentCash = (await current(page)).clan.people.find(
    (p: any) => p.id === 11,
  ).finances.cash;
  await advance(page);
  const month1 = await current(page);
  expect(month1.world.paid).toBe(1);
  expect(
    month1.clan.people.find((p: any) => p.id === 11).finances.cash - parentCash,
  ).toBe(20500);
  expect(month1.properties.some((p: any) => p.owned)).toBe(false);
  await travel(page, "父母自住房");
  await location
    .getByRole("button", { name: "陪父親健檢 · $3,000 / 4h", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "第 2 章：父母老了", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "安排家庭共同照顧", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "目前照顧方案", exact: true }),
  ).toBeDisabled();
  const ready = await current(page);
  expect(ready.story.episode.responses).toHaveLength(2);
  expect(
    ready.story.episode.responses.some(
      (r: any) => r.money === 0 && r.hours > 0,
    ),
  ).toBe(true);
  await showCity(page);
  await canvas.scrollIntoViewIfNeeded();
  await expect
    .poll(async () =>
      Number(
        await page
          .locator("[data-active-popups]")
          .getAttribute("data-active-popups"),
      ),
    )
    .toBe(0);
  await page.screenshot({
    path: `artifacts/promise-${info.project.name}-city.png`,
  });
  await page.getByRole("navigation",{name:"主要功能"}).getByRole("button",{name:"開啟事件功能",exact:true}).click();
  await page
    .locator(".detail-panel")
    .screenshot({ path: `artifacts/promise-${info.project.name}-care.png` });
  await page.reload();
  expect((await current(page)).story.episode).toEqual(ready.story.episode);
  for (let i = 0; i < 3; i++) await advance(page);
  await expect(page.getByText(/本階段追蹤完成，繼續自由經營/)).toBeVisible();
  const completed = await current(page);
  expect(completed.story.completedEpisodes).toHaveLength(1);
  expect(completed.clan.people.find((p: any) => p.id === 10).alive).toBe(true);
  await page.getByRole("button", { name: "股票", exact: true }).click();
  await page
    .getByRole("button", { name: "買 100 股", exact: true })
    .first()
    .click();
  expect((await current(page)).shares[0]).toBe(100);
  await advance(page);
  expect((await current(page)).month).toBe(completed.month + 1);
  expect(
    (await current(page)).clan.transactions.every(
      (t: any) =>
        Math.abs(t.postings.reduce((sum: number, p: any) => sum + p.delta, 0)) <
        0.01,
    ),
  ).toBe(true);
  const storySnapshot = await current(page);
  await home(page);
  await page.getByRole("button", { name: /自由模式.*自訂背景/ }).click();
  await page.getByLabel("家庭背景").selectOption("self-made");
  await page.getByRole("button", { name: "開始自由人生", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "自由人生 · 自己決定方向" }),
  ).toBeVisible();
  expect((await current(page)).story).toBeUndefined();
  const saves = await library(page);
  expect(saves.slots).toHaveLength(2);
  expect(saves.slots.find((s: any) => s.state.story)?.state).toEqual(
    storySnapshot,
  );
  await account(page);
  await page
    .locator(".slot")
    .filter({ hasText: "劇情模式" })
    .getByRole("button", { name: "接續", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "第 2 章：父母老了", exact: true }),
  ).toBeVisible();
  await page.reload();
  expect((await current(page)).story.completedEpisodes).toHaveLength(1);
  expect(errors).toEqual([]);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});

test("父母房屋修繕與停租、舊劇情存檔遷移不憑空增產", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "開始劇情人生", exact: true }).click();
  await travel(page, "父母出租房");
  const before = await current(page);
  const location = page.getByRole("region", { name: "劇情場所互動" });
  await location
    .getByRole("button", { name: "請屋主支付修繕 $8,000 · 4h", exact: true })
    .click();
  expect((await current(page)).cash).toBe(before.cash);
  expect(
    (await current(page)).clan.people.find((p: any) => p.id === 11).finances
      .cash,
  ).toBe(before.clan.people.find((p: any) => p.id === 11).finances.cash - 8000);
  await expect(location.getByText(/施工中/)).toBeVisible();
  await advance(page);
  let s = await current(page);
  expect(
    s.city.events.some(
      (e: any) => e.kind === "rent" && e.placeId === 9 && e.month === 1,
    ),
  ).toBe(false);
  await advance(page);
  s = await current(page);
  expect(
    s.city.events.some(
      (e: any) => e.kind === "rent" && e.placeId === 9 && e.month === 2,
    ),
  ).toBe(true);
  await page.evaluate(() => {
    const l = JSON.parse(localStorage.getItem("fwe-library-v1")!);
    const slot = l.slots.find((s: any) => s.id === l.active);
    slot.state.version = 3;
    delete slot.state.story;
    localStorage.setItem("fwe-library-v1", JSON.stringify(l));
  });
  await page.reload();
  await expect.poll(async () => (await current(page)).version).toBe(4);
  const migrated = await current(page);
  expect(migrated.version).toBe(4);
  expect(migrated.story).toBeUndefined();
  expect(migrated.cash).toBe(s.cash);
  expect(migrated.clan.people).toEqual(s.clan.people);
  await expect(page.locator("canvas")).toBeVisible();
});
