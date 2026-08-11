const { chromium } = require("playwright");

const baseUrl = process.env.PORTFOLIO_URL || "http://localhost:3000";

async function run() {
  const browser = await chromium.launch({ headless: true });
  const desktop = await browser.newPage({
    viewport: { width: 1440, height: 1100 },
  });
  const consoleErrors = [];
  desktop.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });
  desktop.on("pageerror", (error) => consoleErrors.push(error.message));

  await desktop.goto(baseUrl, { waitUntil: "networkidle" });
  await desktop.getByRole("button", { name: "Other", exact: true }).click();
  await desktop.waitForTimeout(1200);

  const section = desktop.locator("#other");
  const cards = section.locator(".explore-card");
  const cardHeights = await cards.evaluateAll((nodes) =>
    nodes.map((node) => Math.round(node.getBoundingClientRect().height)),
  );
  const links = await section.locator("a.explore-card").evaluateAll((nodes) =>
    nodes.map((node) => ({
      href: node.href,
      target: node.target,
      rel: node.rel,
      label: node.getAttribute("aria-label"),
    })),
  );

  const available = section.locator("a.explore-card");
  const bounds = await available.boundingBox();
  if (!bounds) throw new Error("Available Explore card has no bounds");
  await desktop.mouse.move(
    bounds.x + bounds.width * 0.72,
    bounds.y + bounds.height * 0.35,
  );
  await desktop.waitForTimeout(450);
  const hoverState = await available.evaluate((node) => ({
    pointerActive: node.dataset.pointerActive,
    pointerX: node.style.getPropertyValue("--explore-x"),
    glowOpacity: getComputedStyle(node.querySelector(".explore-card-glow"))
      .opacity,
    transform: getComputedStyle(node).transform,
  }));

  await desktop.mouse.move(10, 10);
  await desktop.waitForTimeout(520);
  const resetState = await available.evaluate((node) => {
    const transform = getComputedStyle(node).transform;
    const matrix = new DOMMatrixReadOnly(transform);
    return {
      pointerActive: node.dataset.pointerActive,
      transform,
      isResting:
        Math.abs(matrix.a - 1) < 0.001 &&
        Math.abs(matrix.d - 1) < 0.001 &&
        Math.abs(matrix.m42) < 0.1,
    };
  });

  await available.focus();
  await desktop.waitForTimeout(100);
  const focusState = await available.evaluate((node) => ({
    outline: getComputedStyle(node).outlineStyle,
    actionTransform: getComputedStyle(
      node.querySelector(".explore-card-action svg"),
    ).transform,
  }));
  await desktop.evaluate(() => {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  });
  await section.screenshot({ path: "test-results/more-explore-desktop.png" });

  const mobileContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
    hasTouch: true,
    isMobile: true,
  });
  const mobile = await mobileContext.newPage();
  await mobile.goto(baseUrl, { waitUntil: "networkidle" });
  await mobile.locator("#other").scrollIntoViewIfNeeded();
  await mobile.waitForTimeout(650);
  const mobileState = await mobile.evaluate(() => {
    const cards = Array.from(document.querySelectorAll("#other .explore-card"));
    return {
      viewportWidth: innerWidth,
      documentWidth: document.documentElement.scrollWidth,
      cardCount: cards.length,
      distinctRows: new Set(
        cards.map((card) => Math.round(card.getBoundingClientRect().top)),
      ).size,
      glowDisplay: getComputedStyle(
        document.querySelector("#other .explore-card-glow"),
      ).display,
    };
  });
  await mobile.locator("#other").screenshot({
    path: "test-results/more-explore-mobile.png",
  });

  const reduced = await browser.newPage({
    viewport: { width: 1440, height: 1100 },
    reducedMotion: "reduce",
  });
  await reduced.goto(baseUrl, { waitUntil: "networkidle" });
  await reduced.locator("#other").scrollIntoViewIfNeeded();
  const reducedState = await reduced.locator("#other").evaluate((node) => ({
    headingOpacity: getComputedStyle(
      node.querySelector(".more-explore-heading"),
    ).opacity,
    cardTransform: getComputedStyle(node.querySelector(".explore-card"))
      .transform,
    glowDisplay: getComputedStyle(node.querySelector(".explore-card-glow"))
      .display,
  }));

  const result = {
    sectionCount: await section.count(),
    hash: await desktop.evaluate(() => location.hash),
    activeNavigation: await desktop
      .locator('.nav-link[aria-current="page"]')
      .innerText(),
    revealed: await section.evaluate((node) =>
      node.classList.contains("explore-revealed"),
    ),
    cardCount: await cards.count(),
    cardHeights,
    comingSoonCount: await section.locator(".explore-card-coming-soon").count(),
    links,
    hoverState,
    resetState,
    focusState,
    mobileState,
    reducedState,
    consoleErrors,
  };

  console.log(JSON.stringify(result, null, 2));
  await mobileContext.close();
  await browser.close();

  const failed =
    result.sectionCount !== 1 ||
    result.hash !== "#other" ||
    result.activeNavigation !== "Other" ||
    !result.revealed ||
    result.cardCount !== 3 ||
    new Set(result.cardHeights).size !== 1 ||
    result.comingSoonCount !== 2 ||
    result.links.length !== 1 ||
    result.links[0].href !== `${baseUrl}/links` ||
    result.links[0].target !== "" ||
    result.links[0].rel !== "" ||
    result.hoverState.pointerActive !== "true" ||
    !result.hoverState.pointerX.endsWith("px") ||
    result.hoverState.glowOpacity !== "1" ||
    result.hoverState.transform === "none" ||
    result.resetState.pointerActive !== "false" ||
    !result.resetState.isResting ||
    result.focusState.outline === "none" ||
    result.focusState.actionTransform === "none" ||
    result.mobileState.documentWidth > result.mobileState.viewportWidth ||
    result.mobileState.cardCount !== 3 ||
    result.mobileState.distinctRows !== 3 ||
    result.mobileState.glowDisplay !== "none" ||
    result.reducedState.headingOpacity !== "1" ||
    result.reducedState.cardTransform !== "none" ||
    result.reducedState.glowDisplay !== "none" ||
    result.consoleErrors.length > 0;

  if (failed) process.exitCode = 1;
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
