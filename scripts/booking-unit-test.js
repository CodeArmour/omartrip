const assert = require("node:assert/strict");
const fs = require("node:fs");
const ts = require("typescript");

require.extensions[".ts"] = (module, filename) => {
  const source = fs.readFileSync(filename, "utf8");
  const output = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
      esModuleInterop: true,
    },
    fileName: filename,
  }).outputText;
  module._compile(output, filename);
};

const {
  formatSlotTime,
  getMonthGrid,
  zonedDateTimeToUtc,
} = require("../src/lib/booking/calendar-utils.ts");
const {
  generateSlotsForDate,
  getPreviewAvailability,
} = require("../src/lib/booking/availability-service.ts");
const { bookingService } = require("../src/lib/booking/booking-service.ts");
const {
  validateBookingInput,
} = require("../src/lib/booking/booking-validation.ts");

async function run() {
  assert.equal(
    getMonthGrid(2024, 1).filter(Boolean).length,
    29,
    "leap-year February",
  );
  assert.equal(
    getMonthGrid(2026, 7).length,
    42,
    "calendar keeps six stable weeks",
  );

  assert.equal(
    zonedDateTimeToUtc("2026-03-27", "09:00", "Europe/Brussels").toISOString(),
    "2026-03-27T08:00:00.000Z",
    "Brussels winter offset",
  );
  assert.equal(
    zonedDateTimeToUtc("2026-03-30", "09:00", "Europe/Brussels").toISOString(),
    "2026-03-30T07:00:00.000Z",
    "Brussels daylight-saving offset",
  );

  const fixedNow = new Date("2026-08-10T07:30:00.000Z");
  const noticeSlots = generateSlotsForDate("2026-08-11", fixedNow);
  assert.equal(
    noticeSlots[0].startsAt,
    "2026-08-11T07:45:00.000Z",
    "24-hour notice",
  );
  assert.equal(
    new Date(noticeSlots[1].startsAt) - new Date(noticeSlots[0].startsAt),
    45 * 60 * 1000,
    "30-minute sessions include the configured 15-minute buffer",
  );

  const weekend = generateSlotsForDate("2026-08-15", fixedNow);
  assert.equal(weekend.length, 0, "weekends have no preview availability");
  const preview = getPreviewAvailability({
    month: "2026-08",
    date: "2026-08-11",
    now: fixedNow,
  });
  assert.equal(preview.mode, "preview");
  assert.equal(preview.configured, false);
  assert.ok(preview.availableDates.includes("2026-08-11"));

  const sampleIso = "2026-08-11T12:00:00.000Z";
  assert.match(formatSlotTime(sampleIso, false), /14:00/);
  assert.match(formatSlotTime(sampleIso, true), /2:00|02:00/);

  const invalid = validateBookingInput({
    fullName: "A",
    email: "bad",
    topic: "short",
  });
  assert.equal(invalid.valid, false);
  assert.deepEqual(Object.keys(invalid.fieldErrors).sort(), [
    "email",
    "fullName",
    "idempotencyKey",
    "startsAt",
    "topic",
  ]);
  const valid = validateBookingInput({
    startsAt: noticeSlots[0].startsAt,
    fullName: " Omar <Test> ",
    email: "OMAR@EXAMPLE.COM",
    topic: "A sufficiently detailed project topic.",
    idempotencyKey: "fixed-test-key",
  });
  assert.equal(valid.valid, true);
  assert.equal(valid.normalized.fullName, "Omar Test");
  assert.equal(valid.normalized.email, "omar@example.com");

  const conflict = await bookingService.createBooking({
    ...valid.normalized,
    startsAt: "2020-01-01T09:00:00.000Z",
  });
  assert.equal(conflict.status, "conflict", "submission revalidates the slot");
  const unavailable = await bookingService.createBooking(valid.normalized);
  assert.equal(unavailable.status, "configuration-unavailable");
  const repeated = await bookingService.createBooking(valid.normalized);
  assert.equal(
    repeated.status,
    "configuration-unavailable",
    "repeated requests never fake persistence",
  );

  console.log(
    JSON.stringify(
      {
        leapYear: true,
        dst: true,
        noticeAndBuffer: true,
        formatToggle: true,
        validation: true,
        slotConflict: true,
        providerUnavailable: true,
      },
      null,
      2,
    ),
  );
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
