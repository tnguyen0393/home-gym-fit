import { formatNumber } from "@/lib/format";
import type { GymProduct } from "@/lib/types";

/** Diagram palette from the Sprint 2 visual system. */
export const DIAGRAM = {
  indigo: "#4f46e5",
  indigoSoft: "#6366f1",
  stone200: "#e7e5e4",
  stone600: "#57534e",
  stone900: "#1c1917",
  amber: "#d97706",
  emerald: "#059669",
  track: "#e7e5e4",
} as const;

export const CEILING_REFERENCE_IN = 96;
export const CEILING_SCALE_IN = 120;
export const OLYMPIC_BAR_IN = 86.6;
export const BAR_SCALE_IN = 96;
export const DEPTH_SCALE_IN = 60;
export const WEIGHT_SCALE_LBS = 125;
export const BENCH_SCALE_IN = 64;
export const BENCH_WIDTH_SCALE_IN = 32;
export const TRAY_SCALE_IN = 24;
export const SLEEVE_SCALE_IN = 80;

export type DiagramMissingLabel = "Not published" | "Unverified";

export type DiagramTone = "fits" | "exceeds" | "missing" | "neutral";

export interface ScaleRow {
  id: string;
  label: string;
  /** Positive published measure. Null means the bar is omitted. */
  value: number | null;
  color: string;
  text: string;
  missing: boolean;
}

export interface ScaleChartModel {
  scaleMax: number;
  marker?: { value: number; label: string };
  rows: ScaleRow[];
  caption: string;
  tone: DiagramTone;
  /** Shown on the detail diagram only. */
  note?: string;
  wall?: boolean;
}

export interface SleeveModel {
  scaleMax: number;
  /** Published per-side loadable sleeve. Drawn on both ends only when shaft is also published. */
  sleeveIn: number | null;
  shaftIn: number | null;
  caption: string;
  tone: DiagramTone;
  note?: string;
}

export interface BenchModel {
  lengthIn: number | null;
  widthIn: number | null;
  /** dimensions.footprint_sqft. Never computed from length × width. */
  footprintSqft: number | null;
  storedFootprintSqft: number | null;
  storedHeightIn: number | null;
  facts: { label: string; text: string; missing: boolean }[];
  caption: string;
  tone: DiagramTone;
  note?: string;
}

export interface DumbbellModel {
  scaleMax: number;
  minLbs: number | null;
  maxLbs: number | null;
  trayIncluded: boolean | null;
  trayLengthIn: number | null;
  trayWidthIn: number | null;
  maxLengthIn: number | null;
  weightCaption: string;
  weightTone: DiagramTone;
  trayCaption: string;
  trayTone: DiagramTone;
  /** "outline" when both tray edges are published, "length" for a max-length bar, "none" otherwise. */
  trayMode: "outline" | "length" | "none";
  note?: string;
}

/** A positive finite published number. Null, zero, and non-finite values are not drawable. */
export function measure(value: number | null | undefined): number | null {
  if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) return null;
  return value;
}

