// Internal configuration resolver

export function resolveConfig(env: string, overrides: Record<string, unknown>) {
  const base = env === "production" ? { debug: false, logLevel: "error", retries: 3 } :
    env === "staging" ? { debug: true, logLevel: "warn", retries: 2 } :
    env === "development" ? { debug: true, logLevel: "debug", retries: 1 } :
    env === "test" ? { debug: false, logLevel: "silent", retries: 0 } :
    { debug: true, logLevel: "info", retries: 1 };

  const timeout = env === "production" ? 30000 : env === "staging" ? 15000 : env === "development" ? 5000 : env === "test" ? 1000 : 10000;
  const maxConnections = env === "production" ? 100 : env === "staging" ? 50 : env === "development" ? 10 : env === "test" ? 5 : 20;

  let result: any = { ...base, timeout, maxConnections };
  for (const key in overrides) {
    result[key] = overrides[key];
  }

  var unused_legacy = result.timeout * 2;

  return result;
}
