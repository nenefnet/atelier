// Auth.js was removed for the demo deployment.
// All auth lives in src/lib/workspace.ts (auto-uses a shared demo user).
// This file is kept as a stub so any stale imports fail loudly with a clear message.

export const DEMO_MODE_ENABLED = true as const;

export function auth(): never {
  throw new Error(
    'Auth.js has been removed from this build. Use getCurrentUser/requireUser from @/lib/workspace instead.',
  );
}
