/* eslint-disable @typescript-eslint/no-require-imports */
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
  MAX_GUESTBOOK_MESSAGE_LENGTH,
  normalizeGuestbookMessage,
  validateGuestbookMessage,
} = require("../src/lib/guestbook/guestbook-validation.ts");
const {
  unavailableGuestbookService,
} = require("../src/lib/guestbook/guestbook-service.ts");

async function run() {
  assert.equal(validateGuestbookMessage("   ").valid, false);
  assert.equal(validateGuestbookMessage("a").valid, false);
  assert.equal(validateGuestbookMessage("hello").valid, true);
  assert.equal(
    validateGuestbookMessage("x".repeat(MAX_GUESTBOOK_MESSAGE_LENGTH + 1))
      .valid,
    false,
  );
  assert.equal(normalizeGuestbookMessage("  hello\r\nworld  "), "hello\nworld");

  const messages = await unavailableGuestbookService.listVisibleMessages();
  assert.deepEqual(messages, []);
  const result = await unavailableGuestbookService.createMessage("user", {
    content: "Hello",
    idempotencyKey: "test-key",
  });
  assert.equal(result.status, "configuration-unavailable");

  console.log(
    JSON.stringify({ validation: true, plainText: true, safeFallback: true }),
  );
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
