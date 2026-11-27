import { formatNumber } from "@/lib/format";
import {
  BENCH_SCALE_IN,
  BENCH_WIDTH_SCALE_IN,
  benchModel,
  barbellLengthModel,
  barbellSleeveModel,
  DIAGRAM,
  dumbbellModel,
  type DiagramMissingLabel,
  type DiagramTone,
  type DumbbellModel,
  type ScaleChartModel,
  type ScaleRow,
  type SleeveModel,
  rackCeilingModel,
  rackDepthModel,
  scaleSummary,
  TRAY_SCALE_IN,
} from "@/lib/diagrams";
import type { GymProduct } from "@/lib/types";

type DiagramMode = "strip" | "compare" | "detail";

function toneClass(tone: DiagramTone): string {
  if (tone === "fits") return "text-emerald-600";
  if (tone === "exceeds") return "text-amber-600";
  if (tone === "missing") return "text-amber-800";
  return "text-stone-600";
}

function MissingValue({ label }: { label: DiagramMissingLabel }) {
  if (label === "Unverified") {
    return (
      <span className="inline-flex items-center rounded bg-amber-50 px-1.5 py-0.5 text-xs font-medium text-amber-950">
        Unverified
      </span>
    );
  }
  return <span className="text-stone-500">Not published</span>;
}

function ValueText({ text, missing, label }: { text: string; missing: boolean; label: DiagramMissingLabel }) {
  if (!missing) return <span className="tabular-nums font-medium text-stone-950">{text}</span>;
  if (text === label) return <MissingValue label={label} />;
  return <span className="text-stone-500">{text}</span>;
}

function fraction(value: number, scaleMax: number): number {
  if (!Number.isFinite(value) || !Number.isFinite(scaleMax) || scaleMax <= 0 || value <= 0) return 0;
  return Math.min(value, scaleMax) / scaleMax;
}

function BarSvg({
  row,
  scaleMax,
  marker,
  wall,
  label,
}: {
  row: ScaleRow;
  scaleMax: number;
  marker?: number;
  wall?: boolean;
  label: DiagramMissingLabel;
}) {
  const summary = row.value == null ? `${row.label}: ${row.text}. No bar.` : `${row.label}: ${row.text}.`;
  const width = row.value == null ? 0 : fraction(row.value, scaleMax) * 100;
  const markerX = marker == null ? null : fraction(marker, scaleMax) * 100;
  return (
    <svg viewBox="0 0 100 12" preserveAspectRatio="none" className="block h-3 w-full" role="img" aria-label={summary}>
      <title>{summary}</title>
      {width > 0 ? (
        <>
          <rect x="0" y="2" width="100" height="8" fill={DIAGRAM.track} />
          <rect x="0" y="2" width={width} height="8" fill={row.color} />
        </>
      ) : (
        <line
          x1="0"
          x2="100"
          y1="6"
          y2="6"
          stroke={DIAGRAM.track}
          strokeWidth="2"
          vectorEffect="non-scaling-stroke"
        />
      )}
      {markerX != null ? (
        <line
          x1={markerX}
          x2={markerX}
          y1="0"
          y2="12"
          stroke={DIAGRAM.stone600}
          strokeWidth="1.5"
          strokeDasharray="2 2"
          vectorEffect="non-scaling-stroke"
        />
      ) : null}
      {wall && width > 0 ? (
        <line x1="0.6" x2="0.6" y1="0" y2="12" stroke={DIAGRAM.stone900} strokeWidth="2" vectorEffect="non-scaling-stroke" />
      ) : null}
      {row.missing ? <desc>{label}. Bar omitted.</desc> : null}
    </svg>
  );
}

