import { test, expect } from "@playwright/test";
import { resolve } from "node:path";
test("單檔 HTML 不載入外部資源，離線可完成照顧、存檔與續玩", async ({
  page,
}) => {
  const errors: string[] = [],
    network: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("request", (r) => {
    if (/^https?:/.test(r.url())) network.push(r.url());
  });
  // This managed browser forbids file://; validate the exact artifact over HTTP.
  // Reload is fulfilled with the unchanged file while the network is offline.
  await page.goto("/standalone.html");
  await page
    .context()
    .route("**/standalone.html", (route) =>
      route.fulfill({
        path: resolve("artifacts/family-wealth-empire-demo.html"),
        contentType: "text/html",
      }),
    );
  await page.context().setOffline(true);
  await page.getByRole("button", { name: "開始劇情人生", exact: true }).click();
  await expect(page.locator("canvas")).toBeVisible();
  await page
    .getByRole("navigation", { name: "城市場所" })
    .getByRole("button", { name: "父母自住房", exact: true })
    .click();
  await page
    .getByRole("button", { name: "陪父親健檢 · $3,000 / 4h", exact: true })
    .click();
  await page
    .getByRole("button", { name: "安排家庭共同照顧", exact: true })
    .click();
  for (let i = 0; i < 3; i++)
    await page
      .getByRole("button", { name: "結算一個月並繼續人生", exact: true })
      .click();
  await expect(page.getByText(/本階段追蹤完成，繼續自由經營/)).toBeVisible();
  await page.reload();
  await expect(page.getByText(/本階段追蹤完成，繼續自由經營/)).toBeVisible();
  expect(errors).toEqual([]);
  expect(network.length).toBeGreaterThan(0);
  expect(
    network.every((url) => new URL(url).pathname === "/standalone.html"),
  ).toBe(true);
});
