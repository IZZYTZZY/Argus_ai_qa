"use client";
import { Topbar } from "@/components/shell";
import { Card, MetricLabel, Badge, Button } from "@/components/ui";
import { demoRisks } from "@/lib/demo";
import { riskColor } from "@/lib/utils";
import { Sparkles } from "lucide-react";

export default function Risk() {
  return (
    <>
      <Topbar title="Risk & predictions" subtitle="Signals: 214 commits · 37 bugs · 6 releases analyzed" />
      <main className="space-y-4 p-6">
        {demoRisks.map(r => (
          <Card key={r.module} className="card-hover">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-[15px] font-semibold tracking-tight">{r.module}</h3>
                  <Badge tone={r.probability >= 70 ? "fail" : r.probability >= 40 ? "warn" : "pass"} mono>
                    {r.kind.replace(/_/g, " ")}
                  </Badge>
                </div>
              </div>
              <div className="text-right">
                <p className={`font-mono text-3xl tabular-nums tracking-tight ${riskColor(r.probability)}`}>
                  {r.probability}%
                </p>
                <MetricLabel>failure probability</MetricLabel>
              </div>
            </div>

            <MetricLabel className="mt-4">Reasoning</MetricLabel>
            <p className="mt-1 max-w-3xl text-[13.5px] leading-relaxed text-muted">{r.reasoning}</p>

            <MetricLabel className="mt-4">Recommended actions</MetricLabel>
            <ul className="mt-1.5 space-y-1">
              {r.recommended_actions.map(a => (
                <li key={a} className="flex items-center gap-2 text-[13px]">
                  <span className="h-1 w-1 rounded-full bg-accent" /> {a}
                </li>
              ))}
            </ul>
            <div className="mt-4">
              <Button size="sm" variant="outline"><Sparkles size={13} /> Generate these tests</Button>
            </div>
          </Card>
        ))}
      </main>
    </>
  );
}
