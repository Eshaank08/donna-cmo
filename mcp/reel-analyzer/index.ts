#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { runReelAnalyzer } from "../../src/lib/tools/reel-analyzer";

const server = new McpServer({ name: "donna-cmo-reel-analyzer", version: "0.1.0" });

server.registerTool(
  "analyze_reel",
  {
    title: "Analyze a reel",
    description:
      "Download a public reel/short video link and return its transcript, caption, engagement stats, and extracted frames. No API key required for the core flow — set GROQ_API_KEY in the app's Settings page for a transcript. Reads keys from the same local SQLite vault the web app uses.",
    inputSchema: {
      url: z.string().url().describe("The reel or video URL to analyze"),
    },
  },
  async ({ url }) => {
    try {
      const { record } = await runReelAnalyzer(url);
      return {
        content: [{ type: "text", text: JSON.stringify(record, null, 2) }],
      };
    } catch (err) {
      return {
        content: [
          {
            type: "text",
            text: `Error: ${err instanceof Error ? err.message : String(err)}`,
          },
        ],
        isError: true,
      };
    }
  }
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((err) => {
  console.error("Fatal error running reel-analyzer MCP server:", err);
  process.exit(1);
});
