/**
 * Corrections for the province SVGs (hosted on Cloudinary, so they are fixed here, after each map
 * is injected), and the hatch that marks the selected district.
 *
 * Audit of 2026-10-21 (every province, labels and paths checked against each code table):
 * - paths with another district's code (Doa had a Manica code; Maputo Província's codes were
 *   shifted by one district; Nampula's city, Rapale, Ilha and Mogincual were mixed up);
 * - "Vector" paths without a district, drawn over the real ones (Maputo Cidade) or showing Maputo
 *   Cidade inside Maputo Província: they hid colours and caught clicks;
 * - labels spelled differently from the district (so clicks and colours missed them);
 * - districts without a label, and labels outside their district.
 * Mecufi (Cabo Delgado) and Namaacha's original shape have no geometry in the files; Namaacha
 * gets it back from the corrected codes.
 */

export type PathFix = {
  /** Class on the path in the file. */
  from: string;
  /** Which of the paths with that class (document order); all when absent. */
  index?: number;
  /** The right district code, or null for a shape that is no district (outline only). */
  to: string | null;
  /** Fill of an outline-only shape (default none). */
  fill?: string;
};

export type ProvinceFixes = {
  paths?: PathFix[];
  /**
   * Label as written in the file → its district's name in the code table. The label is rewritten
   * to that name, unless `keep` (a short name that fits, e.g. "Nampula" for the city).
   */
  labels?: Record<string, string | { district: string; keep: true }>;
  /** Text of a label the file lacks, when the district's name is too long for it (code → text). */
  names?: Record<string, string>;
  /** Hand-placed labels (file coordinates), where districts are too small to place one automatically. */
  positions?: Record<string, [number, number] | [number, number, "start" | "middle" | "end"]>;
};

export const PROVINCE_FIXES: Record<string, ProvinceFixes> = {
  Tete: {
    paths: [{ from: "MZ0600G6", to: "MZ0500S5" }], // Doa
    // Cahora Bassa keeps the file's two lines; on one it runs into Marara.
    labels: { Nacanga: "Macanga", CahoraBassa: { district: "Cahora Bassa", keep: true } },
  },
  CaboDelgado: {
    // Pemba (the city) is too small for its name, which landed on Ancuabe: it reads out to sea.
    positions: { MZ0200A1: [256, 255, "start"] },
  },
  Gaza: {
    labels: {
      Mabalaze: "Mabalane",
      Bilene: { district: "Bilene Macia", keep: true },
      Mandlakaze: "Manjacaze",
      Chonguene: "Chongoene",
    },
  },
  Inhambane: { labels: { Vilanculo: "Vilankulo" } },
  Manica: { labels: { Sussungenga: "Sussundenga" } },
  MaputoCidade: {
    paths: [{ from: "Vector", to: null }],
    labels: { Nlhamankulo: "Nlhamankulu" },
  },
  MaputoProvincia: {
    paths: [
      { from: "MZ1000J2", to: "MZ1000J8" }, // the west, labelled Namaacha
      { from: "MZ1000J1", to: "MZ1000J2" }, // labelled Boane
      { from: "MZ1000J5", to: "MZ1000J1" }, // labelled Matola
      { from: "MZ1000J4", index: 1, to: "MZ1000J5" }, // the coast, labelled Marracuene
      { from: "Vector", to: null, fill: "rgba(145,158,171,0.24)" }, // Maputo Cidade and Inhaca
    ],
  },
  Nampula: {
    paths: [
      { from: "MZ0300UU", index: 0, to: "MZ0300K4" }, // the island off Mossuril: Ilha de Moçambique
      { from: "MZ0300UU", index: 1, to: "MZ0300K1" }, // the enclave labelled Nampula: the city
      { from: "MZ0300K1", to: "MZ0300M6" }, // the ring around it: Rapale
      { from: "MZ0400T6", to: "MZ0300L1" }, // the coast between Mossuril and Liupo: Mogincual
    ],
    labels: {
      // The full names don't fit their districts; the file's short ones do.
      Erati: { district: "Namapa-Erati", keep: true },
      Nacala: { district: "Nacala Velha", keep: true },
      Ile: "Mogincual",
      Nampula: { district: "Cidade de Nampula", keep: true },
    },
    names: { MZ0300K4: "Ilha" },
    // Rapale is a narrow ring round the city, the two Nacalas share a corner of the coast.
    positions: { MZ0300M6: [212, 186], MZ0300L9: [355, 124], MZ0300L8: [368, 108, "end"] },
  },
  Niassa: {
    // The city's code was on Chimbonila (the district round it), and Chimbonila's on the city.
    paths: [
      { from: "MZ0100N1", to: "MZ0100N4" },
      { from: "MZ0100N4", to: "MZ0100N1" },
    ],
    labels: { Lichinga: { district: "Cidade de Lichinga", keep: true } },
  },
  Sofala: { labels: { Marringue: "Maringue" } },
  Zambezia: {
    labels: { "Alto Muloque": "Alto Molocue" },
    // Quelimane (the city) and Inhassunge are too small for their names: both read out to sea.
    positions: { MZ0400T1: [175, 283, "start"], MZ0400T7: [176, 312, "start"] },
  },
};

