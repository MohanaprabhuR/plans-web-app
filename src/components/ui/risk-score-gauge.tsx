import { cn } from "@/lib/utils";

/** Gradient stops sampled along the arc, low score to high. */
const STOPS = ["#e8564e", "#e8933d", "#e8d24a", "#8fd95f", "#4fd996", "#3fd18a"];

/** −135° to +135°: a 270° sweep with the opening at the bottom. */
const START_DEG = -135;
const SWEEP_DEG = 270;

const SEGMENTS = 5;
const SLICES = 120; // per-slice fill approximates a continuous gradient
const GAP_SLICES = 2; // blanked slices at each segment boundary

const CX = 110;
const CY = 110;
const R_OUTER = 96;
const R_INNER = 79;
const R_GUIDE = 67;

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const hexToRgb = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));

/** Sample the palette at 0..1. */
function colorAt(t: number): string {
  const span = 1 / (STOPS.length - 1);
  const i = Math.min(STOPS.length - 2, Math.floor(t / span));
  const local = (t - i * span) / span;
  const [r1, g1, b1] = hexToRgb(STOPS[i]);
  const [r2, g2, b2] = hexToRgb(STOPS[i + 1]);
  return `rgb(${[lerp(r1, r2, local), lerp(g1, g2, local), lerp(b1, b2, local)]
    .map(Math.round)
    .join(", ")})`;
}

const polar = (r: number, deg: number) => {
  const rad = ((deg - 90) * Math.PI) / 180;
  return [CX + r * Math.cos(rad), CY + r * Math.sin(rad)] as const;
};

/** Filled ring slice between two angles. */
function slicePath(from: number, to: number): string {
  const [ox1, oy1] = polar(R_OUTER, from);
  const [ox2, oy2] = polar(R_OUTER, to);
  const [ix2, iy2] = polar(R_INNER, to);
  const [ix1, iy1] = polar(R_INNER, from);
  return `M ${ox1} ${oy1} A ${R_OUTER} ${R_OUTER} 0 0 1 ${ox2} ${oy2} L ${ix2} ${iy2} A ${R_INNER} ${R_INNER} 0 0 0 ${ix1} ${iy1} Z`;
}

/**
 * Fallback label when the API does not supply one. Bands chosen so 72 reads as
 * "Medium", matching the design; the dashboard passes the API's riskLevel and
 * overrides this.
 */
function riskLabelFor(score: number): string {
  if (score < 40) return "High";
  if (score < 80) return "Medium";
  return "Low";
}

type RiskScoreGaugeProps = {
  /** 0–100 risk score. */
  value: number;
  /** Overrides the label derived from the score (e.g. "Medium"). */
  riskLevel?: string;
  className?: string;
};

/**
 * Radial risk-score gauge.
 *
 * Drawn as inline SVG: the arc is built from many thin slices so the colour
 * runs as a continuous gradient rather than flat bands, with a few slices
 * blanked at each of the five segment boundaries to leave the dividing gaps.
 * The readout sits inside the SVG so it scales with the dial.
 */
export function RiskScoreGauge({
  value,
  riskLevel,
  className,
}: RiskScoreGaugeProps) {
  // Math.min/max propagate NaN, so screen it out before clamping.
  const safe = Number.isFinite(value) ? value : 0;
  const score = Math.max(0, Math.min(100, Math.round(safe)));
  const label = riskLevel?.trim() || riskLabelFor(score);

  const per = SLICES / SEGMENTS;
  const slices = Array.from({ length: SLICES }, (_, i) => {
    const posInSegment = i % per;
    // Leave a gap at the start of every segment except the first.
    if (i >= per && posInSegment < GAP_SLICES) return null;
    const t = i / (SLICES - 1);
    return {
      key: i,
      d: slicePath(
        START_DEG + (i / SLICES) * SWEEP_DEG,
        START_DEG + ((i + 1.02) / SLICES) * SWEEP_DEG,
      ),
      fill: colorAt(t),
    };
  }).filter(Boolean) as { key: number; d: string; fill: string }[];

  // Marker rides just inside the band at the current value.
  const markerDeg = START_DEG + (score / 100) * SWEEP_DEG;
  // Half-height is 6, so placing the centre at R_GUIDE + 6 puts the marker's
  // base exactly on the guide ring with the apex reaching into the band.
  const [mx, my] = polar(R_GUIDE + 6, markerDeg);

  // Shares the band's start and end angles; sitting at a smaller radius, its
  // tips naturally finish a little inside the band's, as in the design.
  const [gx1, gy1] = polar(R_GUIDE, START_DEG);
  const [gx2, gy2] = polar(R_GUIDE, START_DEG + SWEEP_DEG);

  return (
    <div className={cn("mx-auto w-full max-w-95", className)}>
      <svg
        viewBox="0 0 220 206"
        className="w-full"
        role="img"
        aria-label={`Risk score ${score} out of 100, ${label} risk`}
      >
        {slices.map((s) => (
          <path key={s.key} d={s.d} fill={s.fill} />
        ))}

        {/* Thin guide ring inside the band */}
        <path
          d={`M ${gx1} ${gy1} A ${R_GUIDE} ${R_GUIDE} 0 1 1 ${gx2} ${gy2}`}
          fill="none"
          stroke="#E4E4E4"
          strokeWidth={1}
          strokeLinecap="round"
        />

        {/* Value marker: points outward along the radius, at the band, with a
            white outline so it stays legible over the colour beneath it. The
            local apex is (0,+1); rotate(t) maps that to (-sin t, cos t), so
            markerDeg + 180 aims it away from the centre. */}
        <polygon
          points="-7,-6 7,-6 0,6"
          className="fill-foreground"
          stroke="#ffffff"
          strokeWidth={1.5}
          strokeLinejoin="round"
          transform={`translate(${mx} ${my}) rotate(${markerDeg + 180})`}
        />

        <text
          x={CX}
          y={126}
          textAnchor="middle"
          className="fill-accent-foreground"
          style={{ fontSize: 46, fontWeight: 600, letterSpacing: "-0.02em" }}
        >
          {score}
        </text>
        <text
          x={CX}
          y={150}
          textAnchor="middle"
          className="fill-muted-foreground"
          style={{ fontSize: 9, fontWeight: 500, letterSpacing: "0.08em" }}
        >
          YOUR RISK SCORE
        </text>
        <rect
          x={CX - 34}
          y={164}
          width={68}
          height={24}
          rx={12}
          className="fill-primary"
        />
        <text
          x={CX}
          y={180}
          textAnchor="middle"
          className="fill-primary-foreground"
          style={{ fontSize: 11, fontWeight: 500 }}
        >
          {label}
        </text>

      </svg>
    </div>
  );
}
