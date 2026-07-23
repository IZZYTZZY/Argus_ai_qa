/** Seed data for demo mode (no backend configured). Modeled on a realistic
 *  e-commerce checkout product so client demos feel real. */

export const demoDashboard = {
  project: { name: "Meridian Commerce", readiness: 82.4 },
  test_cases: { total: 428, approved: 361, pending_review: 67 },
  coverage: {
    pct: 87.4,
    risk: 18.2,
    confidence: 91.0,
    modules: [
      { name: "Checkout", coverage: 94, risk: 22, tests: 86 },
      { name: "Payments", coverage: 91, risk: 34, tests: 74 },
      { name: "Cart", coverage: 89, risk: 12, tests: 52 },
      { name: "Auth & SSO", coverage: 85, risk: 28, tests: 47 },
      { name: "Search", coverage: 78, risk: 15, tests: 41 },
      { name: "Inventory Sync", coverage: 64, risk: 58, tests: 33 },
      { name: "Notifications", coverage: 71, risk: 19, tests: 28 },
      { name: "Admin Console", coverage: 58, risk: 41, tests: 39 },
      { name: "Promotions", coverage: 82, risk: 24, tests: 28 },
    ],
  },
  top_risks: [
    { module: "Inventory Sync", probability: 78, kind: "regression_hotspot" },
    { module: "Payments · 3DS flow", probability: 64, kind: "production_failure" },
    { module: "Admin Console", probability: 51, kind: "breaking_component" },
    { module: "Auth & SSO", probability: 43, kind: "regression_hotspot" },
  ],
  activity: [
    { action: "ai.tests_generated", detail: "24 tests for Promotions v2", at: "2h ago" },
    { action: "test_case.approved", detail: "TC-PAY-0141 approved by Sarah K.", at: "3h ago" },
    { action: "document.uploaded", detail: "Checkout PRD v3.2 indexed (41 chunks)", at: "5h ago" },
    { action: "ai.maintenance", detail: "6 tests updated after PR #482 merged", at: "yesterday" },
    { action: "ai.risk_assessed", detail: "Release 2.4 readiness recomputed", at: "yesterday" },
  ],
  trend: [
    { week: "W24", coverage: 71, risk: 34 },
    { week: "W25", coverage: 74, risk: 31 },
    { week: "W26", coverage: 79, risk: 27 },
    { week: "W27", coverage: 81, risk: 25 },
    { week: "W28", coverage: 84, risk: 21 },
    { week: "W29", coverage: 87.4, risk: 18.2 },
  ],
};

export const demoTests = [
  {
    id: "1", test_key: "TC-CHK-0042", title: "Guest checkout with expired promo code",
    category: "negative", priority: "P1", severity: "major", risk_level: "medium",
    status: "approved", automation_readiness: 92, generated_by: "ai",
    objective: "Verify an expired promotion is rejected with a clear, non-blocking message and totals remain correct.",
    preconditions: ["Promo SUMMER24 expired on 2026-06-30", "Cart contains 2 items totalling $84.00"],
    steps: [
      { step: 1, action: "Proceed to checkout as guest", expected: "Checkout loads with order summary $84.00" },
      { step: 2, action: "Enter promo code SUMMER24 and apply", expected: "Inline error: 'This code expired on Jun 30.' Total unchanged" },
      { step: 3, action: "Complete payment with valid card", expected: "Order confirmed at full price; no discount rows on invoice" },
    ],
    expected_result: "Expired code rejected gracefully; order completes at correct total.",
    traceability: ["REQ-PRM-014", "US-231"],
  },
  {
    id: "2", test_key: "TC-PAY-0141", title: "3DS challenge abandoned mid-flow",
    category: "edge", priority: "P0", severity: "critical", risk_level: "high",
    status: "approved", automation_readiness: 78, generated_by: "ai",
    objective: "Ensure an abandoned 3DS challenge releases inventory holds and leaves no orphaned payment intent.",
    preconditions: ["Card enrolled in 3DS2", "Inventory hold TTL configured at 15 min"],
    steps: [
      { step: 1, action: "Start payment with 3DS-enrolled card", expected: "Bank challenge iframe opens" },
      { step: 2, action: "Close the challenge window without completing", expected: "Checkout shows 'Payment not completed' with retry option" },
      { step: 3, action: "Wait 15 minutes; query inventory service", expected: "Hold released; stock count restored" },
      { step: 4, action: "Check PSP dashboard for the intent", expected: "Intent status = canceled, not requires_action" },
    ],
    expected_result: "No stuck holds or orphaned intents after 3DS abandonment.",
    traceability: ["REQ-PAY-031"],
  },
  {
    id: "3", test_key: "TC-AUTH-0007", title: "SSO session refresh across subdomains",
    category: "integration", priority: "P1", severity: "major", risk_level: "high",
    status: "in_review", automation_readiness: 85, generated_by: "ai",
    objective: "Verify silent token refresh keeps sessions valid across shop.* and account.* subdomains.",
    preconditions: ["Okta SSO enabled", "Access token TTL 15 min"],
    steps: [
      { step: 1, action: "Sign in via SSO on shop.meridian.com", expected: "Session established" },
      { step: 2, action: "Idle 16 minutes, then open account.meridian.com", expected: "Silent refresh; no re-login prompt" },
    ],
    expected_result: "Session continuity without re-authentication.",
    traceability: ["REQ-AUTH-009"],
  },
  {
    id: "4", test_key: "TC-CHK-0055", title: "Checkout order summary — VoiceOver reads totals in order",
    category: "accessibility", priority: "P2", severity: "minor", risk_level: "low",
    status: "approved", automation_readiness: 40, generated_by: "ai",
    objective: "Order summary is announced logically (items → discounts → tax → total) by screen readers.",
    preconditions: ["macOS VoiceOver enabled", "Cart has discount and tax lines"],
    steps: [
      { step: 1, action: "Navigate summary with VO-arrow keys", expected: "Rows announced in visual order with prices" },
      { step: 2, action: "Apply a promo code", expected: "aria-live region announces the new total" },
    ],
    expected_result: "WCAG 2.2 AA compliant announcement order.",
    traceability: ["REQ-A11Y-003"],
  },
  {
    id: "5", test_key: "TC-API-0210", title: "POST /orders rejects price tampering",
    category: "security", priority: "P0", severity: "critical", risk_level: "high",
    status: "approved", automation_readiness: 98, generated_by: "ai",
    objective: "Server recomputes totals; client-supplied prices are ignored.",
    preconditions: ["Valid session token", "Item SKU-8841 listed at $129.00"],
    steps: [
      { step: 1, action: "POST /orders with line_items[0].price = 0.01", expected: "201 with server-computed total $129.00, or 422 if strict mode" },
      { step: 2, action: "Inspect order record in DB", expected: "Stored price = catalog price" },
    ],
    expected_result: "Client price fields never trusted.",
    traceability: ["REQ-SEC-011", "OWASP-A04"],
  },
  {
    id: "6", test_key: "TC-INV-0033", title: "Inventory sync conflict — simultaneous purchase of last unit",
    category: "e2e", priority: "P0", severity: "critical", risk_level: "high",
    status: "draft", automation_readiness: 66, generated_by: "ai",
    objective: "Exactly one of two concurrent checkouts for the final unit succeeds; the other gets a clear out-of-stock path.",
    preconditions: ["SKU-2210 stock = 1", "Two authenticated sessions"],
    steps: [
      { step: 1, action: "Both sessions reach payment within 2s of each other", expected: "Both holds accepted or one queued (per design)" },
      { step: 2, action: "Both submit payment", expected: "One order confirmed; other receives out-of-stock with saved cart" },
      { step: 3, action: "Verify stock ledger", expected: "Stock = 0, single decrement, audit entry per attempt" },
    ],
    expected_result: "No oversell; deterministic single winner.",
    traceability: ["REQ-INV-004"],
  },
];

