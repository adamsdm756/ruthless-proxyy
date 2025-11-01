import express from "express";
import cors from "cors";

const app = express();

// ✅ FIXED CORS (now allows preflight & correct frontend only)
app.use(cors({
  origin: "https://ruthlessaiiii.onrender.com",
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

// ✅ Handle preflight requests explicitly (this is what was missing)
app.options("*", cors());

app.use(express.json());

// ✅ RunPod Ollama endpoint
const OLLAMA = "https://wlxeu7erob0udp-11434.proxy.runpod.net";

// Health check
app.get("/api/ping", async (_req, res) => {
  try {
    const r = await fetch(`${OLLAMA}/api/tags`);
    if (!r.ok) return res.status(503).json({ ok: false, status: r.status });
    res.json({ ok: true });
  } catch (e) {
    res.status(503).json({ ok: false, error: String(e?.message || e) });
  }
});

// ✅ Generate (Ruthless full conversation memory)
app.post("/api/generate", async (req, res) => {
  try {
    const { prompt } = req.body || {};
    if (!prompt?.trim()) return res.status(400).json({ error: "No prompt provided" });

    const rr = await fetch(`${OLLAMA}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "mistral", // or "llava" later
        prompt,
        stream: false,
      }),
    });

    const data = await rr.json().catch(() => ({}));

    if (!rr.ok) return res.status(500).json({ error: "Model request failed", status: rr.status, data });

    res.json({ reply: data.response ?? data.message ?? "" });
  } catch (err) {
    res.status(500).json({ error: String(err?.message || err) });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`✅ Proxy running on :${port}`));
