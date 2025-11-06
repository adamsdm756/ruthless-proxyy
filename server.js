const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");

const app = express();

// === CONFIG ===
const PORT = process.env.PORT || 5000;
const OLLAMA_API = "https://bfcye3ea776gfr-11434.proxy.runpod.net";

// === MIDDLEWARE ===
app.use(express.json());
app.use(
  cors({
    origin: "*", // allow all (you can later restrict)
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type"],
  })
);

// === ROUTES ===
app.get("/", (req, res) => {
  res.send("✅ Ruthless Proxy API running");
});

app.get("/api/ping", (req, res) => {
  res.json({ ok: true, message: "Proxy running and reachable" });
});

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

// === START SERVER ===
app.listen(PORT, () => {
  console.log(`✅ Ruthless Proxy API live on port ${PORT}`);
  console.log(`🔗 Connected to Ollama at ${OLLAMA_API}`);
});