export const demoRisks = [
  {
    module: "Inventory Sync", probability: 78, kind: "regression_hotspot",
    reasoning: "14 of the last 30 inventory-related commits touched the reconciliation job; 5 production incidents in 90 days trace to hold-release timing. Test coverage sits at 64% with no concurrency tests until this week.",
    recommended_actions: ["Add concurrency suite around hold release", "Contract tests against warehouse API v2", "Canary the reconciliation job in release 2.4"],
  },
  {
    module: "Payments · 3DS flow", probability: 64, kind: "production_failure",
    reasoning: "PSP SDK upgraded 2.1 → 3.0 in PR #482; challenge-abandonment path changed and only 2 of 9 abandonment scenarios have tests. Historical bug BUG-1188 was in this exact path.",
    recommended_actions: ["Generate abandonment matrix tests (9 scenarios)", "Replay BUG-1188 reproduction as regression test"],
  },
  {
    module: "Admin Console", probability: 51, kind: "breaking_component",
    reasoning: "Coverage 58%, lowest of all modules. Refund workflow rewritten last sprint with zero new tests; permission checks moved from backend middleware to frontend guards.",
    recommended_actions: ["Security tests for permission bypass via direct API calls", "Refund happy-path + partial-refund suite"],
  },
];

export const demoChat: { role: "user" | "assistant"; content: string }[] = [
  { role: "user", content: "What should be tested before the 2.4 release?" },
  {
    role: "assistant",
    content:
      "Based on the knowledge graph for Meridian Commerce, three areas need attention before 2.4:\n\n1. Inventory Sync (78% regression risk) — the reconciliation job changed in 14 recent commits but concurrency paths are untested. I've drafted 8 tests including TC-INV-0033.\n\n2. 3DS abandonment (PR #482) — the PSP SDK upgrade altered the challenge flow. Only 2 of 9 abandonment scenarios are covered; BUG-1188 lives in this path.\n\n3. Admin refunds — rewritten with no new tests, and permission checks moved client-side. I recommend API-level permission-bypass tests before anything else.\n\nRelease readiness is currently 82.4%. Closing these three gaps would bring it above the 90% threshold your team set.",
  },
];

export const demoBugResult = {
  root_cause:
    "NullPointerException in InventoryHoldService.release() — the hold record is fetched by paymentIntentId, but abandoned 3DS flows cancel the intent before the webhook fires, so the lookup returns null and .getSkuId() dereferences it.",
  confidence: "high",
  reproduction_steps: [
    "Start checkout with a 3DS-enrolled card (stock hold created)",
    "Close the bank challenge without completing",
    "PSP cancels the payment intent within ~30s",
    "Webhook payment_intent.canceled arrives → release() called → NPE",
  ],
  possible_fixes: [
    { fix: "Look up holds by orderId instead of paymentIntentId (survives intent cancellation)", effort: "low" },
    { fix: "Null-guard with structured warning + retry queue for orphaned webhooks", effort: "low" },
    { fix: "Move hold lifecycle to a state machine keyed on order, not payment", effort: "high" },
  ],
  affected_modules: ["Inventory Sync", "Payments · webhooks"],
  recommended_tests: [
    { title: "3DS abandonment releases hold without error", category: "e2e", reason: "Directly covers this crash path" },
    { title: "Webhook for unknown intent is dead-lettered, not thrown", category: "negative", reason: "Guards the null branch" },
  ],
};