function ScaleChart({
  title,
  chart,
  mode,
  missing,
}: {
  title: string;
  chart: ScaleChartModel;
  mode: DiagramMode;
  missing: DiagramMissingLabel;
}) {
  const summary = scaleSummary(title, chart);
  const columns = mode === "detail" ? "5.75rem minmax(0,1fr) 6.75rem" : "3.75rem minmax(0,1fr)";
  return (
    <figure className="min-w-0" aria-label={summary}>
      {mode === "detail" ? <figcaption className="mb-2 text-sm font-semibold text-stone-950">{title}</figcaption> : null}
      <div className="grid items-center gap-x-2 gap-y-1.5" style={{ gridTemplateColumns: columns }}>
        {chart.rows.map((row) => (
          <div key={row.id} className="contents">
            <span className="text-xs text-stone-600">{row.label}</span>
            <BarSvg row={row} scaleMax={chart.scaleMax} marker={chart.marker?.value} wall={chart.wall} label={missing} />
            {mode === "detail" ? (
              <span className="text-right text-xs">
                <ValueText text={row.text} missing={row.missing} label={missing} />
              </span>
            ) : null}
          </div>
        ))}
      </div>
      <p className={`mt-1.5 text-xs leading-4 ${toneClass(chart.tone)}`}>{chart.caption}</p>
      {mode === "detail" && chart.marker ? (
        <p className="mt-1 text-xs text-stone-500">Dashed line: {chart.marker.label}. Scale 0–{chart.scaleMax}.</p>
      ) : null}
      {mode === "detail" && chart.note ? <p className="mt-1 text-xs leading-5 text-stone-500">{chart.note}</p> : null}
    </figure>
  );
}

function SleeveChart({ model, mode, missing }: { model: SleeveModel; mode: DiagramMode; missing: DiagramMissingLabel }) {
  const parts: { start: number; width: number; color: string; name: string }[] = [];
  if (model.sleeveIn != null && model.shaftIn != null) {
    parts.push({ start: 0, width: model.sleeveIn, color: DIAGRAM.indigoSoft, name: "Left sleeve" });
    parts.push({ start: model.sleeveIn, width: model.shaftIn, color: DIAGRAM.stone900, name: "Shaft" });
    parts.push({
      start: model.sleeveIn + model.shaftIn,
      width: model.sleeveIn,
      color: DIAGRAM.indigoSoft,
      name: "Right sleeve",
    });
  } else if (model.shaftIn != null) {
    parts.push({ start: 0, width: model.shaftIn, color: DIAGRAM.stone900, name: "Shaft" });
  } else if (model.sleeveIn != null) {
    parts.push({ start: 0, width: model.sleeveIn, color: DIAGRAM.indigoSoft, name: "Loadable sleeve" });
  }
  const summary = `Loadable sleeve. ${model.caption}.`;
  return (
    <figure className="min-w-0">
      {mode === "detail" ? (
        <figcaption className="mb-2 text-sm font-semibold text-stone-950">Loadable sleeve</figcaption>
      ) : (
        <figcaption className="mb-1 text-xs text-stone-600">Sleeve</figcaption>
      )}
      <svg viewBox="0 0 100 12" preserveAspectRatio="none" className="block h-3 w-full" role="img" aria-label={summary}>
        <title>{summary}</title>
        {parts.length > 0 ? <rect x="0" y="2" width="100" height="8" fill={DIAGRAM.track} /> : (
          <line x1="0" x2="100" y1="6" y2="6" stroke={DIAGRAM.track} strokeWidth="2" vectorEffect="non-scaling-stroke" />
        )}
        {parts.map((part) => (
          <rect
            key={part.name}
            x={fraction(part.start, model.scaleMax) * 100}
            y="2"
            width={fraction(part.width, model.scaleMax) * 100}
            height="8"
            fill={part.color}
          >
            <title>
              {part.name}: {formatNumber(part.width)} in
            </title>
          </rect>
        ))}
      </svg>
      <p className={`mt-1.5 text-xs leading-4 ${toneClass(model.tone)}`}>{model.caption}</p>
      {mode === "detail" ? <p className="mt-1 text-xs leading-5 text-stone-500">{model.note}</p> : null}
      {parts.length === 0 ? <p className="sr-only">{missing}. Bar omitted.</p> : null}
    </figure>
  );
}

