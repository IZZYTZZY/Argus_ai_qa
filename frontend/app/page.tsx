import Link from "next/link";
import { Eye, FileCheck2, RefreshCw, TriangleAlert, ArrowRight } from "lucide-react";
import { Button, MetricLabel } from "@/components/ui";

const pillars = [
  {
    icon: FileCheck2,
    title: "Understands, then tests",
    body: "Argus builds a knowledge graph from your PRDs, code, APIs and designs — then writes test cases the way a senior QA engineer would: traceable, prioritized, and grounded in how your product actually works.",
  },
  {
    icon: RefreshCw,
    title: "Never falls out of sync",
    body: "Every merged PR, updated story and changed API is compared against your suite. Affected tests are updated, obsolete ones archived, and gaps filled — before anyone asks.",
  },
  {
    icon: TriangleAlert,
    title: "Sees risk before release",
    body: "Commit history, bug patterns and coverage combine into per-module risk probabilities with explicit reasoning — so release decisions rest on evidence, not intuition.",
  },
];

export default function Landing() {
  return (
    <main className="min-h-screen">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <div className="flex items-center gap-2.5">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent text-white">
            <Eye size={15} strokeWidth={2.4} />
          </span>
          <span className="text-[15px] font-semibold tracking-tight">Argus</span>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/login"><Button variant="ghost" size="sm">Sign in</Button></Link>
          <Link href="/dashboard"><Button size="sm">Open workspace</Button></Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="hero-grid relative">
        <div className="mx-auto max-w-6xl px-6 pb-20 pt-24 text-center">
          <MetricLabel className="rise">Enterprise AI quality engineering</MetricLabel>
          <h1 className="rise rise-1 mx-auto mt-4 max-w-3xl text-5xl font-semibold leading-[1.06] tracking-tight sm:text-6xl">
            The QA engineer that
            <span className="text-accent"> never sleeps.</span>
          </h1>
          <p className="rise rise-2 mx-auto mt-6 max-w-xl text-[15px] leading-relaxed text-muted">
            Argus learns your entire product — requirements, code, APIs, history — then
            generates, maintains and audits your test suite continuously. Your team reviews.
            Argus does the rest.
          </p>
          <div className="rise rise-3 mt-9 flex items-center justify-center gap-3">
            <Link href="/dashboard">
              <Button className="h-10 px-5">Explore the live demo <ArrowRight size={15} /></Button>
            </Link>
            <Link href="/generate">
              <Button variant="outline" className="h-10 px-5">Generate tests from a PRD</Button>
            </Link>
          </div>

          {/* Proof strip — mono, data-first */}
          <div className="rise rise-3 mx-auto mt-16 grid max-w-3xl grid-cols-2 gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-4">
            {[
              ["428", "tests maintained"],
              ["87.4%", "coverage"],
              ["6h", "saved per story"],
              ["24/7", "always on"],
            ].map(([n, l]) => (
              <div key={l} className="bg-surface px-4 py-5">
                <p className="font-mono text-2xl tabular-nums tracking-tight">{n}</p>
                <MetricLabel className="mt-1">{l}</MetricLabel>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pillars */}
      <section className="mx-auto max-w-6xl px-6 pb-24">
        <div className="grid gap-4 md:grid-cols-3">
          {pillars.map(({ icon: Icon, title, body }) => (
            <div key={title} className="card card-hover p-6">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent-soft text-accent">
                <Icon size={17} />
              </span>
              <h3 className="mt-4 text-[15px] font-semibold tracking-tight">{title}</h3>
              <p className="mt-2 text-[13.5px] leading-relaxed text-muted">{body}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-line py-8 text-center">
        <MetricLabel>Argus · AI quality engineering · SOC 2-ready architecture</MetricLabel>
      </footer>
    </main>
  );
}
