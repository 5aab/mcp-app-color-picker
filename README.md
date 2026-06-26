# 🎨 MCP Color Picker — Sample MCP App

An interactive color picker that renders as a UI inside MCP-compatible hosts
like **VS Code GitHub Copilot** and **Claude**.

---

## Prerequisites

- Node.js 18+
- VS Code with GitHub Copilot (or Claude / Claude Desktop)

---

## Setup

### 1. Install & build

```bash
npm install
npm run build
```

### 2. Start the server

```bash
npm run serve
```

You should see:
```
✅ MCP Color Picker running at http://localhost:3001/mcp
```

---

## Connect to VS Code Copilot

Add the server to your VS Code MCP config.

**Option A — project-level** (`.vscode/mcp.json` in your workspace):

```json
{
  "servers": {
    "color-picker": {
      "type": "http",
      "url": "http://localhost:3001/mcp"
    }
  }
}
```

**Option B — global** (`~/.copilot/mcp.json`):

```json
{
  "servers": {
    "color-picker": {
      "type": "http",
      "url": "http://localhost:3001/mcp"
    }
  }
}
```

Then in VS Code:
1. Open Copilot Chat (`Ctrl+Alt+I` / `Cmd+Alt+I`)
2. Switch to **Agent** mode (dropdown in the chat input)
3. Type: **"open the color picker"**

The interactive color picker UI will render right inside the chat! 🎉

---

## Connect to Claude (web / desktop)

For Claude.ai or Claude Desktop you need to expose the server publicly.
In a separate terminal:

```bash
npx cloudflared tunnel --url http://localhost:3001
```

Copy the generated URL (e.g. `https://random-name.trycloudflare.com`) and add
it as a **Custom Connector** in Claude:

> Profile → Settings → Connectors → Add custom connector

> Note: Custom connectors require a paid Claude plan (Pro, Max, or Team).

---

## How it works

| File | Role |
|---|---|
| `server.ts` | MCP server — registers the `color_picker` tool + serves the HTML UI resource |
| `mcp-app.html` | HTML entry point for the color picker UI |
| `src/mcp-app.ts` | UI logic — connects to the host via the MCP App SDK |
| `vite.config.ts` | Bundles everything into a single self-contained HTML file |

### Key concepts

- **`registerAppTool`** — registers the tool with `_meta.ui.resourceUri`, telling
  the host to render a UI when this tool is called
- **`registerAppResource`** — serves the bundled HTML when the host requests it
- **`App.connect()`** — establishes bidirectional communication between the UI
  and the host
- **`app.ontoolresult`** — receives data pushed from the server when the tool runs

---

## Rebuilding after UI changes

```bash
npm run build   # rebuild the UI
npm run serve   # restart the server
```

Or run both at once:

```bash
npm run dev
```
