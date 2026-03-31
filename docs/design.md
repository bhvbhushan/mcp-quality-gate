# Project B: MCP Quality Framework — Design & Implementation Plan

**Date:** 2026-03-31
**Status:** Research Complete / Ready for Implementation Planning

---

## Overview

The quality gate for the MCP ecosystem. Like npm audit for packages, but for MCP servers. One command tells you if a server is spec-compliant, secure, and performant before you deploy it. "pytest for MCP servers."

## Problem Statement

- 34K+ dependent TypeScript projects, 8M+ server downloads, 5,800+ MCP servers
- 66% of 1,808 scanned MCP servers had security findings (AgentSeal)
- 43% had command injection vulnerabilities
- Official 2026 roadmap admits gaps in auth, observability, gateways, multi-tenancy
- No unified testing/quality framework exists — ecosystem fragmented across 10+ partial tools
- Real-world attacks documented: WhatsApp exfiltration, GitHub data heist, tool poisoning

## Gap Addressed

- **Gap 3:** MCP Testing & Quality Framework

---

## Competitive Analysis

| Tool | Compliance | Security | Performance | CI Integration | Unified |
|------|:-:|:-:|:-:|:-:|:-:|
| MCP Inspector (official) | Manual debug | No | No | No | No |
| mcp-validator (Janix-ai) | 20 tests | No | No | Partial | No |
| mcp-testing-framework (haakco) | Yes | No | Basic | Yes | No |
| mcp-testing-kit (ThoughtSpot) | Unit helpers | No | No | No | No |
| AgentSeal | No | Yes (static) | No | No | No |
| mcp-scan (Stytch) | No | Change detect | No | No | No |
| Glama | Scoring | Partial | No | No | Proprietary |
| **Our Tool** | **44 tests** | **Static+Dynamic** | **9 benchmarks** | **Yes** | **Yes** |

### Key Details

**MCP Inspector:** Official Anthropic debugging tool. React UI + Node.js proxy. Interactive-only, no automation. Had a critical RCE (CVE-2025-49596).

**AgentSeal:** Scanned 1,808 servers. Results: 43% command injection, 20% tooling infrastructure issues, 13% auth bypasses, 10% path traversal. Security-only, no compliance or performance.

**mcp-validator (Janix-ai):** Python-based. Only 20 tests for spec 2025-06-18 (outdated). No security checks.

---

## MCP Protocol Spec Summary

**Protocol:** JSON-RPC 2.0 over stateful connections. Spec version 2025-11-25.

**Roles:** Hosts (LLM apps) → Clients (connectors) → Servers (capability providers)

**Lifecycle:** Initialize → Operate → Shutdown

**Transports:** stdio (local, most common), Streamable HTTP (remote, standard), SSE (deprecated)

**Capabilities negotiated:** Tools, Resources, Prompts, Logging, Completions, Sampling, Elicitation, Tasks

**Error codes:** Standard JSON-RPC (-32700 to -32099) + tool execution errors (`isError: true`)

---

## Security Research

### Documented Attack Vectors

1. **Tool Poisoning:** Malicious instructions in tool descriptions (invisible to users, visible to AI). Hidden `<IMPORTANT>` tags, file exfiltration directives.
2. **Prompt Injection via Tools:** Tool responses containing hidden instructions for the AI.
3. **Cross-Server Exfiltration:** Malicious server reads data from other MCP servers sharing context.
4. **Tool Shadowing:** Malicious server impersonates tools from another server.
5. **Supply Chain Attacks:** Malicious npm/pip packages execute during server startup.
6. **Over-Permissive Tools:** Excessive filesystem/network/shell access.

### Real-World Incidents

- Supabase Cursor Agent: Privileged agent processed user SQL, leaked tokens
- GitHub MCP Data Heist (Invariant Labs): Malicious issues hijacked agents for private repo access
- WhatsApp MCP Exfiltration (Invariant Labs): Malicious server chained with whatsapp-mcp to steal messages

### OWASP Top 10 for Agentic Applications (2026)

