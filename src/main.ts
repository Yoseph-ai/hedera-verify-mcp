import dotenv from 'dotenv';
dotenv.config();

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';

const API_BASE = process.env.TRUSTANCHOR_API_URL;
const API_KEY = process.env.TRUSTANCHOR_API_KEY;

if (!API_BASE || !API_KEY) {
  console.error('Missing TRUSTANCHOR_API_URL or TRUSTANCHOR_API_KEY');
  process.exit(1);
}

const server = new McpServer({
  name: 'hedera-verify-mcp',
  version: '1.0.0',
});

server.tool(
  'verify_document_hash',
  'Verify a document hash on Hedera mainnet',
  { hash: z.string() },
  async ({ hash }) => {
    // Debug logs (will appear in Inspector terminal)
    console.error(`[MCP] Verifying hash: ${hash}`);
    console.error(`[MCP] API_BASE: ${API_BASE}`);
    console.error(`[MCP] API_KEY length: ${API_KEY.length}`);

    const url = `${API_BASE}/api/agent/verify`;
    const body = JSON.stringify({ hash, apiKey: API_KEY });

    console.error(`[MCP] Request URL: ${url}`);
    console.error(`[MCP] Request body length: ${body.length}`);

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
      });

      console.error(`[MCP] Response status: ${res.status}`);

      if (!res.ok) {
        const errorText = await res.text();
        console.error(`[MCP] Error body: ${errorText}`);
        return {
          content: [{ type: 'text', text: `API error: ${res.status} ${errorText}` }],
          isError: true,
        };
      }

      const data = await res.json();
      console.error(`[MCP] Response data: valid=${data.valid}`);

      if (data.valid) {
        return {
          content: [{
            type: 'text',
            text: `✅ Verified.\nTimestamp: ${data.timestamp}\nCertificate ID: ${data.certificateId}`
          }],
        };
      } else {
        return {
          content: [{ type: 'text', text: '❌ Hash not found on ledger.' }],
        };
      }
    } catch (err) {
      console.error(`[MCP] Fetch error: ${err.message}`);
      return {
        content: [{ type: 'text', text: `Fetch failed: ${err.message}` }],
        isError: true,
      };
    }
  }
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Hedera Verify MCP server running');
}

main().catch(console.error);