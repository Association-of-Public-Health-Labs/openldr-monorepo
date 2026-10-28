import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { listWeeklyReports, NextcloudNotConfigured } from "./nextcloud-server";

const BASE = "https://nc.example.org";

/** An empty folder: the PROPFIND lists the root only, so no share lookups follow. */
const emptyFolder = (folder: string) => `<?xml version="1.0"?>
<d:multistatus xmlns:d="DAV:"><d:response><d:href>/remote.php/dav/files/u${folder}/</d:href>
<d:propstat><d:prop><d:resourcetype><d:collection/></d:resourcetype></d:prop></d:propstat></d:response></d:multistatus>`;

describe("listWeeklyReports", () => {
  const fetchMock = vi.fn(async (url: string) => {
    const folder = new URL(url).pathname.replace(/^\/remote\.php\/dav\/files\/u/, "").replace(/\/$/, "");
    return new Response(emptyFolder(folder), { status: 207 });
  });

  beforeEach(() => {
    vi.stubEnv("NEXTCLOUD_BASE_URL", BASE + "/");
    vi.stubEnv("NEXTCLOUD_USERNAME", "u");
    vi.stubEnv("NEXTCLOUD_APP_PASSWORD", "p");
    vi.stubGlobal("fetch", fetchMock);
    fetchMock.mockClear();
  });
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("keys the cache per folder: each folder is read once, from its own path", async () => {
    await listWeeklyReports("/reports/CV");
    await listWeeklyReports("/reports/DPI");
    await listWeeklyReports("/reports/CV");
    await listWeeklyReports("reports/DPI/");
    const urls = fetchMock.mock.calls.map(([url]) => url);
    expect(urls).toEqual([
      `${BASE}/remote.php/dav/files/u/reports/CV/`,
      `${BASE}/remote.php/dav/files/u/reports/DPI/`,
    ]);
  });

  it("throws NextcloudNotConfigured without the credentials", async () => {
    vi.stubEnv("NEXTCLOUD_APP_PASSWORD", "");
    await expect(listWeeklyReports("/reports/unconfigured")).rejects.toBeInstanceOf(NextcloudNotConfigured);
  });
});
