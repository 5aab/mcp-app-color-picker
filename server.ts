// server.ts
console.log("Starting MCP Color Picker server...");

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import {
  registerAppTool,
  registerAppResource,
  RESOURCE_MIME_TYPE,
} from "@modelcontextprotocol/ext-apps/server";
import cors from "cors";
import express from "express";
import fs from "node:fs/promises";
import path from "node:path";

const server = new McpServer({
  name: "Color Picker MCP Server",
  version: "1.0.0",
});

const resourceUri = "ui://color-picker/mcp-app.html";

// Register the color-picker tool with MCP App UI metadata
registerAppTool(
  server,
  "color_picker",
  {
    title: "Color Picker",
    description:
      "Opens an interactive color picker. Use this when the user wants to pick, choose, or select a color.",
    inputSchema: {},
    _meta: { ui: { resourceUri } },
  },
  async () => {
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({ initialColor: "#6366f1" }),
        },
      ],
    };
  }
);

// Serve the bundled HTML UI as an MCP resource
registerAppResource(
  server,
  resourceUri,
  resourceUri,
  { mimeType: RESOURCE_MIME_TYPE },
  async () => {
    const html = await fs.readFile(
      path.join(import.meta.dirname, "dist", "mcp-app.html"),
      "utf-8"
    );
    return {
      contents: [{ uri: resourceUri, mimeType: RESOURCE_MIME_TYPE, text: html }],
    };
  }
);

// Expose the MCP server over HTTP
const app = express();
app.use(cors());
app.use(express.json());

app.post("/mcp", async (req, res) => {
  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
    enableJsonResponse: true,
  });
  res.on("close", () => transport.close());
  await server.connect(transport);
  await transport.handleRequest(req, res, req.body);
});

app.listen(3001, (err?: Error) => {
  if (err) {
    console.error("Error starting server:", err);
    process.exit(1);
  }
  console.log("✅ MCP Color Picker running at http://localhost:3001/mcp");
});
