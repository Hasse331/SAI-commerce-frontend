export interface CartAsync<T> {
  acquireInitialLoad(loader: () => Promise<T>): Promise<T>;
  shouldApplyInitialLoad(): boolean;
  enqueueMutation(
    operation: () => Promise<T>,
    lifecycle?: CartMutationLifecycle<T>,
  ): Promise<T>;
}

export interface CartMutationLifecycle<T> {
  onStarted(): void;
  onSucceeded(value: T): void;
  onFailed(error: unknown): void;
}

export function createCartAsync<T>(): CartAsync<T> {
  let initialLoad: Promise<T> | null = null;
  let initialLoadIsCurrent = true;
  let mutationTail: Promise<void> = Promise.resolve();

  return {
    acquireInitialLoad(loader: () => Promise<T>): Promise<T> {
      if (!initialLoad) {
        initialLoad = loader();
      }

      return initialLoad;
    },
    shouldApplyInitialLoad(): boolean {
      return initialLoadIsCurrent;
    },
    enqueueMutation(
      operation: () => Promise<T>,
      lifecycle?: CartMutationLifecycle<T>,
    ): Promise<T> {
      initialLoadIsCurrent = false;

      const runMutation = async () => {
        lifecycle?.onStarted();

        try {
          const value = await operation();
          lifecycle?.onSucceeded(value);
          return value;
        } catch (error) {
          lifecycle?.onFailed(error);
          throw error;
        }
      };
      const mutation = mutationTail.then(runMutation, runMutation);
      mutationTail = mutation.then(
        () => undefined,
        () => undefined,
      );

      return mutation;
    },
  };
}