function benchFrame(mode: DiagramMode, storedHeightIn: number | null) {
  const pad = mode === "detail" ? 12 : 6;
  const viewW = mode === "detail" ? 280 : 160;
  const baseH = mode === "detail" ? 148 : 72;
  const ppi = Math.min((viewW - pad * 2) / BENCH_SCALE_IN, (baseH - pad * 2) / BENCH_WIDTH_SCALE_IN);
  const storedPx = storedHeightIn == null ? 0 : storedHeightIn * ppi;
  const viewH = Math.max(baseH, pad * 2 + storedPx);
  return { pad, viewW, viewH, ppi, storedPx };
}

function BenchPlan({
  lengthIn,
  widthIn,
  storedHeightIn,
  mode,
  summary,
}: {
  lengthIn: number | null;
  widthIn: number | null;
  storedHeightIn: number | null;
  mode: DiagramMode;
  summary: string;
}) {
  if (lengthIn == null && widthIn == null && storedHeightIn == null) return null;
  const frame = benchFrame(mode, storedHeightIn);
  const heightClass = mode === "detail" ? "h-36" : "h-16";
  return (
    <svg
      viewBox={`0 0 ${frame.viewW} ${frame.viewH}`}
      className={`${heightClass} w-auto max-w-full`}
      role="img"
      aria-label={summary}
    >
      <title>{summary}</title>
      {lengthIn != null && widthIn != null ? (
        <rect
          x={frame.pad}
          y={frame.pad}
          width={lengthIn * frame.ppi}
          height={widthIn * frame.ppi}
          fill="#eef2ff"
          stroke={DIAGRAM.indigo}
          strokeWidth="2"
        />
      ) : null}
      {widthIn == null && lengthIn != null ? (
        <rect
          x={frame.pad}
          y={frame.viewH / 2 - 4}
          width={lengthIn * frame.ppi}
          height="8"
          fill={DIAGRAM.indigo}
        />
      ) : null}
      {lengthIn == null && widthIn != null ? (
        <rect x={frame.pad} y={frame.pad} width="8" height={widthIn * frame.ppi} fill={DIAGRAM.indigo} />
      ) : null}
      {frame.storedPx > 0 ? (
        <rect
          x={frame.viewW - frame.pad - 10}
          y={frame.viewH - frame.pad - frame.storedPx}
          width="8"
          height={frame.storedPx}
          fill={DIAGRAM.indigoSoft}
        />
      ) : null}
    </svg>
  );
}

function BenchChart({ product, mode, missing }: { product: GymProduct; mode: DiagramMode; missing: DiagramMissingLabel }) {
  const model = benchModel(product, missing);
  const summary = `Bench footprint. ${model.caption}. ${model.facts.map((fact) => `${fact.label} ${fact.text}`).join(". ")}.`;
  return (
    <figure className="min-w-0">
      {mode === "detail" ? (
        <figcaption className="mb-2 text-sm font-semibold text-stone-950">Published footprint</figcaption>
      ) : null}
      <div className={mode === "detail" ? "grid items-center gap-4 md:grid-cols-[auto_minmax(0,1fr)]" : "flex items-center gap-3"}>
        <BenchPlan
          lengthIn={model.lengthIn}
          widthIn={model.widthIn}
          storedHeightIn={mode === "strip" ? null : model.storedHeightIn}
          mode={mode}
          summary={summary}
        />
        <div className="min-w-0">
          <p className={`text-xs leading-4 ${toneClass(model.tone)}`}>{model.caption}</p>
          <dl className={mode === "detail" ? "mt-2 grid gap-1" : "mt-1 grid gap-0.5"}>
            {model.facts.map((fact) => (
              <div key={fact.label} className="flex flex-wrap items-baseline gap-x-2 text-xs">
                <dt className="text-stone-500">{fact.label}</dt>
                <dd>
                  <ValueText text={fact.text} missing={fact.missing} label={missing} />
                </dd>
              </div>
            ))}
          </dl>
          {mode === "detail" && model.note ? (
            <p className="mt-2 text-xs leading-5 text-stone-500">{model.note}</p>
          ) : null}
        </div>
      </div>
    </figure>
  );
}

