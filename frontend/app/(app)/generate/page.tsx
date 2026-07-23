"use client";
import { useState } from "react";
import { FileUp, Sparkles, CircleCheck, Loader2 } from "lucide-react";
import { Topbar } from "@/components/shell";
import { Button, Card, Input, MetricLabel, Badge } from "@/components/ui";
import { cn } from "@/lib/utils";

const CATEGORIES = ["functional","regression","smoke","integration","api","ui","e2e","boundary","negative","edge","performance","accessibility","security","compatibility"];
const SOURCES = [
  { kind: "prd", label: "PRD / Word / PDF" }, { kind: "user_story", label: "User stories" },
  { kind: "openapi", label: "Swagger / OpenAPI" }, { kind: "code", label: "Source code / repo" },
  { kind: "figma", label: "Figma designs" }, { kind: "schema", label: "Database schema" },
];

export default function Generate() {
  const [scope, setScope] = useState("");
  const [picked, setPicked] = useState<string[]>(["functional", "negative", "edge"]);
  const [phase, setPhase] = useState<"idle" | "running" | "done">("idle");
  const [step, setStep] = useState(0);

  const pipeline = [
    "Product Understanding agent · modeling features & journeys",
    "Requirement Analysis agent · extracting testable requirements",
    "Test Generation agent · writing enterprise-grade cases",
    "Coverage agent · auditing the new suite for gaps",
  ];

  const run = () => {
    setPhase("running"); setStep(0);
    pipeline.forEach((_, i) => setTimeout(() => setStep(i + 1), (i + 1) * 1100));
    setTimeout(() => setPhase("done"), pipeline.length * 1100 + 400);
  };

  return (
    <>
      <Topbar title="Generate tests" subtitle="Ground Argus in your product, then set it to work" />
      <main className="mx-auto max-w-3xl space-y-4 p-6">
        <Card>
          <MetricLabel>1 · Knowledge sources</MetricLabel>
          <p className="mt-1 text-[13px] text-muted">Upload documents or connect repositories. Everything is chunked, embedded and added to the project knowledge graph.</p>
          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {SOURCES.map(s => (
              <label key={s.kind} className="card-hover flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-line px-3 py-3 text-[12.5px] text-muted hover:text-ink">
                <FileUp size={14} /> {s.label}
                <input type="file" className="hidden" multiple />
              </label>
            ))}
          </div>
        </Card>

        <Card>
          <MetricLabel>2 · Scope</MetricLabel>
          <Input className="mt-3" placeholder='e.g. "Checkout and payment flows, including 3DS and promo codes"'
            value={scope} onChange={e => setScope(e.target.value)} />
          <MetricLabel className="mt-5">Test categories</MetricLabel>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {CATEGORIES.map(c => (
              <button key={c}
                onClick={() => setPicked(p => p.includes(c) ? p.filter(x => x !== c) : [...p, c])}
                className={cn("rounded-md border px-2.5 py-1 font-mono text-[11px] uppercase tracking-wide transition-colors",
                  picked.includes(c) ? "border-accent bg-accent-soft text-accent" : "border-line text-muted hover:text-ink")}>
                {c}
              </button>
            ))}
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <MetricLabel>3 · Agent pipeline</MetricLabel>
            <Button onClick={run} disabled={phase === "running" || !scope}>
              <Sparkles size={14} /> {phase === "running" ? "Working…" : "Generate test cases"}
            </Button>
          </div>
          {phase !== "idle" && (
            <ol className="mt-4 space-y-2.5">
              {pipeline.map((label, i) => (
                <li key={label} className="flex items-center gap-2.5 text-[13px]">
                  {step > i ? <CircleCheck size={15} className="text-pass" />
                    : step === i && phase === "running" ? <Loader2 size={15} className="animate-spin text-accent" />
                    : <span className="h-[15px] w-[15px] rounded-full border border-line" />}
                  <span className={step >= i ? "" : "text-muted"}>{label}</span>
                </li>
              ))}
            </ol>
          )}
          {phase === "done" && (
            <div className="mt-4 rounded-xl border border-pass/30 bg-pass/5 p-4">
              <p className="text-[13.5px] font-medium text-pass">24 test cases drafted</p>
              <p className="mt-1 text-[12.5px] text-muted">
                18 functional · 4 negative · 2 edge — all traceable to REQ-PRM-014 → REQ-PRM-021.
                Ready for review in <span className="text-ink">Test cases</span>.
              </p>
              <div className="mt-2 flex gap-1.5">
                <Badge tone="pass" mono>92% avg automation readiness</Badge>
                <Badge tone="info" mono>traceability 100%</Badge>
              </div>
            </div>
          )}
          <p className="mt-4 text-[11.5px] text-muted">
            Demo mode simulates the pipeline. With the backend connected, this calls
            <span className="font-mono"> POST /api/v1/ai/generate-tests</span> and persists results.
          </p>
        </Card>
      </main>
    </>
  );
}
