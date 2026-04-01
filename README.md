# mcptest

[![npm version](https://img.shields.io/npm/v/mcptest)](https://www.npmjs.com/package/mcptest)
[![license](https://img.shields.io/npm/l/mcptest)](https://github.com/bhvbhushan/mcptest/blob/main/LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/node/v/mcptest)](https://nodejs.org/)
[![CI](https://github.com/bhvbhushan/mcptest/actions/workflows/ci.yml/badge.svg)](https://github.com/bhvbhushan/mcptest/actions/workflows/ci.yml)

Quality gate for MCP servers. Compliance, security, and efficiency testing in one command. Like `npm audit` for packages, but for [Model Context Protocol](https://modelcontextprotocol.io/) servers.

Run it against any MCP server and get a 0-100 score across four dimensions: protocol compliance, schema quality, efficiency, and security.

## Install

```bash
npm install -g mcptest
```

Requires Node.js >= 22.

## Quick Start

```bash
# Test any MCP server
mcptest validate "npx -y @modelcontextprotocol/server-filesystem /tmp"

# Test with environment variables
mcptest validate "npx -y @supabase/mcp-server-supabase@latest --read-only --project-ref REF" \
  --env "SUPABASE_ACCESS_TOKEN=your-token"

# JSON output for CI/CD
mcptest validate "./my-server" --reporter json --output report.json

# Fail CI if score is below threshold
mcptest validate "./my-server" --threshold 80

# Test HTTP/SSE servers
mcptest validate "http://localhost:3000/mcp" --transport http
```

## Benchmarks

Tested against official MCP reference servers (April 2026). These are real results, not synthetic:

| Server | Score | Compliance | Quality | Efficiency | Security | Key Findings |
|--------|:-----:|:----------:|:-------:|:----------:|:--------:|---|
| **Memory** | **98** | 40/40 | 23/25 | 15/15 | 20/20 | 50% params undocumented |
| **Sequential Thinking** | **98** | 40/40 | 23/25 | 15/15 | 20/20 | Verbose 500+ char description |
| **Everything** | **88** | 40/40 | 23/25 | 15/15 | 10/20 | `get-env` leaks env vars, duplicate schemas |
| **Filesystem** | **81** | 40/40 | 11/25 | 15/15 | 15/20 | 72% params undocumented, deprecated tool, duplicates |
| **Playwright** | **81** | 40/40 | 19/25 | 12/15 | 10/20 | Code execution tools, short descriptions, 21 tools |

Servers tested: `@modelcontextprotocol/server-memory`, `@modelcontextprotocol/server-sequential-thinking`, `@modelcontextprotocol/server-everything`, `@modelcontextprotocol/server-filesystem`, `@anthropic/mcp-server-playwright`.

### Example Output

```
mcptest v0.1.0
Server: npx -y @modelcontextprotocol/server-filesystem /tmp

  lifecycle
    PASS Server reports name and version (0ms)
    PASS Server reports capabilities (0ms)
    PASS Server responds to ping (1ms)

  tools
    PASS Server lists tools without error (5ms)
    PASS Tool definitions have required fields (6ms)
    PASS Tool names follow naming convention (8ms)
    PASS Tool inputSchema has type object (4ms)
    PASS Can call a listed tool (10ms)
    PASS Calling nonexistent tool returns error (1ms)
    PASS Tool descriptions are present (8ms)

  resources
    SKIP Server lists resources without error
    SKIP Resource definitions have required fields
    SKIP Resource descriptions are present
    SKIP Can read a listed resource

  prompts
    SKIP Server lists prompts without error
    SKIP Prompt definitions have required fields
    SKIP Can get a listed prompt

  efficiency
    14 tools, ~3057 schema tokens

  quality
    Param description coverage: 28%
    Deprecated: read_file
    Duplicates: read_file, read_text_file
    CRIT 18 of 25 parameters lack descriptions (72%)
    CRIT 1 deprecated tool(s) still listed: read_file
    WARN Tools with identical schemas: read_file, read_text_file

  security
    WARN "write_file" performs destructive operations — description warns of risk

Results: 10 passed, 7 skipped (45ms)
Score: 81/100
  compliance 40/40 | quality 11/25 | efficiency 15/15 | security 15/20
```

## What's Tested

### Compliance Tests (17 total)

| Category | ID | Test | Severity |
|----------|----|------|----------|
| Lifecycle | `lifecycle-init-01` | Server reports name and version | Critical |
| Lifecycle | `lifecycle-init-02` | Server reports capabilities | Critical |
| Lifecycle | `lifecycle-init-03` | Server responds to ping | High |
| Tools | `tools-list-01` | Server lists tools without error | Critical |
| Tools | `tools-list-02` | Tool definitions have required fields | Critical |
| Tools | `tools-list-03` | Tool names follow naming convention | Medium |
| Tools | `tools-list-04` | Tool inputSchema has type "object" | High |
| Tools | `tools-call-01` | Can call a listed tool | Critical |
| Tools | `tools-call-02` | Calling nonexistent tool returns error | High |
| Tools | `tools-call-03` | Tool descriptions are present | Medium |
| Resources | `resources-list-01` | Server lists resources without error | Critical |
| Resources | `resources-list-02` | Resource definitions have required fields | Critical |
| Resources | `resources-list-03` | Resource descriptions are present | Medium |
| Resources | `resources-read-01` | Can read a listed resource | Critical |
| Prompts | `prompts-list-01` | Server lists prompts without error | Critical |
| Prompts | `prompts-list-02` | Prompt definitions have required fields | Critical |
| Prompts | `prompts-get-01` | Can get a listed prompt | Critical |

### Quality Analysis

Checks how well your tool schemas help LLMs understand and use your tools.

| Check | Description |
|-------|-------------|
| Param description coverage | Percentage of parameters with descriptions |
| Description quality (short) | Tools with descriptions under 20 characters |
| Description quality (verbose) | Tools with descriptions over 500 characters |
| Deprecated tool detection | Tools whose descriptions mention "deprecated" or "obsolete" |
| Duplicate tool detection | Tools with identical input schemas |
| Required/default mismatch | Required parameters that also have default values |

### Security Analysis

Static analysis on tool definitions to detect common security risks.

| Check | Category | Description |
|-------|----------|-------------|
| Environment variable exposure | `env-exposure` | Tools whose name/description suggest leaking env vars or secrets |
| Code execution detection | `code-execution` | Tools that appear to execute arbitrary code or scripts |
| Dangerous default patterns | `dangerous-defaults` | Tools performing destructive operations without warnings |

### Efficiency Analysis

Catches tool proliferation and schema bloat, the top causes of poor LLM performance with MCP servers.

| Metric | Warning | Critical |
|--------|---------|----------|
| Tool count | > 20 | > 50 |
| Schema tokens (est.) | > 10,000 | > 30,000 |

Token estimation uses `chars/4` heuristic (~15% accuracy vs tiktoken for JSON schemas).

## Scoring

Composite 0-100 score across four dimensions:

| Dimension | Max Points | Description |
|-----------|-----------|-------------|
| Compliance | 40 | Protocol conformance: `(passed / total_run) * 40` |
| Quality | 25 | Schema quality; deduct 5 per critical finding, 2 per warning |
| Efficiency | 15 | Tool count and token budget; deduct 8 per critical, 3 per warning |
| Security | 20 | Dangerous patterns; deduct 10 per critical, 5 per warning |

A server with no issues across all four dimensions scores 100. Skipping a dimension with `--skip-*` flags means those points are not awarded. A server with `--skip-security` can score at most 80.

## CLI Options

| Flag | Description | Default |
|------|-------------|---------|
| `-t, --transport` | Transport type (`stdio` or `http`) | `stdio` |
| `-r, --reporter` | Output format (`console` or `json`) | `console` |
| `-o, --output` | Write report to file | |
| `--threshold` | Minimum passing score (0-100) | |
| `--timeout` | Test timeout in ms | `30000` |
| `--skip` | Comma-separated test IDs to skip | |
| `--only` | Comma-separated test IDs to run | |
| `-e, --env` | Environment variables as `KEY=VAL,KEY2=VAL2` | |
| `--max-tools` | Critical threshold for tool count | `50` |
| `--max-schema-tokens` | Critical threshold for schema tokens | `30000` |
| `--skip-efficiency` | Skip efficiency analysis | |
| `--skip-quality` | Skip quality analysis | |
| `--skip-security` | Skip security analysis | |

## Programmatic API

```typescript
import {
  createMCPClient,
  listAllTools,
  runTests,
  complianceTests,
  analyzeEfficiency,
  analyzeQuality,
  analyzeSecurity,
  ConsoleReporter,
} from "mcptest";

const client = await createMCPClient({
  command: "node",
  args: ["./my-server.js"],
  transport: "stdio",
});

const tools = await listAllTools(client);
const efficiency = analyzeEfficiency(tools);
const quality = analyzeQuality(tools);
const security = analyzeSecurity(tools);

const result = await runTests(
  complianceTests,
  { client, timeout: 10000 },
  undefined,
  "my-server",
  efficiency,
  quality,
  security,
);

console.log(new ConsoleReporter().format(result));
await client.close();
```

## Architecture

```
mcptest CLI (Commander)
+-- Test Runner Engine    -- discovers, filters, executes tests, scores results
+-- MCP Client Wrapper    -- connects via stdio or HTTP transport
+-- Compliance Tests      -- spec conformance (lifecycle, tools, resources, prompts)
+-- Reporters             -- console (colored) and JSON output
+-- Efficiency Analyzer   -- tool count, schema token estimation, threshold findings
+-- Quality Analyzer      -- param descriptions, description quality, deprecated/duplicate detection
+-- Security Analyzer     -- env exposure, code execution, dangerous default patterns
+-- Score                 -- 4-dimension weighted composite (40 + 25 + 15 + 20 = 100)
```

## Versioning

mcptest follows [Semantic Versioning](https://semver.org/):

- **0.x.y** ... pre-1.0, the API may change between minor versions
- **PATCH** (0.x.Y) ... bug fixes, new compliance tests, doc updates
- **MINOR** (0.X.0) ... new analyzer dimensions, new reporters, CLI flag additions
- **MAJOR** (X.0.0) ... breaking API changes, scoring formula changes, removed tests

Releases are automated: bump `version` in `package.json`, merge to `main`, and CI publishes to npm with provenance and creates a GitHub Release.

## Roadmap

- [x] **Phase 1**: Compliance tests (lifecycle, tools, resources, prompts), quality + security + efficiency analysis, 4-dimension scoring
- [ ] **Phase 2**: Transport compliance tests, capability refusal tests, `mcptest init` scaffolding
- [ ] **Phase 3**: npm publish, GitHub Action for CI integration, registry scanner
- [ ] **Phase 4**: Dynamic security testing, performance benchmarking, MCP server directory

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for development setup, code standards, and how to add tests.

## Security

See [SECURITY.md](SECURITY.md) for reporting vulnerabilities.

## Code of Conduct

See [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md).

## License

[MIT](LICENSE)
