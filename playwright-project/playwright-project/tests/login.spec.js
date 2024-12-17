import { test, expect } from '@playwright/test';
import tasks from '../tasks.json'; 

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
  await page.click('button[type="submit"]');
  await page.waitForLoadState('networkidle'); // Wait for the page to load completely

  const projectsHeadingLocator = page.locator('h1:has-text("Projects")');
  await projectsHeadingLocator.waitFor({ state: 'visible', timeout: 5000 });
  expect(await projectsHeadingLocator.isVisible()).toBe(true);
}

// Utility Function: Verify Task in Column 
async function verifyTaskInColumn(page, column, taskText, expectedTags) {
  const columnLocator = page.locator(`div:has(h2:has-text("${column}"))`);
  const taskLocator = columnLocator.locator(`text="${taskText}"`);

  await expect(taskLocator).toBeVisible();
  
  const tags = await taskLocator.locator('.. >> span').allTextContents();
  expect(tags).toEqual(expect.arrayContaining(expectedTags));
}

// Data-Driven Test Cases
test.describe('Task Verification Tests', () => {
  for (const task of tasks) {
    test(`Verify "${task.taskText}" in "${task.column}"`, async ({ page }) => {
      await login(page);
      await page.click(`text="${task.app}"`);
      await verifyTaskInColumn(page, task.column, task.taskText, task.expectedTags);
    });
  }
});
