import path from "node:path";

import { faker } from "@faker-js/faker";
import { expect, test as setup } from "@playwright/test";

const authFile = path.join(__dirname, "../playwright/.auth/user.json");

const email = faker.internet.email();

async function getOtp(email: string, baseUrl?: string) {
  const res = await fetch(`${baseUrl}/api/otp` + `?email=${email}`);
  if (!res.ok)
    throw new Error("Failed to get OTP");
  const data = await res.json();
  return data.otp.value;
}

setup("Authentication", async ({ page, baseURL }) => {
  // Perform authentication steps. Replace these actions with your own.

  await page.goto("/signin");
  await page.fill("input[name=\"email\"]", email);
  await page.click("button[type=\"submit\"]");

  // Wait for the OTP page
  await page.waitForURL("**\/verify?email=*");

  const otp = await getOtp(email, baseURL);

  await page.waitForSelector("input[name=\"otp\"]");
  await page.fill("input[name=\"otp\"]", otp);
  await page.click("button[type=\"submit\"]");

  await page.waitForURL("**/onboarding");
  expect(page.url()).toContain("/onboarding");

  // ! ONBOARDING

  const button = page.getByTestId("next-button");

  expect(page.getByTestId("intro-title")).toBeVisible();
  expect(page.getByTestId("intro-title")).toHaveText("Benvenuto");

  await button.click();

  expect(page.getByTestId("partita-iva-title")).toBeVisible();
  expect(page.getByTestId("partita-iva-title")).toHaveText("Partita IVA");

  await button.click();

  await page.waitForLoadState("networkidle");

  expect(page.getByTestId("general-title")).toBeVisible();
  expect(page.getByTestId("general-title")).toHaveText("Informazioni Generali");

  await button.click();

  expect(page.getByTestId("indirizzo-title")).toBeVisible();
  expect(page.getByTestId("indirizzo-title")).toHaveText("Indirizzo");

  await button.click();

  await page.waitForLoadState("networkidle");

  await page.waitForURL("**/payment/plans");
  expect(page.url()).toContain("/payment/plans");

  expect(page.getByText("Inizia Ora")).toBeVisible();
  await page.getByText("Inizia Ora").click();

  // await page.waitForLoadState('networkidle');

  await page.waitForURL(`**/${new Date().getFullYear()}`);
  expect(page.url()).toContain(`/${new Date().getFullYear()}`);

  // End of authentication steps.
  await page.context().storageState({ path: authFile });
});
