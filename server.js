import express from "express";
import cors from "cors";
import fetch from "node-fetch";

const app = express();

// === CONFIG ===
const PORT = process.env.PORT || 5000;
// ⚠️ REPLACE with your RunPod Ollama endpoint:
const OLLAMA_API = "https://bfcye3ea776gfr-11434.proxy.runpod.net";

// === MIDDLEWARE ===
app.use(express.json());
app.use(
  cors({
    origin: "*", // allow any origin (for now, can later restrict)
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type"],
  })
);

// === ROUTES ===

// Health check
app.get("/api/ping", (req, res) => {
  res.json({ ok: true, message: "Server running and reachable" });
});

// List available models
app.get("/api/tags", async (req, res) => {
  try {
    const response = await fetch(`${OLLAMA_API}/api/tags`);
    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error("Error fetching tags:", err);
    res.status(500).json({ error: "Failed to fetch Ollama tags" });
  }
});

// Generate chat or code response
app.post("/api/generate", async (req, res) => {
  const { prompt, model } = req.body;
  const selectedModel = model || "ruthlessai:latest";

  try {
    const response = await fetch(`${OLLAMA_API}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: selectedModel,
        prompt,
        stream: false,
      }),
    });

    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error("Error connecting to Ollama:", err);
    res.status(500).json({ error: "Failed to connect to Ollama" });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ RuthlessAI proxy live on port ${PORT}`);
  console.log(`🔗 Connected to Ollama at ${OLLAMA_API}`);
});
