import { describe, expect, it } from "vitest";
import {
  buildReports,
  formatSize,
  groupReports,
  matchesQuery,
  parsePropfind,
  publicDownloadUrl,
  weekFolders,
  weekStartOf,
  type DavFile,
} from "./nextcloud";

const ROOT = "/remote.php/dav/files/openldr/reports/CV";

// Shaped as Nextcloud answers a Depth: infinity PROPFIND (2026-10-26).
const XML = `<?xml version="1.0"?>
<d:multistatus xmlns:d="DAV:" xmlns:oc="http://owncloud.org/ns" xmlns:nc="http://nextcloud.org/ns">
  <d:response><d:href>${ROOT}/</d:href><d:propstat><d:prop><d:resourcetype><d:collection/></d:resourcetype></d:prop></d:propstat></d:response>
  <d:response><d:href>${ROOT}/2026/Setembro/13%20Setembro%20-%2019%20Setembro/</d:href><d:propstat><d:prop><d:resourcetype><d:collection/></d:resourcetype></d:prop></d:propstat></d:response>
  <d:response>
    <d:href>${ROOT}/2026/Setembro/13%20Setembro%20-%2019%20Setembro/Carga%20Viral%20-%20semana%2013%20Setembro%20-%2019%20Setembro.xlsx</d:href>
    <d:propstat><d:prop>
      <d:getlastmodified>Fri, 25 Sep 2026 13:31:57 GMT</d:getlastmodified>
      <d:getcontentlength>374575</d:getcontentlength>
      <d:resourcetype/>
      <oc:share-types><oc:share-type>3</oc:share-type></oc:share-types>
    </d:prop><d:status>HTTP/1.1 200 OK</d:status></d:propstat>
  </d:response>
  <d:response>
    <d:href>${ROOT}/2026/Mar%C3%A7o/01%20Mar%C3%A7o%20-%2007%20Mar%C3%A7o/A%20%26%20B.xlsx</d:href>
    <d:propstat><d:prop><d:getlastmodified>Mon, 09 Mar 2026 08:00:00 GMT</d:getlastmodified><d:getcontentlength>10</d:getcontentlength><d:resourcetype/></d:prop></d:propstat>
  </d:response>
</d:multistatus>`;

const file = (path: string, modified = "2026-01-01T00:00:00.000Z"): DavFile => ({ path, size: 1, modified });

describe("parsePropfind", () => {
  it("keeps files only, relative to the root and decoded", () => {
    expect(parsePropfind(XML, ROOT)).toEqual([
      {
        path: "2026/Setembro/13 Setembro - 19 Setembro/Carga Viral - semana 13 Setembro - 19 Setembro.xlsx",
        size: 374575,
        modified: "2026-09-25T13:31:57.000Z",
      },
      { path: "2026/Março/01 Março - 07 Março/A & B.xlsx", size: 10, modified: "2026-03-09T08:00:00.000Z" },
    ]);
  });

  it("accepts a root with a trailing slash and ignores hrefs outside it", () => {
    expect(parsePropfind(XML, ROOT + "/")).toHaveLength(2);
    expect(parsePropfind(XML, "/remote.php/dav/files/other")).toEqual([]);
  });

  it("lists each week folder once", () => {
    expect(weekFolders([file("2026/Set/a/x.xlsx"), file("2026/Set/a/y.xlsx"), file("2026/Out/b/z.xlsx"), file("top.xlsx")])).toEqual([
      "2026/Set/a",
      "2026/Out/b",
    ]);
  });
});

describe("weekStartOf", () => {
  const start = (path: string) => {
    const d = weekStartOf(path);
    return d && `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
  };

  it("reads the Sunday from the week folder", () => {
    expect(start("2026/Setembro/13 Setembro - 19 Setembro/f.xlsx")).toBe("2026-9-13");
    expect(start("2026/Outubro/27 Setembro - 03 Outubro/f.xlsx")).toBe("2026-9-27");
    expect(start("2026/Março/01 Março - 07 Março/f.xlsx")).toBe("2026-3-1");
  });

  it("puts a week starting in December in the previous year", () => {
    expect(start("2026/Janeiro/28 Dezembro - 03 Janeiro/f.xlsx")).toBe("2025-12-28");
  });

  it("is null for folders that are not weeks", () => {
    expect(weekStartOf("2026/Setembro/f.xlsx")).toBeNull();
    expect(weekStartOf("2026/Setembro/Extra/f.xlsx")).toBeNull();
    expect(weekStartOf("xx/Setembro/13 Setembro - 19 Setembro/f.xlsx")).toBeNull();
  });
});

describe("buildReports", () => {
  const BASE = "https://nextcloud.example.org/";
  const files = [
    file("2026/Setembro/13 Setembro - 19 Setembro/Carga Viral - semana 13 Setembro - 19 Setembro.xlsx"),
    file("2026/Outubro/27 Setembro - 03 Outubro/Carga Viral - semana 27 Setembro - 03 Outubro.xlsx"),
    file("2026/Outubro/27 Setembro - 03 Outubro/notas.txt"),
    file("2025/Agosto/03 Agosto - 09 Agosto/Carga Viral - semana 03 Agosto - 09 Agosto.xlsx"),
  ];
  const tokens = new Map([[files[0].path, "abc"]]);
  const reports = buildReports(files, tokens, BASE);

  it("keeps Excel files, newest week first", () => {
    expect(reports.map((r) => r.weekStart)).toEqual(["2026-09-27", "2026-09-13", "2025-08-03"]);
  });

  it("labels and groups by the week's Sunday", () => {
    expect(reports[0]).toMatchObject({ label: "27 Set–3 Out", group: "Setembro 2026" });
    expect(reports[2]).toMatchObject({ label: "3–9 Ago", group: "Agosto 2025" });
  });

  it("links files that have a public share, direct download over https", () => {
    expect(reports[1].url).toBe("https://nextcloud.example.org/public.php/dav/files/abc/");
    expect(reports[0].url).toBeNull();
    expect(publicDownloadUrl("https://n.org", "a/b")).toBe("https://n.org/public.php/dav/files/a%2Fb/");
  });

  it("falls back to the file name and modified date for unknown folders", () => {
    const [r] = buildReports([file("solto/Relatório.xlsx", "2026-05-02T10:00:00.000Z")], new Map(), BASE);
    expect(r).toMatchObject({ weekStart: null, label: "Relatório", group: "Maio 2026" });
  });

  it("groups consecutive reports under their month", () => {
    expect(groupReports(reports).map((g) => [g.group, g.reports.length])).toEqual([
      ["Setembro 2026", 2],
      ["Agosto 2025", 1],
    ]);
  });
});

describe("matchesQuery and formatSize", () => {
  const [r] = buildReports([file("2026/Março/01 Março - 07 Março/Carga Viral.xlsx")], new Map(), "https://n.org");

  it("matches label, group and name ignoring case and accents", () => {
    expect(matchesQuery(r, "")).toBe(true);
    expect(matchesQuery(r, "marco 2026")).toBe(true);
    expect(matchesQuery(r, "1–7")).toBe(true);
    expect(matchesQuery(r, "carga")).toBe(true);
    expect(matchesQuery(r, "abril")).toBe(false);
  });

  it("formats sizes", () => {
    expect(formatSize(512)).toBe("512 B");
    expect(formatSize(374575)).toBe("366 KB");
    expect(formatSize(1.5 * 1024 * 1024)).toBe("1,5 MB");
  });
});