function WeightSvg({ model }: { model: DumbbellModel }) {
  const summary = `Weight range. ${model.weightCaption}. Scale 0 to ${model.scaleMax} lb.`;
  const start = model.minLbs == null ? null : fraction(model.minLbs, model.scaleMax) * 100;
  const end = model.maxLbs == null ? null : fraction(model.maxLbs, model.scaleMax) * 100;
  const showRange = start != null && end != null && end > start;
  return (
    <svg viewBox="0 0 100 16" preserveAspectRatio="none" className="block h-4 w-full" role="img" aria-label={summary}>
      <title>{summary}</title>
      <line x1="0" x2="100" y1="8" y2="8" stroke={DIAGRAM.track} strokeWidth="2" vectorEffect="non-scaling-stroke" />
      {showRange ? (
        <rect x={start} y="4" width={end - start} height="8" fill={DIAGRAM.indigo} />
      ) : null}
      {start != null && !showRange ? (
        <rect x={Math.max(start - 0.6, 0)} y="2" width="1.2" height="12" fill={DIAGRAM.amber} />
      ) : null}
      {end != null && !showRange ? (
        <rect x={Math.max(end - 0.6, 0)} y="2" width="1.2" height="12" fill={DIAGRAM.amber} />
      ) : null}
    </svg>
  );
}

function TraySvg({ model }: { model: DumbbellModel }) {
  const summary = `Tray. ${model.trayCaption}.`;
  if (model.trayMode === "none") return null;
  const pad = 4;
  const viewW = 168;
  const ppi = (viewW - pad * 2) / TRAY_SCALE_IN;
  const drawn =
    model.trayMode === "outline" && model.trayWidthIn != null
      ? model.trayWidthIn * ppi
      : 10;
  const viewH = Math.max(64, pad + drawn + 16);
  return (
    <svg viewBox={`0 0 ${viewW} ${viewH}`} className="h-14 w-auto max-w-full" role="img" aria-label={summary}>
      <title>{summary}</title>
      <line
        x1={pad}
        x2={pad + TRAY_SCALE_IN * ppi}
        y1={viewH - 6}
        y2={viewH - 6}
        stroke={DIAGRAM.track}
        strokeWidth="2"
      />
      {model.trayMode === "outline" && model.trayLengthIn != null && model.trayWidthIn != null ? (
        <rect
          x={pad}
          y={pad}
          width={model.trayLengthIn * ppi}
          height={model.trayWidthIn * ppi}
          fill="#eef2ff"
          stroke={DIAGRAM.indigo}
          strokeWidth="2"
        />
      ) : null}
      {model.trayMode === "length" && model.maxLengthIn != null ? (
        <rect x={pad} y={viewH / 2 - 5} width={model.maxLengthIn * ppi} height="8" fill={DIAGRAM.indigo} />
      ) : null}
    </svg>
  );
}

