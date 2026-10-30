export type RequestGate = ReturnType<typeof createRequestGate>;

/** Latest-request-wins: a response is applied only if no newer request started since. */
export function createRequestGate() {
  let latest = 0;
  return {
    next: () => ++latest,
    isCurrent: (id: number) => id === latest,
  };
}
