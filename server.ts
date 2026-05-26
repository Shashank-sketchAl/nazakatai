import 'dotenv/config';
import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import { MOCK_CATALOG } from "./src/data.js";

// ─── Lazy-init Gemini only if key is present ────────────────────────────────
function getAI() {
  const key = process.env.GEMINI_API_KEY;
  if (!key || key === 'YOUR_GEMINI_API_KEY_HERE') return null;
  return new GoogleGenAI({
    apiKey: key,
    httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
  });
}

// ─── Demo mode: smart rule-based responses when no API key ──────────────────
function buildDemoResponse(messages: any[], profile: any): string {
  const lastUser = [...messages].reverse().find((m: any) => m.role === 'user');
  const userText = (lastUser?.content || '').toLowerCase();

  const catalog = MOCK_CATALOG;
  const formatProducts = (products: typeof MOCK_CATALOG) =>
    `PRODUCTS_JSON:${JSON.stringify(products.slice(0, 3).map(p => ({
      id: p.id,
      name: p.name,
      brand: p.brand_id,
      price: p.price,
      mrp: Math.round(p.price * 1.2),
      fabric: p.fabric_type,
      color: p.colors[0],
      imageUrl: p.images[0],
      pdpUrl: `/product/${p.id}`,
      reason: `A perfect choice for ${profile?.occasion || 'your occasion'} — ${p.description.slice(0, 80)}…`
    })))}`;

  // Budget-aware filter
  let filtered = catalog;
  if (profile?.budget) {
    const num = parseInt(profile.budget.replace(/[^\d]/g, ''));
    if (num) filtered = catalog.filter(p => p.price <= num);
  }

  // Wedding / bridal
  if (userText.match(/wedding|bridal|reception|shaadi/)) {
    const weddingItems = filtered.filter(p => p.occasions.some(o => o.includes('wedding')));
    return `For a wedding, I'd recommend something that balances grandeur with grace.\n\nAre you attending as a **guest**, or are you the **bride herself**?\n\nIn the meantime, here are some of our most sought-after wedding pieces — each hand-crafted by artisans in Lucknow's old city:\n\n${formatProducts(weddingItems.length ? weddingItems : filtered)}\n\nWhat's your budget range? That'll help me refine these further. 🌸`;
  }

  // Eid
  if (userText.match(/eid|eid-ul-fitr|eid mubarak/)) {
    const eidItems = filtered.filter(p => p.occasions.includes('festive'));
    return `Eid Mubarak in advance! 🌙\n\nFor Eid, pastel Chikankari and lightweight georgette sets are always a graceful choice — festive yet effortlessly elegant.\n\nHere are my top picks for you:\n\n${formatProducts(eidItems.length ? eidItems : filtered)}\n\nWould you prefer something more **traditional and rich**, or **soft and minimal**?`;
  }

  // Haldi / Mehendi
  if (userText.match(/haldi|mehendi|mehndi/)) {
    const haldi = filtered.filter(p => p.occasions.some(o => o.match(/haldi|festive|day-wedding/)));
    return `For Haldi, yellow is traditionally auspicious — and our **Organza Mukaish** pieces are simply breathtaking in the sunlight.\n\nFor Mehendi, soft greens and blush pinks in lightweight Chikankari are a timeless choice.\n\n${formatProducts(haldi.length ? haldi : filtered)}\n\nAre you looking for floor-length or knee-length? 🌼`;
  }

  // Chikankari
  if (userText.match(/chikankari|chikan/)) {
    const chikan = filtered.filter(p => p.craft_type === 'Chikankari');
    return `Chikankari is our soul. 🪡\n\nHand-embroidered by master craftsmen in Lucknow's Aminabad, each piece takes 3–7 days to complete.\n\nHere are our finest Chikankari selections:\n\n${formatProducts(chikan.length ? chikan : filtered)}\n\nAny particular color or silhouette in mind — Anarkali, Kurta Set, or something else?`;
  }

  // Banarasi
  if (userText.match(/banarasi|saree|silk/)) {
    const banarasi = filtered.filter(p => p.craft_type === 'Banarasi' || p.category === 'Saree');
    return `Banarasi silk — the crown jewel of Indian textiles. ✨\n\nWoven with authentic zari threads in Varanasi, our sarees are heirloom pieces meant to be passed down.\n\n${formatProducts(banarasi.length ? banarasi : filtered)}\n\nWill this be for a **wedding**, **evening occasion**, or **festive celebration**?`;
  }

  // Budget mention
  if (userText.match(/budget|price|under|below|₹|\d{3,}/)) {
    const budgetNum = parseInt(userText.match(/\d{3,}/)?.[0] || '0');
    const budgetFiltered = budgetNum ? catalog.filter(p => p.price <= budgetNum) : filtered;
    return `Wonderful — I'll curate within your budget.\n\n${budgetFiltered.length ? `Here are my top picks that offer the finest value:\n\n${formatProducts(budgetFiltered)}` : `Our collection starts at ₹3,800. Here are our most accessible pieces:\n\n${formatProducts(catalog.slice(0, 3))}`}\n\nShall I also suggest some styling tips for these?`;
  }

  // Lehenga
  if (userText.match(/lehenga/)) {
    const lehenga = filtered.filter(p => p.category === 'Lehenga');
    return `A lehenga is a statement of grandeur. 👑\n\nOur **Royal Blue Zardozi Velvet Lehenga** is one of our most celebrated pieces — adorned with heavy hand-embroidery by master craftsmen.\n\n${formatProducts(lehenga.length ? lehenga : filtered)}\n\nWhat size are you looking for, and is this for a day event or evening celebration?`;
  }

  // Generic browse / casual
  if (userText.match(/browse|casual|office|work|everyday/)) {
    const casual = filtered.filter(p => p.occasions.some(o => o.match(/casual|office/)));
    return `For everyday elegance, our **Pastel Cotton Chikankari** range is a quiet luxury — breathable, handcrafted, and effortlessly refined.\n\n${formatProducts(casual.length ? casual : filtered)}\n\nIs there a particular color palette or silhouette you're drawn to? 🌸`;
  }

  // Default / greeting
  if (messages.length <= 2 || userText.match(/hi|hello|namaste|hey|help/)) {
    return `Namaste! I'm so glad you're here. 🙏\n\nI'm Nazakatai — your personal AI stylist for premium Lucknow ethnic wear.\n\n**To get started, tell me:**\n- What's the occasion? *(wedding, Eid, Haldi, casual…)*\n- What's your budget?\n- Any colour preferences?\n\nI'll curate something timeless just for you. ✨`;
  }

  // Fallback with all products
  return `What a beautiful choice to explore! ✨\n\nLet me show you some of our most curated pieces from our atelier:\n\n${formatProducts(filtered.length ? filtered : catalog)}\n\nTell me more about your occasion and preferences, and I'll narrow this down to the perfect look for you. 🌸`;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", hasApiKey: !!getAI() });
  });

  app.get("/api/products/search", (req, res) => {
    res.json(MOCK_CATALOG);
  });

  app.get("/api/brands/:slug", (req, res) => {
    const brandProducts = MOCK_CATALOG.filter(p => p.brand_id === req.params.slug);
    res.json({ products: brandProducts });
  });

  // ─── Chat endpoint ─────────────────────────────────────────────────────────
  app.post("/api/chat", async (req, res) => {
    const { messages, profile } = req.body;
    const ai = getAI();

    // Set up SSE
    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive"
    });

    // ── DEMO MODE (no API key) ────────────────────────────────────────────────
    if (!ai) {
      const response = buildDemoResponse(messages, profile);
      // Stream word-by-word for authentic feel
      const words = response.split(' ');
      for (let i = 0; i < words.length; i++) {
        const text = (i === 0 ? '' : ' ') + words[i];
        res.write(`data: ${JSON.stringify({ text })}\n\n`);
        await new Promise(resolve => setTimeout(resolve, 18 + Math.random() * 20));
      }
      res.write(`data: [DONE]\n\n`);
      res.end();
      return;
    }

    // ── LIVE GEMINI MODE ──────────────────────────────────────────────────────
    try {
      const systemPrompt = `You are Nazakatai, an expert personal stylist for a premium Lucknow ethnic wear brand. Your tone is warm, knowledgeable, polite, and concise—like a helpful shop assistant in a high-end boutique.

YOUR GOAL: Help the user find the perfect outfit based on their occasion, budget, and style preferences.

CUSTOMER PROFILE (known so far):
- Occasion: ${profile?.occasion || 'unknown'}
- Budget: ${profile?.budget || 'unknown'}
- Style: ${profile?.style || 'unknown'}
- Size: ${profile?.size || 'unknown'}

AVAILABLE INVENTORY (Use ONLY these to make recommendations):
${JSON.stringify(MOCK_CATALOG, null, 2)}

GUIDELINES:
1. Ask, don't assume: If you don't know the occasion or budget, ask gently. Ask only one question at a time.
2. Be concise: Keep text responses under 3 sentences.
3. Styling over selling: Offer advice first, then products.
4. Recommend 1-3 products when you have enough info.
5. Mention heritage craft naturally.

OUTPUT FORMAT FOR RECOMMENDATIONS:
Embed JSON between text blocks — do NOT markdown-format the JSON:
PRODUCTS_JSON:[{"id":"product-id", "name":"Name", "brand":"brand_id", "price":4500, "mrp":5500, "fabric":"Chikankari Cotton", "color":"ivory", "imageUrl":"https://...", "pdpUrl":"/product/id", "reason":"one sentence why this fits"}]

Always follow up a recommendation with a question.`;

      const contents = messages.map((m: any) => ({
        role: m.role === 'bot' ? 'model' : 'user',
        parts: [{ text: m.content }]
      }));

      const responseStream = await ai.models.generateContentStream({
        model: "gemini-2.0-flash",
        contents,
        config: { systemInstruction: systemPrompt },
      });

      for await (const chunk of responseStream) {
        const text = chunk.text;
        if (text) res.write(`data: ${JSON.stringify({ text })}\n\n`);
      }

      res.write(`data: [DONE]\n\n`);
      res.end();
    } catch (error: any) {
      console.error("Gemini chat error:", error?.message || error);
      const fallback = buildDemoResponse(messages, profile);
      const words = fallback.split(' ');
      for (let i = 0; i < words.length; i++) {
        res.write(`data: ${JSON.stringify({ text: (i === 0 ? '' : ' ') + words[i] })}\n\n`);
        await new Promise(r => setTimeout(r, 18));
      }
      res.write(`data: [DONE]\n\n`);
      res.end();
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
    const hasKey = !!getAI();
    console.log(`\n🚀 Server running on http://localhost:${PORT}`);
    console.log(hasKey
      ? `✅ Gemini AI connected — live mode active`
      : `⚠️  No GEMINI_API_KEY found — running in demo mode\n   Add your key to .env to enable live AI\n   Get one free at: https://aistudio.google.com/app/apikey`
    );
  });
}

startServer();