const SVG_NS = "http://www.w3.org/2000/svg";

const key = (s: string | null | undefined) =>
  (s ?? "").normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/\s+/g, "").toLowerCase();

type Box = { x: number; y: number; width: number; height: number };

function applyPathFixes(svg: SVGElement, fixes: PathFix[]) {
  // From the classes in the file, all at once: a fix never sees another fix's result.
  const paths = Array.from(svg.querySelectorAll("path"));
  const original = paths.map((p) => p.getAttribute("class"));
  const seen: Record<string, number> = {};
  paths.forEach((path, i) => {
    const cls = original[i];
    if (!cls) return;
    const nth = (seen[cls] = (seen[cls] ?? -1) + 1);
    const fix = fixes.find((f) => f.from === cls && (f.index === undefined || f.index === nth));
    if (!fix) return;
    if (fix.to) {
      path.setAttribute("class", fix.to);
    } else {
      // Not a district: no class (the maps skip it), never on top of a district's clicks.
      path.removeAttribute("class");
      path.setAttribute("fill", fix.fill ?? "none");
      path.style.pointerEvents = "none";
    }
  });
}

/** A point from one element's coordinates to another's (paths and labels may sit in different groups). */
function between(point: DOMPoint, from: SVGGraphicsElement, to: SVGGraphicsElement): DOMPoint {
  const a = from.getScreenCTM();
  const b = to.getScreenCTM();
  return a && b ? point.matrixTransform(a).matrixTransform(b.inverse()) : point;
}

// Grid inside a district: the sample farthest from its edge is where its label reads best.
const GRID = 24;

function visualCentre(path: SVGGeometryElement, others: SVGGeometryElement[] = []): DOMPoint | null {
  const box: Box = path.getBBox();
  if (!box.width || !box.height) return null;
  const inside: DOMPoint[] = [];
  const outside: DOMPoint[] = [];
  for (let i = 0; i <= GRID; i++) {
    for (let j = 0; j <= GRID; j++) {
      const p = new DOMPoint(box.x + (box.width * i) / GRID, box.y + (box.height * j) / GRID);
      const own = path.isPointInFill(p) && !others.some((o) => o.isPointInFill(between(p, path, o)));
      (own ? inside : outside).push(p);
    }
  }
  if (!inside.length) return new DOMPoint(box.x + box.width / 2, box.y + box.height / 2);
  // Edge of the bounding box counts as outside too.
  const edgeDistance = (p: DOMPoint) => Math.min(p.x - box.x, box.x + box.width - p.x, p.y - box.y, box.y + box.height - p.y);
  let best = inside[0];
  let bestDistance = -1;
  for (const p of inside) {
    let d = edgeDistance(p);
    for (const q of outside) d = Math.min(d, Math.hypot(p.x - q.x, p.y - q.y));
    if (d > bestDistance) {
      bestDistance = d;
      best = p;
    }
  }
  return best;
}

function largestPath(svg: SVGElement, code: string): SVGGeometryElement | null {
  let best: SVGGeometryElement | null = null;
  let area = -1;
  svg.querySelectorAll("path").forEach((p) => {
    if (p.getAttribute("class") !== code) return;
    const b = (p as SVGGeometryElement).getBBox();
    if (b.width * b.height > area) {
      area = b.width * b.height;
      best = p as SVGGeometryElement;
    }
  });
  return best;
}

/** Move a whole label by (dx, dy) in its parent's coordinates (line breaks and own transform kept). */
function translateLabel(text: SVGTextElement, dx: number, dy: number) {
  const current = text.getAttribute("transform");
  text.setAttribute("transform", `translate(${dx} ${dy})${current ? ` ${current}` : ""}`);
}

