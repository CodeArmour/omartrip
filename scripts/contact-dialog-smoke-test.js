const { chromium } = require("playwright");

const baseUrl = process.env.PORTFOLIO_URL || "http://localhost:3000";

async function run() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1100 },
    permissions: ["clipboard-read", "clipboard-write"],
  });
  const page = await context.newPage();
  const consoleErrors = [];
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });
  page.on("pageerror", (error) => consoleErrors.push(error.message));

  await page.goto(baseUrl, { waitUntil: "networkidle" });
  await page.evaluate(() => window.scrollTo(0, 500));
  const scrollBefore = await page.evaluate(() => window.scrollY);
  const homeTrigger = page.getByRole("button", {
    name: "Book a call with Omar",
  });
  await homeTrigger.click();
  const dialog = page.getByRole("dialog", { name: "Get in touch" });
  await dialog.waitFor({ state: "visible" });
  await page.waitForTimeout(450);

  const initialState = await page.evaluate(() => {
    const portal = document.querySelector("[data-contact-dialog-portal]");
    const dialogNode = document.querySelector("[role='dialog']");
    const appNode = Array.from(document.body.children).find(
      (node) => node !== portal,
    );
    return {
      url: location.href,
      bodyOverflow: getComputedStyle(document.body).overflow,
      appAriaHidden: appNode?.getAttribute("aria-hidden"),
      appInert: appNode instanceof HTMLElement ? appNode.inert : false,
      activeLabel: document.activeElement?.getAttribute("aria-label"),
      role: dialogNode?.getAttribute("role"),
      modal: dialogNode?.getAttribute("aria-modal"),
      labelledBy: dialogNode?.getAttribute("aria-labelledby"),
      describedBy: dialogNode?.getAttribute("aria-describedby"),
    };
  });

  const bookingState = {
    disabledCount: await dialog.locator("[aria-disabled='true']").count(),
    bookingLinks: await dialog
      .getByRole("link", { name: /Book a 30-minute call/ })
      .count(),
    href: await dialog
      .getByRole("link", { name: /Book a 30-minute call/ })
      .getAttribute("href"),
  };
  const emailHref = await dialog
    .getByRole("link", { name: "Send an email to Omar Abusahmoud" })
    .first()
    .getAttribute("href");
  const socialLinks = await dialog
    .getByRole("navigation", { name: "Contact links" })
    .locator("a")
    .evaluateAll((nodes) =>
      nodes.map((node) => ({
        href: node.getAttribute("href"),
        target: node.getAttribute("target"),
        rel: node.getAttribute("rel"),
        label: node.getAttribute("aria-label"),
      })),
    );

  await dialog.getByRole("heading", { name: "Get in touch" }).click();
  const remainedOpenAfterInsideClick = await dialog.isVisible();

  const socialEmail = dialog
    .getByRole("navigation", { name: "Contact links" })
    .getByRole("link", { name: "Send an email to Omar Abusahmoud" });
  await socialEmail.focus();
  await page.keyboard.press("Tab");
  const trappedFocusLabel = await page.evaluate(() =>
    document.activeElement?.getAttribute("aria-label"),
  );

  const copyButton = dialog.getByRole("button", { name: "Copy email address" });
  await copyButton.click();
  const copiedLabel = await dialog
    .getByRole("button", { name: "Email copied" })
    .innerText();
  const clipboardValue = await page.evaluate(() =>
    navigator.clipboard.readText(),
  );
  await page.waitForTimeout(2100);

  await page.evaluate(() => {
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText: () => Promise.reject(new Error("blocked")) },
    });
  });
  await dialog.getByRole("button", { name: "Copy email address" }).click();
  const failedLabel = await dialog
    .getByRole("button", { name: "Copy failed" })
    .innerText();

  await page.screenshot({
    path: "test-results/contact-dialog-desktop.png",
    fullPage: false,
  });

  await page.keyboard.press("Escape");
  await dialog.waitFor({ state: "detached" });
  await page.waitForTimeout(50);
  const escapeState = {
    restoredFocus: await homeTrigger.evaluate(
      (node) => document.activeElement === node,
    ),
    scrollAfter: await page.evaluate(() => window.scrollY),
    bodyPosition: await page.evaluate(() => document.body.style.position),
  };

  await homeTrigger.click();
  await dialog.waitFor({ state: "visible" });
  await page
    .locator(".contact-dialog-backdrop")
    .click({ position: { x: 5, y: 5 } });
  await dialog.waitFor({ state: "detached" });
  const backdropClosed = (await page.getByRole("dialog").count()) === 0;

  await page.goto(`${baseUrl}/links`, { waitUntil: "networkidle" });
  const linksTrigger = page.getByRole("button", {
    name: "Book a call with Omar",
  });
  await linksTrigger.click();
  const linksDialogOpened = await page
    .getByRole("dialog", { name: "Get in touch" })
    .isVisible();
  await page.getByRole("button", { name: "Close contact dialog" }).click();
  await page.getByRole("dialog").waitFor({ state: "detached" });

  const mobileContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
    hasTouch: true,
    isMobile: true,
  });
  const mobile = await mobileContext.newPage();
  await mobile.goto(`${baseUrl}/links`, { waitUntil: "networkidle" });
  await mobile.getByRole("button", { name: "Book a call with Omar" }).click();
  await mobile.getByRole("dialog").waitFor({ state: "visible" });
  await mobile.waitForTimeout(450);
  const mobileState = await mobile
    .locator(".contact-dialog")
    .evaluate((node) => {
      const bounds = node.getBoundingClientRect();
      return {
        width: Math.round(bounds.width),
        bottom: Math.round(innerHeight - bounds.bottom),
        documentWidth: document.documentElement.scrollWidth,
        viewportWidth: innerWidth,
        overflowY: getComputedStyle(node).overflowY,
      };
    });
  await mobile.screenshot({
    path: "test-results/contact-dialog-mobile.png",
    fullPage: false,
  });

  const reduced = await browser.newPage({
    viewport: { width: 1440, height: 1100 },
    reducedMotion: "reduce",
  });
  await reduced.goto(baseUrl, { waitUntil: "networkidle" });
  await reduced.getByRole("button", { name: "Book a call with Omar" }).click();
  await reduced.waitForTimeout(50);
  const reducedAnimation = await reduced
    .locator(".contact-dialog")
    .evaluate((node) => ({
      duration: getComputedStyle(node).animationDuration,
      transform: getComputedStyle(node).transform,
    }));

  const result = {
    scrollBefore,
    initialState,
    bookingState,
    emailHref,
    socialLinks,
    remainedOpenAfterInsideClick,
    trappedFocusLabel,
    copiedLabel,
    clipboardValue,
    failedLabel,
    escapeState,
    backdropClosed,
    linksDialogOpened,
    mobileState,
    reducedAnimation,
    consoleErrors,
  };
  console.log(JSON.stringify(result, null, 2));

  await mobileContext.close();
  await context.close();
  await browser.close();

  const failed =
    result.initialState.url !== `${baseUrl}/` ||
    result.initialState.bodyOverflow !== "hidden" ||
    result.initialState.appAriaHidden !== "true" ||
    !result.initialState.appInert ||
    result.initialState.activeLabel !== "Close contact dialog" ||
    result.initialState.role !== "dialog" ||
    result.initialState.modal !== "true" ||
    result.initialState.labelledBy !== "contact-dialog-title" ||
    result.initialState.describedBy !== "contact-dialog-description" ||
    result.bookingState.disabledCount !== 0 ||
    result.bookingState.bookingLinks !== 1 ||
    result.bookingState.href !== "/book" ||
    result.emailHref !==
      "mailto:omarcode.business@gmail.com?subject=Project%20inquiry%20from%20your%20portfolio" ||
    result.socialLinks[0].href !== "https://github.com/CodeArmour" ||
    result.socialLinks[1].href !==
      "https://www.linkedin.com/in/omar-maysara-2622b0330/" ||
    result.socialLinks[2].href !== "mailto:omarcode.business@gmail.com" ||
    result.socialLinks[0].target !== "_blank" ||
    result.socialLinks[1].target !== "_blank" ||
    !result.socialLinks[0].rel.includes("noopener") ||
    !result.socialLinks[1].rel.includes("noopener") ||
    !result.remainedOpenAfterInsideClick ||
    result.trappedFocusLabel !== "Close contact dialog" ||
    !result.copiedLabel.includes("Email copied") ||
    result.clipboardValue !== "omarcode.business@gmail.com" ||
    !result.failedLabel.includes("Copy failed") ||
    !result.escapeState.restoredFocus ||
    Math.abs(result.escapeState.scrollAfter - result.scrollBefore) > 1 ||
    result.escapeState.bodyPosition !== "" ||
    !result.backdropClosed ||
    !result.linksDialogOpened ||
    result.mobileState.width !== 390 ||
    result.mobileState.bottom !== 0 ||
    result.mobileState.documentWidth > result.mobileState.viewportWidth ||
    result.mobileState.overflowY !== "auto" ||
    Number.parseFloat(result.reducedAnimation.duration) > 0.001 ||
    !["none", "matrix(1, 0, 0, 1, 0, 0)"].includes(
      result.reducedAnimation.transform,
    ) ||
    result.consoleErrors.length > 0;

  if (failed) process.exitCode = 1;
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
