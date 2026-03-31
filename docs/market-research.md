# MCPTest Market Research — MCP Ecosystem Quality Gap Analysis

**Date:** 2026-03-31
**Source:** Deep research across parallel agents + targeted web searches

---

## MCP Ecosystem Scale

| Metric | Value | Source |
|--------|-------|--------|
| MCP servers total | 11,000+ | MCP Registry |
| Server downloads | 8M+ | MCP Registry |
| TypeScript SDK dependents | 34,700+ projects | npm |
| Month-over-month growth | 85% | MCP Registry |
| Adopted by | Claude, OpenAI, Gemini, Cursor, Copilot | Official announcements |

## The Security Problem (Quantified)

**AgentSeal scanned 1,808 MCP servers:**
- **66% had security findings**
- 43% command injection vulnerabilities
- 20% tooling infrastructure issues
- 13% auth bypasses
- 10% path traversal

**Real-World Attacks:**
1. **WhatsApp MCP Exfiltration** (Invariant Labs) — Malicious server chained with whatsapp-mcp to steal entire message history
2. **GitHub MCP Data Heist** (Invariant Labs) — Malicious GitHub issues hijacked AI agents to access private repos
3. **Supabase Cursor Agent** — Privileged agent processed user SQL from support tickets, leaked tokens
4. **MCP Inspector RCE** (CVE-2025-49596) — Critical vulnerability in official debugging tool

Sources:
- [AgentSeal findings](https://agentseal.org/blog/mcp-server-security-findings)
- [Tool Poisoning (Invariant Labs)](https://invariantlabs.ai/blog/mcp-security-notification-tool-poisoning-attacks)
- [MCP Horror Stories (Docker)](https://www.docker.com/blog/mcp-horror-stories-github-prompt-injection/)
- [MCP Prompt Injection (Simon Willison)](https://simonwillison.net/2025/Apr/9/mcp-prompt-injection/)

## OWASP Top 10 for Agentic Applications (2026)

| Code | Name | MCP Relevance |
|------|------|---------------|
| ASI01 | Agent Goal Hijack | Tool poisoning redirects agent goals |
| ASI02 | Rogue Agents | Compromised MCP servers act as rogue agents |
| ASI03 | Tool Misuse | Over-permissive tool schemas |
| ASI04 | Data Leakage | Cross-server data exfiltration |
| ASI05 | Supply Chain Compromise | Malicious MCP server packages |
| ASI06 | Human-Agent Trust Exploitation | Hidden instructions in tool descriptions |
| ASI07 | Cascading Hallucination | Hallucinated tool responses |
| ASI08 | Identity & Access Abuse | Missing auth in MCP servers |
| ASI09 | Accountability Gap | No audit trail for tool calls |
| ASI10 | Unsafe Output Handling | Unvalidated tool response rendering |

Source: [OWASP Agentic AI 2026](https://genai.owasp.org/resource/owasp-top-10-for-agentic-applications-for-2026/)

## 2026 MCP Roadmap — Official Gaps Acknowledged

The official roadmap openly admits these gaps:
1. **HTTP Transport:** Stateful sessions conflict with load balancers
2. **Tasks Primitive:** Retry semantics, expiry policies missing
3. **Enterprise Readiness:** Audit trails, SSO auth, gateway behavior undefined
4. **Server Discovery:** No standard way to learn what a server does without connecting
5. **Multi-tenancy:** NOT addressed in roadmap

Sources:
- [2026 MCP Roadmap](http://blog.modelcontextprotocol.io/posts/2026-mcp-roadmap/)
- [MCP production growing pains](https://thenewstack.io/model-context-protocol-roadmap-2026/)
- [MCP enterprise readiness](https://workos.com/blog/2026-mcp-roadmap-enterprise-readiness)

## Existing Tools (Detailed)

### Official: MCP Inspector
- React UI + Node.js proxy
- Manual/interactive debugging only
- No automation, no CI integration
- Had critical RCE (CVE-2025-49596)
- [GitHub](https://github.com/modelcontextprotocol/inspector)

### Janix-ai/mcp-validator
- Python-based compliance tests
- HTTP: 7/7, OAuth: 6/6, Protocol: 7/7 tests
- Targets spec 2025-06-18 (outdated)
- No security checks
- [GitHub](https://github.com/Janix-ai/mcp-validator)

### haakco/mcp-testing-framework
- npm package with automated test generation
- Mocking, coverage analysis, basic performance
- Most comprehensive existing framework
- No security scanning
- [GitHub](https://github.com/haakco/mcp-testing-framework)

### ThoughtSpot/mcp-testing-kit
- Lightweight unit testing utilities
- Dummy transport for direct server testing
- Minimal scope
- [GitHub](https://github.com/thoughtspot/mcp-testing-kit)

### AgentSeal
- Security scanning (1,808 servers scanned)
- 66% had findings
- Security-only, no compliance or performance
- [GitHub](https://github.com/AgentSeal/agentseal)

### mcp-scan (Stytch)
- Hash-pinning for tool definition change detection
- Very narrow scope
- No compliance, no security beyond change detection

### Glama (glama.ai)
- Automated quality scoring with badges
- Security/license/quality scoring
- Proprietary, not self-hostable

### MCPHammer (Praetorian)
- Security testing focused
- From Praetorian security firm
- [GitHub](https://github.com/praetorian-inc/MCPHammer)

## MCP Protocol Quick Reference

**Spec version:** 2025-11-25
**Protocol:** JSON-RPC 2.0 over stateful connections
**Roles:** Host → Client → Server

**Transports:**
- stdio (local, most common — client spawns server as child process)
- Streamable HTTP (remote, standard — single endpoint, supports stateless)
- SSE (deprecated)

**Client→Server methods:** initialize, tools/list, tools/call, resources/list, resources/read, resources/subscribe, prompts/list, prompts/get, completion/complete, logging/setLevel, ping

**Server→Client methods:** sampling/createMessage, elicitation/create, roots/list

**Error codes:** -32700 (parse), -32600 (invalid request), -32601 (method not found), -32602 (invalid params), -32603 (internal), -32800 (cancelled), -32801 (content too large)

## Analogous Framework Patterns (Architecture Lessons)

| Framework | Lesson for MCPTest |
|-----------|-------------------|
| Postman/Newman | Collection-based test suites, data-driven tests, multiple reporters |
| OpenAPI Validator | Multi-level validation (syntax → schema → semantic → best practices) |
| Spectral (API linter) | Composable YAML/JS rule engine with custom rulesets |
| k6 (load testing) | Code-as-test, distinct phases, TypeScript scripting |
| OWASP ZAP | Passive scanning + active scanning, plugin marketplace |
| GraphQL-ESLint | AST-based, schema-aware and schema-less modes |

## Funding Landscape

**MCP ecosystem tooling funding: $0 meaningful.**

No funded startup focused on MCP quality/testing despite:
- 34K+ dependent projects
- 8M+ downloads
- 85% month-over-month growth
- Adopted by every major AI lab

This is a classic picks-and-shovels opportunity during a gold rush.