ASI01-ASI10: Agent Goal Hijack, Rogue Agents, Tool Misuse, Data Leakage, Supply Chain Compromise, Human-Agent Trust Exploitation, Cascading Hallucination, Identity & Access Abuse, Accountability Gap, Unsafe Output Handling.

---

## Architecture

```
mcptest CLI
├── Test Runner Engine
│   ├── Test discovery & execution
│   ├── Fixture system (MockMCPClient, transports)
│   ├── Multiple reporters (console, JSON, HTML)
│   └── Plugin loader
├── Spec Compliance Module (~44 tests)
│   ├── Lifecycle (8): init, version negotiation, shutdown
│   ├── Tools (12): list, call, schema validation, errors
│   ├── Resources (8): list, read, subscribe, templates
│   ├── Prompts (5): list, get, arguments
│   ├── Transport (4): stdio, HTTP, sessions
│   └── Protocol (7): JSON-RPC, error codes, ping
├── Security Scanner (~20 checks)
│   ├── Static (7): tool descriptions, schemas, capabilities
│   └── Dynamic (10): injection, traversal, exfiltration
├── Performance Benchmarks (9)
│   └── Latency, throughput, concurrency, memory, connections
├── Plugin System
│   └── Custom checks via mcptest-plugin-* packages
└── Report Generator
    └── JSON, HTML, badges, OWASP mapping
```

### Tech Stack

| Component | Choice | Rationale |
|-----------|--------|-----------|
| Runtime | Node.js 22+ | Native MCP SDK compatibility |
| Language | TypeScript 5.x (strict) | Type safety, SDK alignment |
| MCP Client | @modelcontextprotocol/client | Official SDK |
| Validation | Zod | Already required by MCP SDK |
| CLI | citty or commander | Standard |
| Build | tsup | Fast |
| Testing | Vitest | Internal tests |
| Monorepo | pnpm | @mcptest/core, /compliance, /security, /performance |

### Test Definition Format

```typescript
interface MCPTest {
  id: string;
  name: string;
  category: 'lifecycle' | 'tools' | 'resources' | 'prompts' | 'transport' | 'protocol';
  severity: 'critical' | 'high' | 'medium' | 'low';
  tags: string[];
  spec_ref?: string;      // Link to spec section
  owasp_ref?: string;     // OWASP ASI reference
  setup?(ctx: TestContext): Promise<void>;
  run(ctx: TestContext): Promise<TestResult>;
  teardown?(ctx: TestContext): Promise<void>;
}
```

### CLI Design

```bash
mcptest validate ./my-server           # Spec compliance
mcptest scan ./my-server               # Security scan
mcptest bench ./my-server              # Performance
mcptest ./my-server                    # Full suite
mcptest ./my-server --reporter json,html --output ./reports/
mcptest ./my-server --badge ./badges/  # Generate quality badges
```

### Configuration

```typescript
// mcptest.config.ts
export default {
  server: { command: 'node', args: ['./dist/index.js'], transport: 'stdio' },
  compliance: { skip: ['transport-http-*'] },
  security: { mode: 'both', customChecks: ['./checks/'] },
  performance: { thresholds: { p95_latency_ms: 200, min_throughput_rps: 100 } },
  reporters: ['console', 'json', 'html'],
  plugins: ['mcptest-plugin-custom']
}
```

---

## Implementation Plan

### Phase 1: Spec Compliance Test Suite (Weeks 1-3)

**Week 1:** Foundation
- Project scaffolding (monorepo: core, cli, compliance, security, performance)
- MCP client wrapper with transport abstraction
- Test runner engine (discovery, execution, reporting)
- Basic CLI with console reporter

**Week 2:** Core compliance tests
- Lifecycle tests (8): init handshake, version negotiation, capability negotiation, pre-init restrictions, shutdown, timeouts
- Tools tests (12): list, pagination, call valid/invalid, schema validation, structured content, error reporting, notifications, name validation
- JSON-RPC tests (7): format validation, error codes, request ID, unknown methods, progress, cancellation, ping

