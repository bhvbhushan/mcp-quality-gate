# TODOS

## Phase 1 — Compliance

### Capability Refusal Compliance Test
**What:** Test that servers correctly REFUSE operations when the client didn't negotiate that capability during initialize. E.g., if client doesn't declare sampling support, server must not send sampling/createMessage.
**Why:** Security-critical spec requirement (Section 5.1: "client and server MUST NOT use capabilities that were not successfully negotiated"). Identified by outside voice as missing from the 44-test suite. Servers that ignore capability negotiation can escalate privileges.
**Effort:** Requires a separate test group with a deliberately restricted client initialization.
**Depends on:** Test runner with group-based isolation.

## Phase 2 — Security + Registry

### Public Registry Scanner
**What:** A mode/service that batch-scans all servers in the MCP Registry and publishes results publicly. Not just a CLI flag but a separate execution pipeline for registry-wide scanning.
**Why:** Enterprise consumers and AI hosts need quality signals without server author cooperation. 100x adoption impact vs CLI-only. Creates network effect (consumers demand quality, authors improve). Snyk acquired Invariant Labs for exactly this reason.
**Open questions:** Infrastructure cost for 5,800+ server scans. Legal/ethical questions around scanning without author consent. Results database hosting. Public results page design.
**Depends on:** Phase 1 compliance tests working reliably, Phase 2 security scanner.

### Sandboxed Testing Specification
**What:** Concrete specification for how dynamic security probes are isolated from production side effects. Define what happens when canary strings get written to databases, when path traversal reads real files, when injection payloads trigger server-side alerts.
**Why:** "Sandboxed testing" was undefined in the original plan. Canary-based detection is non-destructive in intent, but servers process inputs with real side effects. If mcptest damages a server during a scan, the project's reputation is destroyed.
**Options to evaluate:** Docker-based isolation, documentation-only (warn users), read-only probe mode (only test responses, never trigger writes), explicit server-side cleanup instructions.
**Depends on:** Phase 2 security scanner design.

## Post-Adoption — Revisit Triggers

### Open-Core Monetization Model
**What:** Document the business model: free CLI tool + paid platform (registry scanning API, continuous monitoring, team dashboards, badge hosting, enterprise compliance reports).
**Why:** $40M+ funded into MCP security startups. Snyk model (free scanner → paid platform) is proven. Developers don't pay for testing tools but enterprises pay for compliance infrastructure. Architecture decisions now (stable JSON schema, API-ready output format) enable monetization later without a rewrite.
**Revisit trigger:** 1,000 weekly active users.
**Priority:** P3
**Depends on:** Phase 1 shipped and adoption measured.

### OWASP ASI Mapping for All Tests
**What:** Tag every compliance and security test with its corresponding OWASP ASI code (ASI01-ASI10). Add `owasp_ref` field to defineTest metadata.
**Why:** Enterprise buyers evaluate tools by standards alignment. "OWASP ASI08 violation" is more actionable than "test lifecycle-init-03 failed." Maps directly to the OWASP Top 10 for Agentic Applications (2026).
**Revisit trigger:** Phase 2 security scanner ships.
**Priority:** P2
**Depends on:** Phase 2 security scanner (security tests have the strongest OWASP mapping).
