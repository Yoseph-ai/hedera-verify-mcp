# Hedera Verify MCP Server

[![npm version](https://img.shields.io/npm/v/@yoseph-ai/hedera-verify-mcp.svg)](https://www.npmjs.com/package/@yoseph-ai/hedera-verify-mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![MCP Compatible](https://img.shields.io/badge/MCP-Compatible-blue.svg)](https://modelcontextprotocol.io)

A **Model Context Protocol (MCP) server** that lets AI agents verify and timestamp document hashes on **Hedera mainnet** using the Hedera Consensus Service (HCS). Works with Claude Desktop, Cursor, Windsurf, and any MCP-compatible client.

Once a document hash is anchored, anyone can independently verify it via the public Hedera Mirror Node — no central authority required.

---

## Tools

### `verify_document_hash`
Checks whether a SHA-256 document hash has been anchored on Hedera. Returns the original timestamp, sequence number, and certificate ID if found.

**Input:**

| Parameter | Type   | Required | Description                              |
|-----------|--------|----------|------------------------------------------|
| `hash`    | string | ✅        | SHA-256 hash of the document (64 hex chars) |

**Example prompt:**
> "Verify the document hash `a1b2c3d4e5f6...`"

**Response — found:**
```json
{
  "exists": true,
  "timestamp": "2025-06-01T10:23:45.000000000Z",
  "sequenceNumber": 42,
  "certificateId": "0.0.12345@42",
  "network": "mainnet",
  "mirrorNodeUrl": "https://mainnet.mirrornode.hedera.com"
}
```

**Response — not found:**
```json
{
  "exists": false,
  "timestamp": null,
  "sequenceNumber": null
}
```

---

### `timestamp_document_hash`
Submits a new SHA-256 document hash to Hedera HCS, creating an immutable timestamp anchor. Returns a signed certificate JWT and full consensus details.

**Input:**

| Parameter | Type   | Required | Description                              |
|-----------|--------|----------|------------------------------------------|
| `hash`    | string | ✅        | SHA-256 hash of the document (64 hex chars) |

**Example prompt:**
> "Timestamp the document hash `a1b2c3d4e5f6...`"

**Response — success:**
```json
{
  "success": true,
  "sequenceNumber": 43,
  "consensusTimestamp": "1717235025.000180000",
  "certificateId": "0.0.12345@43",
  "receipt": "<signed-jwt-certificate>"
}
```

**Response — duplicate (already anchored):**
```json
{
  "error": "Document already timestamped at 2025-06-01T10:23:45.000000000Z (sequence #42).",
  "originalTimestamp": "1717235025.000180000",
  "originalSequence": 42
}
```

---

## Prerequisites

- Node.js 18+
- An API key for the TrustAnchor backend

No Hedera account needed — the backend handles all on-chain transactions.

---

## Installation

### Recommended: use via `npx` (no install needed)

The Claude Desktop and Cursor configs below use `npx` to pull and run the latest published version automatically. Nothing to install manually.

### Install globally

```bash
npm install -g @yoseph-ai/hedera-verify-mcp
```

### Clone and run locally

```bash
git clone https://github.com/Yoseph-ai/hedera-verify-mcp.git
cd hedera-verify-mcp
npm install
cp .env.example .env
# Edit .env with your credentials
npm run dev
```

---

## Environment Variables

| Variable              | Required | Description                                                      |
|-----------------------|----------|------------------------------------------------------------------|
| `TRUSTANCHOR_API_URL` | ✅        | Backend API URL (default: `https://hedera-document-auth.vercel.app`) |
| `TRUSTANCHOR_API_KEY` | ✅        | Your API key for the TrustAnchor backend                         |

---

## Claude Desktop Setup

Find your config file:

| Platform    | Path                                                                 |
|-------------|----------------------------------------------------------------------|
| **Windows** | `%APPDATA%\Claude\claude_desktop_config.json`                        |
| **macOS**   | `~/Library/Application Support/Claude/claude_desktop_config.json`   |
| **Linux**   | `~/.config/claude/claude_desktop_config.json`                        |

Add the following block (merge into existing `mcpServers` if present):

```json
{
  "mcpServers": {
    "hedera-verify": {
      "command": "npx",
      "args": ["-y", "@yoseph-ai/hedera-verify-mcp"],
      "env": {
        "TRUSTANCHOR_API_URL": "https://hedera-document-auth.vercel.app",
        "TRUSTANCHOR_API_KEY": "your-api-key-here"
      }
    }
  }
}
```

Restart Claude Desktop after saving. The `verify_document_hash` and `timestamp_document_hash` tools will appear automatically.

---

## Cursor Setup

Add to your Cursor MCP config (`%APPDATA%\Cursor\User\globalStorage\mcp.json` on Windows, or the equivalent on macOS/Linux):

```json
{
  "mcpServers": {
    "hedera-verify": {
      "command": "npx",
      "args": ["-y", "@yoseph-ai/hedera-verify-mcp"],
      "env": {
        "TRUSTANCHOR_API_URL": "https://hedera-document-auth.vercel.app",
        "TRUSTANCHOR_API_KEY": "your-api-key-here"
      }
    }
  }
}
```

---

## Windsurf / Other MCP Clients

Any MCP-compatible client that supports stdio transport can use this server with the same config pattern above. Point `command` at `npx` and pass `["-y", "@yoseph-ai/hedera-verify-mcp"]` as args.

---

## Testing with MCP Inspector

```bash
npx @modelcontextprotocol/inspector npx @yoseph-ai/hedera-verify-mcp
```

Set `TRUSTANCHOR_API_URL` and `TRUSTANCHOR_API_KEY` in the Inspector UI, then call `verify_document_hash` or `timestamp_document_hash` directly from the browser.

---

## How It Works

```
Your Document
     │
     ▼
SHA-256 Hash ──▶ MCP Server ──▶ TrustAnchor API ──▶ Hedera HCS (mainnet)
                                                            │
                                           Consensus Timestamp + Sequence Number
                                                            │
                                           ◀── Signed Certificate (JWT)
```

1. You provide a SHA-256 hash of your document
2. The MCP server forwards it to the TrustAnchor API with your API key
3. The API submits the hash to a Hedera HCS topic
4. Hedera consensus nodes reach agreement on an immutable timestamp
5. A signed JWT certificate is returned — independently verifiable via the Mirror Node

---

## Independent Verification

Hashes anchored on Hedera can be verified directly via the public Mirror Node with no dependency on this server:

```
https://mainnet.mirrornode.hedera.com/api/v1/topics/{topicId}/messages
```

Browse the live topic on HashScan: [View on HashScan](https://hashscan.io/mainnet/topic/0.0.10496228)

---

## Deploy Your Own Backend

The backend source is available at [hedera-document-auth](https://github.com/Yoseph-ai/hedera-document-auth). Deploy your own instance to Vercel and point the MCP server at it.

Required environment variables for your Vercel deployment:

```
HEDERA_ACCOUNT_ID
HEDERA_PRIVATE_KEY
HEDERA_NETWORK
HEDERA_TOPIC_ID
AGENT_API_KEY
JWT_SECRET
```

Then update your MCP server config:

```json
"TRUSTANCHOR_API_URL": "https://your-deployment.vercel.app"
```

---

## License

MIT © [Yoseph-ai](https://github.com/Yoseph-ai)

---

## Links

- [NPM Package](https://www.npmjs.com/package/@yoseph-ai/hedera-verify-mcp)
- [Backend Source](https://github.com/Yoseph-ai/hedera-document-auth)
- [Hedera Documentation](https://docs.hedera.com)
- [Model Context Protocol](https://modelcontextprotocol.io)
- [Live Topic on HashScan](https://hashscan.io/mainnet/topic/0.0.10496228)