import assert from "node:assert/strict";
import test from "node:test";

import { createCartAsync } from "./cart-async";
import { cartStateReducer, initialCartState } from "./cart-state";

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

test("queued mutation lifecycle preserves a successful add when the next mutation fails", async () => {
  const lastGoodCart = {
    checkoutUrl: "https://store.example/cart/c/cart-1",
    totalQuantity: 1,
    subtotal: { amount: "15.00", currencyCode: "USD" },
    total: { amount: "15.00", currencyCode: "USD" },
    lines: [],
  };
  const cartAfterAdd = {
    ...lastGoodCart,
    totalQuantity: 2,
    total: { amount: "30.00", currencyCode: "USD" },
  };
  const add = deferred<typeof cartAfterAdd>();
  const update = deferred<typeof cartAfterAdd>();
  const actions: string[] = [];
  let state = cartStateReducer(initialCartState, {
    type: "loadSucceeded",
    cart: lastGoodCart,
  });
  const cartAsync = createCartAsync<typeof cartAfterAdd>();

  const addResult = cartAsync.enqueueMutation(
    () => add.promise,
    {
      onStarted: () => {
        actions.push("mutationStarted");
        state = cartStateReducer(state, { type: "mutationStarted" });
      },
      onSucceeded: (cart) => {
        actions.push("addSucceeded");
        state = cartStateReducer(state, { type: "addSucceeded", cart });
      },
      onFailed: (error) => {
        actions.push("mutationFailed");
        state = cartStateReducer(state, { type: "mutationFailed", error: String(error) });
      },
    },
  );
  const updateResult = cartAsync.enqueueMutation(
    () => update.promise,
    {
      onStarted: () => {
        actions.push("mutationStarted");
        state = cartStateReducer(state, { type: "mutationStarted" });
      },
      onSucceeded: (cart) => {
        actions.push("mutationSucceeded");
        state = cartStateReducer(state, { type: "mutationSucceeded", cart });
      },
      onFailed: (error) => {
        actions.push("mutationFailed");
        state = cartStateReducer(state, { type: "mutationFailed", error: String(error) });
      },
    },
  );

  await Promise.resolve();
  assert.deepEqual(actions, ["mutationStarted"]);

  add.resolve(cartAfterAdd);
  await addResult;
  await Promise.resolve();
  assert.deepEqual(actions, ["mutationStarted", "addSucceeded", "mutationStarted"]);
  assert.deepEqual(state, {
    cart: cartAfterAdd,
    status: "mutating",
    error: null,
    isOpen: true,
  });

  update.reject("update failed");
  await assert.rejects(updateResult, /update failed/);
  assert.deepEqual(actions, [
    "mutationStarted",
    "addSucceeded",
    "mutationStarted",
    "mutationFailed",
  ]);
  assert.deepEqual(state, {
    cart: cartAfterAdd,
    status: "error",
    error: "update failed",
    isOpen: true,
  });
});

test("a new cart orchestrator accepts a mutation before the initial load is acquired", async () => {
  const cartAsync = createCartAsync<string>();
  const mutation = cartAsync.enqueueMutation(async () => "cart-from-early-mutation");

  assert.equal(await mutation, "cart-from-early-mutation");
});

test("a late initial load cannot overwrite a mutation enqueued before load acquisition", async () => {
  const initialLoad = deferred<string>();
  const mutation = deferred<string>();
  let displayedCart = "last-good-cart";
  const cartAsync = createCartAsync<string>();
  const mutationResult = cartAsync.enqueueMutation(
    () => mutation.promise,
    {
      onStarted: () => undefined,
      onSucceeded: (cart) => {
        displayedCart = cart;
      },
      onFailed: () => undefined,
    },
  );
  const loadResult = cartAsync.acquireInitialLoad(() => initialLoad.promise);

  await Promise.resolve();
  mutation.resolve("cart-after-mutation");
  await mutationResult;
  initialLoad.resolve("stale-cart-from-initial-load");
  const loadedCart = await loadResult;

  if (cartAsync.shouldApplyInitialLoad()) {
    displayedCart = loadedCart;
  }

  assert.equal(displayedCart, "cart-after-mutation");
  assert.equal(cartAsync.shouldApplyInitialLoad(), false);
});

test("initial load stays valid without mutations and is invalidated before or after acquisition", () => {
  const withoutMutation = createCartAsync<string>();
  withoutMutation.acquireInitialLoad(async () => "initial-cart");
  assert.equal(withoutMutation.shouldApplyInitialLoad(), true);

  const mutationBeforeLoad = createCartAsync<string>();
  void mutationBeforeLoad.enqueueMutation(async () => "cart-after-mutation");
  mutationBeforeLoad.acquireInitialLoad(async () => "initial-cart");
  assert.equal(mutationBeforeLoad.shouldApplyInitialLoad(), false);

  const mutationAfterLoad = createCartAsync<string>();
  mutationAfterLoad.acquireInitialLoad(async () => "initial-cart");
  void mutationAfterLoad.enqueueMutation(async () => "cart-after-mutation");
  assert.equal(mutationAfterLoad.shouldApplyInitialLoad(), false);
});
