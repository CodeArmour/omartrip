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
  await desktop.getByRole("button", { name: "Skills", exact: true }).click();
  await desktop.waitForTimeout(850);

  const section = desktop.locator("#skills");
  const sphere = section.locator(".skill-sphere");
  const nodes = section.locator(".skill-node");
  const sampledNode = nodes.nth(6);
  const logos = await nodes.locator("img").evaluateAll((images) =>
    images.map((image) => ({
      complete: image.complete,
      naturalWidth: image.naturalWidth,
      naturalHeight: image.naturalHeight,
      width: image.getBoundingClientRect().width,
      height: image.getBoundingClientRect().height,
      source: image.currentSrc,
    })),
  );

  const initialTransform = await sampledNode.evaluate(
    (node) => node.style.transform,
  );
  await desktop.waitForTimeout(650);
  const autoTransform = await sampledNode.evaluate(
    (node) => node.style.transform,
  );

  await sphere.scrollIntoViewIfNeeded();
  await desktop.waitForTimeout(250);
  const sphereBounds = await sphere.boundingBox();
  if (!sphereBounds) throw new Error("Skill sphere has no bounds");
  const startX = sphereBounds.x + sphereBounds.width * 0.48;
  const startY = sphereBounds.y + sphereBounds.height * 0.5;
  await desktop.mouse.move(startX, startY);
  await desktop.mouse.down();
  await desktop.mouse.move(startX + 120, startY - 55, { steps: 8 });
  const draggingState = await sphere.getAttribute("data-dragging");
  await desktop.mouse.up();
  const releaseTransform = await sampledNode.evaluate(
    (node) => node.style.transform,
  );
  await desktop.waitForTimeout(420);
  const momentumTransform = await sampledNode.evaluate(
    (node) => node.style.transform,
  );

  await nodes.nth(6).focus();
  await desktop.waitForTimeout(320);
  const tooltipState = await nodes.nth(6).evaluate((node) => ({
    label: node.getAttribute("aria-label"),
    opacity: getComputedStyle(node.querySelector(".skill-node-tooltip"))
      .opacity,
  }));

  await sphere.focus();
  await desktop.waitForTimeout(120);
  const focusedStart = await sampledNode.evaluate(
    (node) => node.style.transform,
  );
  await desktop.waitForTimeout(450);
  const focusedIdle = await sampledNode.evaluate(
    (node) => node.style.transform,
  );
  const beforeKeyboard = focusedIdle;
  await desktop.keyboard.press("ArrowRight");
  await desktop.waitForTimeout(80);
  const afterKeyboard = await sampledNode.evaluate(
    (node) => node.style.transform,
  );

  const canvasBeforeResize = await section
    .locator("canvas")
    .evaluate((canvas) => ({
      width: canvas.width,
      height: canvas.height,
    }));
  await desktop.setViewportSize({ width: 1024, height: 900 });
  await desktop.waitForTimeout(250);
  const canvasAfterResize = await section
    .locator("canvas")
    .evaluate((canvas) => ({
      width: canvas.width,
      height: canvas.height,
    }));
  await desktop.setViewportSize({ width: 1440, height: 1100 });
  await section.scrollIntoViewIfNeeded();
  await desktop.waitForTimeout(250);
  await desktop.evaluate(() => {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  });
  await desktop.waitForTimeout(220);
  await section.screenshot({ path: "test-results/skills-section-desktop.png" });

  const touchContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
    hasTouch: true,
    isMobile: true,
  });
  const mobile = await touchContext.newPage();
  await mobile.goto(baseUrl, { waitUntil: "networkidle" });
  await mobile.locator("#skills").scrollIntoViewIfNeeded();
  await mobile.waitForTimeout(500);
  const mobileSphere = mobile.locator("#skills .skill-sphere");
  const mobileNode = mobile.locator("#skills .skill-node").first();
  const mobileBounds = await mobileSphere.boundingBox();
  if (!mobileBounds) throw new Error("Mobile skill sphere has no bounds");
  const mobileBeforeTouch = await mobileNode.evaluate(
    (node) => node.style.transform,
  );
  const cdp = await mobile.context().newCDPSession(mobile);
  const touchStartX = mobileBounds.x + mobileBounds.width * 0.45;
  const touchStartY = mobileBounds.y + mobileBounds.height * 0.5;
  await cdp.send("Input.dispatchTouchEvent", {
    type: "touchStart",
    touchPoints: [{ x: touchStartX, y: touchStartY, id: 1 }],
  });
  await cdp.send("Input.dispatchTouchEvent", {
    type: "touchMove",
    touchPoints: [{ x: touchStartX + 70, y: touchStartY - 25, id: 1 }],
  });
  await cdp.send("Input.dispatchTouchEvent", {
    type: "touchEnd",
    touchPoints: [],
  });
  await mobile.waitForTimeout(120);
  const mobileAfterTouch = await mobileNode.evaluate(
    (node) => node.style.transform,
  );
  const mobileState = await mobile.evaluate(() => ({
    viewportWidth: innerWidth,
    documentWidth: document.documentElement.scrollWidth,
    nodeCount: document.querySelectorAll("#skills .skill-node").length,
    touchAction: getComputedStyle(
      document.querySelector("#skills .skill-sphere"),
    ).touchAction,
  }));
  await mobile.locator("#skills").screenshot({
    path: "test-results/skills-section-mobile.png",
  });

  const reduced = await browser.newPage({
    viewport: { width: 1440, height: 1100 },
    reducedMotion: "reduce",
  });
  await reduced.goto(baseUrl, { waitUntil: "networkidle" });
  await reduced.locator("#skills .skill-sphere").scrollIntoViewIfNeeded();
  await reduced.waitForTimeout(250);
  const reducedNode = reduced.locator("#skills .skill-node").nth(6);
  const reducedStart = await reducedNode.evaluate(
    (node) => node.style.transform,
  );
  await reduced.waitForTimeout(550);
  const reducedIdle = await reducedNode.evaluate(
    (node) => node.style.transform,
  );
  await reduced.locator("#skills .skill-sphere").focus();
  await reduced.keyboard.press("ArrowLeft");
  await reduced.waitForTimeout(60);
  const reducedKeyboard = await reducedNode.evaluate(
    (node) => node.style.transform,
  );

  const noJavaScriptContext = await browser.newContext({
    viewport: { width: 1024, height: 900 },
    javaScriptEnabled: false,
  });
  const noJavaScript = await noJavaScriptContext.newPage();
  await noJavaScript.goto(baseUrl, { waitUntil: "load" });
  const fallbackItems = noJavaScript.locator(
    "#skills noscript .skills-fallback-grid li",
  );
  const fallbackCount = await fallbackItems.count();
  const staticFallback = {
    count: fallbackCount,
    firstVisible:
      fallbackCount > 0 ? await fallbackItems.first().isVisible() : false,
  };

  const result = {
    sectionCount: await section.count(),
    activeNavigation: await desktop
      .locator('.nav-link[aria-current="page"]')
      .innerText(),
    nodeCount: await nodes.count(),
    semanticSkillCount: await section
      .locator(".skills-semantic-list li")
      .count(),
    logos,
    canvasBeforeResize,
    canvasAfterResize,
    automaticRotation: initialTransform !== autoTransform,
    draggingState,
    momentumContinues: releaseTransform !== momentumTransform,
    tooltipState,
    focusPausesRotation: focusedStart === focusedIdle,
    keyboardRotation: beforeKeyboard !== afterKeyboard,
    mobileState,
    touchRotation: mobileBeforeTouch !== mobileAfterTouch,
    reducedIdleStatic: reducedStart === reducedIdle,
    reducedKeyboardWorks: reducedIdle !== reducedKeyboard,
    staticFallback,
    consoleErrors,
  };

  console.log(JSON.stringify(result, null, 2));
  await touchContext.close();
  await noJavaScriptContext.close();
  await browser.close();

  const failed =
    result.sectionCount !== 1 ||
    result.activeNavigation !== "Skills" ||
    result.nodeCount !== 21 ||
    result.semanticSkillCount !== 21 ||
    result.logos.length !== 21 ||
    result.logos.some(
      ({ complete, naturalWidth, naturalHeight, width, height }) =>
        !complete ||
        naturalWidth === 0 ||
        naturalHeight === 0 ||
        naturalWidth !== naturalHeight ||
        Math.abs(width - height) > 1,
    ) ||
    (result.canvasBeforeResize.width === result.canvasAfterResize.width &&
      result.canvasBeforeResize.height === result.canvasAfterResize.height) ||
    !result.automaticRotation ||
    result.draggingState !== "true" ||
    !result.momentumContinues ||
    result.tooltipState.label !== "JavaScript" ||
    result.tooltipState.opacity !== "1" ||
    !result.focusPausesRotation ||
    !result.keyboardRotation ||
    result.mobileState.documentWidth > result.mobileState.viewportWidth ||
    result.mobileState.nodeCount !== 21 ||
    result.mobileState.touchAction !== "none" ||
    !result.touchRotation ||
    !result.reducedIdleStatic ||
    !result.reducedKeyboardWorks ||
    result.staticFallback.count !== 21 ||
    !result.staticFallback.firstVisible ||
    result.consoleErrors.length > 0;

  if (failed) process.exitCode = 1;
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
