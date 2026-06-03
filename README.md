# Hedera Verify MCP Server

[![npm version](https://img.shields.io/npm/v/@yoseph/hedera-verify-mcp.svg)](https://www.npmjs.com/package/@yoseph/hedera-verify-mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**Model Context Protocol (MCP) server** that lets you verify and timestamp document hashes on **Hedera mainnet** – using the Hedera Consensus Service (HCS). Works with Claude Desktop, Cursor, Windsurf, and any MCP‑compatible client.

## Features

- ✅ `verify_document_hash` – Check if a document hash exists on Hedera (immutable proof).
- ⏱️ `timestamp_document_hash` – Submit a new hash to Hedera, creating a verifiable timestamp anchor.
- 🔑 API key authentication (via `x-api-key` header) – your backend is separate.
- 🌐 Live production backend on Vercel: `https://hedera-document-auth.vercel.app`

## Prerequisites

- Node.js 18+ and npm
- A Hedera mainnet account with a small amount of HBAR (your backend handles the transactions)
- An API key from your TrustAnchor backend (or you can deploy your own)

## Installation

```bash
# Clone the repository
git clone https://github.com/Yoseph-ai/hedera-verify-mcp.git
cd hedera-verify-mcp

# Install dependencies
npm install

# Copy environment template and edit with your credentials
cp .env.example .env

## Configuration
#Edit .env:

.env
TRUSTANCHOR_API_URL=https://hedera-document-auth.vercel.app
TRUSTANCHOR_API_KEY=your-api-key-here
(The server reads these variables to call your backend API.)

#Usage
Run locally (stdio)
bash
npm run start   # or npx tsx src/main.ts

#Test with MCP Inspector
bash
npx @modelcontextprotocol/inspector tsx src/main.ts
Then in the browser, test verify_document_hash and timestamp_document_hash.

#Integrate with Claude Desktop
Add this to your claude_desktop_config.json (Windows: %APPDATA%\Claude\claude_desktop_config.json):

json
{
  "mcpServers": {
    "hedera-verify": {
      "command": "npx",
      "args": ["tsx", "C:\\path\\to\\hedera-verify-mcp\\src\\main.ts"],
      "env": {
        "TRUSTANCHOR_API_URL": "https://hedera-document-auth.vercel.app",
        "TRUSTANCHOR_API_KEY": "your-api-key"
      }
    }
  }
}

#Integrate with Cursor
Add to %APPDATA%\Cursor\User\globalStorage\mcp.json (Windows) or the equivalent on macOS/Linux.

Example calls
Verify – use the hash of an empty string (already anchored):
e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855

Anchor – submit a new hash, e.g., my_document_v1.

#License
MIT © Yoseph-ai

#Links
Hedera Documentation

#Model Context Protocol

Live Topic on HashScan

text

---
