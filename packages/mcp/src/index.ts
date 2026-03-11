#!/usr/bin/env npx tsx
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { PlaudConfig, PlaudAuth, PlaudClient } from '@plaud/core';

async function main() {
  const config = new PlaudConfig();
  const creds = config.getCredentials();

  if (!creds) {
    console.error('No Plaud credentials found. Run `plaud login` first.');
    process.exit(1);
  }

  const auth = new PlaudAuth(config);
  const client = new PlaudClient(auth, creds.region);

  const server = new McpServer({
    name: 'plaud-mcp',
    version: '0.1.0',
  });

  const recordingIdSchema = { recording_id: z.string().describe('The recording ID') };

  server.tool('plaud_list_recordings', 'List all Plaud recordings with ID, date, duration, and title.', async () => {
    const recs = await client.listRecordings();
    const result = recs.map(r => ({
      id: r.id,
      title: r.filename,
      date: new Date(r.start_time).toISOString().slice(0, 16),
      duration_minutes: Math.round(r.duration / 60000),
      has_transcript: r.is_trans,
    }));
    return { content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }] };
  });

  server.tool('plaud_get_transcript', 'Get the transcript of a Plaud recording by ID.', recordingIdSchema, async (params) => {
    const detail = await client.getRecording(params.recording_id);
    const result = { id: detail.id, title: detail.filename, transcript: detail.transcript || 'No transcript available.' };
    return { content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }] };
  });

  server.tool('plaud_get_recording_detail', 'Get full details of a Plaud recording including metadata and transcript.', recordingIdSchema, async (params) => {
    const detail = await client.getRecording(params.recording_id);
    return { content: [{ type: 'text' as const, text: JSON.stringify(detail, null, 2) }] };
  });

  server.tool('plaud_user_info', 'Get current Plaud user information.', async () => {
    const user = await client.getUserInfo();
    return { content: [{ type: 'text' as const, text: JSON.stringify(user, null, 2) }] };
  });

  server.tool('plaud_get_mp3_url', 'Get a temporary download URL for the MP3 version of a recording.', recordingIdSchema, async (params) => {
    const url = await client.getMp3Url(params.recording_id);
    const result = { url: url || null, message: url ? 'Temporary URL valid for a short time.' : 'No MP3 available.' };
    return { content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }] };
  });

  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch(err => {
  console.error('Failed to start MCP server:', err);
  process.exit(1);
});
