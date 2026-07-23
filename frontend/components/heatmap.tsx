"use client";
import { MetricLabel } from "./ui";

type Module = { name: string; coverage: number; risk: number; tests: number };

/** Testing heatmap: each module is a cell; fill encodes coverage, the
 *  corner dot encodes risk. Reads at a glance like a health board. */
export function Heatmap({ modules }: { modules: Module[] }) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
      {modules.map((m) => {
        const alpha = 0.06 + (m.coverage / 100) * 0.3;
        const dot = m.risk >= 50 ? "var(--fail)" : m.risk >= 25 ? "var(--warn)" : "var(--pass)";
        return (
          <div
            key={m.name}
            className="card-hover relative rounded-xl border border-line p-3"
            style={{ background: `color-mix(in srgb, var(--accent) ${alpha * 100}%, var(--surface))` }}
            title={`${m.name} — ${m.coverage}% coverage, ${m.risk}% risk`}
          >
            <span className="absolute right-3 top-3 h-2 w-2 rounded-full" style={{ background: dot }} />
            <p className="pr-4 text-[13px] font-medium leading-tight">{m.name}</p>
            <p className="mt-2 font-mono text-lg tabular-nums">{m.coverage}%</p>
            <MetricLabel>{m.tests} tests</MetricLabel>
          </div>
        );
      })}
    </div>
  );
}