function DumbbellChart({
  product,
  mode,
  missing,
}: {
  product: GymProduct;
  mode: DiagramMode;
  missing: DiagramMissingLabel;
}) {
  const model = dumbbellModel(product, missing);
  return (
    <div className={mode === "detail" ? "grid gap-6 md:grid-cols-2" : "flex flex-col gap-3"}>
      <figure className="min-w-0">
        {mode === "detail" ? (
          <figcaption className="mb-2 text-sm font-semibold text-stone-950">Weight range</figcaption>
        ) : null}
        <WeightSvg model={model} />
        <div className="mt-1 flex justify-between text-xs tabular-nums text-stone-500">
          <span>0</span>
          <span>{model.scaleMax} lb</span>
        </div>
        <p className={`mt-1 text-xs leading-4 ${toneClass(model.weightTone)}`}>{model.weightCaption}</p>
        {model.minLbs == null ? <p className="sr-only">Start {missing}. Range bar omitted.</p> : null}
      </figure>
      {mode === "strip" ? null : (
        <figure className="min-w-0">
          {mode === "detail" ? (
            <figcaption className="mb-2 text-sm font-semibold text-stone-950">Tray</figcaption>
          ) : (
            <figcaption className="mb-1 text-xs text-stone-600">Tray</figcaption>
          )}
          <TraySvg model={model} />
          <p className={`mt-1.5 text-xs leading-4 ${toneClass(model.trayTone)}`}>{model.trayCaption}</p>
          {mode === "detail" && model.note ? (
            <p className="mt-1 text-xs leading-5 text-stone-500">{model.note}</p>
          ) : null}
        </figure>
      )}
    </div>
  );
}

function CategoryDiagram({
  product,
  mode,
  missing,
}: {
  product: GymProduct;
  mode: DiagramMode;
  missing: DiagramMissingLabel;
}) {
  if (product.category === "rack") {
    return (
      <div className={mode === "detail" ? "grid gap-6 md:grid-cols-2" : "flex flex-col gap-3"}>
        <ScaleChart title="Ceiling clearance" chart={rackCeilingModel(product, missing)} mode={mode} missing={missing} />
        {mode === "strip" ? null : (
          <ScaleChart title="Wall depth" chart={rackDepthModel(product, missing)} mode={mode} missing={missing} />
        )}
      </div>
    );
  }
  if (product.category === "barbell") {
    return (
      <div className={mode === "detail" ? "grid gap-6 md:grid-cols-2" : "flex flex-col gap-3"}>
        <ScaleChart title="Bar length" chart={barbellLengthModel(product, missing)} mode={mode} missing={missing} />
        {mode === "strip" ? null : (
          <SleeveChart model={barbellSleeveModel(product, missing)} mode={mode} missing={missing} />
        )}
      </div>
    );
  }
  if (product.category === "bench") return <BenchChart product={product} mode={mode} missing={missing} />;
  return <DumbbellChart product={product} mode={mode} missing={missing} />;
}

export function FitStrip({ product }: { product: GymProduct }) {
  return (
    <div className="rounded-md bg-stone-50 px-2.5 py-2" data-fit-diagram="strip">
      <CategoryDiagram product={product} mode="strip" missing="Not published" />
    </div>
  );
}

export function FitDiagram({ product }: { product: GymProduct }) {
  return (
    <section aria-labelledby={`fit-diagram-${product.id}`} className="rounded-lg border border-stone-200 bg-white p-4" data-fit-diagram="detail">
      <h2 id={`fit-diagram-${product.id}`} className="text-xl font-semibold">
        Fit diagram
      </h2>
      <p className="mt-1 max-w-prose text-sm text-stone-600">
        Scaled from published measurements. A missing number stays unverified.
      </p>
      <div className="mt-4">
        <CategoryDiagram product={product} mode="detail" missing="Unverified" />
      </div>
    </section>
  );
}

export function CompareFit({ products }: { products: GymProduct[] }) {
  return (
    <div className="border-b border-stone-200 bg-stone-50 px-3 py-3" data-fit-diagram="compare">
      <h2 className="text-sm font-semibold text-stone-950">Fit at a glance</h2>
      <p className="mt-1 text-xs text-stone-600">
        Bars share a scale within each measurement. A blank mark means not published.
      </p>
      <div className="mt-3 flex gap-3">
        {products.map((product) => (
          <div key={product.id} className="min-w-56 flex-1 basis-0 rounded-md bg-white p-2">
            <p className="mb-2 line-clamp-2 min-h-10 text-xs font-semibold leading-5 text-stone-950">
              {product.brand} {product.model}
            </p>
            <CategoryDiagram product={product} mode="compare" missing="Not published" />
          </div>
        ))}
      </div>
    </div>
  );
}
