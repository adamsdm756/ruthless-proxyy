import express from "express";
import cors from "cors";

const app = express();
app.use(cors({ origin: "*", methods: "GET,POST", allowedHeaders: "Content-Type, Authorization" }));
app.use(express.json());

// ✅ Your RunPod Ollama endpoint (CORRECT)
const OLLAMA = "https://bfcye3ea776gfr-11434.proxy.runpod.net";

// Health check → forwards to Ollama /api/tags
app.get("/api/ping", async (_req, res) => {
  try {
    const r = await fetch(`${OLLAMA}/api/tags`);
    if (!r.ok) return res.status(503).json({ ok: false, status: r.status });
    res.json({ ok: true });
  } catch (e) {
    res.status(503).json({ ok: false, error: String(e?.message || e) });
  }
});

// Generate → forwards prompt to Ollama /api/generate
app.post("/api/generate", async (req, res) => {
  try {
    const { prompt } = req.body || {};
    if (!prompt?.trim()) return res.status(400).json({ error: "No prompt provided" });

    const rr = await fetch(`${OLLAMA}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model: "ruthless:latest", prompt, stream: false }),
    });

    // Pass through Ollama response cleanly
    const data = await rr.json().catch(() => ({}));
    if (!rr.ok) return res.status(500).json({ error: "Model request failed", status: rr.status, data });

    // Normalize to { reply: ... }
    res.json({ reply: data.response ?? data.message ?? "" });
  } catch (err) {
    res.status(500).json({ error: String(err?.message || err) });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`✅ Proxy running on :${port}`));
