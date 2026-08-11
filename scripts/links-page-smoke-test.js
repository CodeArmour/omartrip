const { chromium } = require("playwright");

const baseUrl = process.env.PORTFOLIO_URL || "http://localhost:3000";

async function run() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({
    viewport: { width: 1440, height: 1100 },
  });
  const consoleErrors = [];
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });
  page.on("pageerror", (error) => consoleErrors.push(error.message));

  await page.goto(`${baseUrl}/#other`, { waitUntil: "networkidle" });
  const homeCard = page.getByRole("link", {
    name: "My Links: Find me across the web and social platforms.",
  });
  await homeCard.click();
  await page.waitForURL(`${baseUrl}/links`);

  const cards = page.locator(".social-link-card");
  const destinations = await cards.evaluateAll((nodes) =>
    nodes.map((node) => ({
      href: node.getAttribute("href"),
      target: node.getAttribute("target"),
      rel: node.getAttribute("rel"),
      label: node.getAttribute("aria-label"),
    })),
  );
  const navDestinations = await page
    .locator(".nav-pill .nav-link")
    .evaluateAll((nodes) => nodes.map((node) => node.getAttribute("href")));

  const firstCard = cards.first();
  const bounds = await firstCard.boundingBox();
  if (!bounds) throw new Error("GitHub card has no bounds");
  await page.mouse.move(
    bounds.x + bounds.width * 0.7,
    bounds.y + bounds.height / 2,
  );
  await page.waitForTimeout(350);
  const hoverState = await firstCard.evaluate((node) => ({
    pointerX: node.style.getPropertyValue("--link-pointer-x"),
    transform: getComputedStyle(node).transform,
    glowOpacity: getComputedStyle(node.querySelector(".social-link-glow"))
      .opacity,
  }));

  await firstCard.focus();
  const focusOutline = await firstCard.evaluate(
    (node) => getComputedStyle(node).outlineStyle,
  );
  await page.screenshot({
    path: "test-results/links-page-desktop.png",
    fullPage: true,
  });

  const backHref = await page
    .getByRole("link", { name: "Back to home" })
    .getAttribute("href");
  const dotGridCount = await page.locator(".dot-grid").count();
  const title = await page.title();
  const bookCallTag = await page
    .getByRole("button", { name: "Book a call with Omar" })
    .evaluate((node) => node.tagName);

  await page
    .getByRole("navigation", { name: "Primary navigation" })
    .getByRole("link", { name: "About", exact: true })
    .click();
  await page.waitForURL(`${baseUrl}/#about`);
  const aboutExists = await page.locator("#about").count();

  const mobileContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
    hasTouch: true,
    isMobile: true,
  });
  const mobile = await mobileContext.newPage();
  await mobile.goto(`${baseUrl}/links`, { waitUntil: "networkidle" });
  const mobileState = await mobile.evaluate(() => ({
    viewportWidth: innerWidth,
    documentWidth: document.documentElement.scrollWidth,
    cardCount: document.querySelectorAll(".social-link-card").length,
    glowDisplay: getComputedStyle(document.querySelector(".social-link-glow"))
      .display,
  }));
  await mobile.screenshot({
    path: "test-results/links-page-mobile.png",
    fullPage: true,
  });

  const reduced = await browser.newPage({
    viewport: { width: 1440, height: 1100 },
    reducedMotion: "reduce",
  });
  await reduced.goto(`${baseUrl}/links`, { waitUntil: "networkidle" });
  const reducedState = await reduced
    .locator(".social-link-card")
    .first()
    .evaluate((node) => ({
      animation: getComputedStyle(node).animationName,
      transform: getComputedStyle(node).transform,
      glowDisplay: getComputedStyle(node.querySelector(".social-link-glow"))
        .display,
    }));

  const result = {
    title,
    destinations,
    navDestinations,
    backHref,
    bookCallTag,
    dotGridCount,
    hoverState,
    focusOutline,
    aboutExists,
    mobileState,
    reducedState,
    consoleErrors,
  };
  console.log(JSON.stringify(result, null, 2));

  await mobileContext.close();
  await browser.close();

  const expectedNav = [
    "/#home",
    "/#about",
    "/#projects",
    "/#skills",
    "/#other",
  ];
  const failed =
    result.title !== "My Links | Omar Abusahmoud" ||
    result.destinations.length !== 3 ||
    result.destinations[0].href !== "https://github.com/CodeArmour" ||
    result.destinations[1].href !==
      "https://www.linkedin.com/in/omar-maysara-2622b0330/" ||
    result.destinations[2].href !== "mailto:omarcode.business@gmail.com" ||
    result.destinations[0].target !== "_blank" ||
    result.destinations[1].target !== "_blank" ||
    !result.destinations[0].rel.includes("noopener") ||
    !result.destinations[1].rel.includes("noopener") ||
    JSON.stringify(result.navDestinations) !== JSON.stringify(expectedNav) ||
    result.backHref !== "/#other" ||
    result.bookCallTag !== "BUTTON" ||
    result.dotGridCount !== 1 ||
    !result.hoverState.pointerX.endsWith("px") ||
    result.hoverState.transform === "none" ||
    result.hoverState.glowOpacity !== "1" ||
    result.focusOutline === "none" ||
    result.aboutExists !== 1 ||
    result.mobileState.documentWidth > result.mobileState.viewportWidth ||
    result.mobileState.cardCount !== 3 ||
    result.mobileState.glowDisplay !== "none" ||
    result.reducedState.animation !== "none" ||
    result.reducedState.transform !== "none" ||
    result.reducedState.glowDisplay !== "none" ||
    result.consoleErrors.length > 0;

  if (failed) process.exitCode = 1;
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
