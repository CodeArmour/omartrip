import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "test-results/**",
    "docs/design-references/**",
    "scripts/about-smoke-test.js",
    "scripts/projects-smoke-test.js",
    "scripts/more-explore-smoke-test.js",
    "scripts/links-page-smoke-test.js",
    "scripts/contact-dialog-smoke-test.js",
    "scripts/booking-unit-test.js",
    "scripts/booking-page-smoke-test.js",
    "scripts/skills-smoke-test.js",
    "scripts/ui-smoke-test.js",
    "next-env.d.ts",
  ]),
]);
