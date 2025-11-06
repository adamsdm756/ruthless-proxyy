import express from "express";
import cors from "cors";
import fetch from "node-fetch";

const app = express();

const PORT = process.env.PORT || 5000;
const OLLAMA_API = "https://bfcye3ea776gfr-11434.proxy.runpod.net";

// 🧠 simple in-memory chat history (resets when server restarts)
let chatHistory = [];

// === MIDDLEWARE ===
app.use(express.json());
app.use(
  cors({
    origin: "*", // or "https://ruthlessaiiii.onrender.com" to restrict
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type"],
  })
);

// === ROUTES ===
app.get("/", (req, res) => {
  res.send("✅ Ruthless Proxy API running (ESM + Memory)");
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

// === GENERATE with short-term memory ===
app.post("/api/generate", async (req, res) => {
  const { prompt, model } = req.body;
  const selectedModel = model || "ruthlessai:latest";

  try {
    // 1️⃣ Save user message
    chatHistory.push({ role: "user", content: prompt });

    // 2️⃣ Build conversation string
    const combined = chatHistory.map(m => `${m.role}: ${m.content}`).join("\n");

    // 3️⃣ Ask Ollama with full context
    const response = await fetch(`${OLLAMA_API}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: selectedModel,
        prompt: combined,
        stream: false,
      }),
    });

    const data = await response.json();
    const reply = data.response || data.output?.map(o => o.content).join(" ") || "No reply";

    // 4️⃣ Save assistant reply to memory
    chatHistory.push({ role: "assistant", content: reply });

    // 5️⃣ Send reply back
    res.json({ response: reply });
  } catch (err) {
    console.error("Error connecting to Ollama:", err);
    res.status(500).json({ error: "Failed to connect to Ollama" });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Ruthless Proxy API live on port ${PORT}`);
  console.log(`🔗 Connected to Ollama at ${OLLAMA_API}`);
});
