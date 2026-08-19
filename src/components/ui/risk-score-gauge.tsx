import { cn } from "@/lib/utils";

/** Gradient stops across the arc, low score (left) to high (right). */
const STOPS = ["#eb4f46", "#f0813c", "#f5c53f", "#c3dd4a", "#7ed957"] as const;
const EMPTY = "#E2E2E2";

const TICKS = 68;
const R_OUTER = 100;
const R_INNER = 82;
const R_ARC = 72; // thin guide arc inside the ticks; the marker rides on it
const CX = 110;
const CY = 110;

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function hexToRgb(hex: string) {
  return [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
}

/** Sample the gradient at 0..1. */
function colorAt(t: number): string {
  const span = 1 / (STOPS.length - 1);
  const i = Math.min(STOPS.length - 2, Math.floor(t / span));
  const local = (t - i * span) / span;
  const [r1, g1, b1] = hexToRgb(STOPS[i]);
  const [r2, g2, b2] = hexToRgb(STOPS[i + 1]);
  const c = [lerp(r1, r2, local), lerp(g1, g2, local), lerp(b1, b2, local)];
  return `rgb(${c.map((n) => Math.round(n)).join(", ")})`;
}

function riskLabelFor(score: number): string {
  if (score < 34) return "High";
  if (score < 67) return "Medium";
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
 * Semicircular risk-score gauge drawn as inline SVG: ticks sweep red → green
 * left to right, filled up to the score and greyed beyond it, with a marker at
 * the current value. The readout sits in the middle as real DOM text so it
 * uses the app's type styles.
 */
export function RiskScoreGauge({
  value,
  riskLevel,
  className,
}: RiskScoreGaugeProps) {
  const score = Math.max(0, Math.min(100, Math.round(value)));
  const label = riskLevel?.trim() || riskLabelFor(score);
  const filledThrough = (score / 100) * (TICKS - 1);

  const ticks = Array.from({ length: TICKS }, (_, i) => {
    const t = i / (TICKS - 1);
    const angle = Math.PI * (1 - t); // π (left) → 0 (right)
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    return {
      key: i,
      x1: CX + R_INNER * cos,
      y1: CY - R_INNER * sin,
      x2: CX + R_OUTER * cos,
      y2: CY - R_OUTER * sin,
      color: i <= filledThrough ? colorAt(t) : EMPTY,
    };
  });

  // Marker sits just inside the arc at the current value.
  const markerAngle = Math.PI * (1 - score / 100);
  const markerR = R_ARC;
  const mx = CX + markerR * Math.cos(markerAngle);
  const my = CY - markerR * Math.sin(markerAngle);
  // Point the marker inward, back along the radius toward the centre.
  // rotate(R) maps (1,0) -> (cos R, sin R); the inward unit vector is
  // (-cos t, sin t) in SVG coords, so R = 180 - t, i.e. 1.8 * score.
  const markerRotation = (score / 100) * 180;

  return (
    <div className={cn("mx-auto w-full max-w-95", className)}>
      <svg
        viewBox="0 0 220 132"
        className="w-full"
        role="img"
        aria-label={`Risk score ${score} out of 100, ${label} risk`}
      >
        {/* Guide arc the marker travels along */}
        <path
          d={`M ${CX - R_ARC} ${CY} A ${R_ARC} ${R_ARC} 0 0 1 ${CX + R_ARC} ${CY}`}
          fill="none"
          stroke="#E2E2E2"
          strokeWidth={1.5}
          strokeLinecap="round"
        />

        {ticks.map((t) => (
          <line
            key={t.key}
            x1={t.x1}
            y1={t.y1}
            x2={t.x2}
            y2={t.y2}
            stroke={t.color}
            strokeWidth={2}
            strokeLinecap="round"
          />
        ))}
        <polygon
          points="0,-5 8,0 0,5"
          fill={colorAt(score / 100)}
          transform={`translate(${mx} ${my}) rotate(${markerRotation})`}
        />

        {/* Readout lives in the SVG so it scales with the arc */}
        <text
          x={CX}
          y={82}
          textAnchor="middle"
          className="fill-accent-foreground"
          style={{ fontSize: 30, fontWeight: 600, letterSpacing: "-0.02em" }}
        >
          {score}
        </text>
        <text
          x={CX}
          y={95}
          textAnchor="middle"
          className="fill-muted-foreground"
          style={{ fontSize: 7.5, fontWeight: 500, letterSpacing: "0.14em" }}
        >
          YOUR RISK SCORE
        </text>
        <rect
          x={CX - 25}
          y={102}
          width={50}
          height={16}
          rx={8}
          className="fill-primary"
        />
        <text
          x={CX}
          y={113}
          textAnchor="middle"
          className="fill-primary-foreground"
          style={{ fontSize: 7.5, fontWeight: 500 }}
        >
          {label}
        </text>

        {/* Scale bounds, aligned under the arc ends */}
        <text
          x={CX - R_OUTER}
          y={129}
          textAnchor="middle"
          className="fill-muted-foreground"
          style={{ fontSize: 8 }}
        >
          0
        </text>
        <text
          x={CX + R_OUTER}
          y={129}
          textAnchor="middle"
          className="fill-muted-foreground"
          style={{ fontSize: 8 }}
        >
          100
        </text>
      </svg>
    </div>
  );
}
