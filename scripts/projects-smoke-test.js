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

  await desktop.goto(baseUrl, { waitUntil: "networkidle" });
  await desktop.getByRole("button", { name: "Projects", exact: true }).click();
  await desktop.waitForTimeout(850);

  await desktop
    .locator("#about")
    .evaluate((node) => node.scrollIntoView({ block: "start" }));
  await desktop.waitForTimeout(500);
  const activeAfterAboutScroll = await desktop
    .locator('.nav-link[aria-current="page"]')
    .innerText();

  await desktop
    .locator("#projects")
    .evaluate((node) => node.scrollIntoView({ block: "start" }));
  await desktop.waitForTimeout(500);
  const activeAfterProjectsScroll = await desktop
    .locator('.nav-link[aria-current="page"]')
    .innerText();

  const section = desktop.locator("section#projects");
  const visuals = section.locator(".project-visual");
  const images = await section
    .locator(".project-image-viewport img")
    .evaluateAll((nodes) =>
      nodes.map((image) => ({
        complete: image.complete,
        naturalWidth: image.naturalWidth,
        naturalHeight: image.naturalHeight,
        source: image.currentSrc,
      })),
    );

  const firstVisual = visuals.first();
  await firstVisual.scrollIntoViewIfNeeded();
  await desktop.waitForTimeout(250);
  const firstBounds = await firstVisual.boundingBox();
  if (!firstBounds) throw new Error("First project visual has no bounds");
  await desktop.mouse.move(
    firstBounds.x + firstBounds.width * 0.8,
    firstBounds.y + firstBounds.height * 0.3,
  );
  await desktop.waitForTimeout(350);
  const pointerState = await firstVisual.evaluate((node) => ({
    active: node.hasAttribute("data-pointer-active"),
    rotateX: getComputedStyle(node).getPropertyValue("--rotate-x").trim(),
    rotateY: getComputedStyle(node).getPropertyValue("--rotate-y").trim(),
    spotlight: getComputedStyle(node.querySelector(".project-visual-spotlight"))
      .opacity,
  }));

  await desktop.mouse.move(10, 10);
  await desktop.waitForTimeout(400);
  const resetState = await firstVisual.evaluate((node) => ({
    active: node.hasAttribute("data-pointer-active"),
    rotateX: getComputedStyle(node).getPropertyValue("--rotate-x").trim(),
    rotateY: getComputedStyle(node).getPropertyValue("--rotate-y").trim(),
  }));

  await firstVisual.focus();
  const focusState = await firstVisual.evaluate((node) => ({
    outline: getComputedStyle(node).outlineStyle,
    borderColor: getComputedStyle(node).borderColor,
  }));

  const reviewButton = firstVisual.getByRole("button", {
    name: /Show customer review/,
  });
  await reviewButton.focus();
  const reviewFocusIndicator = await reviewButton.evaluate(
    (node) => getComputedStyle(node).boxShadow,
  );
  await reviewButton.press("Enter");
  await desktop.waitForTimeout(650);
  const flippedBounds = await firstVisual.boundingBox();
  if (!flippedBounds) throw new Error("Flipped project visual has no bounds");
  await desktop.mouse.move(
    flippedBounds.x + flippedBounds.width * 0.72,
    flippedBounds.y + flippedBounds.height * 0.35,
  );
  await desktop.waitForTimeout(350);
  const reviewState = await firstVisual.evaluate((node) => ({
    flipped: node.classList.contains("is-flipped"),
    rotateX: getComputedStyle(node).getPropertyValue("--rotate-x").trim(),
    rotateY: getComputedStyle(node).getPropertyValue("--rotate-y").trim(),
    reviewPressed: node
      .querySelector(".project-review-button")
      .getAttribute("aria-pressed"),
    backTabIndex: node
      .querySelector(".project-review-back")
      .getAttribute("tabindex"),
    starCount: node.querySelectorAll(".project-review-stars svg").length,
    filledStars: node.querySelectorAll(".project-review-stars .is-filled")
      .length,
    rating: node
      .querySelector(".project-review-stars")
      .getAttribute("aria-label"),
  }));
  await firstVisual.screenshot({
    path: "test-results/project-review-desktop.png",
  });
  const backButton = firstVisual.getByRole("button", { name: /Return to/ });
  await backButton.press("Enter");
  await desktop.waitForTimeout(650);
  const returnedToFront = await firstVisual.evaluate(
    (node) => !node.classList.contains("is-flipped"),
  );

  await section.screenshot({
    path: "test-results/projects-section-desktop.png",
  });

  const mobileContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
    hasTouch: true,
    isMobile: true,
  });
  const mobile = await mobileContext.newPage();
  await mobile.goto(baseUrl, { waitUntil: "networkidle" });
  await mobile.locator("#projects .projects-heading").scrollIntoViewIfNeeded();
  await mobile.waitForTimeout(950);
  const mobileState = await mobile.evaluate(() => ({
    viewportWidth: innerWidth,
    documentWidth: document.documentElement.scrollWidth,
    revealed: document
      .querySelector("#projects")
      .classList.contains("projects-revealed"),
    headingOpacity: getComputedStyle(
      document.querySelector("#projects .projects-heading"),
    ).opacity,
    visualTransform: getComputedStyle(document.querySelector(".project-visual"))
      .transform,
    spotlightDisplay: getComputedStyle(
      document.querySelector(".project-visual-spotlight"),
    ).display,
  }));
  const mobileReviewButton = mobile
    .locator(".project-visual")
    .first()
    .getByRole("button", { name: /Show customer review/ });
  const mobileReviewVisible = await mobileReviewButton.isVisible();
  await mobileReviewButton.click();
  await mobile.waitForTimeout(150);
  const mobileFlipped = await mobile
    .locator(".project-visual")
    .first()
    .evaluate((node) => node.classList.contains("is-flipped"));
  await mobile.locator("#projects").screenshot({
    path: "test-results/projects-section-mobile.png",
  });

  const reduced = await browser.newPage({
    viewport: { width: 1440, height: 1100 },
    reducedMotion: "reduce",
  });
  await reduced.goto(baseUrl, { waitUntil: "networkidle" });
  await reduced.locator("#projects").scrollIntoViewIfNeeded();
  const reducedState = await reduced.locator("#projects").evaluate((node) => ({
    headingOpacity: getComputedStyle(node.querySelector(".projects-heading"))
      .opacity,
    visualTransform: getComputedStyle(node.querySelector(".project-visual"))
      .transform,
    spotlightDisplay: getComputedStyle(
      node.querySelector(".project-visual-spotlight"),
    ).display,
    flipTransition: getComputedStyle(node.querySelector(".project-flip-inner"))
      .transitionDuration,
  }));

  const result = {
    sectionCount: await section.count(),
    hash: await desktop.evaluate(() => location.hash),
    revealed: await section.evaluate((node) =>
      node.classList.contains("projects-revealed"),
    ),
    activeAfterAboutScroll,
    activeAfterProjectsScroll,
    visualCount: await visuals.count(),
    images,
    pointerState,
    resetState,
    focusState,
    reviewFocusIndicator,
    reviewState,
    returnedToFront,
    externalLinks: await section
      .locator('a[target="_blank"]')
      .evaluateAll((links) => links.map((link) => link.href)),
    mobileState,
    mobileReviewVisible,
    mobileFlipped,
    reducedState,
    consoleErrors,
  };
  console.log(JSON.stringify(result, null, 2));
  await mobileContext.close();
  await browser.close();

  const failed =
    result.sectionCount !== 1 ||
    result.hash !== "#projects" ||
    !result.revealed ||
    result.activeAfterAboutScroll !== "About" ||
    result.activeAfterProjectsScroll !== "Projects" ||
    result.visualCount !== 2 ||
    images.length !== 2 ||
    images.some(
      ({ complete, naturalWidth }) => !complete || naturalWidth === 0,
    ) ||
    !images[0].source.includes("project2.png") ||
    !images[1].source.includes("project1.png") ||
    !pointerState.active ||
    pointerState.rotateX === "0deg" ||
    pointerState.rotateY === "0deg" ||
    pointerState.spotlight === "0" ||
    resetState.active ||
    resetState.rotateX !== "0deg" ||
    resetState.rotateY !== "0deg" ||
    focusState.outline === "none" ||
    reviewFocusIndicator === "none" ||
    !reviewState.flipped ||
    reviewState.rotateX === "0deg" ||
    reviewState.rotateY === "0deg" ||
    reviewState.reviewPressed !== "true" ||
    reviewState.backTabIndex !== "0" ||
    reviewState.starCount !== 5 ||
    reviewState.filledStars !== 5 ||
    reviewState.rating !== "5.0 out of 5 stars" ||
    !returnedToFront ||
    result.externalLinks.length !== 3 ||
    !result.externalLinks.includes("https://moon-two-flame.vercel.app/") ||
    !result.externalLinks.includes("https://www.andaluciagroup.eu/") ||
    !result.externalLinks.includes("https://github.com/CodeArmour") ||
    mobileState.documentWidth > mobileState.viewportWidth ||
    !mobileState.revealed ||
    mobileState.headingOpacity !== "1" ||
    mobileState.visualTransform !== "none" ||
    mobileState.spotlightDisplay !== "none" ||
    !mobileReviewVisible ||
    !mobileFlipped ||
    reducedState.headingOpacity !== "1" ||
    reducedState.visualTransform !== "none" ||
    reducedState.spotlightDisplay !== "none" ||
    Number.parseFloat(reducedState.flipTransition) > 0.001 ||
    consoleErrors.length > 0;

  if (failed) process.exitCode = 1;
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
