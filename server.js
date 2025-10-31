import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

const OLLAMA = "https://wlxeu7erob0udp-11434.proxy.runpod.net"; // your pod

app.post("/api/generate", async (req, res) => {
  try {
    const { prompt } = req.body;

    const response = await fetch(`${OLLAMA}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "ruthless:latest",
        prompt,
        stream: false,
      }),
    });

    const data = await response.json();
    res.json({ reply: data.response });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`✅ Proxy running on ${port}`));