/** A label's left, centre or right point (at mid-height), in its parent's coordinates. */
function labelPoint(text: SVGTextElement, anchor: "start" | "middle" | "end"): DOMPoint {
  const tb = text.getBBox();
  const x = anchor === "start" ? tb.x : anchor === "end" ? tb.x + tb.width : tb.x + tb.width / 2;
  return between(new DOMPoint(x, tb.y + tb.height / 2), text, text.parentNode as SVGGraphicsElement);
}

/**
 * Put a label's centre (or its start or end, reading away from a small district) on `point`. A rigid
 * move: the files' labels hold tspans with their own x/y, which x/y on the text can't move.
 */
function placeLabel(text: SVGTextElement, point: DOMPoint, path: SVGGeometryElement, anchor: "start" | "middle" | "end" = "middle") {
  const p = between(point, path, text.parentNode as SVGGraphicsElement);
  const c = labelPoint(text, anchor);
  translateLabel(text, p.x - c.x, p.y - c.y);
}

/** How many of a label's probes (centre, near its two ends) fall inside the district. */
function probesInside(text: SVGTextElement, path: SVGGeometryElement): number {
  const tb = text.getBBox();
  return [0.5, 0.08, 0.92]
    .map((f) => between(new DOMPoint(tb.x + tb.width * f, tb.y + tb.height / 2), text, path))
    .filter((p) => path.isPointInFill(p)).length;
}

/** Shift a label back inside the map when it runs past an edge. */
function keepOnMap(text: SVGTextElement, svg: SVGElement) {
  const view = (svg as SVGSVGElement).viewBox?.baseVal;
  if (!view?.width) return;
  const tb = text.getBBox();
  const parent = text.parentNode as SVGGraphicsElement;
  const left = between(new DOMPoint(tb.x, tb.y), text, svg as SVGGraphicsElement).x;
  const right = between(new DOMPoint(tb.x + tb.width, tb.y), text, svg as SVGGraphicsElement).x;
  const shift = left < view.x ? view.x - left + 1 : right > view.x + view.width ? view.x + view.width - right - 1 : 0;
  if (!shift) return;
  const origin = between(new DOMPoint(0, 0), svg as SVGGraphicsElement, parent);
  const moved = between(new DOMPoint(shift, 0), svg as SVGGraphicsElement, parent);
  translateLabel(text, moved.x - origin.x, moved.y - origin.y);
}

/** Size of a label in a path's coordinates. */
function labelSize(text: SVGTextElement, path: SVGGeometryElement) {
  const tb = text.getBBox();
  const a = between(new DOMPoint(tb.x, tb.y), text, path);
  const b = between(new DOMPoint(tb.x + tb.width, tb.y + tb.height), text, path);
  return { width: Math.abs(b.x - a.x), height: Math.abs(b.y - a.y) };
}

/**
 * Correct one province map in place: district codes on the paths, label spellings, missing labels,
 * labels outside their district. `codes` is the province's code → name table.
 */
