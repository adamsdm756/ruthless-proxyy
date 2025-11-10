import express from "express";
import cors from "cors";
import fetch from "node-fetch";

const app = express();

const PORT = process.env.PORT || 5000;
const OLLAMA_API = "https://j8v8ql23ioafrt-11434.proxy.runpod.net";

// Simple in-memory history (not used for generation now)
let chatHistory = [];

// === MIDDLEWARE ===
app.use(express.json());
app.use(
  cors({
    origin: "*", // or "https://ruthlessaiiiii.onrender.com" to restrict
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type"],
  })
);

// === ROUTES ===
app.get("/", (req, res) => {
  res.send("✅ Ruthless Proxy API running (ESM + Memory fix)");
});

// === GENERATE (stateless, no memory bleed) ===
app.post("/api/generate", async (req, res) => {
  const { prompt, model } = req.body;
  const selectedModel = model || "ruthless-mistral";

  try {
    // Clear previous conversation (prevent memory contamination)
    chatHistory = [];

    // 🔥 Ask Ollama cleanly with only the current user prompt
    const response = await fetch(`${OLLAMA_API}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: selectedModel,
        prompt: prompt,
        stream: false,
      }),
    });

    const data = await response.json();
    const reply =
      data.response ||
      (data.output ? data.output.map((o) => o.content).join(" ") : "No reply");

    // Save to in-memory history (optional for display)
    chatHistory.push({ role: "user", content: prompt });
    chatHistory.push({ role: "assistant", content: reply });

    res.json({ response: reply });
  } catch (err) {
    console.error("Error connecting to Ollama:", err);
    res.status(500).json({ error: "Failed to connect to Ollama" });
  }
});

// === START SERVER ===
app.listen(PORT, () => {
  console.log(`⚡ Ruthless Proxy API running on port ${PORT}`);
});
