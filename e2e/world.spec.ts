import { test, expect } from "@playwright/test";
test("雙模式開局、探索求職社交與獨立讀檔", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "家族財富帝國", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "開始劇情人生", exact: true }).click();
  await expect(page.locator("canvas")).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "第 1 章：平凡的日子" }),
  ).toBeVisible();
  const first = await page.evaluate(
    () => JSON.parse(localStorage.getItem("fwe-library-v1")!).active,
  );
  await page
    .getByRole("navigation", { name: "城市場所" })
    .getByRole("button", { name: "公司", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "目前位置：公司" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "12×", exact: true }).click();
  await expect
    .poll(async () =>
      page.evaluate(() => {
        const l = JSON.parse(localStorage.getItem("fwe-library-v1")!);
        return l.slots.find((s: any) => s.id === l.active).state.world.paid;
      }),
    )
    .toBeGreaterThan(0);
  await page.getByRole("button", { name: "Ⅱ 暫停", exact: true }).click();
  const npcPlace = await page.evaluate(() => {
    const l = JSON.parse(localStorage.getItem("fwe-library-v1")!);
    return l.slots.find((s: any) => s.id === l.active).state.world.npcs[0]
      .place;
  });
  await page
    .getByRole("navigation", { name: "城市場所" })
    .getByRole("button")
    .nth(npcPlace)
    .click();
  await page.getByRole("button", { name: /^交流/ }).first().click();
  await page
    .getByRole("navigation", { name: "城市場所" })
    .getByRole("button", { name: "社區中心", exact: true })
    .click();
  await page
    .getByRole("button", { name: "人脈商機：服務工作室 $30,000", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "服務工作室營運中" }),
  ).toBeDisabled();
  await page.getByRole("button", { name: "首頁 / 新人生" }).click();
  await page.getByRole("button", { name: /自由模式.*自訂背景/ }).click();
  await page.getByLabel("家庭背景").selectOption("self-made");
  await page.getByLabel("起始年齡").fill("22");
  await page.getByRole("button", { name: "開始自由人生", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "自由人生 · 自己決定方向" }),
  ).toBeVisible();
  const saves = await page.evaluate(() => {
    const l = JSON.parse(localStorage.getItem("fwe-library-v1")!);
    return l.slots.map((s: any) => ({
      id: s.id,
      mode: s.state.world?.mode,
      age: s.state.age,
      venture: s.state.world?.venture,
    }));
  });
  expect(saves).toHaveLength(2);
  expect(saves.find((s) => s.id === first)?.venture).toBe(true);
  expect(saves.find((s) => s.mode === "free")?.age).toBe(22);
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "自由人生 · 自己決定方向" }),
  ).toBeVisible();
  expect(errors).toEqual([]);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});

test("城市步行尋路、場所快速前往及存檔位置", async ({ page }, info) => {
  await page.goto("/");
  await page.getByRole("button", { name: "開始劇情人生", exact: true }).click();
  const canvas = page.locator("canvas");
  await expect(canvas).toBeVisible();
  await page
    .getByRole("navigation", { name: "城市場所" })
    .getByRole("button", { name: "公園", exact: true })
    .click();
  await expect
    .poll(
      async () =>
        Number(
          await page.locator("[data-player-x]").getAttribute("data-player-x"),
        ),
      { timeout: 10000 },
    )
    .toBeCloseTo(6, 1);
  await expect
    .poll(
      async () =>
        Number(
          await page.locator("[data-player-y]").getAttribute("data-player-y"),
        ),
      { timeout: 10000 },
    )
    .toBeCloseTo(6, 1);
  await canvas.scrollIntoViewIfNeeded();
  const box = await canvas.boundingBox();
  if (!box) throw Error("城市尚未載入");
  await canvas.click({
    position: { x: (579 / 840) * box.width, y: (171 / 570) * box.height },
  });
  await expect(
    page.getByRole("heading", { name: "目前位置：城市道路" }),
  ).toBeVisible();
  await expect
    .poll(
      async () =>
        Number(
          await page.locator("[data-player-x]").getAttribute("data-player-x"),
        ),
      { timeout: 10000 },
    )
    .toBeCloseTo(3, 1);
  await expect
    .poll(
      async () =>
        Number(
          await page.locator("[data-player-y]").getAttribute("data-player-y"),
        ),
      { timeout: 10000 },
    )
    .toBeCloseTo(0, 1);
  await canvas.scrollIntoViewIfNeeded();
  await page.screenshot({
    path: `/tmp/fwe-openworld-${info.project.name}.png`,
  });
  const before = await page.evaluate(() => {
    const l = JSON.parse(localStorage.getItem("fwe-library-v1")!);
    return l.slots.find((s: any) => s.id === l.active).state;
  });
  expect(before.month).toBe(0);
  expect(before.cash).toBe(1800000);
  expect(before.world.position).toEqual({ x: 3, y: 0 });
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "目前位置：城市道路" }),
  ).toBeVisible();
});
