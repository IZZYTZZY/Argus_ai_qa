"use client";
import { Topbar } from "@/components/shell";
import { Card, MetricLabel, Badge, Button } from "@/components/ui";

const groups: { name: string; items: { name: string; desc: string; status: "connected" | "available" }[] }[] = [
  { name: "Source control", items: [
    { name: "GitHub", desc: "Sync repos, PRs and commit history for change detection.", status: "connected" },
    { name: "GitLab", desc: "Repositories, merge requests and pipelines.", status: "available" },
    { name: "Bitbucket", desc: "Repositories and pull requests.", status: "available" },
  ]},
  { name: "Planning", items: [
    { name: "Jira", desc: "Import stories and acceptance criteria; push generated tests back.", status: "connected" },
    { name: "Azure DevOps", desc: "Work items, test plans and pipelines.", status: "available" },
  ]},
  { name: "API & design", items: [
    { name: "Swagger / OpenAPI", desc: "Generate API tests directly from specs.", status: "connected" },
    { name: "Postman", desc: "Import collections; export generated suites.", status: "available" },
    { name: "Figma", desc: "Understand UI flows and states from designs.", status: "available" },
  ]},
  { name: "CI/CD & alerts", items: [
    { name: "GitHub Actions", desc: "Run generated automation on every PR.", status: "connected" },
    { name: "Jenkins", desc: "Trigger and report suites from Jenkins jobs.", status: "available" },
    { name: "Slack", desc: "Coverage drops, risk spikes and review requests in-channel.", status: "connected" },
    { name: "Microsoft Teams", desc: "The same alerts, for Teams-first orgs.", status: "available" },
  ]},
];

export default function Integrations() {
  return (
    <>
      <Topbar title="Integrations" subtitle="Argus plugs into the tools your team already uses" />
      <main className="space-y-6 p-6">
        {groups.map(g => (
          <section key={g.name}>
            <MetricLabel className="mb-2">{g.name}</MetricLabel>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {g.items.map(i => (
                <Card key={i.name} className="card-hover flex flex-col">
                  <div className="flex items-center justify-between">
                    <p className="text-[14px] font-semibold tracking-tight">{i.name}</p>
                    <Badge tone={i.status === "connected" ? "pass" : "neutral"} mono>{i.status}</Badge>
                  </div>
                  <p className="mt-1.5 flex-1 text-[12.5px] leading-relaxed text-muted">{i.desc}</p>
                  <div className="mt-3">
                    <Button size="sm" variant={i.status === "connected" ? "outline" : "primary"}>
                      {i.status === "connected" ? "Configure" : "Connect"}
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </section>
        ))}
      </main>
    </>
  );
}
