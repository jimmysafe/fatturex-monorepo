import test, { expect } from "@playwright/test";

test.describe("Authentication", () => {
  test("Should be able to Logout", async ({ page }) => {
    await page.goto(`/${new Date().getFullYear()}`);

    await page.waitForURL(`**/${new Date().getFullYear()}`);
    expect(page.url()).toContain(`/${new Date().getFullYear()}`);

    expect(page.getByTestId("user-button")).toBeVisible();
    await page.getByTestId("user-button").click();

    expect(page.getByText("Esci")).toBeVisible();
    await page.getByText("Esci").click();

    await page.waitForLoadState("networkidle");

    await page.waitForURL("**/signin");
    expect(page.url()).toContain("/signin");
  });
});
