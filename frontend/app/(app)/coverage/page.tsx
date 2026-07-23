"use client";
import { Topbar } from "@/components/shell";
import { Card, MetricLabel, Badge, Bar } from "@/components/ui";
import { Heatmap } from "@/components/heatmap";
import { demoDashboard as d } from "@/lib/demo";

const gaps = [
  { area: "Inventory Sync · concurrency", kind: "missing_edge_case", detail: "No tests cover simultaneous purchase of final stock units; incident history shows 3 oversell events.", severity: "fail" },
  { area: "Admin Console · refunds", kind: "untested_feature", detail: "Refund workflow rewritten in sprint 24 with zero associated tests.", severity: "fail" },
  { area: "Promotions · stacking rules", kind: "weak_regression", detail: "Only happy-path stacking covered; exclusion matrix (12 combinations) untested.", severity: "warn" },
  { area: "Checkout · keyboard navigation", kind: "missing_accessibility", detail: "Tab-order assertions exist for cart but not for the 3-step checkout.", severity: "warn" },
  { area: "TC-SRCH-0012 / TC-SRCH-0019", kind: "duplicate", detail: "Both assert identical filter behavior; consolidate and archive one.", severity: "neutral" },
];

export default function Coverage() {
  return (
    <>
      <Topbar title="Coverage analysis" subtitle="Last audit: today 09:12 · confidence 91%" />
      <main className="space-y-4 p-6">
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            ["Coverage", d.coverage.pct + "%", "pass"],
            ["Risk exposure", d.coverage.risk + "%", "warn"],
            ["AI confidence", d.coverage.confidence + "%", "accent"],
          ].map(([label, val, tone]) => (
            <Card key={label as string}>
              <MetricLabel>{label}</MetricLabel>
              <p className="mt-2 font-mono text-3xl tabular-nums tracking-tight">{val}</p>
              <div className="mt-3"><Bar value={parseFloat(val as string)} tone={tone as any} /></div>
            </Card>
          ))}
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <MetricLabel className="mb-3">Module heatmap</MetricLabel>
            <Heatmap modules={d.coverage.modules} />
          </Card>
          <Card>
            <MetricLabel className="mb-3">Detected gaps · {gaps.length}</MetricLabel>
            <ul className="space-y-3">
              {gaps.map(g => (
                <li key={g.area} className="rounded-xl border border-line p-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-[13px] font-medium">{g.area}</p>
                    <Badge tone={g.severity as any} mono>{g.kind.replace(/_/g, " ")}</Badge>
                  </div>
                  <p className="mt-1 text-[12.5px] leading-relaxed text-muted">{g.detail}</p>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </main>
    </>
  );
}
