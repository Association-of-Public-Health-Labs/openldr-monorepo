import { describe, expect, it } from "vitest";
import { cookieStorage, sharedCookieDomain, sharedSettingsStorage, type CookieJar } from "./sharedStorage";
import type { StorageLike } from "./layoutSettings";

/** A document.cookie stand-in: reads give "k=v; k2=v2", writes take one "k=v; attrs" string. */
function fakeJar(): CookieJar & { writes: string[] } {
  const values = new Map<string, string>();
  const writes: string[] = [];
  return {
    writes,
    get cookie() {
      return [...values].map(([k, v]) => `${k}=${v}`).join("; ");
    },
    set cookie(line: string) {
      writes.push(line);
      const [pair] = line.split(";");
      const i = pair!.indexOf("=");
      values.set(pair!.slice(0, i).trim(), pair!.slice(i + 1));
    },
  };
}

function memoryStorage(initial: Record<string, string> = {}): StorageLike {
  const data = { ...initial };
  return { getItem: (k) => data[k] ?? null, setItem: (k, v) => { data[k] = v; } };
}

describe("sharedCookieDomain", () => {
  it("shares across the openldr.org.mz dashboards", () => {
    expect(sharedCookieDomain("vl.openldr.org.mz")).toBe("openldr.org.mz");
    expect(sharedCookieDomain("eid.openldr.org.mz")).toBe("openldr.org.mz");
    expect(sharedCookieDomain("openldr.org.mz")).toBe("openldr.org.mz");
  });

  it("keeps the cookie on the host elsewhere (localhost, preview hosts)", () => {
    expect(sharedCookieDomain("localhost")).toBeUndefined();
    expect(sharedCookieDomain("abc.94.237.74.73.sslip.io")).toBeUndefined();
    expect(sharedCookieDomain("notopenldr.org.mz")).toBeUndefined();
  });
});

describe("cookieStorage", () => {
  it("round-trips JSON through an encoded cookie on the shared domain", () => {
    const jar = fakeJar();
    const storage = cookieStorage(jar, { domain: "openldr.org.mz", secure: true });
    storage.setItem("layout-settings", '{"state":{"settings":{"mode":"dark"}}}');
    expect(storage.getItem("layout-settings")).toBe('{"state":{"settings":{"mode":"dark"}}}');
    expect(jar.writes[0]).toMatch(/^layout-settings=%7B/);
    expect(jar.writes[0]).toContain("; domain=openldr.org.mz");
    expect(jar.writes[0]).toContain("; path=/");
    expect(jar.writes[0]).toContain("; max-age=31536000");
    expect(jar.writes[0]).toContain("; SameSite=Lax");
    expect(jar.writes[0]).toContain("; Secure");
  });

  it("writes a host-only cookie without domain or Secure on localhost", () => {
    const jar = fakeJar();
    cookieStorage(jar, { domain: undefined, secure: false }).setItem("k", "v");
    expect(jar.writes[0]).not.toContain("domain=");
    expect(jar.writes[0]).not.toContain("Secure");
  });

  it("returns null for a missing or undecodable cookie and finds the exact name", () => {
    const jar = fakeJar();
    jar.cookie = "other-layout-settings=x";
    jar.cookie = "bad=%E0%A4%A";
    const storage = cookieStorage(jar, { domain: undefined, secure: false });
    expect(storage.getItem("layout-settings")).toBeNull();
    expect(storage.getItem("bad")).toBeNull();
  });
});

describe("sharedSettingsStorage", () => {
  it("prefers the shared cookie over this host's old localStorage", () => {
    const jar = fakeJar();
    const shared = cookieStorage(jar, { domain: undefined, secure: false });
    shared.setItem("layout-settings", "cookie");
    const storage = sharedSettingsStorage(shared, memoryStorage({ "layout-settings": "local" }));
    expect(storage.getItem("layout-settings")).toBe("cookie");
  });

  it("falls back to the old localStorage value once, so current preferences are kept", () => {
    const storage = sharedSettingsStorage(cookieStorage(fakeJar(), { domain: undefined, secure: false }), memoryStorage({ "layout-settings": "local" }));
    expect(storage.getItem("layout-settings")).toBe("local");
  });

  it("writes to the shared cookie", () => {
    const jar = fakeJar();
    const legacy = memoryStorage();
    const storage = sharedSettingsStorage(cookieStorage(jar, { domain: undefined, secure: false }), legacy);
    storage.setItem("layout-settings", "new");
    expect(jar.cookie).toContain("layout-settings=new");
  });

  it("works without the old storage", () => {
    const storage = sharedSettingsStorage(cookieStorage(fakeJar(), { domain: undefined, secure: false }), undefined);
    expect(storage.getItem("layout-settings")).toBeNull();
  });
});
