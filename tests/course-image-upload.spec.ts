import { test, expect } from "@playwright/test";

test.describe("Course Image Upload", () => {
  test("should navigate to home page", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/NSK\.AI/);
  });

  test("should show upload button in course editor", async ({ page }) => {
    // NOTE: This test requires authentication.
    // If running locally without saved auth state, this will likely redirect to sign-in.

    // 1. Navigate to a course editor page (using a placeholder ID or one from seed)
    // We use a random ID, expecting it might 404 or redirect if not logged in.
    const courseId = "test-course-id";
    await page.goto(`/tutor/courses/${courseId}`);

    // 2. Check if redirected to sign-in
    if (page.url().includes("sign-in")) {
      console.log(
        "Redirected to sign-in. Authentication required for full E2E test.",
      );
      test.skip(true, "Authentication required to access course editor");
      return;
    }

    // 3. If we are somehow logged in (e.g. via reused state), verify the upload button
    const uploadButton = page.getByRole("button", {
      name: /Upload a new image/i,
    });

    // It might be visible or we might need to find it by text
    await expect(uploadButton).toBeVisible();

    // 4. Test interactivity (Optional/Mocked)
    // In a real E2E, we would upload a file here:
    // const fileChooserPromise = page.waitForEvent('filechooser');
    // await uploadButton.click();
    // const fileChooser = await fileChooserPromise;
    // await fileChooser.setFiles('path/to/test-image.png');

    // await expect(page.getByText('Uploading...')).toBeVisible();
    // await expect(page.getByText('Image uploaded successfully')).toBeVisible();
  });
});
