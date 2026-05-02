import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

import {
  CONTACT_EYEBROW_INDICATOR_COLOR,
  CONTACT_EYEBROW_INDICATOR_PULSE_DURATION_SECONDS,
  CONTACT_EYEBROW_INDICATOR_SIZE,
} from "./contact-eyebrow-indicator-config.ts";

const currentFilePath = fileURLToPath(import.meta.url);
const currentDirPath = dirname(currentFilePath);

test("contact eyebrow indicator uses a bright orange accent", () => {
  assert.equal(CONTACT_EYEBROW_INDICATOR_COLOR, "#ff7a00");
});

test("contact eyebrow indicator stays compact for eyebrow text", () => {
  assert.equal(CONTACT_EYEBROW_INDICATOR_SIZE, "8px");
});

test("contact eyebrow indicator pulse animation is fast and looping", () => {
  assert.equal(CONTACT_EYEBROW_INDICATOR_PULSE_DURATION_SECONDS, 0.9);
});

test("contact eyebrow indicator stays server-safe", () => {
  const source = readFileSync(
    join(currentDirPath, "contact-eyebrow-indicator.tsx"),
    "utf8",
  );

  assert.match(source, /^"use client"/);
  assert.match(source, /@emotion\/react/);
  assert.match(source, /infinite/);
});

test("contact eyebrow indicator does not require a root layout stylesheet import", () => {
  const layoutSource = readFileSync(
    join(currentDirPath, "..", "..", "..", "app", "layout.tsx"),
    "utf8",
  );

  assert.doesNotMatch(layoutSource, /globals\.css/);
});
