import type { StorageLike } from "./layoutSettings";

/** The parent of every dashboard host (vl., tb., eid.): a cookie there is read by all of them. */
const SHARED_DOMAIN = "openldr.org.mz";

const ONE_YEAR = 60 * 60 * 24 * 365;

/** The part of `document` the cookie storage needs. */
export interface CookieJar {
  cookie: string;
}

/** The domain to share settings on, or undefined for a host-only cookie (localhost, preview hosts). */
export function sharedCookieDomain(hostname: string): string | undefined {
  return hostname === SHARED_DOMAIN || hostname.endsWith(`.${SHARED_DOMAIN}`) ? SHARED_DOMAIN : undefined;
}

/** A StorageLike over cookies, so one value is seen by every dashboard on the shared domain. */
export function cookieStorage(jar: CookieJar, { domain, secure }: { domain?: string; secure: boolean }): StorageLike {
  return {
    getItem(key) {
      const found = jar.cookie.split("; ").find((pair) => pair.startsWith(`${key}=`));
      if (found === undefined) return null;
      try {
        return decodeURIComponent(found.slice(key.length + 1));
      } catch {
        return null;
      }
    },
    setItem(key, value) {
      jar.cookie = [
        `${key}=${encodeURIComponent(value)}`,
        "path=/",
        `max-age=${ONE_YEAR}`,
        "SameSite=Lax",
        ...(domain ? [`domain=${domain}`] : []),
        ...(secure ? ["Secure"] : []),
      ].join("; ");
    },
  };
}

/**
 * Settings shared by the dashboards: the cookie wins; until it is first written, this host's old
 * localStorage value is read, so a user keeps the preferences they had before the cookie existed.
 */
export function sharedSettingsStorage(shared: StorageLike, legacy: StorageLike | undefined): StorageLike {
  return {
    getItem: (key) => shared.getItem(key) ?? legacy?.getItem(key) ?? null,
    setItem: (key, value) => shared.setItem(key, value),
  };
}

/** The browser's shared settings storage; undefined on the server. */
export function browserSettingsStorage(): StorageLike | undefined {
  if (typeof window === "undefined") return undefined;
  let legacy: StorageLike | undefined;
  try {
    legacy = window.localStorage;
  } catch {
    legacy = undefined; // blocked storage: the cookie alone
  }
  const shared = cookieStorage(document, {
    domain: sharedCookieDomain(window.location.hostname),
    secure: window.location.protocol === "https:",
  });
  return sharedSettingsStorage(shared, legacy);
}
