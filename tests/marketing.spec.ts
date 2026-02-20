import { test, expect } from "@playwright/test";

test.describe("Marketing Pages", () => {
  test("Home page should load", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/NSK\.AI/);
    await expect(
      page.getByRole("button", { name: /Start Learning for Free/i }),
    ).toBeVisible();
  });

  test("Pricing page should be accessible", async ({ page }) => {
    await page.goto("/pricing");
    // Check for common pricing elements
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.getByText(/plan/i).first()).toBeVisible();
  });

  test("Features page should be accessible", async ({ page }) => {
    await page.goto("/features");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("Contact page should exist", async ({ page }) => {
    await page.goto("/contact");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });
});
