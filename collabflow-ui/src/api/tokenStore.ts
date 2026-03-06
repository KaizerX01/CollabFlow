/**
 * In-memory token store.
 *
 * Keeps the JWT access token in a module-scoped variable instead of
 * localStorage, so it is NOT accessible to XSS-injected scripts that
 * scan `window.localStorage`.
 *
 * Trade-off: token is lost on hard-refresh, but the httpOnly refresh
 * cookie will transparently issue a new one via the /auth/refresh endpoint.
 */

let accessToken: string | null = null;

export function getAccessToken(): string | null {
  return accessToken;
}

export function setAccessToken(token: string | null): void {
  accessToken = token;
}

export function clearAccessToken(): void {
  accessToken = null;
}
