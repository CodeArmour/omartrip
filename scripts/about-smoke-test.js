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
  await desktop.getByRole("button", { name: "About", exact: true }).click();
  await desktop.waitForTimeout(800);

  const about = desktop.locator("section#about");
  const imageSources = await about
    .locator("img")
    .evaluateAll((images) =>
      images.map((image) => image.getAttribute("src") || image.currentSrc),
    );
  const initialCenterSource = await about
    .locator(".dynamic-about-image img")
    .getAttribute("src");

  const university = about.getByRole("button", { name: /^University:/ });
  await university.hover();
  await desktop.waitForTimeout(550);
  const hoverCenterSource = await about
    .locator(".dynamic-about-image img")
    .getAttribute("src");

  const competitions = about.getByRole("button", { name: /^Competitions:/ });
  await competitions.focus();
  await desktop.waitForTimeout(550);
  const focusState = {
    pressed: await competitions.getAttribute("aria-pressed"),
    source: await about.locator(".dynamic-about-image img").getAttribute("src"),
    outline: await competitions.evaluate(
      (node) => getComputedStyle(node).outlineStyle,
    ),
  };

  const balance = about.getByRole("button", {
    name: "Show balance image",
  });
  await about.locator(".mindset-card").hover();
  await desktop.waitForTimeout(300);
  const mindsetPreviewSource = await about
    .locator(".dynamic-about-image img")
    .getAttribute("src");
  await balance.click();
  const mindsetState = {
    pressed: await balance.getAttribute("aria-pressed"),
    zIndex: await balance.evaluate((node) => getComputedStyle(node).zIndex),
  };

  const locationState = await about
    .locator(".location-card")
    .evaluate((card) => ({
      time: card.querySelector("time")?.textContent,
      zone: card.querySelector(".location-time span")?.textContent,
    }));
  const tickerAnimation = await about
    .locator(".tech-ticker-track")
    .evaluate((node) => getComputedStyle(node).animationName);

  await about.locator(".craft-card").hover();
  await desktop.waitForTimeout(300);
  const craftPreviewSource = await about
    .locator(".dynamic-about-image img")
    .getAttribute("src");

  await about.locator(".location-card").hover();
  await desktop.waitForTimeout(300);
  const brusselsPreviewSource = await about
    .locator(".dynamic-about-image img")
    .getAttribute("src");

  await desktop.mouse.move(10, 10);
  await desktop.locator("body").focus();
  await desktop.waitForTimeout(600);
  const resetCenterSource = await about
    .locator(".dynamic-about-image img")
    .getAttribute("src");

  await about.screenshot({
    path: "test-results/about-section-desktop.png",
  });

  const mobile = await browser.newPage({
    viewport: { width: 390, height: 844 },
  });
  await mobile.goto(baseUrl, { waitUntil: "networkidle" });
  await mobile.locator("section#about").scrollIntoViewIfNeeded();
  const mobileExperience = mobile
    .locator("section#about")
    .getByRole("button", { name: /^University:/ });
  await mobileExperience.click();
  const mobileState = await mobile.evaluate(() => ({
    viewportWidth: innerWidth,
    documentWidth: document.documentElement.scrollWidth,
    descriptionVisible: Boolean(
      document
        .querySelector(
          '.experience-card[aria-pressed="true"] .experience-description',
        )
        ?.checkVisibility(),
    ),
  }));
  await mobile.locator("section#about").screenshot({
    path: "test-results/about-section-mobile.png",
  });

  const reduced = await browser.newPage({
    viewport: { width: 1440, height: 1100 },
    reducedMotion: "reduce",
  });
  await reduced.goto(baseUrl, { waitUntil: "networkidle" });
  const reducedState = await reduced
    .locator("section#about")
    .evaluate((section) => ({
      tickerAnimation: getComputedStyle(
        section.querySelector(".tech-ticker-track"),
      ).animationName,
      pulseAnimation: getComputedStyle(
        section.querySelector(".craft-availability i"),
      ).animationName,
    }));

  const result = {
    aboutCount: await about.count(),
    hash: await desktop.evaluate(() => location.hash),
    imageSources,
    initialCenterSource,
    hoverCenterSource,
    focusState,
    mindsetState,
    mindsetPreviewSource,
    locationState,
    tickerAnimation,
    craftPreviewSource,
    brusselsPreviewSource,
    resetCenterSource,
    mobileState,
    reducedState,
    consoleErrors,
  };
  console.log(JSON.stringify(result, null, 2));

  await browser.close();

  const allImagesAreAboutAssets = imageSources.every(
    (source) => source.includes("%2Fabout%2F") || source.includes("/about/"),
  );
  const failed =
    result.aboutCount !== 1 ||
    result.hash !== "#about" ||
    !allImagesAreAboutAssets ||
    !initialCenterSource?.includes("me.jpeg") ||
    !hoverCenterSource?.includes("uni.jpg") ||
    focusState.pressed !== "true" ||
    !focusState.source?.includes("uni.jpg") ||
    focusState.outline === "none" ||
    mindsetState.pressed !== "true" ||
    Number(mindsetState.zIndex) < 5 ||
    !mindsetPreviewSource?.includes("mindset.jpeg") ||
    locationState.time === "--:--" ||
    !locationState.zone?.startsWith("GMT") ||
    tickerAnimation !== "tech-scroll" ||
    !craftPreviewSource?.includes("craft.jpg") ||
    !brusselsPreviewSource?.includes("brussels.jpg") ||
    !resetCenterSource?.includes("me.jpeg") ||
    mobileState.documentWidth > mobileState.viewportWidth ||
    !mobileState.descriptionVisible ||
    reducedState.tickerAnimation !== "none" ||
    reducedState.pulseAnimation !== "none" ||
    consoleErrors.length > 0;

  if (failed) process.exitCode = 1;
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
