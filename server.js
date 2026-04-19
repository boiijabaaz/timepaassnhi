import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// ✅ Middleware
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

// ✅ Debug check (important)
if (!process.env.GROQ_API_KEY) {
  console.error("❌ GROQ_API_KEY missing in .env");
  process.exit(1);
}

// ✅ Default route
app.get("/", (req, res) => {
  res.sendFile(process.cwd() + "/public/index.html");
});

// ✅ Chat API
app.post("/chat", async (req, res) => {
  const { message } = req.body;

  console.log("🔥 User:", message);

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile", // stable model
        messages: [
          {
            role: "system",
            content: "You are a calm, supportive mental health assistant."
          },
          {
            role: "user",
            content: message
          }
        ]
      })
    });

    const data = await response.json();
    console.log("Groq Response:", data);

    if (data.error) {
      return res.json({ reply: "❌ " + data.error.message });
    }

    res.json({
      reply: data.choices?.[0]?.message?.content || "No response"
    });

  } catch (error) {
    console.error("Server Error:", error);
    res.json({ reply: "⚠️ Server error" });
  }
});

// ✅ Start server
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});