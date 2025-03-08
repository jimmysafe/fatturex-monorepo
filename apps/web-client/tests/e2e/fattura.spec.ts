import { faker } from "@faker-js/faker";
import test, { expect } from "@playwright/test";

test.describe.serial("Fattura", () => {
  test("Should be able to create a new Cliente", async ({ page }) => {
    await page.goto(`/${new Date().getFullYear()}/clienti`);
    await page.waitForURL("**/clienti");
    expect(page.url()).toContain("/clienti");

    const clientiList = page.getByTestId("clienti-list");
    const openModalButton = page.getByTestId("cliente-create-modal-trigger").first();
    const dialog = page.getByRole("dialog");
    const dialogTitle = page.getByTestId("dialog-title");
    const saveButton = page.getByRole("button", { name: "Salva" });

    await page.waitForLoadState("networkidle");

    await expect(clientiList).toBeEmpty();

    await expect(openModalButton).toBeVisible();
    await openModalButton.click();

    await expect(dialog).toBeVisible();

    await expect(dialogTitle).toBeVisible();
    await expect(dialogTitle).toHaveText("Nuovo cliente");

    await page.fill("input[name=\"ragioneSociale\"]", faker.company.name());
    await page.fill("input[name=\"partitaIva\"]", faker.string.numeric(11));
    await page.fill("input[name=\"codiceFiscale\"]", faker.string.numeric(11));
    await page.fill("input[name=\"indirizzoEmail\"]", faker.internet.email());
    await page.fill("input[name=\"indirizzoPec\"]", faker.internet.email());
    await page.fill("input[name=\"indirizzo\"]", faker.location.streetAddress());
    await page.fill("input[name=\"cap\"]", faker.location.zipCode());
    await page.fill("input[name=\"comune\"]", faker.location.city());
    await page.selectOption("select", "RM");

    await saveButton.click();

    await expect(dialogTitle).not.toBeVisible();

    await page.waitForLoadState("networkidle");
  });

  test("Should be able to create a new Fattura", async ({ page }) => {
    await page.goto(`/${new Date().getFullYear()}/fatture/nuova`);
    await page.waitForURL("**/fatture/nuova");
    expect(page.url()).toContain("/fatture/nuova");

    await page.waitForLoadState("networkidle");

    const cercaClienteButton = page.getByRole("button", { name: "Cerca Cliente" });
    const dialog = page.getByRole("dialog");
    const dialogTitle = page.getByTestId("dialog-title");
    const saveButton = page.getByRole("button", { name: "Seleziona" });
    const clientiList = page.getByTestId("clienti-list");
    const firstClient = clientiList.getByTestId("cliente-list-item").first();
    const nextButton = page.getByTestId("next-button");

    await expect(cercaClienteButton).toBeVisible();
    await cercaClienteButton.click();

    await expect(dialog).toBeVisible();
    await expect(dialogTitle).toBeVisible();
    await expect(dialogTitle).toHaveText("Clienti");

    await expect(clientiList).toBeVisible();
    await expect(clientiList).not.toBeEmpty();

    await firstClient.click();
    await saveButton.click();

    await expect(dialogTitle).not.toBeVisible();

    await nextButton.click();

    await page.waitForLoadState("networkidle");

    expect(page.getByTestId("dettagli-title")).toBeVisible();
    expect(page.getByTestId("dettagli-title")).toHaveText("Dettagli");

    await nextButton.click();

    expect(page.getByTestId("articoli-title")).toBeVisible();
    expect(page.getByTestId("articoli-title")).toHaveText("Articoli e Voci");

    await page.fill("textarea[name=\"articoli.0.descrizione\"]", faker.lorem.paragraph(5));
    await page.fill("input[name=\"articoli.0.prezzo\"]", "200");

    await nextButton.click();

    await page.waitForLoadState("networkidle");

    expect(page.getByTestId("impostazioni-title")).toBeVisible();
    expect(page.getByTestId("impostazioni-title")).toHaveText("Impostazioni");

    await nextButton.click();

    await page.waitForLoadState("networkidle");

    expect(page.getByTestId("anteprima-title")).toBeVisible();
    expect(page.getByTestId("anteprima-title")).toHaveText("Anteprima");

    await nextButton.click();

    await page.waitForURL("**/fatture/**?success=1");
    expect(page.url()).toContain("?success=1");

    const pageTitle = page.getByTestId("page-title");
    await expect(pageTitle).toHaveText(`Fattura 1 / ${new Date().getFullYear()}`);
  });
});
