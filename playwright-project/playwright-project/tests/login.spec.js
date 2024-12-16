import { test, expect } from '@playwright/test';

const BASE_URL = 'https://animated-gingersnap-8cf7f2.netlify.app/';
const EMAIL = 'admin';
const PASSWORD = 'password123';

// Test Setup: Start and stop tracing for test debugging
test.beforeEach(async ({ context }) => {
  await context.tracing.start({ screenshots: true, snapshots: true });
});

test.afterEach(async ({ context }, testInfo) => {
  const tracePath = testInfo.status === 'failed' 
    ? `trace-${testInfo.title}.zip` 
    : undefined;
  await context.tracing.stop({ path: tracePath });
});

// Utility Function: Login
async function login(page) {
  await page.goto(BASE_URL);
  await page.waitForSelector('input[id="username"]', { timeout: 5000 });

  await page.fill('input[id="username"]', EMAIL);
  await page.fill('input[id="password"]', PASSWORD);
  page.click('button[type="submit"]'),
 // Verify navigation post-login
// Verify navigation post-login
await page.waitForLoadState('networkidle'); // Wait for the page to load completely

// Use a locator for the h1 element
const projectsHeadingLocator = page.locator('h1:has-text("Projects")');

// Wait for the heading to be visible
await projectsHeadingLocator.waitFor({ state: 'visible', timeout: 5000 });

// Assert that the heading is visible
expect(await projectsHeadingLocator.isVisible()).toBe(true);
}

// Utility Function: Verify Task in Column 
async function verifyTaskInColumn(page, column, taskText, expectedTags) {
  const columnLocator = page.locator(`div:has(h2:has-text("${column}"))`);
  const taskLocator = columnLocator.locator(`text="${taskText}"`);

  // Check task visibility
  await expect(taskLocator).toBeVisible();

  // Confirm tags for the task
  // Locate all span elements within the task context that contain tag text
  const tags = await taskLocator.locator('.. >> span').allTextContents();

  // Check if the actual tags match the expected tag texts
  expect(tags).toEqual(expect.arrayContaining(expectedTags));
}

// Test Cases
test.describe('Task Verification Tests', () => {
  test('Verify "Implement user authentication" in "To Do"', async ({ page }) => {
    await login(page);
    await page.click('text="Web Application"');
    await verifyTaskInColumn(page, 'To Do', 'Implement user authentication', ['Feature', 'High Priority']);
  });

  test('Verify "Fix navigation bug" in "To Do"', async ({ page }) => {
    await login(page);
    await page.click('text="Web Application"');
    await verifyTaskInColumn(page, 'To Do', 'Fix navigation bug', ['Bug']);
  });

  test('Verify "Design system updates" in "In Progress"', async ({ page }) => {
    await login(page);
    await page.click('text="Web Application"');
    await verifyTaskInColumn(page, 'In Progress', 'Design system updates', ['Design']);
  });

  test('Verify "Push notification system" in "To Do"', async ({ page }) => {
    await login(page);
    await page.click('text="Mobile Application"');
    await verifyTaskInColumn(page, 'To Do', 'Push notification system', ['Feature']);
  });

  test('Verify "Offline mode" in "In Progress"', async ({ page }) => {
    await login(page);
    await page.click('text="Mobile Application"');
    await verifyTaskInColumn(page, 'In Progress', 'Offline mode', ['Feature', 'High Priority']);
  });

  test('Verify "App icon design" in "Done"', async ({ page }) => {
    await login(page);
    await page.click('text="Mobile Application"');
    await verifyTaskInColumn(page, 'Done', 'App icon design', ['Design']);
  });
});
