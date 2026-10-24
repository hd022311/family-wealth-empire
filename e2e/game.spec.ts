import { initial } from "../src/simulation";
import { test, expect } from "@playwright/test";
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

test("城市、交易、多家族、重新載入與離線回歸", async ({ page }, testInfo) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  await expect(page.locator("canvas")).toBeVisible();
  await page.getByRole("button", { name: "Ⅱ 暫停", exact: true }).click();
  const canvas = page.locator("canvas");
  const box = await canvas.boundingBox();
  if (!box) throw Error("地圖未就緒");
  await canvas.click({
    position: { x: (536 / 840) * box.width, y: (308 / 570) * box.height },
  });
  await expect(
    page.getByRole("heading", { name: "銀行 · 房貸管理" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "房產", exact: true }).click();
  await page.getByRole("button", { name: /購入 · 頭期款/ }).click();
  await expect(
    page.getByRole("button", { name: "出租收租", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "出租收租", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "停止出租", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "存檔", exact: true }).click();
  await page.getByRole("button", { name: "家族存檔 / 會員" }).click();
  await expect(
    page.getByText("雲端尚未設定", { exact: false }).first(),
  ).toBeVisible();
  page.once("dialog", (d) => d.accept("第二個測試家族"));
  await page.getByRole("button", { name: "＋ 建立獨立家族" }).click();
  await expect(
    page.getByRole("button", { name: /購入 · 頭期款/ }),
  ).toBeVisible();
  await page.getByRole("button", { name: "家族存檔 / 會員" }).click();
  await page
    .locator(".slot")
    .filter({ hasText: "林家・第一個家族" })
    .getByRole("button", { name: "接續" })
    .click();
  await expect(
    page.getByRole("button", { name: "停止出租", exact: true }),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole("button", { name: "停止出租", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "排行榜規劃", exact: true }).click();
  await expect(
    page.getByText("示意資料 · 不是正式排名，未讀取玩家財務、未連接排名服務。"),
  ).toBeVisible();
  await page.getByLabel("榜單", { exact: true }).selectOption("returns");
  await expect(
    page.getByRole("columnheader", { name: "成績（%）" }),
  ).toBeVisible();
  await expect(page.getByText(/個人名次（示意）/)).toContainText("第 3 / 3 名");
  await page.getByRole("button", { name: "排行榜規劃", exact: true }).click();
  await page.getByRole("button", { name: "股票", exact: true }).click();
  await page.getByRole("button", { name: "買 100 股" }).first().click();
  await expect(page.getByText(/持有 100 股/)).toBeVisible();
  // Force a long absence without changing simulation. Offline launch works after first cache.
  const before = await page.evaluate(() => {
    const lib = JSON.parse(localStorage.getItem("fwe-library-v1")!);
    const a = lib.slots.find((s: { id: string }) => s.id === lib.active);
    a.updatedAt -= 365 * 86400000;
    localStorage.setItem("fwe-library-v1", JSON.stringify(lib));
    return a.state.age;
  });
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
  });
  await page.context().setOffline(true);
  await page.reload();
  await expect(
    page.getByText(/年齡、資產、房貸與虛構股價均未離線推進/),
  ).toBeVisible();
  const after = await page.evaluate(() => {
    const l = JSON.parse(localStorage.getItem("fwe-library-v1")!);
    return l.slots.find((s: { id: string }) => s.id === l.active).state.age;
  });
  expect(after).toBe(before);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: `/tmp/fwe-${testInfo.project.name}.png`,
    fullPage: true,
  });
  expect(errors).toEqual([]);
});

test("接班會保存上一代快照，重新開啟仍接續第二代", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("canvas")).toBeVisible();
  await page.getByRole("button", { name: "Ⅱ 暫停", exact: true }).click();
  await page.evaluate(() => {
    const l = JSON.parse(localStorage.getItem("fwe-library-v1")!);
    const s = l.slots[0].state;
    s.dead = true;
    s.age = 85;
    s.month = 720;
    s.family[1].age = 62;
    s.family[2].age = 60;
    localStorage.setItem("fwe-library-v1", JSON.stringify(l));
  });
  await page.reload();
  await expect(page.getByRole("dialog", { name: "選擇下一代" })).toBeVisible();
  await page
    .getByRole("button", { name: /林晨 · 62 歲 · 接續個人帳戶/ })
    .click();
  await expect(
    page.getByText("第 2 代家主 · 62 歲 0 個月 · 青禾城"),
  ).toBeVisible();
  await page.getByRole("button", { name: "家族存檔 / 會員" }).click();
  await expect(
    page.getByRole("heading", { name: "世代典藏 · 1 段已完成世代" }),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByText("第 2 代家主 · 62 歲 0 個月 · 青禾城"),
  ).toBeVisible();
});
