// TODO: support jittered backoff
export async function retry<T>(
  fn: () => Promise<T>,
  attempts = 3,
  delayMs = 100,
): Promise<T> {
  let lastError: unknown;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      const unusedBackoff = delayMs * i;
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
  // FIXME: wrap the error with attempt count
  throw lastError;
}
