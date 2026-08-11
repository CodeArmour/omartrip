/* eslint-disable @typescript-eslint/no-require-imports */
const { chromium } = require("playwright");

const baseUrl = process.env.PORTFOLIO_URL || "http://localhost:3000";

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

  await page.goto(`${baseUrl}/#other`, { waitUntil: "networkidle" });
  await page
    .getByRole("link", {
      name: "Guestbook: Leave your mark and see what others have to say.",
    })
    .click();
  await page.waitForURL(`${baseUrl}/guestbook`);

  const result = {
    title: await page.title(),
    backHref: await page
      .getByRole("link", { name: "Back to home" })
      .getAttribute("href"),
    heading: await page.getByRole("heading", { level: 1 }).textContent(),
    providerButtons: await page
      .getByRole("button", { name: /Sign in with/i })
      .count(),
    configStatus: await page.getByRole("status").textContent(),
    previewMessage: await page
      .getByRole("heading", { name: "Omar Abusahmoud" })
      .count(),
    dotGrid: await page.locator(".dot-grid").count(),
    navHrefs: await page
      .locator(".nav-pill .nav-link")
      .evaluateAll((nodes) => nodes.map((node) => node.getAttribute("href"))),
    consoleErrors,
  };

  await page.screenshot({
    path: "test-results/guestbook-page-desktop.png",
    fullPage: true,
  });

  const mobile = await browser.newPage({
    viewport: { width: 390, height: 844 },
  });
  await mobile.goto(`${baseUrl}/guestbook`, { waitUntil: "networkidle" });
  result.mobile = await mobile.evaluate(() => ({
    viewport: innerWidth,
    documentWidth: document.documentElement.scrollWidth,
  }));
  await mobile.screenshot({
    path: "test-results/guestbook-page-mobile.png",
    fullPage: true,
  });

  const reduced = await browser.newPage({ reducedMotion: "reduce" });
  await reduced.goto(`${baseUrl}/guestbook`, { waitUntil: "networkidle" });
  result.reducedAnimation = await reduced
    .locator(".guestbook-enter")
    .first()
    .evaluate((node) => getComputedStyle(node).animationName);

  console.log(JSON.stringify(result, null, 2));
  await browser.close();

  assert(result.title === "Guestbook | Omar Abusahmoud", "metadata title");
  assert(result.backHref === "/#other", "back link");
  assert(result.heading.includes("Leave Your Mark"), "hero heading");
  assert(result.providerButtons === 0, "no fake OAuth buttons");
  assert(result.configStatus.includes("not configured"), "config status");
  assert(result.previewMessage === 1, "developer preview message");
  assert(result.dotGrid === 1, "dot grid");
  assert(
    JSON.stringify(result.navHrefs) ===
      JSON.stringify([
        "/#home",
        "/#about",
        "/#projects",
        "/#skills",
        "/#other",
      ]),
    "cross-route navigation",
  );
  assert(result.consoleErrors.length === 0, "console errors");
  assert(
    result.mobile.documentWidth <= result.mobile.viewport,
    "mobile overflow",
  );
  assert(result.reducedAnimation === "none", "reduced motion");
}

function assert(condition, label) {
  if (!condition) throw new Error(`Guestbook smoke check failed: ${label}`);
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
