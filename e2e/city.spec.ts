import { initial } from "../src/simulation";
import { test, expect, type Page } from "@playwright/test";
async function activeState(page: Page) {
  return page.evaluate(() => {
    const lib = JSON.parse(localStorage.getItem("fwe-library-v1")!);
    return lib.slots.find((s: { id: string }) => s.id === lib.active).state;
  });
}
async function canvasPoint(page: Page, x: number, y: number) {
  const box = await page.locator("canvas").boundingBox();
  if (!box) throw Error("城市未載入");
  return {
    x: box.x + (x / 840) * box.width,
    y: box.y + (y / 570) * box.height,
  };
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

test("動態城市：鏡頭、手機手勢、角色、日夜天氣及減少動態", async ({
  page,
}, info) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  await expect(page.locator("canvas")).toBeVisible();
  await page.getByRole("button", { name: "Ⅱ 暫停", exact: true }).click();
  const before = await activeState(page);
  const canvas = page.locator("canvas");
  // Ambient traffic stays alive even while the financial clock is paused.
  const first = await canvas.screenshot();
  await expect(async () => {
    const next = await canvas.screenshot();
    expect(first.equals(next)).toBe(false);
  }).toPass({ timeout: 4000 });
  await page.getByRole("button", { name: "放大城市" }).click();
  await expect(page.getByRole("status", { name: "地圖縮放" })).toHaveText(
    "115%",
  );
  await page.getByRole("button", { name: "重設視角" }).click();
  const p = await canvasPoint(page, 400, 330);
  if (info.project.name !== "desktop") {
    const cdp = await page.context().newCDPSession(page);
    await cdp.send("Input.dispatchTouchEvent", {
      type: "touchStart",
      touchPoints: [{ x: p.x, y: p.y, id: 0 }],
    });
    await cdp.send("Input.dispatchTouchEvent", {
      type: "touchMove",
      touchPoints: [{ x: p.x + 50, y: p.y + 20, id: 0 }],
    });
    await cdp.send("Input.dispatchTouchEvent", {
      type: "touchEnd",
      touchPoints: [],
    });
    await expect(page.locator(".city")).not.toHaveAttribute(
      "data-camera-x",
      "0",
    );
    await cdp.send("Input.dispatchTouchEvent", {
      type: "touchStart",
      touchPoints: [
        { x: p.x - 30, y: p.y, id: 0 },
        { x: p.x + 30, y: p.y, id: 1 },
      ],
    });
    await cdp.send("Input.dispatchTouchEvent", {
      type: "touchMove",
      touchPoints: [
        { x: p.x - 55, y: p.y, id: 0 },
        { x: p.x + 55, y: p.y, id: 1 },
      ],
    });
    await cdp.send("Input.dispatchTouchEvent", {
      type: "touchEnd",
      touchPoints: [],
    });
    await expect(page.getByRole("status", { name: "地圖縮放" })).not.toHaveText(
      "100%",
    );
    await cdp.detach();
  } else {
    await page.mouse.move(p.x, p.y);
    await page.mouse.down();
    await page.mouse.move(p.x + 70, p.y + 25, { steps: 5 });
    await page.mouse.up();
    await expect(page.locator(".city")).not.toHaveAttribute(
      "data-camera-x",
      "0",
    );
    await page.mouse.wheel(0, -100);
    await expect(page.getByRole("status", { name: "地圖縮放" })).toHaveText(
      "110%",
    );
  }
  await page.getByRole("button", { name: "重設視角" }).click();
  await expect(page.locator(".city")).toHaveAttribute("data-camera-x", "0");
  await expect(page.getByRole("status", { name: "地圖縮放" })).toHaveText(
    "100%",
  );
  // A main-family sprite has a separate click target and opens the family panel.
  const person = await canvasPoint(page, 452, 167);
  if (info.project.name === "desktop")
    await page.mouse.click(person.x, person.y);
  else await page.touchscreen.tap(person.x, person.y);
  await expect(
    page.getByRole("heading", { name: "財富有價，傳承無價。" }),
  ).toBeVisible();
  await page
    .getByText("城市動畫設定 · 拖曳移動 / 雙指或滾輪縮放", { exact: true })
    .click();
  await page.getByLabel("城市日夜", { exact: true }).selectOption("night");
  await page.getByLabel("城市天氣", { exact: true }).selectOption("rainy");
  await expect(page.getByTestId("city-environment")).toHaveText("夜晚 · 雨天");
  await page.getByLabel("動畫品質", { exact: true }).selectOption("low");
  await page.getByLabel("減少動態效果", { exact: true }).check();
  await page.evaluate(() => new Promise(requestAnimationFrame));
  const still = await canvas.screenshot();
  expect(still.equals(await canvas.screenshot())).toBe(true);
  expect(await activeState(page)).toEqual(before); // Presentation options cannot spend cash or age anyone.
  await page.screenshot({
    path: `/tmp/fwe-dynamic-${info.project.name}.png`,
    fullPage: true,
  });
  await page.reload();
  await page
    .getByText("城市動畫設定 · 拖曳移動 / 雙指或滾輪縮放", { exact: true })
    .click();
  await expect(page.getByLabel("減少動態效果", { exact: true })).toBeChecked();
  await expect(page.getByLabel("城市日夜", { exact: true })).toHaveValue(
    "night",
  );
  expect(errors).toEqual([]);
});
test("購屋、入住、收租、翻修、營運和新生兒動畫對應可保存的財務變更", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  await expect(page.locator("canvas")).toBeVisible();
  await page.getByRole("button", { name: "Ⅱ 暫停", exact: true }).click();
  await page.getByRole("button", { name: /購入 · 頭期款/ }).click();
  await expect(page.getByRole("status", { name: "城市事件" })).toHaveText(
    "取得資產：青禾小宅",
  );
  expect((await activeState(page)).cash).toBe(1440000);
  await page.getByRole("button", { name: "出租收租", exact: true }).click();
  await expect(page.getByRole("status", { name: "城市事件" })).toHaveText(
    "青禾小宅 租客入住",
  );
  await page.getByRole("button", { name: "12×", exact: true }).click();
  await expect(page.getByRole("status", { name: "城市事件" })).toContainText(
    "收租 +＄9,000",
  );
  await page.getByRole("button", { name: "Ⅱ 暫停", exact: true }).click();
  const rented = await activeState(page);
  expect(rented.month).toBeGreaterThanOrEqual(1);
  expect(rented.cash).toBeCloseTo(1440000 + rented.income - rented.expense, 0);
  await page.getByRole("button", { name: /翻修升級/ }).click();
  const renovating = await activeState(page);
  expect(renovating.cash).toBeLessThan(rented.cash);
  expect(renovating.properties[0].level).toBe(2);
  await expect(page.getByRole("status", { name: "城市事件" })).toContainText(
    "翻修 Lv.2",
  );
  await page.getByRole("button", { name: /轉角商店.*可購入/ }).click();
  await page.getByRole("button", { name: /購入 · 頭期款/ }).click();
  await page.getByRole("button", { name: "自行營運", exact: true }).click();
  await expect(page.getByRole("status", { name: "城市事件" })).toHaveText(
    "商店開始營運",
  );
  await page.getByRole("button", { name: /企業擴張/ }).click();
  expect((await activeState(page)).properties[2].level).toBe(2);
  await page.getByRole("button", { name: "家族", exact: true }).click();
  const beforeBirth = await activeState(page);
  await page.getByRole("button", { name: /迎接新生兒/ }).click();
  await expect(page.getByRole("status", { name: "城市事件" })).toContainText(
    "誕生",
  );
  expect((await activeState(page)).cash).toBe(beforeBirth.cash - 50000);
  await page.getByRole("button", { name: "存檔", exact: true }).click();
  const saved = await activeState(page);
  await page.reload();
  expect(await activeState(page)).toEqual(saved);
  await expect(page.getByRole("status", { name: "城市事件" })).toContainText(
    "點選建築或人物",
  );
  expect(errors).toEqual([]);
});
