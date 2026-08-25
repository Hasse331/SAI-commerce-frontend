import assert from "node:assert/strict";
import test from "node:test";

import { acceptAll, createInitialConsentState, rejectOptional } from "./domain";
import { persistAndVerifyConsentDecision } from "./verified-browser-cookie";

const now = new Date("2026-08-23T12:00:00.000Z");

test("announces only after the exact decision has been written and read back", () => {
  const decision = acceptAll(createInitialConsentState(), now).decision!;
  const calls: string[] = [];

  const saved = persistAndVerifyConsentDecision(decision, {
    write(value) {
      assert.equal(value, decision);
      calls.push("write");
    },
    read() {
      calls.push("read");
      return decision;
    },
    announce(value) {
      assert.equal(value, decision);
      calls.push("announce");
    },
  });

  assert.equal(saved, true);
  assert.deepEqual(calls, ["write", "read", "announce"]);
});

test("fails closed and never announces when the browser silently retains another decision", () => {
  const requested = acceptAll(createInitialConsentState(), now).decision!;
  const retained = rejectOptional(createInitialConsentState(), now).decision!;
  const calls: string[] = [];

  const saved = persistAndVerifyConsentDecision(requested, {
    write() { calls.push("write"); },
    read() { calls.push("read"); return retained; },
    announce() { calls.push("announce"); },
  });

  assert.equal(saved, false);
  assert.deepEqual(calls, ["write", "read"]);
});

test("fails closed when cookie IO throws or readback is missing", () => {
  const decision = acceptAll(createInitialConsentState(), now).decision!;
  assert.equal(persistAndVerifyConsentDecision(decision, {
    write() { throw new Error("blocked"); },
    read() { return decision; },
    announce() { throw new Error("must not announce"); },
  }), false);
  assert.equal(persistAndVerifyConsentDecision(decision, {
    write() {},
    read() { return null; },
    announce() { throw new Error("must not announce"); },
  }), false);
});
