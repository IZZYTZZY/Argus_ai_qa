"use client";

/** The signature dashboard element: a precision release-readiness dial.
 *  A thin arc, mono numerals, and a threshold tick at 90%. */
export function ReadinessDial({ value, threshold = 90 }: { value: number; threshold?: number }) {
  const r = 74, cx = 90, cy = 90;
  const circ = 2 * Math.PI * r;
  const arc = (270 / 360) * circ;                 // dial spans 270°
  const filled = (value / 100) * arc;
  const tone = value >= threshold ? "var(--pass)" : value >= 60 ? "var(--warn)" : "var(--fail)";
  const tickAngle = ((threshold / 100) * 270 - 225) * (Math.PI / 180);
  const t1 = { x: cx + (r - 8) * Math.cos(tickAngle), y: cy + (r - 8) * Math.sin(tickAngle) };
  const t2 = { x: cx + (r + 8) * Math.cos(tickAngle), y: cy + (r + 8) * Math.sin(tickAngle) };

  return (
    <div className="relative h-[180px] w-[180px]">
      <svg viewBox="0 0 180 180" className="h-full w-full -rotate-[135deg]">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--line)" strokeWidth="6"
          strokeDasharray={`${arc} ${circ}`} strokeLinecap="round" />
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={tone} strokeWidth="6"
          strokeDasharray={`${filled} ${circ}`} strokeLinecap="round"
          style={{ transition: "stroke-dasharray 900ms cubic-bezier(0.22,1,0.36,1)" }} />
        <line x1={t1.x} y1={t1.y} x2={t2.x} y2={t2.y} stroke="var(--muted)" strokeWidth="1.5" />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-mono text-4xl font-medium tabular-nums tracking-tight">{value.toFixed(1)}</span>
        <span className="metric-label mt-1">Release readiness</span>
      </div>
    </div>
  );
}
