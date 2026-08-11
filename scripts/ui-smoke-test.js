const { chromium } = require("playwright");

const baseUrl = process.env.PORTFOLIO_URL || "http://127.0.0.1:3000";

async function run() {
  const browser = await chromium.launch({ headless: true });
  const desktop = await browser.newPage({
    viewport: { width: 1440, height: 1000 },
  });
  desktop.setDefaultTimeout(10000);
  const consoleErrors = [];

  desktop.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });

  await desktop.goto(baseUrl, { waitUntil: "domcontentloaded" });
  await desktop.waitForTimeout(500);
  console.log("desktop loaded");

  const background = desktop.locator(".dot-grid");
  const beforeCursor = await background.evaluate((node) => ({
    x: getComputedStyle(node).getPropertyValue("--cursor-x").trim(),
    y: getComputedStyle(node).getPropertyValue("--cursor-y").trim(),
    pointerEvents: getComputedStyle(node).pointerEvents,
  }));

  await desktop.mouse.move(1110, 420);
  await desktop.waitForTimeout(400);

  const afterCursor = await background.evaluate((node) => ({
    x: getComputedStyle(node).getPropertyValue("--cursor-x").trim(),
    y: getComputedStyle(node).getPropertyValue("--cursor-y").trim(),
  }));

  const portrait = await desktop
    .getByAltText("Portrait of Omar Abusahmoud")
    .evaluate((image) => ({
      complete: image.complete,
      naturalWidth: image.naturalWidth,
      naturalHeight: image.naturalHeight,
      widthAttribute: image.getAttribute("width"),
      heightAttribute: image.getAttribute("height"),
      optimized: image.currentSrc.includes("/_next/image"),
    }));
  console.log("portrait verified");

  const suggestionTargets = [
    ["View projects", "Omar's selected work spans"],
    ["About Omar", "Omar is a software developer based in Brussels"],
    ["Explore skills", "Omar works across frontend and backend engineering"],
    ["Contact Omar", "For availability, project enquiries"],
  ];
  const suggestionResults = [];

  for (const [label, responseFragment] of suggestionTargets) {
    console.log(`checking suggestion: ${label}`);
    await desktop
      .locator(".assistant-suggestions")
      .getByRole("button", { name: label, exact: true })
      .click();
    const latestAssistantText = await desktop
      .locator(".assistant-message-assistant")
      .last()
      .textContent();
    suggestionResults.push({
      label,
      responseShown: latestAssistantText?.includes(responseFragment),
      actionShown:
        (await desktop
          .locator(".assistant-inline-action")
          .filter({ hasText: label })
          .count()) > 0,
    });
    await desktop.reload({ waitUntil: "domcontentloaded" });
  }

  await desktop.getByRole("button", { name: "Home", exact: true }).click();
  await desktop.waitForTimeout(650);

  const questionInput = desktop.getByLabel(
    "Ask Omar's portfolio assistant a question",
  );
  await questionInput.fill("Where is Omar based?");
  await questionInput.press("Enter");
  const locationResponseVisible = await desktop
    .getByText(
      "Omar is based in Brussels, Belgium, and is open to working with teams across locations.",
    )
    .isVisible();
  const chatAfterSubmit = {
    inputValue: await questionInput.inputValue(),
    sendDisabled: await desktop
      .getByRole("button", { name: "Send question" })
      .isDisabled(),
    locationResponseVisible,
    latestMessageInView: await desktop
      .locator(".assistant-messages")
      .evaluate((log) => {
        const latestMessage = log.lastElementChild;
        if (!latestMessage) return false;

        const logBounds = log.getBoundingClientRect();
        const messageBounds = latestMessage.getBoundingClientRect();
        return (
          messageBounds.bottom <= logBounds.bottom + 1 &&
          messageBounds.top >= logBounds.top - 1
        );
      }),
  };
  console.log("chat verified");

  const aboutButton = desktop.getByRole("button", {
    name: "About",
    exact: true,
  });
  await aboutButton.click();
  await desktop.waitForTimeout(850);

  const navigation = await desktop.evaluate(() => ({
    hash: window.location.hash,
    current: document.querySelector('.nav-link[aria-current="page"]')
      ?.textContent,
    scrollY: window.scrollY,
    navZIndex: getComputedStyle(document.querySelector(".floating-nav-shell"))
      .zIndex,
    backgroundZIndex: getComputedStyle(document.querySelector(".dot-grid"))
      .zIndex,
  }));

  await desktop.locator("body").click({ position: { x: 8, y: 220 } });
  await desktop.keyboard.press("Tab");
  await desktop.keyboard.press("Tab");
  await desktop.keyboard.press("Tab");
  const focusedNavigationItem = await desktop.evaluate(() => ({
    text: document.activeElement?.textContent?.trim(),
    outline: document.activeElement
      ? getComputedStyle(document.activeElement).outlineStyle
      : "none",
  }));

  await desktop.getByRole("button", { name: "Home", exact: true }).click();
  await desktop.waitForTimeout(700);

  await desktop.screenshot({
    path: "test-results/portfolio-foundation-desktop.png",
    fullPage: false,
    timeout: 10000,
  });

  const mobile = await browser.newPage({
    viewport: { width: 390, height: 844 },
  });
  mobile.setDefaultTimeout(10000);
  await mobile.goto(baseUrl, { waitUntil: "domcontentloaded" });
  await mobile.waitForTimeout(250);
  const mobileLayout = await mobile.evaluate(() => ({
    viewportWidth: window.innerWidth,
    documentWidth: document.documentElement.scrollWidth,
  }));

  const reduced = await browser.newPage({
    viewport: { width: 1440, height: 1000 },
    reducedMotion: "reduce",
  });
  reduced.setDefaultTimeout(10000);
  await reduced.goto(baseUrl, { waitUntil: "domcontentloaded" });
  await reduced.waitForTimeout(250);
  const reducedSpotlight = await reduced
    .locator(".dot-grid")
    .evaluate((node) => getComputedStyle(node, "::after").display);

  await browser.close();

  const result = {
    background: {
      pointerEvents: beforeCursor.pointerEvents,
      cursorReacted:
        beforeCursor.x !== afterCursor.x && beforeCursor.y !== afterCursor.y,
    },
    portrait,
    suggestionResults,
    chatAfterSubmit,
    navigation,
    focusedNavigationItem,
    mobileLayout,
    reducedSpotlight,
    consoleErrors,
  };

  console.log(JSON.stringify(result, null, 2));

  const failed =
    result.background.pointerEvents !== "none" ||
    !result.background.cursorReacted ||
    !portrait.complete ||
    Math.abs(portrait.naturalWidth / portrait.naturalHeight - 852 / 1846) >
      0.01 ||
    portrait.widthAttribute !== "852" ||
    portrait.heightAttribute !== "1846" ||
    !portrait.optimized ||
    suggestionResults.some(
      ({ responseShown, actionShown }) => !responseShown || !actionShown,
    ) ||
    chatAfterSubmit.inputValue !== "" ||
    !chatAfterSubmit.sendDisabled ||
    !chatAfterSubmit.locationResponseVisible ||
    !chatAfterSubmit.latestMessageInView ||
    navigation.hash !== "#about" ||
    navigation.current !== "About" ||
    navigation.scrollY === 0 ||
    Number(navigation.navZIndex) <= Number(navigation.backgroundZIndex) ||
    focusedNavigationItem.outline === "none" ||
    mobileLayout.documentWidth > mobileLayout.viewportWidth ||
    reducedSpotlight !== "none" ||
    consoleErrors.length > 0;

  if (failed) process.exitCode = 1;
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
