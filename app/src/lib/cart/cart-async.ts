export interface CartAsync<T> {
  acquireInitialLoad(loader: () => Promise<T>): Promise<T>;
  enqueueMutation(operation: () => Promise<T>): Promise<T>;
}

export function createCartAsync<T>(): CartAsync<T> {
  let initialLoad: Promise<T> | null = null;
  let mutationTail: Promise<void> = Promise.resolve();

  return {
    acquireInitialLoad(loader: () => Promise<T>): Promise<T> {
      if (!initialLoad) {
        initialLoad = loader();
      }

      return initialLoad;
    },
    enqueueMutation(operation: () => Promise<T>): Promise<T> {
      const mutation = mutationTail.then(operation, operation);
      mutationTail = mutation.then(
        () => undefined,
        () => undefined,
      );

      return mutation;
    },
  };
}
