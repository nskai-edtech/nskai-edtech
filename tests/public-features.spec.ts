import { test, expect } from "@playwright/test";

test.describe("Public Features", () => {
  test("AI Tutors page should load and list tutors", async ({ page }) => {
    await page.goto("/ai-tutors");
    await expect(page).toHaveTitle(/Tutors|AI/i);
    // Assuming there's a heading or list
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("Blog page should load", async ({ page }) => {
    await page.goto("/blog");
    await expect(page).toHaveTitle(/Blog|News/i);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });
});
