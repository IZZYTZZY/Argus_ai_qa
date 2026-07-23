"use client";
import { Topbar } from "@/components/shell";
import { Card, MetricLabel, Badge, Button, Input, Select } from "@/components/ui";

const roles = [
  { user: "Izhaan (you)", email: "izhaan@meridian.com", role: "Owner" },
  { user: "Sarah Kim", email: "sarah@meridian.com", role: "Admin" },
  { user: "Dev Patel", email: "dev@meridian.com", role: "Member" },
  { user: "QA Guild", email: "qa-guild@meridian.com", role: "Viewer" },
];

export default function Settings() {
  return (
    <>
      <Topbar title="Settings" subtitle="Workspace · Meridian Commerce" />
      <main className="mx-auto max-w-3xl space-y-4 p-6">
        <Card>
          <MetricLabel>Organization</MetricLabel>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <div><p className="mb-1 text-[12.5px] text-muted">Name</p><Input defaultValue="Meridian Commerce" /></div>
            <div><p className="mb-1 text-[12.5px] text-muted">Plan</p>
              <div className="flex h-9 items-center"><Badge tone="accent" mono>enterprise</Badge></div></div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <MetricLabel>Members & roles</MetricLabel>
            <Button size="sm" variant="outline">Invite member</Button>
          </div>
          <ul className="mt-3 divide-y divide-line">
            {roles.map(r => (
              <li key={r.email} className="flex items-center justify-between py-2.5">
                <div>
                  <p className="text-[13px] font-medium">{r.user}</p>
                  <p className="text-[12px] text-muted">{r.email}</p>
                </div>
                <Select defaultValue={r.role}>
                  {["Owner","Admin","Member","Viewer"].map(x => <option key={x}>{x}</option>)}
                </Select>
              </li>
            ))}
          </ul>
        </Card>

        <Card>
          <MetricLabel>AI behavior</MetricLabel>
          <div className="mt-3 space-y-3 text-[13px]">
            {[
              ["Auto-maintenance", "Update affected tests automatically when connected repos change", true],
              ["Review gate", "AI-generated tests require human approval before entering the suite", true],
              ["Risk alerts", "Notify Slack when any module's failure probability exceeds 60%", true],
              ["Weekly digest", "Coverage and risk trends every Monday 09:00", false],
            ].map(([label, desc, on]) => (
              <label key={label as string} className="flex cursor-pointer items-start justify-between gap-4">
                <span>
                  <span className="font-medium">{label}</span>
                  <span className="block text-[12.5px] text-muted">{desc}</span>
                </span>
                <input type="checkbox" defaultChecked={on as boolean} className="mt-1 h-4 w-4 accent-[var(--accent)]" />
              </label>
            ))}
          </div>
        </Card>

        <Card>
          <MetricLabel>Audit log</MetricLabel>
          <p className="mt-1 text-[12.5px] text-muted">
            Every action — human or AI — is recorded with actor, entity and timestamp.
            Export available for compliance reviews.
          </p>
          <div className="mt-3"><Button size="sm" variant="outline">Export audit log (CSV)</Button></div>
        </Card>
      </main>
    </>
  );
}
