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

  await page.goto(`${baseUrl}/book`, { waitUntil: "networkidle" });
  const title = await page.title();
  const currentMonth = new Intl.DateTimeFormat(undefined, {
    month: "long",
    year: "numeric",
  }).format(new Date());
  const monthHeading = await page
    .getByRole("heading", { name: currentMonth })
    .innerText();
  const previewVisible = await page
    .getByText("Development preview")
    .isVisible();
  const onlineMeetingVisible = await page
    .getByText("Online meeting")
    .isVisible();
  const googleMeetCount = await page.getByText("Google Meet").count();
  const profileLoaded = await page
    .locator(".meeting-avatar")
    .evaluate((image) => image.complete && image.naturalWidth > 0);
  const initialSelectedSlots = await page
    .locator(".booking-slots-list .is-selected")
    .count();
  const calendarButtons = page.locator("[data-booking-date]");
  const pastDateState = await calendarButtons.evaluateAll((nodes) => {
    const today = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Europe/Brussels",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date());
    const past = nodes.filter((node) => node.dataset.bookingDate < today);
    return {
      count: past.length,
      allDisabled: past.every((node) => node.disabled),
    };
  });

  const firstAvailable = page
    .locator("[data-booking-date]:not([disabled])")
    .first();
  const selectedDate = await firstAvailable.getAttribute("data-booking-date");
  await firstAvailable.click();
  await page
    .locator(".booking-slots-list button")
    .first()
    .waitFor({ state: "visible" });
  const slots = page.locator(".booking-slots-list button");
  const slotCount = await slots.count();
  const first24Label = await slots.first().innerText();
  await slots.first().click();
  const selectedStartsAt = await slots.first().getAttribute("data-starts-at");
  const selectedSlotCount = await page
    .locator(".booking-slots-list .is-selected")
    .count();
  await page.getByRole("button", { name: "12h" }).click();
  const first12Label = await slots.first().innerText();
  const persistedFormat = await page.evaluate(() =>
    localStorage.getItem("omar-booking-hour12"),
  );

  await firstAvailable.focus();
  await page.keyboard.press("PageDown");
  await page.waitForTimeout(300);
  const changedMonth =
    (await page.locator(".booking-calendar-header h2").innerText()) !==
    currentMonth;
  await page.getByRole("button", { name: "Previous month" }).click();

  const fullName = page.getByLabel("Full name");
  await fullName.fill("A");
  await fullName.blur();
  const nameError = await page
    .getByText("Enter at least 2 characters.")
    .isVisible();
  await page.getByLabel("Email address").fill("invalid");
  await page.getByLabel("Email address").blur();
  const emailError = await page
    .getByText("Enter a valid email address.")
    .isVisible();
  const topic = page.getByLabel("Topic");
  await topic.fill("short");
  await topic.blur();
  const topicError = await page
    .getByText("Add at least 10 characters about the topic.")
    .isVisible();
  const counterText = await page.getByText(/characters remaining/).innerText();
  const submitDisabled = await page
    .getByRole("button", { name: "Confirm booking" })
    .isDisabled();

  const invalidResponse = await page.request.post(
    `${baseUrl}/api/booking/request`,
    {
      data: {},
    },
  );
  const invalidApi = {
    status: invalidResponse.status(),
    body: await invalidResponse.json(),
  };
  const configurationResponse = await page.request.post(
    `${baseUrl}/api/booking/request`,
    {
      data: {
        startsAt: selectedStartsAt,
        fullName: "Test Visitor",
        email: "visitor@example.com",
        topic: "A project discovery and planning conversation.",
        idempotencyKey: "playwright-fixed-key",
        company: "",
      },
    },
  );
  const configurationApi = {
    status: configurationResponse.status(),
    body: await configurationResponse.json(),
  };

  const navButton = page.getByRole("button", { name: "Book a call with Omar" });
  await navButton.click();
  const schedulerFocused = await page
    .locator("#booking-scheduler")
    .evaluate((node) => document.activeElement === node);
  const duplicateDialogCount = await page.getByRole("dialog").count();

  await page.screenshot({
    path: "test-results/booking-page-desktop.png",
    fullPage: true,
  });

  await page.goto(baseUrl, { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Book a call with Omar" }).click();
  await page
    .getByRole("link", { name: "Book a 30-minute call with Omar Abusahmoud" })
    .click();
  await page.waitForURL(`${baseUrl}/book`);
  const modalNavigationWorked = await page
    .locator("#booking-scheduler")
    .isVisible();

  const mobileContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
    hasTouch: true,
    isMobile: true,
  });
  const mobile = await mobileContext.newPage();
  await mobile.goto(`${baseUrl}/book`, { waitUntil: "networkidle" });
  const mobileState = await mobile.evaluate(() => ({
    viewportWidth: innerWidth,
    documentWidth: document.documentElement.scrollWidth,
    columns: getComputedStyle(
      document.querySelector(".booking-scheduler-columns"),
    ).gridTemplateColumns,
    submitWidth: Math.round(
      document
        .querySelector(".booking-submit-row button")
        .getBoundingClientRect().width,
    ),
    formWidth: Math.round(
      document.querySelector(".booking-form").getBoundingClientRect().width,
    ),
  }));
  await mobile.screenshot({
    path: "test-results/booking-page-mobile.png",
    fullPage: true,
  });

  const reduced = await browser.newPage({
    viewport: { width: 1440, height: 1100 },
    reducedMotion: "reduce",
  });
  await reduced.goto(`${baseUrl}/book`, { waitUntil: "networkidle" });
  const reducedAnimation = await reduced
    .locator(".booking-scheduler")
    .evaluate((node) => getComputedStyle(node).animationName);

  const result = {
    title,
    monthHeading,
    previewVisible,
    onlineMeetingVisible,
    googleMeetCount,
    profileLoaded,
    initialSelectedSlots,
    pastDateState,
    selectedDate,
    slotCount,
    first24Label,
    first12Label,
    selectedSlotCount,
    persistedFormat,
    changedMonth,
    nameError,
    emailError,
    topicError,
    counterText,
    submitDisabled,
    invalidApi,
    configurationApi,
    schedulerFocused,
    duplicateDialogCount,
    modalNavigationWorked,
    mobileState,
    reducedAnimation,
    consoleErrors,
  };
  console.log(JSON.stringify(result, null, 2));

  await mobileContext.close();
  await browser.close();

  const failed =
    result.title !== "Book a Call | Omar Abusahmoud" ||
    result.monthHeading !== currentMonth ||
    !result.previewVisible ||
    !result.onlineMeetingVisible ||
    result.googleMeetCount !== 0 ||
    !result.profileLoaded ||
    result.initialSelectedSlots !== 0 ||
    !result.pastDateState.allDisabled ||
    !result.selectedDate ||
    result.slotCount < 1 ||
    result.first24Label === result.first12Label ||
    result.selectedSlotCount !== 1 ||
    result.persistedFormat !== "true" ||
    !result.changedMonth ||
    !result.nameError ||
    !result.emailError ||
    !result.topicError ||
    !result.counterText.includes("295") ||
    !result.submitDisabled ||
    result.invalidApi.status !== 400 ||
    result.invalidApi.body.status !== "invalid" ||
    ![409, 503].includes(result.configurationApi.status) ||
    !["conflict", "configuration-unavailable"].includes(
      result.configurationApi.body.status,
    ) ||
    !result.schedulerFocused ||
    result.duplicateDialogCount !== 0 ||
    !result.modalNavigationWorked ||
    result.mobileState.documentWidth > result.mobileState.viewportWidth ||
    result.mobileState.columns.split(" ").length !== 1 ||
    Math.abs(
      result.mobileState.submitWidth - result.mobileState.formWidth + 48,
    ) > 3 ||
    result.reducedAnimation !== "none" ||
    result.consoleErrors.length > 0;

  if (failed) process.exitCode = 1;
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
