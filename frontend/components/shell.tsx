"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, FileCheck2, Sparkles, PieChart, TriangleAlert,
  Bug, MessageSquare, Plug, Settings, Eye, Search,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "./theme";
import { Badge } from "./ui";
import { DEMO } from "@/lib/api";

const nav = [
  { group: "Overview", items: [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  ]},
  { group: "Testing", items: [
    { href: "/test-cases", label: "Test cases", icon: FileCheck2 },
    { href: "/generate", label: "Generate", icon: Sparkles },
    { href: "/coverage", label: "Coverage", icon: PieChart },
  ]},
  { group: "Intelligence", items: [
    { href: "/risk", label: "Risk & predictions", icon: TriangleAlert },
    { href: "/bugs", label: "Bug investigation", icon: Bug },
    { href: "/chat", label: "Ask Argus", icon: MessageSquare },
  ]},
  { group: "Workspace", items: [
    { href: "/integrations", label: "Integrations", icon: Plug },
    { href: "/settings", label: "Settings", icon: Settings },
  ]},
];

export function Sidebar() {
  const path = usePathname();
  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-[232px] flex-col border-r border-line bg-surface md:flex">
      <Link href="/dashboard" className="flex items-center gap-2.5 px-5 pb-5 pt-6">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent text-white">
          <Eye size={15} strokeWidth={2.4} />
        </span>
        <span className="text-[15px] font-semibold tracking-tight">Argus</span>
        {DEMO && <Badge tone="accent" mono>demo</Badge>}
      </Link>

      <nav className="flex-1 space-y-5 overflow-y-auto px-3 pb-4">
        {nav.map((g) => (
          <div key={g.group}>
            <p className="metric-label px-2 pb-1.5">{g.group}</p>
            {g.items.map(({ href, label, icon: Icon }) => {
              const active = path.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "mb-0.5 flex items-center gap-2.5 rounded-lg px-2.5 py-[7px] text-[13px] font-medium transition-colors",
                    active ? "bg-accent-soft text-accent" : "text-muted hover:bg-raised hover:text-ink"
                  )}
                >
                  <Icon size={15} strokeWidth={active ? 2.2 : 1.8} />
                  {label}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="border-t border-line px-5 py-4">
        <p className="text-[13px] font-medium">Meridian Commerce</p>
        <p className="metric-label mt-0.5">Release 2.4 · 428 tests</p>
      </div>
    </aside>
  );
}

export function Topbar({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-line bg-bg/80 px-6 backdrop-blur-md">
      <div>
        <h1 className="text-[15px] font-semibold tracking-tight">{title}</h1>
        {subtitle && <p className="text-[12px] text-muted">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-2">
        <div className="relative hidden lg:block">
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted" />
          <input
            placeholder="Search tests, docs, modules…"
            className="h-8 w-64 rounded-lg border border-line bg-surface pl-8 pr-3 text-[13px] placeholder:text-muted/70 focus:border-accent"
          />
        </div>
        <ThemeToggle />
        <span className="ml-1 flex h-8 w-8 items-center justify-center rounded-full bg-accent-soft font-mono text-[11px] font-semibold text-accent">
          IZ
        </span>
      </div>
    </header>
  );
}
