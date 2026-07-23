"use client";
import { useState } from "react";
import { Bug, Loader2 } from "lucide-react";
import { Topbar } from "@/components/shell";
import { Button, Card, MetricLabel, Badge, Textarea } from "@/components/ui";
import { demoBugResult } from "@/lib/demo";
import { DEMO, api } from "@/lib/api";

const SAMPLE = `java.lang.NullPointerException: Cannot invoke "com.meridian.inventory.Hold.getSkuId()" because "hold" is null
    at com.meridian.inventory.InventoryHoldService.release(InventoryHoldService.java:118)
    at com.meridian.payments.webhooks.PaymentWebhookHandler.onIntentCanceled(PaymentWebhookHandler.java:74)
    at com.meridian.payments.webhooks.WebhookRouter.dispatch(WebhookRouter.java:52)`;

export default function Bugs() {
  const [input, setInput] = useState(SAMPLE);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<typeof demoBugResult | null>(null);

  const investigate = async () => {
    setBusy(true);
    if (DEMO) {
      await new Promise(r => setTimeout(r, 1400));
      setResult(demoBugResult);
    } else {
      setResult(await api("/ai/investigate-bug", { method: "POST", body: JSON.stringify({ input_text: input }) }));
    }
    setBusy(false);
  };

  return (
    <>
      <Topbar title="Bug investigation" subtitle="Paste a stack trace, error log or crash report" />
      <main className="mx-auto max-w-4xl space-y-4 p-6">
        <Card>
          <MetricLabel>Evidence</MetricLabel>
          <Textarea rows={7} className="mt-2" value={input} onChange={e => setInput(e.target.value)} />
          <div className="mt-3 flex justify-end">
            <Button onClick={investigate} disabled={busy || !input.trim()}>
              {busy ? <Loader2 size={14} className="animate-spin" /> : <Bug size={14} />}
              {busy ? "Investigating…" : "Investigate"}
            </Button>
          </div>
        </Card>

        {result && (
          <>
            <Card className="rise border-l-2 border-l-fail">
              <div className="flex items-center justify-between">
                <MetricLabel>Root cause</MetricLabel>
                <Badge tone={result.confidence === "high" ? "pass" : "warn"} mono>{result.confidence} confidence</Badge>
              </div>
              <p className="mt-2 text-[13.5px] leading-relaxed">{result.root_cause}</p>
              <MetricLabel className="mt-4">Affected modules</MetricLabel>
              <div className="mt-1.5 flex gap-1.5">
                {result.affected_modules.map(m => <Badge key={m} tone="fail" mono>{m}</Badge>)}
              </div>
            </Card>

            <div className="grid gap-4 md:grid-cols-2">
              <Card className="rise rise-1">
                <MetricLabel>Reproduction steps</MetricLabel>
                <ol className="mt-2 space-y-2">
                  {result.reproduction_steps.map((s, i) => (
                    <li key={i} className="flex gap-2.5 text-[13px]">
                      <span className="font-mono text-muted">{String(i + 1).padStart(2, "0")}</span>{s}
                    </li>
                  ))}
                </ol>
              </Card>
              <Card className="rise rise-1">
                <MetricLabel>Possible fixes</MetricLabel>
                <ul className="mt-2 space-y-2.5">
                  {result.possible_fixes.map((f, i) => (
                    <li key={i} className="flex items-start justify-between gap-2 text-[13px]">
                      <span>{f.fix}</span>
                      <Badge tone={f.effort === "low" ? "pass" : f.effort === "medium" ? "warn" : "fail"} mono>
                        {f.effort}
                      </Badge>
                    </li>
                  ))}
                </ul>
              </Card>
            </div>

            <Card className="rise rise-2">
              <MetricLabel>Recommended regression tests</MetricLabel>
              <ul className="mt-2 space-y-2">
                {result.recommended_tests.map((t, i) => (
                  <li key={i} className="flex items-center justify-between gap-3 rounded-xl border border-line p-3">
                    <div>
                      <p className="text-[13px] font-medium">{t.title}</p>
                      <p className="text-[12px] text-muted">{t.reason}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge mono>{t.category}</Badge>
                      <Button size="sm" variant="outline">Add to suite</Button>
                    </div>
                  </li>
                ))}
              </ul>
            </Card>
          </>
        )}
      </main>
    </>
  );
}
