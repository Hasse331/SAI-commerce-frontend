import assert from "node:assert/strict";
import test from "node:test";

import { createCartAsync } from "./cart-async";

function deferred<T>() {
  let resolve: (value: T) => void;
  let reject: (reason?: unknown) => void;
  const promise = new Promise<T>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });

  return { promise, resolve: resolve!, reject: reject! };
}

test("initial load acquisitions share one outstanding loader promise", async () => {
  const loadingCart = deferred<string>();
  let loadCalls = 0;
  const cartAsync = createCartAsync<string>();

  const firstAcquisition = cartAsync.acquireInitialLoad(() => {
    loadCalls += 1;
    return loadingCart.promise;
  });
  const secondAcquisition = cartAsync.acquireInitialLoad(() => {
    loadCalls += 1;
    return Promise.resolve("unexpected-second-load");
  });

  assert.strictEqual(firstAcquisition, secondAcquisition);
  assert.equal(loadCalls, 1);

  loadingCart.resolve("loaded-cart");
  assert.equal(await secondAcquisition, "loaded-cart");
});

test("mutations run in server order and continue after a rejection", async () => {
  const first = deferred<string>();
  const second = deferred<string>();
  const third = deferred<string>();
  const starts: string[] = [];
  const cartAsync = createCartAsync<string>();

  const firstResult = cartAsync.enqueueMutation(() => {
    starts.push("first");
    return first.promise;
  });
  const secondResult = cartAsync.enqueueMutation(() => {
    starts.push("second");
    return second.promise;
  });
  const thirdResult = cartAsync.enqueueMutation(() => {
    starts.push("third");
    return third.promise;
  });

  await Promise.resolve();
  assert.deepEqual(starts, ["first"]);

  first.resolve("cart-after-first");
  assert.equal(await firstResult, "cart-after-first");
  await Promise.resolve();
  assert.deepEqual(starts, ["first", "second"]);

  second.reject(new Error("server rejected second mutation"));
  await assert.rejects(secondResult, /server rejected second mutation/);
  await Promise.resolve();
  assert.deepEqual(starts, ["first", "second", "third"]);

  third.resolve("cart-after-third");
  assert.equal(await thirdResult, "cart-after-third");
});
