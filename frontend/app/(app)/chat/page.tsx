"use client";
import { useState } from "react";
import { SendHorizonal, Eye, Loader2 } from "lucide-react";
import { Topbar } from "@/components/shell";
import { Button, Input, MetricLabel } from "@/components/ui";
import { demoChat } from "@/lib/demo";
import { DEMO, api } from "@/lib/api";

const SUGGESTIONS = [
  "What features are missing test coverage?",
  "Generate API tests for checkout.",
  "Which modules have the highest regression risk?",
  "What should be tested before release 2.4?",
];

export default function Chat() {
  const [messages, setMessages] = useState(demoChat);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);

  const send = async (text?: string) => {
    const q = (text ?? input).trim();
    if (!q) return;
    setMessages(m => [...m, { role: "user", content: q }]);
    setInput(""); setBusy(true);
    let answer = "In demo mode I answer from the seeded Meridian Commerce knowledge base. Connect the backend (NEXT_PUBLIC_API_URL) and I'll reason over your real project — documents, tests, commits and bug history — via the knowledge-retrieval agent.";
    if (!DEMO) {
      const res = await api<{ answer: string }>("/ai/chat", { method: "POST", body: JSON.stringify({ message: q }) });
      answer = res.answer;
    } else {
      await new Promise(r => setTimeout(r, 900));
    }
    setMessages(m => [...m, { role: "assistant", content: answer }]);
    setBusy(false);
  };

  return (
    <>
      <Topbar title="Ask Argus" subtitle="Grounded in the project knowledge graph — never generic" />
      <main className="mx-auto flex h-[calc(100vh-56px)] max-w-3xl flex-col p-6">
        <div className="flex-1 space-y-5 overflow-y-auto pb-6">
          {messages.map((m, i) => (
            <div key={i} className={m.role === "user" ? "flex justify-end" : "flex gap-3"}>
              {m.role === "assistant" && (
                <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-accent text-white">
                  <Eye size={13} strokeWidth={2.4} />
                </span>
              )}
              <div className={m.role === "user"
                ? "max-w-[80%] rounded-2xl rounded-br-md bg-accent-soft px-4 py-2.5 text-[13.5px] text-ink"
                : "max-w-[85%] whitespace-pre-wrap text-[13.5px] leading-relaxed"}>
                {m.content}
              </div>
            </div>
          ))}
          {busy && <div className="flex items-center gap-2 text-muted"><Loader2 size={14} className="animate-spin" /><span className="text-[12.5px]">Consulting the knowledge graph…</span></div>}
        </div>

        <div className="border-t border-line pt-4">
          <div className="mb-3 flex flex-wrap gap-1.5">
            {SUGGESTIONS.map(s => (
              <button key={s} onClick={() => send(s)}
                className="rounded-full border border-line px-3 py-1 text-[12px] text-muted transition-colors hover:border-accent hover:text-accent">
                {s}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <Input placeholder="Ask about coverage, risk, releases, or any test…" value={input}
              onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && send()} />
            <Button onClick={() => send()} disabled={busy}><SendHorizonal size={15} /></Button>
          </div>
          <MetricLabel className="mt-2">Answers cite their sources · low-confidence answers are flagged</MetricLabel>
        </div>
      </main>
    </>
  );
}