export function fixDistrictMap(svg: SVGElement, codes: Record<string, string>, fixes: ProvinceFixes = {}) {
  if (fixes.paths?.length) applyPathFixes(svg, fixes.paths);

  const byName = new Map(Object.entries(codes).map(([code, name]) => [key(name), code]));
  const aliases = new Map(Object.entries(fixes.labels ?? {}).map(([wrong, right]) => [key(wrong), right]));
  const texts = Array.from(svg.querySelectorAll("text"));
  const labelled = new Map<string, SVGTextElement>();

  for (const text of texts) {
    // One size for every label: some tspans carry their own (KaMubukwana was twice the others).
    text.querySelectorAll("tspan").forEach((t) => t.style.removeProperty("font-size"));
    // Labels never take the mouse: hovers and clicks reach the district under the cursor, so a
    // label needn't repeat its district's exact name.
    text.style.pointerEvents = "none";
    const alias = aliases.get(key(text.textContent));
    let name = text.textContent;
    if (typeof alias === "string") {
      text.textContent = alias; // drops the file's line breaks too
      name = alias;
    } else if (alias) {
      name = alias.district;
    }
    const code = byName.get(key(name));
    if (code && !labelled.has(code)) labelled.set(code, text);
  }

  const template = texts[0];
  const districtPaths = Array.from(svg.querySelectorAll("path")).filter((p) => codes[p.getAttribute("class") ?? ""]) as SVGGeometryElement[];
  const viewWidth = (svg as SVGSVGElement).viewBox?.baseVal?.width || 0;

  for (const [code, name] of Object.entries(codes)) {
    const path = largestPath(svg, code);
    if (!path) continue; // no geometry in the file (see the audit above)
    const others = districtPaths.filter((p) => p.getAttribute("class") !== code);
    let text = labelled.get(code);

    if (!text) {
      text = document.createElementNS(SVG_NS, "text") as SVGTextElement;
      if (template?.getAttribute("class")) text.setAttribute("class", template.getAttribute("class") as string);
      if (template?.getAttribute("style")) text.setAttribute("style", template.getAttribute("style") as string);
      text.textContent = fixes.names?.[code] ?? name;
      text.style.pointerEvents = "none";
      (template?.parentNode ?? svg).appendChild(text);
      labelled.set(code, text);
      const pb = path.getBBox();
      const size = labelSize(text, path);
      if (pb.width >= size.width && pb.height >= size.height * 1.4) {
        const centre = visualCentre(path, others);
        if (centre) placeLabel(text, centre, path);
        keepOnMap(text, svg);
      } else {
        // Too small to hold its name (a coastal town, an island): beside it, on the side with room.
        const right = viewWidth ? pb.x + pb.width / 2 < viewWidth / 2 : false;
        const y = pb.y + pb.height / 2;
        placeLabel(text, new DOMPoint(right ? pb.x + pb.width + 1 : pb.x - 1, y), path, right ? "start" : "end");
        keepOnMap(text, svg);
      }
      continue;
    }

    // A label outside its district, or spilling over its border, moves to the district's centre
    // when the district can hold it and the label sits better there; labels of tiny districts
    // (cities, islands) keep their offset, placed by hand so they don't collide.
    const before = probesInside(text, path);
    if (before === 3) continue;
    const pb = path.getBBox();
    const size = labelSize(text, path);
    if (pb.width < size.width * 0.9 || pb.height < size.height * 1.6) continue;
    const inner = visualCentre(path, others);
    if (!inner) continue;
    const saved = text.getAttribute("transform");
    placeLabel(text, inner, path);
    keepOnMap(text, svg);
    if (probesInside(text, path) <= before) {
      if (saved === null) text.removeAttribute("transform");
      else text.setAttribute("transform", saved);
    }
  }

  for (const [code, [x, y, side]] of Object.entries(fixes.positions ?? {})) {
    const text = labelled.get(code);
    const path = largestPath(svg, code);
    if (text && path) placeLabel(text, new DOMPoint(x, y), path, side ?? "middle");
  }
}

/**
 * Fill for the selected district: its own colour, hatched with darker diagonal lines (as the EID
 * transport mockup), so it stands out without losing its class colour.
 */
export function hatchFill(path: Element, color: string): string {
  const svg = path.closest("svg");
  if (!svg) return color;
  // Stripes about 1/60 of the map wide, whatever the file's coordinates; the size is in the id
  // because ids are page-wide and two maps may be on screen.
  const size = Math.max(2, (svg.viewBox?.baseVal?.width || 400) / 60);
  const id = `district-hatch-${color.replace(/[^a-zA-Z0-9]/g, "")}-${Math.round(size * 10)}`;
  if (!svg.querySelector(`#${id}`)) {
    let defs = svg.querySelector("defs");
    if (!defs) {
      defs = document.createElementNS(SVG_NS, "defs");
      svg.insertBefore(defs, svg.firstChild);
    }
    const pattern = document.createElementNS(SVG_NS, "pattern");
    pattern.setAttribute("id", id);
    pattern.setAttribute("patternUnits", "userSpaceOnUse");
    pattern.setAttribute("width", String(size));
    pattern.setAttribute("height", String(size));
    pattern.setAttribute("patternTransform", "rotate(45)");
    const base = document.createElementNS(SVG_NS, "rect");
    base.setAttribute("width", String(size));
    base.setAttribute("height", String(size));
    base.setAttribute("fill", color);
    const line = document.createElementNS(SVG_NS, "rect");
    line.setAttribute("width", String(size / 3));
    line.setAttribute("height", String(size));
    line.setAttribute("fill", "rgba(0,0,0,0.32)");
    pattern.append(base, line);
    defs.appendChild(pattern);
  }
  return `url(#${id})`;
}
