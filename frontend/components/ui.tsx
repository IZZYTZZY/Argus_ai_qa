"use client";
import { cn } from "@/lib/utils";
import { forwardRef } from "react";

/* ---------- Button ---------- */
export const Button = forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: "primary" | "ghost" | "outline" | "danger";
    size?: "sm" | "md";
  }
>(({ className, variant = "primary", size = "md", ...props }, ref) => (
  <button
    ref={ref}
    className={cn(
      "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-150 disabled:opacity-40 disabled:pointer-events-none active:scale-[0.98]",
      size === "sm" ? "h-8 px-3 text-[13px]" : "h-9 px-4 text-sm",
      variant === "primary" && "bg-accent text-white hover:brightness-110 shadow-sm",
      variant === "outline" && "border border-line bg-surface hover:bg-raised text-ink",
      variant === "ghost" && "text-muted hover:text-ink hover:bg-raised",
      variant === "danger" && "bg-fail/10 text-fail hover:bg-fail/20",
      className
    )}
    {...props}
  />
));
Button.displayName = "Button";

/* ---------- Card ---------- */
export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("card p-5", className)} {...props} />;
}

/* ---------- Metric label (the Argus signature) ---------- */
export function MetricLabel({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("metric-label", className)} {...props} />;
}

/* ---------- Badge ---------- */
const badgeTones: Record<string, string> = {
  neutral: "bg-raised text-muted border-line",
  accent: "bg-accent-soft text-accent border-transparent",
  pass: "bg-pass/10 text-pass border-transparent",
  fail: "bg-fail/10 text-fail border-transparent",
  warn: "bg-warn/10 text-warn border-transparent",
  info: "bg-info/10 text-info border-transparent",
};

export function Badge({
  tone = "neutral",
  mono = false,
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { tone?: keyof typeof badgeTones; mono?: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-medium",
        mono && "font-mono uppercase tracking-wide",
        badgeTones[tone],
        className
      )}
      {...props}
    />
  );
}

export const priorityTone = (p: string) =>
  p === "P0" ? "fail" : p === "P1" ? "warn" : ("neutral" as const);
export const statusTone = (s: string) =>
  s === "approved" ? "pass" : s === "in_review" ? "info" : s === "archived" ? "neutral" : ("warn" as const);
export const riskTone = (r: string) =>
  r === "high" ? "fail" : r === "medium" ? "warn" : ("pass" as const);

/* ---------- Inputs ---------- */
export const Input = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "h-9 w-full rounded-lg border border-line bg-surface px-3 text-sm text-ink placeholder:text-muted/70 transition-colors focus:border-accent",
        className
      )}
      {...props}
    />
  )
);
Input.displayName = "Input";

export const Textarea = forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        "w-full rounded-lg border border-line bg-surface p-3 text-sm text-ink placeholder:text-muted/70 transition-colors focus:border-accent font-mono text-[13px] leading-relaxed",
        className
      )}
      {...props}
    />
  )
);
Textarea.displayName = "Textarea";

export function Select({ className, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        "h-9 rounded-lg border border-line bg-surface px-3 text-sm text-ink focus:border-accent",
        className
      )}
      {...props}
    />
  );
}

/* ---------- Progress bar ---------- */
export function Bar({ value, tone = "accent" }: { value: number; tone?: "accent" | "pass" | "warn" | "fail" }) {
  const color =
    tone === "pass" ? "bg-pass" : tone === "warn" ? "bg-warn" : tone === "fail" ? "bg-fail" : "bg-accent";
  return (
    <div className="h-1.5 w-full rounded-full bg-raised overflow-hidden">
      <div className={cn("h-full rounded-full transition-all duration-700", color)} style={{ width: `${Math.min(100, value)}%` }} />
    </div>
  );
}

/* ---------- Empty state ---------- */
export function Empty({ title, hint, action }: { title: string; hint: string; action?: React.ReactNode }) {
  return (
    <div className="card flex flex-col items-center justify-center gap-2 py-16 text-center">
      <p className="text-sm font-medium">{title}</p>
      <p className="max-w-sm text-[13px] text-muted">{hint}</p>
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}
