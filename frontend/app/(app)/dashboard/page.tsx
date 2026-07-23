"use client";
import { Topbar } from "@/components/shell";
import { Card, MetricLabel, Badge, Bar } from "@/components/ui";
import { ReadinessDial } from "@/components/readiness-dial";
import { Heatmap } from "@/components/heatmap";
import { TrendChart } from "@/components/trend-chart";
import { demoDashboard as d } from "@/lib/demo";
import { riskColor } from "@/lib/utils";

export default function Dashboard() {
  return (
    <>
      <Topbar title="Dashboard" subtitle="Meridian Commerce · release 2.4" />
      <main className="space-y-4 p-6">
        {/* Row 1: readiness + KPIs + trend */}
        <div className="grid gap-4 lg:grid-cols-[auto_1fr]">
          <Card className="flex items-center justify-center rise">
            <ReadinessDial value={d.project.readiness} />
          </Card>

          <div className="grid gap-4 sm:grid-cols-2">
            <Card className="rise rise-1">
              <MetricLabel>Test suite</MetricLabel>
              <p className="mt-2 font-mono text-3xl tabular-nums tracking-tight">{d.test_cases.total}</p>
              <p className="mt-1 text-[12.5px] text-muted">
                <span className="text-pass">{d.test_cases.approved} approved</span> · {d.test_cases.pending_review} awaiting review
              </p>
              <div className="mt-3"><Bar value={(d.test_cases.approved / d.test_cases.total) * 100} tone="pass" /></div>
            </Card>
            <Card className="rise rise-1">
              <MetricLabel>Coverage · AI confidence {d.coverage.confidence}%</MetricLabel>
              <p className="mt-2 font-mono text-3xl tabular-nums tracking-tight">{d.coverage.pct}%</p>
              <p className="mt-1 text-[12.5px] text-muted">Risk exposure {d.coverage.risk}%</p>
              <div className="mt-3"><Bar value={d.coverage.pct!} /></div>
            </Card>
            <Card className="rise rise-2 sm:col-span-2">
              <MetricLabel>Six-week trend</MetricLabel>
              <div className="mt-2"><TrendChart data={d.trend} /></div>
            </Card>
          </div>
        </div>

        {/* Row 2: heatmap + risks + activity */}
        <div className="grid gap-4 lg:grid-cols-3">
          <Card className="rise rise-2 lg:col-span-2">
            <div className="mb-3 flex items-center justify-between">
              <MetricLabel>Module heatmap · fill = coverage · dot = risk</MetricLabel>
            </div>
            <Heatmap modules={d.coverage.modules} />
          </Card>

          <div className="space-y-4">
            <Card className="rise rise-2">
              <MetricLabel>Highest-risk modules</MetricLabel>
              <ul className="mt-3 space-y-3">
                {d.top_risks.map((r) => (
                  <li key={r.module} className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-[13px] font-medium">{r.module}</p>
                      <p className="metric-label">{r.kind.replace(/_/g, " ")}</p>
                    </div>
                    <span className={`font-mono text-sm tabular-nums ${riskColor(r.probability)}`}>
                      {r.probability}%
                    </span>
                  </li>
                ))}
              </ul>
            </Card>

            <Card className="rise rise-3">
              <MetricLabel>Recent activity</MetricLabel>
              <ul className="mt-3 space-y-2.5">
                {d.activity.map((a, i) => (
                  <li key={i} className="flex items-start justify-between gap-3">
                    <div>
                      <Badge tone={a.action.startsWith("ai.") ? "accent" : "neutral"} mono>
                        {a.action.split(".")[1]?.replace(/_/g, " ")}
                      </Badge>
                      <p className="mt-1 text-[12.5px] text-muted">{a.detail}</p>
                    </div>
                    <span className="metric-label shrink-0">{a.at}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </div>
      </main>
    </>
  );
}
