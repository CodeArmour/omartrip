/* eslint-disable @typescript-eslint/no-require-imports */
const { chromium } = require("playwright");

const baseUrl = process.env.PORTFOLIO_URL || "http://127.0.0.1:3000";
const storageKey = "omar-portfolio-theme";

async function run() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({
    viewport: { width: 1440, height: 1000 },
  });
  const consoleErrors = [];

  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });
  page.on("pageerror", (error) => consoleErrors.push(error.message));

  await page.goto(baseUrl, { waitUntil: "networkidle" });
  await page.evaluate((key) => localStorage.removeItem(key), storageKey);
  await page.reload({ waitUntil: "networkidle" });
  await page.evaluate(() => scrollTo(0, 0));

  const toggle = page.getByRole("button", { name: "Switch to light mode" });
  const defaultState = await page.evaluate(
    (key) => ({
      theme: document.documentElement.dataset.theme,
      scheme: document.documentElement.style.colorScheme,
      stored: localStorage.getItem(key),
    }),
    storageKey,
  );

  await toggle.focus();
  await toggle.press("Enter");
  await page.waitForTimeout(350);
  const lightState = await page.evaluate(
    (key) => ({
      theme: document.documentElement.dataset.theme,
      scheme: document.documentElement.style.colorScheme,
      stored: localStorage.getItem(key),
      background: getComputedStyle(document.body).backgroundColor,
    }),
    storageKey,
  );

  await page.screenshot({
    path: "test-results/theme-light-home.png",
    fullPage: true,
  });

  await page.goto(`${baseUrl}/links`, { waitUntil: "networkidle" });
  const persistedState = await page.evaluate(
    (key) => ({
      theme: document.documentElement.dataset.theme,
      stored: localStorage.getItem(key),
    }),
    storageKey,
  );
  const routeToggle = page.getByRole("button", { name: "Switch to dark mode" });
  await routeToggle.focus();
  const focusOutline = await routeToggle.evaluate(
    (node) => getComputedStyle(node).outlineStyle,
  );
  await page.screenshot({
    path: "test-results/theme-light-links.png",
    fullPage: true,
  });

  await routeToggle.click();
  const darkState = await page.evaluate(
    (key) => ({
      theme: document.documentElement.dataset.theme,
      scheme: document.documentElement.style.colorScheme,
      stored: localStorage.getItem(key),
    }),
    storageKey,
  );

  const mobile = await browser.newPage({
    viewport: { width: 390, height: 844 },
  });
  await mobile.goto(baseUrl, { waitUntil: "networkidle" });
  const mobileLayout = await mobile.evaluate(() => ({
    viewportWidth: innerWidth,
    documentWidth: document.documentElement.scrollWidth,
    toggleVisible: Boolean(document.querySelector(".nav-theme-control")),
  }));

  await browser.close();

  const result = {
    defaultState,
    lightState,
    persistedState,
    darkState,
    focusOutline,
    mobileLayout,
    consoleErrors,
  };
  console.log(JSON.stringify(result, null, 2));

  const failed =
    defaultState.theme !== "dark" ||
    lightState.theme !== "light" ||
    lightState.scheme !== "light" ||
    lightState.stored !== "light" ||
    lightState.background !== "rgb(242, 239, 229)" ||
    persistedState.theme !== "light" ||
    persistedState.stored !== "light" ||
    darkState.theme !== "dark" ||
    darkState.scheme !== "dark" ||
    darkState.stored !== "dark" ||
    focusOutline === "none" ||
    mobileLayout.documentWidth > mobileLayout.viewportWidth ||
    !mobileLayout.toggleVisible ||
    consoleErrors.length > 0;

  if (failed) process.exitCode = 1;
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