**Week 3:** Extended tests + polish
- Resources tests (8): list, pagination, read, subscribe, templates, binary content
- Prompts tests (5): list, get, arguments, notifications
- Transport tests (4): stdio basic, HTTP basic, protocol version header, session management
- JSON + HTML report generation
- Config file support
- npm publishing + GitHub Action
- Test against 5+ real MCP servers for validation

### Phase 2: Security Scanner (Weeks 4-6)

**Week 4:** Static analysis
- Tool description pattern scanner (hidden instructions, `<IMPORTANT>` tags)
- Schema analysis (over-permissive input schemas)
- Capability risk assessment (dangerous tool combinations)

**Week 5:** Dynamic probing
- Path traversal resistance testing
- Command injection probing
- SQL injection testing
- Auth enforcement verification
- Rate limiting checks
- Large payload handling
- Error information leak detection
- Prompt injection via tool arguments
- Data exfiltration via responses
- Resource boundary enforcement

**Week 6:** Reporting
- OWASP ASI mapping for all findings
- CVSS-style severity scoring
- Remediation recommendations
- Security report generation

### Phase 3: Performance Benchmarks (Weeks 7-9)

**9 benchmarks:**
1. Init handshake latency
2. tools/list latency
3. tools/call latency
4. resources/read latency
5. Concurrent tool calls
6. Connection churn (open/close cycles)
7. Large response handling
8. Sustained load (5 min)
9. Memory leak detection (RSS monitoring)

Statistical analysis: min, max, mean, median, p95, p99, stddev.
Threshold configuration for CI pass/fail gates.
Regression detection between runs.

### Phase 4: Ecosystem Integration (Weeks 10-12)

- Plugin system (custom checks, benchmarks, reporters)
- Badge generation ("MCP Compliant", "MCP Secure", "MCP Verified")
- MCP Registry integration
- Docker image for CI environments
- Documentation site
- Example integrations with 10+ popular MCP servers

---

## Badge System (Adoption Driver)

- **"MCP Compliant"** — passes spec compliance suite (green badge)
- **"MCP Secure"** — no high/critical security findings (blue badge)
- **"MCP Verified"** — passes ALL thresholds (gold badge)

Badges link to public reports. Shields.io compatible. Integration with MCP Registry for discoverability.

---

## Risks & Mitigations

| Risk | Mitigation |
|------|-----------|
| Spec changes frequently | Pin to spec version, automate spec-to-test generation |
| Dynamic security tests could harm servers | Explicit opt-in, sandboxed testing, documentation |
| MCP SDK v2 breaking changes | Abstract MCP client behind interface, support both |
| Low adoption | Partner with MCP Registry maintainers, badge system day 1 |

---

## Sources

- [MCP Specification 2025-11-25](https://modelcontextprotocol.io/specification/2025-11-25)
- [MCP TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk)
- [2026 MCP Roadmap](http://blog.modelcontextprotocol.io/posts/2026-mcp-roadmap/)
- [MCP Registry](https://registry.modelcontextprotocol.io/)
- [AgentSeal Security Findings](https://agentseal.org/blog/mcp-server-security-findings)
- [OWASP Top 10 Agentic Applications 2026](https://genai.owasp.org/resource/owasp-top-10-for-agentic-applications-for-2026/)
- [Tool Poisoning Attacks (Invariant Labs)](https://invariantlabs.ai/blog/mcp-security-notification-tool-poisoning-attacks)
- [MCP Prompt Injection (Simon Willison)](https://simonwillison.net/2025/Apr/9/mcp-prompt-injection/)
- [MCP Horror Stories (Docker Blog)](https://www.docker.com/blog/mcp-horror-stories-github-prompt-injection/)
- [Janix-ai MCP Validator](https://github.com/Janix-ai/mcp-validator)
- [haakco MCP Testing Framework](https://github.com/haakco/mcp-testing-framework)
- [MCP Inspector](https://github.com/modelcontextprotocol/inspector)
- [Spectral API Linter](https://github.com/stoplightio/spectral)
