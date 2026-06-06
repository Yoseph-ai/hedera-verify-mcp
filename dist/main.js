#!/usr/bin/env node
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
server.tool('verify_document_hash', 'Verify a document hash on Hedera mainnet', { hash: z.string() }, async ({ hash }) => {
    try {
        const res = await fetch(`${API_BASE}/api/agent/verify`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': API_KEY,
            },
            body: JSON.stringify({ hash }),
        });
        const text = await res.text();
        if (!res.ok) {
            return { content: [{ type: 'text', text: `API error (${res.status}): ${text}` }], isError: true };
        }
        const data = JSON.parse(text);
        if (data.valid) {
            return {
                content: [{
                        type: 'text',
                        text: `✅ Verified.\nTimestamp: ${data.timestamp}\nCertificate ID: ${data.certificateId}`,
                    }],
            };
        }
        else {
            return { content: [{ type: 'text', text: '❌ Hash not found on ledger.' }] };
        }
    }
    catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        return { content: [{ type: 'text', text: `Fetch failed: ${errorMessage}` }], isError: true };
    }
});
server.tool('timestamp_document_hash', 'Record a document hash on Hedera mainnet (anchor it)', { hash: z.string() }, async ({ hash }) => {
    try {
        const res = await fetch(`${API_BASE}/api/agent/anchor`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': API_KEY,
            },
            body: JSON.stringify({ hash }),
        });
        const text = await res.text();
        if (!res.ok) {
            return { content: [{ type: 'text', text: `Anchor error (${res.status}): ${text}` }], isError: true };
        }
        const data = JSON.parse(text);
        const seqNum = typeof data.sequenceNumber === 'object' ? data.sequenceNumber.low : data.sequenceNumber;
        return {
            content: [{
                    type: 'text',
                    text: `✅ Hash anchored.\nSequence number: ${seqNum}\nTimestamp: ${data.consensusTimestamp}\nCertificate ID: ${data.certificateId}`,
                }],
        };
    }
    catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        return { content: [{ type: 'text', text: `Fetch failed: ${errorMessage}` }], isError: true };
    }
});
async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error('Hedera Verify MCP server running');
}
main().catch(console.error);
