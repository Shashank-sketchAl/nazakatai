import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import { MOCK_CATALOG } from "./src/data.js";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  app.get("/api/products/search", (req, res) => {
    res.json(MOCK_CATALOG);
  });

  app.get("/api/brands/:slug", (req, res) => {
    const brandProducts = MOCK_CATALOG.filter(p => p.brand_id === req.params.slug);
    res.json({ products: brandProducts });
  });

  // Chat endpoint
  app.post("/api/chat", async (req, res) => {
    try {
      const { messages, profile } = req.body;

      const systemPrompt = `You are Nazakatai, an expert personal stylist for a premium Lucknow ethnic wear brand. Your tone is warm, knowledgeable, polite, and concise—like a helpful shop assistant in a high-end boutique.

YOUR GOAL: Help the user find the perfect outfit based on their occasion, budget, and style preferences.

CUSTOMER PROFILE (known so far):
- Occasion: ${profile?.occasion || 'unknown'}
- Budget: ${profile?.budget || 'unknown'}
- Style: ${profile?.style || 'unknown'}  
- Size: ${profile?.size || 'unknown'}

AVAILABLE INVENTORY CANDIDATES (Use ONLY these to make recommendations):
${JSON.stringify(MOCK_CATALOG, null, 2)}

GUIDELINES:
1. Ask, don't assume: If you don't know the occasion or budget, ask gently in the first few turns. Ask only one main question at a time.
2. Be concise: Mobile screens are small. Keep text responses under 3 sentences if possible.
3. Styling over selling: Don't just push products. Offer advice. "For a daytime Haldi, yellow is traditional. A lightweight cotton Chikankari would be comfortable in the heat."
4. Recommending Products: When you have enough info, recommend 1-3 options. 
5. Mention the craft heritage naturally (hand-embroidered by artisans in Lucknow's old city).

OUTPUT FORMAT FOR RECOMMENDATIONS:
To show products, embed a JSON block strictly following this format *between* text blocks. Do not markdown format the JSON block itself.

PRODUCTS_JSON:[{"id":"product-uuid", "name":"Product Name", "brand":"Brand Name", "price":1200, "mrp":1500, "fabric":"chikankari cotton", "color":"ivory", "imageUrl":"https://...", "pdpUrl":"/product/uuid", "reason":"one sentence why this fits"}]

Always follow up a recommendation with a question to keep the conversation going.`;

      // Convert messages to Gemini format
      const contents = messages.map((m: any) => ({
        role: m.role === 'bot' ? 'model' : 'user',
        parts: [{ text: m.content }]
      }));

      const responseStream = await ai.models.generateContentStream({
        model: "gemini-3.1-pro-preview",
        contents: contents,
        config: {
          systemInstruction: systemPrompt,
        },
      });

      // Clean SSE stream setup
      res.writeHead(200, {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive"
      });

      for await (const chunk of responseStream) {
        const text = chunk.text;
        if (text) {
          res.write(`data: ${JSON.stringify({ text })}\n\n`);
        }
      }

      res.write(`data: [DONE]\n\n`);
      res.end();
    } catch (error) {
      console.error("Chat error:", error);
      res.status(500).json({ error: "Failed to process chat" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
