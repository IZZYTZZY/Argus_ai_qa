"use client";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export function TrendChart({ data }: { data: { week: string; coverage: number; risk: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -18 }}>
        <defs>
          <linearGradient id="cov" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--accent)" stopOpacity={0.25} />
            <stop offset="100%" stopColor="var(--accent)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke="var(--line)" strokeDasharray="0" vertical={false} />
        <XAxis dataKey="week" stroke="var(--muted)" fontSize={11} tickLine={false} axisLine={false}
          fontFamily="var(--font-mono)" />
        <YAxis stroke="var(--muted)" fontSize={11} tickLine={false} axisLine={false} unit="%"
          fontFamily="var(--font-mono)" />
        <Tooltip
          contentStyle={{
            background: "var(--raised)", border: "1px solid var(--line)", borderRadius: 10,
            fontSize: 12, color: "var(--ink)",
          }}
        />
        <Area type="monotone" dataKey="coverage" stroke="var(--accent)" strokeWidth={2} fill="url(#cov)" name="Coverage %" />
        <Area type="monotone" dataKey="risk" stroke="var(--warn)" strokeWidth={2} fill="transparent" name="Risk %" />
      </AreaChart>
    </ResponsiveContainer>
  );
}
