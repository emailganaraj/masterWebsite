import { test, expect } from "@playwright/test";

test.describe("Public site smoke tests", () => {
  test("health endpoint returns healthy", async ({ request }) => {
    const res = await request.get("/api/health");
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body.status).toBe("healthy");
  });

  test("homepage loads", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("body")).toBeVisible();
  });

  test("latest page loads", async ({ page }) => {
    await page.goto("/latest");
    await expect(page.getByRole("heading", { name: "Latest" })).toBeVisible();
  });

  test("search page loads", async ({ page }) => {
    await page.goto("/search?q=test");
    await expect(page.getByRole("heading", { name: "Search" })).toBeVisible();
  });
});

test.describe("Admin auth", () => {
  test("login page loads", async ({ page }) => {
    await page.goto("/admin/login");
    await expect(page.getByRole("heading", { name: "Admin Sign In" })).toBeVisible();
  });

  test("protected admin redirects to login", async ({ page }) => {
    await page.goto("/admin/articles");
    await expect(page).toHaveURL(/\/admin\/login/);
  });
});
