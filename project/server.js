import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fetch from "node-fetch";

dotenv.config();

const app = express();

// ✅ Middlewares
app.use(cors());
app.use(express.json());

// ✅ SERVE FRONTEND (MOST IMPORTANT FIX)
app.use(express.static("public"));

// ✅ Optional: default route (index.html open karega)
app.get("/", (req, res) => {
  res.sendFile(process.cwd() + "/public/index.html");
});

// ✅ CHAT API
app.post("/chat", async (req, res) => {
  const { message } = req.body;

  console.log("🔥 Request:", message);

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
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
    console.log("Groq:", data);

    if (data.error) {
      return res.json({ reply: data.error.message });
    }

    res.json({
      reply: data.choices?.[0]?.message?.content || "No reply"
    });

  } catch (error) {
    console.error(error);
    res.json({ reply: "Server error" });
  }
});

// ✅ START SERVER
app.listen(3000, "0.0.0.0", () => {
  console.log("✅ Server running on port 3000");
});