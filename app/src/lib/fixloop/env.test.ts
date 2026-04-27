import test from "node:test";
import assert from "node:assert/strict";

import {
  getFixloopProjectName,
  hasFixloopEnabled,
  hasFixloopProjectName,
} from "./env.ts";

test("getFixloopProjectName returns the configured project name", () => {
  process.env.AGENTIC_FIX_LOOP_PROJECT_NAME =
    "Spectrum Audio Instruments storefront";

  assert.equal(
    getFixloopProjectName(),
    "Spectrum Audio Instruments storefront"
  );
});

test("getFixloopProjectName returns undefined when the project name is missing", () => {
  delete process.env.AGENTIC_FIX_LOOP_PROJECT_NAME;

  assert.equal(getFixloopProjectName(), undefined);
});

test("hasFixloopProjectName is false when the project name is missing", () => {
  delete process.env.AGENTIC_FIX_LOOP_PROJECT_NAME;

  assert.equal(hasFixloopProjectName(), false);
});

test("hasFixloopEnabled is true by default when a project name exists", () => {
  process.env.AGENTIC_FIX_LOOP_PROJECT_NAME =
    "Spectrum Audio Instruments storefront";
  delete process.env.USE_FIXLOOP;

  assert.equal(hasFixloopEnabled(), true);
});

test("hasFixloopEnabled is false when USE_FIXLOOP is set to false", () => {
  process.env.AGENTIC_FIX_LOOP_PROJECT_NAME =
    "Spectrum Audio Instruments storefront";
  process.env.USE_FIXLOOP = "false";

  assert.equal(hasFixloopEnabled(), false);
});

test("hasFixloopEnabled is false when the project name is missing", () => {
  delete process.env.AGENTIC_FIX_LOOP_PROJECT_NAME;
  process.env.USE_FIXLOOP = "true";

  assert.equal(hasFixloopEnabled(), false);
});