export function roundInches(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

/** Keeps a fixed reference axis unless a published measure is longer than that axis. */
export function axisMax(base: number, values: (number | null)[]): number {
  let max = base;
  for (const value of values) {
    if (value != null && value > max) max = value;
  }
  return max;
}

function missingPhrase(label: DiagramMissingLabel): string {
  return label === "Unverified" ? "unverified" : "not published";
}

function inchesText(value: number | null, missing: DiagramMissingLabel): { text: string; missing: boolean } {
  if (value == null) return { text: missing, missing: true };
  return { text: `${formatNumber(value)} in`, missing: false };
}

function poundsText(value: number | null, missing: DiagramMissingLabel): { text: string; missing: boolean } {
  if (value == null) return { text: missing, missing: true };
  return { text: `${formatNumber(value)} lb`, missing: false };
}

function sqftText(value: number | null, missing: DiagramMissingLabel): { text: string; missing: boolean } {
  if (value == null) return { text: missing, missing: true };
  return { text: `${formatNumber(value)} sq ft`, missing: false };
}

export type CeilingFit = "fits" | "exceeds-ceiling" | "exceeds-upright" | "unverified";

/**
 * Fit is claimed only from a published minimum ceiling.
 * Upright height above 96 in is taller than the reference itself.
 * A shorter upright with no published minimum ceiling is not treated as a fit.
 */
export function ceilingFit(heightIn: number | null, minCeilingIn: number | null): CeilingFit {
  if (minCeilingIn != null) {
    return minCeilingIn <= CEILING_REFERENCE_IN ? "fits" : "exceeds-ceiling";
  }
  if (heightIn != null && heightIn > CEILING_REFERENCE_IN) return "exceeds-upright";
  return "unverified";
}

export function rackCeilingModel(product: GymProduct, missing: DiagramMissingLabel): ScaleChartModel {
  const height = measure(product.dimensions?.height_in);
  const minCeiling = measure(product.dimensions?.min_ceiling_in);
  const fit = ceilingFit(height, minCeiling);
  const heightText = inchesText(height, missing);
  const ceilingText = inchesText(minCeiling, missing);
  let caption = `Minimum ceiling ${missingPhrase(missing)}`;
  let tone: DiagramTone = "missing";
  if (fit === "fits") {
    caption = "Fits 8 ft ceiling";
    tone = "fits";
  } else if (fit === "exceeds-ceiling") {
    caption = "Exceeds 8 ft ceiling";
    tone = "exceeds";
  } else if (fit === "exceeds-upright") {
    caption = "Upright exceeds 96 in";
    tone = "exceeds";
  }

  return {
    scaleMax: axisMax(CEILING_SCALE_IN, [height, minCeiling]),
    marker: { value: CEILING_REFERENCE_IN, label: "96 in ceiling" },
    wall: false,
    caption,
    tone,
    note: "The dashed line is an 8 ft reference. It is not a clearance calculation.",
    rows: [
      {
        id: "height",
        label: "Upright",
        value: height,
        color: height != null && height > CEILING_REFERENCE_IN ? DIAGRAM.amber : DIAGRAM.indigo,
        text: heightText.text,
        missing: heightText.missing,
      },
      {
        id: "ceiling",
        label: "Ceiling",
        value: minCeiling,
        color:
          minCeiling == null
            ? DIAGRAM.track
            : minCeiling <= CEILING_REFERENCE_IN
              ? DIAGRAM.emerald
              : DIAGRAM.amber,
        text: ceilingText.text,
        missing: ceilingText.missing,
      },
    ],
  };
}

export function rackDepthModel(product: GymProduct, missing: DiagramMissingLabel): ScaleChartModel {
  const folded = measure(product.dimensions?.depth_folded_in);
  const open = measure(product.dimensions?.depth_open_in);
  const foldedText = inchesText(folded, missing);
  const openText = inchesText(open, missing);
  const parts: string[] = [];
  if (folded == null) parts.push(`Folded depth ${missingPhrase(missing)}`);
  if (open == null) parts.push(`Open depth ${missingPhrase(missing)}`);
  const caption = parts.length > 0 ? parts.join(" · ") : "Folded and open depth from the wall";
  const tone: DiagramTone = parts.length > 0 ? "missing" : "neutral";

  return {
    scaleMax: axisMax(DEPTH_SCALE_IN, [folded, open]),
    wall: true,
    caption,
    tone,
    note:
      folded == null && open == null
        ? "No folded or open depth was published, so no depth bars are drawn."
        : "Bars start at the wall. A missing depth is left blank.",
    rows: [
      {
        id: "folded",
        label: "Folded",
        value: folded,
        color: DIAGRAM.indigoSoft,
        text: foldedText.text,
        missing: foldedText.missing,
      },
      {
        id: "open",
        label: "Open",
        value: open,
        color: DIAGRAM.indigo,
        text: openText.text,
        missing: openText.missing,
      },
    ],
  };
}

/**
 * Published bar length. The catalog records it as overall length.
 * Open depth is only a fallback when overall length was not published.
 */
export function publishedBarLength(product: GymProduct): {
  inches: number | null;
  source: "overall" | "depth" | null;
} {
  const overall = measure(product.barbell_specs?.overall_length_in);
  if (overall != null) return { inches: overall, source: "overall" };
  const depth = measure(product.dimensions?.depth_open_in);
  if (depth != null) return { inches: depth, source: "depth" };
  return { inches: null, source: null };
}

export function barbellLengthModel(product: GymProduct, missing: DiagramMissingLabel): ScaleChartModel {
  const length = publishedBarLength(product);
  const lengthText = inchesText(length.inches, missing);
  let caption = `Length ${missingPhrase(missing)}`;
  let tone: DiagramTone = "missing";
  if (length.inches != null) {
    const delta = roundInches(OLYMPIC_BAR_IN - length.inches);
    if (delta > 0) {
      caption = `${formatNumber(delta)} in shorter than 86.6 in`;
      tone = "fits";
    } else if (delta < 0) {
      caption = `${formatNumber(Math.abs(delta))} in longer than 86.6 in`;
      tone = "exceeds";
    } else {
      caption = "Same length as 86.6 in";
      tone = "neutral";
    }
  }

  const note =
    length.source === "depth"
      ? "Length uses published open depth because overall length was not published. The dashed line is an 86.6 in Olympic bar."
      : "Length is the published overall length. The dashed line is an 86.6 in Olympic bar.";

  return {
    scaleMax: axisMax(BAR_SCALE_IN, [length.inches, OLYMPIC_BAR_IN]),
    marker: { value: OLYMPIC_BAR_IN, label: "86.6 in Olympic bar" },
    caption,
    tone,
    note,
    rows: [
      {
        id: "length",
        label: "Length",
        value: length.inches,
        color: DIAGRAM.indigo,
        text: lengthText.text,
        missing: lengthText.missing,
      },
    ],
  };
}

export function barbellSleeveModel(product: GymProduct, missing: DiagramMissingLabel): SleeveModel {
  const sleeveIn = measure(product.barbell_specs?.loadable_sleeve_length_in);
  const shaftIn = measure(product.barbell_specs?.shaft_length_in);
  const sleeve = inchesText(sleeveIn, missing);
  const shaft = inchesText(shaftIn, missing);
  let caption = `Loadable sleeve ${missingPhrase(missing)}`;
  if (sleeveIn != null && shaftIn != null) {
    caption = `Sleeve ${sleeve.text} each side · shaft ${shaft.text}`;
  } else if (sleeveIn != null) {
    caption = `Sleeve ${sleeve.text} each side · shaft ${missingPhrase(missing)}`;
  } else if (shaftIn != null) {
    caption = `Shaft ${shaft.text} · loadable sleeve ${missingPhrase(missing)}`;
  }

  const assembled =
    sleeveIn != null && shaftIn != null ? sleeveIn * 2 + shaftIn : Math.max(sleeveIn ?? 0, shaftIn ?? 0);

  return {
    scaleMax: axisMax(SLEEVE_SCALE_IN, [assembled]),
    sleeveIn,
    shaftIn,
    caption,
    tone: sleeveIn == null && shaftIn == null ? "missing" : "neutral",
    note: "Each end uses the published per-side sleeve length. No total is calculated.",
  };
}

export function benchModel(product: GymProduct, missing: DiagramMissingLabel): BenchModel {
  const lengthIn = measure(product.dimensions?.depth_open_in);
  const widthIn = measure(product.dimensions?.width_in);
  const footprintSqft = measure(product.dimensions?.footprint_sqft);
  const storedFootprintSqft = measure(product.bench_specs?.stored_footprint_sqft);
  const storedHeightIn = measure(product.bench_specs?.stored_height_in);
  const length = inchesText(lengthIn, missing);
  const width = inchesText(widthIn, missing);
  const footprint = sqftText(footprintSqft, missing);
  const storedFootprint = sqftText(storedFootprintSqft, missing);
  const storedHeight = inchesText(storedHeightIn, missing);

  let caption = "In-use outline";
  if (lengthIn != null && widthIn != null) {
    caption = `In use ${formatNumber(lengthIn)} × ${formatNumber(widthIn)} in`;
  } else if (lengthIn != null) {
    caption = `${length.text} long · width ${missingPhrase(missing)}`;
  } else if (widthIn != null) {
    caption = `${width.text} wide · length ${missingPhrase(missing)}`;
  } else {
    caption = `In-use size ${missingPhrase(missing)}`;
  }

  const tone: DiagramTone = lengthIn == null || widthIn == null ? "missing" : "neutral";

  return {
    lengthIn,
    widthIn,
    footprintSqft,
    storedFootprintSqft,
    storedHeightIn,
    caption,
    tone,
    note: "Footprint and stored size are shown only when the manufacturer published them.",
    facts: [
      { label: "Footprint", text: footprint.text, missing: footprint.missing },
      { label: "Stored footprint", text: storedFootprint.text, missing: storedFootprint.missing },
      { label: "Stored height", text: storedHeight.text, missing: storedHeight.missing },
    ],
  };
}

export function dumbbellModel(product: GymProduct, missing: DiagramMissingLabel): DumbbellModel {
  const specs = product.dumbbell_specs;
  const minLbs = measure(specs?.min_weight_lbs);
  const maxLbs = measure(specs?.max_weight_lbs);
  const trayLengthIn = measure(specs?.tray_length_in);
  const trayWidthIn = measure(specs?.tray_width_in);
  const maxLengthIn = measure(product.dimensions?.depth_open_in);
  const trayIncluded = specs?.tray_included ?? null;
  const minText = poundsText(minLbs, missing);
  const maxText = poundsText(maxLbs, missing);

  let weightCaption = `Weight ${missingPhrase(missing)}`;
  let weightTone: DiagramTone = "missing";
  if (minLbs != null && maxLbs != null) {
    weightCaption = `${formatNumber(minLbs)}–${formatNumber(maxLbs)} lb`;
    weightTone = "neutral";
  } else if (maxLbs != null) {
    weightCaption = `Start ${missingPhrase(missing)} · up to ${maxText.text}`;
    weightTone = "missing";
  } else if (minLbs != null) {
    weightCaption = `From ${minText.text} · maximum ${missingPhrase(missing)}`;
    weightTone = "missing";
  }

  let trayMode: DumbbellModel["trayMode"] = "none";
  let trayCaption = `Tray ${missingPhrase(missing)}`;
  let trayTone: DiagramTone = "missing";
  if (trayLengthIn != null && trayWidthIn != null) {
    trayMode = "outline";
    trayCaption = `Tray ${formatNumber(trayLengthIn)} × ${formatNumber(trayWidthIn)} in`;
    trayTone = "neutral";
  } else if (trayIncluded === false) {
    trayCaption = "No tray";
    trayTone = "neutral";
    if (maxLengthIn != null) {
      trayMode = "length";
      trayCaption = `No tray · max length ${formatNumber(maxLengthIn)} in`;
    }
  } else if (maxLengthIn != null) {
    trayMode = "length";
    trayCaption =
      trayIncluded === true
        ? `Tray size ${missingPhrase(missing)} · max length ${formatNumber(maxLengthIn)} in`
        : `Max length ${formatNumber(maxLengthIn)} in · tray ${missingPhrase(missing)}`;
    trayTone = "missing";
  } else if (trayIncluded === true) {
    trayCaption = `Tray size ${missingPhrase(missing)}`;
    trayTone = "missing";
  }

  return {
    scaleMax: axisMax(WEIGHT_SCALE_LBS, [minLbs, maxLbs]),
    minLbs,
    maxLbs,
    trayIncluded,
    trayLengthIn,
    trayWidthIn,
    maxLengthIn,
    weightCaption,
    weightTone,
    trayCaption,
    trayTone,
    trayMode,
    note: "Weights sit on a 0–125 lb scale. Tray size is drawn only when length and width are published.",
  };
}

export function scaleSummary(title: string, chart: ScaleChartModel): string {
  const rows = chart.rows
    .map((row) => {
      if (row.value == null) return `${row.label}: ${row.text}. No bar.`;
      return `${row.label}: ${row.text}.`;
    })
    .join(" ");
  const marker = chart.marker ? ` Reference ${chart.marker.label}.` : "";
  return `${title}. ${rows}${marker} ${chart.caption}.`;
}
