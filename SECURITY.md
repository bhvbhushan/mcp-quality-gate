# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability in mcptest, please report it responsibly.

**Do NOT open a public issue.** Use one of these methods:

1. **GitHub private vulnerability reporting** ... [Report a vulnerability](https://github.com/bhvbhushan/mcptest/security/advisories/new)
2. **Email** ... bhvbhushan@gmail.com with subject "mcptest Security"

## What to Expect

- **Acknowledgment** within 48 hours
- **Assessment** within 7 days
- **Fix target** within 14 days for critical issues
- **Credit** in release notes (unless you prefer anonymity)

## Supported Versions

| Version | Supported |
|---------|-----------|
| Latest (0.x) | Yes |

## Scope

This policy covers:
- The `mcptest` npm package
- The mcptest GitHub repository
- MCP client connection handling (stdio and HTTP transports)
- Test execution and scoring logic
- CLI input parsing and environment variable handling
- Security analyzer pattern matching (false positives/negatives)

## Out of Scope

- Bugs in the MCP servers being tested (report to server maintainers)
- Bugs in `@modelcontextprotocol/sdk` (report to [Anthropic](https://github.com/modelcontextprotocol/typescript-sdk/issues))
- Feature requests (use [Issues](https://github.com/bhvbhushan/mcptest/issues))
- Cosmetic issues

## Security Model

mcptest is a **testing tool** that connects to MCP servers:
- It spawns server processes via stdio or connects to HTTP endpoints you specify
- No data is stored persistently (reports go to stdout or a file you specify)
- No network calls except to MCP servers you explicitly point it at
- No authentication or credential storage
- CLI environment variables (`--env`) are passed directly to the child server process
