// src/mcp-app.ts
import { App } from "@modelcontextprotocol/ext-apps";

// ── Swatches palette ─────────────────────────────────────────────────────────
const SWATCHES = [
  "#ef4444", "#f97316", "#eab308", "#22c55e",
  "#14b8a6", "#6366f1", "#a855f7", "#ec4899",
  "#f43f5e", "#fb923c", "#facc15", "#4ade80",
  "#2dd4bf", "#818cf8", "#c084fc", "#f472b6",
];

// ── DOM refs ──────────────────────────────────────────────────────────────────
const preview   = document.getElementById("preview")    as HTMLDivElement;
const colorWheel = document.getElementById("colorWheel") as HTMLInputElement;
const hexInput  = document.getElementById("hexInput")   as HTMLInputElement;
const swatchesEl = document.getElementById("swatches")  as HTMLDivElement;
const copyBtn   = document.getElementById("copyBtn")    as HTMLButtonElement;
const rVal      = document.getElementById("rVal")!;
const gVal      = document.getElementById("gVal")!;
const bVal      = document.getElementById("bVal")!;

// ── Helpers ───────────────────────────────────────────────────────────────────
function hexToRgb(hex: string): [number, number, number] | null {
  const clean = hex.replace("#", "");
  if (clean.length !== 6) return null;
  const n = parseInt(clean, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function applyColor(hex: string) {
  const upper = hex.toUpperCase();
  preview.style.background = upper;
  colorWheel.value = upper;
  hexInput.value   = upper;

  const rgb = hexToRgb(upper);
  if (rgb) {
    rVal.textContent = String(rgb[0]);
    gVal.textContent = String(rgb[1]);
    bVal.textContent = String(rgb[2]);
  }

  // highlight active swatch
  document.querySelectorAll(".swatch").forEach((s) => {
    s.classList.toggle("active", (s as HTMLElement).dataset.color === upper);
  });
}

// ── Build swatches ────────────────────────────────────────────────────────────
SWATCHES.forEach((color) => {
  const s = document.createElement("button");
  s.className = "swatch";
  s.style.background = color;
  s.dataset.color = color.toUpperCase();
  s.title = color;
  s.addEventListener("click", () => applyColor(color));
  swatchesEl.appendChild(s);
});

// ── Event listeners ───────────────────────────────────────────────────────────
colorWheel.addEventListener("input", () => applyColor(colorWheel.value));

hexInput.addEventListener("input", () => {
  const raw = hexInput.value.trim();
  const hex = raw.startsWith("#") ? raw : `#${raw}`;
  if (/^#[0-9a-fA-F]{6}$/.test(hex)) applyColor(hex);
});

copyBtn.addEventListener("click", async () => {
  const hex = hexInput.value;
  try {
    await navigator.clipboard.writeText(hex);
  } catch {
    // Clipboard might be blocked in the iframe; still show feedback
  }
  copyBtn.textContent = "✓ Copied!";
  copyBtn.classList.add("copied");
  setTimeout(() => {
    copyBtn.textContent = "Copy HEX";
    copyBtn.classList.remove("copied");
  }, 2000);
});

// ── MCP App integration ───────────────────────────────────────────────────────
const app = new App({ name: "Color Picker App", version: "1.0.0" });
app.connect();

// Receive initial color from the server tool result
app.ontoolresult = (result) => {
  try {
    const text = result.content?.find((c: { type: string }) => c.type === "text");
    if (text && "text" in text) {
      const data = JSON.parse(text.text as string) as { initialColor?: string };
      if (data.initialColor) applyColor(data.initialColor);
    }
  } catch {
    // Fallback to default
  }
};

// ── Initial render ────────────────────────────────────────────────────────────
applyColor("#6366F1");
