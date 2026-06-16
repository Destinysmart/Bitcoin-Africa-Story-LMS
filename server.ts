import express from "express";
import path from "path";
import cors from "cors";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // Initialize Gemini
  const getAiParams = () => {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is not set.");
    }
    return new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  };

  // API route for quiz generation
  app.post("/api/generate-quiz", async (req, res) => {
    try {
      const { chapterTitle, chapterDescription } = req.body;
      const ai = getAiParams();

      const prompt = `Generate a 3-question multiple choice quiz for a chapter titled "${chapterTitle}". 
      Here is the course material/description for context:
      ${chapterDescription || 'No description provided.'}
      
      The question should have 4 options (A, B, C, D) and specify the correct answer letter. 
      Respond strictly in raw JSON format like this: 
      [
        { "question": "?", "options": { "A": "", "B": "", "C": "", "D": "" }, "correct": "A" }
      ]`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      const rawContent = response.text || "[]";
      const startIndex = rawContent.indexOf('[');
      const endIndex = rawContent.lastIndexOf(']') + 1;
      const jsonStr = startIndex !== -1 && endIndex !== 0 ? rawContent.slice(startIndex, endIndex) : "[]";
      
      const parsed = JSON.parse(jsonStr);
      res.json(parsed);

    } catch (err: any) {
      console.error(err);
      res.status(err.status || 500).json({ error: err.message || "Failed to generate quiz" });
    }
  });

  app.post("/api/generate-description", async (req, res) => {
    try {
      const { chapterTitle } = req.body;
      const ai = getAiParams();

      const prompt = `Write a short, engaging description (1-2 paragraphs) for a learning module titled "${chapterTitle}". Maintain an encouraging and professional tone suitable for a bitcoin and money educational platform. Do not wrap in JSON, just return the raw text.`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      res.json({ description: (response.text || "").trim() });

    } catch (err: any) {
      console.error(err);
      res.status(err.status || 500).json({ error: err.message || "Failed to generate description" });
    }
  });

  app.post("/api/generate-resources", async (req, res) => {
    try {
      const { chapterTitle } = req.body;
      const ai = getAiParams();

      const prompt = `Suggest 3 highly authoritative, widely-known reading resources (like famous books, popular open-source articles, or established podcasts) to learn about "${chapterTitle}" in the context of bitcoin or money.
      Respond strictly in raw JSON format like this: 
      [
        { "title": "?", "type": "link", "url": "https://..." }
      ]
      Note: the "type" field must be one of: "link", "pdf", "podcast", "book". Ensure the "url" looks realistic if you don't know the exact one.`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      const rawContent = response.text || "[]";
      const startIndex = rawContent.indexOf('[');
      const endIndex = rawContent.lastIndexOf(']') + 1;
      const jsonStr = startIndex !== -1 && endIndex !== 0 ? rawContent.slice(startIndex, endIndex) : "[]";
      
      const parsed = JSON.parse(jsonStr);
      res.json(parsed);

    } catch (err: any) {
      console.error(err);
      res.status(err.status || 500).json({ error: err.message || "Failed to generate resources" });
    }
  });

  app.post("/api/course-companion", async (req, res) => {
    try {
      const { chapterTitle, chapterDescription, question, history } = req.body;
      const ai = getAiParams();

      let systemPrompt = `You are an expert Course Companion for a bitcoin and money educational platform. 
      You are helping a student understand the chapter titled "${chapterTitle}".
      Here is the course material/description for context:
      ${chapterDescription || 'No description provided.'}
      
      Answer their questions concisely and accurately based on the provided material.`;

      // Format history for Gemini chat
      let formattedHistory: Array<{ role: string; parts: Array<{ text: string }> }> = [];
      if (history && Array.isArray(history)) {
         formattedHistory = history.map((msg: any) => ({
             role: msg.role === 'assistant' ? 'model' : 'user',
             parts: [{ text: msg.content || "" }],
         }));
      }

      const chatContents = [...formattedHistory];
      if (question) {
         chatContents.push({ role: 'user', parts: [{ text: question }] });
      }

      // If chatContents is empty, return a friendly welcome
      if (chatContents.length === 0) {
         return res.json({ answer: "Hello! I am your Bitcoin Course Companion. Ask me any questions about this chapter!" });
      }

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: chatContents,
        config: {
          systemInstruction: systemPrompt,
        }
      });
      
      res.json({ answer: (response.text || "").trim() });

    } catch (err: any) {
      console.error(err);
      res.status(err.status || 500).json({ error: err.message || "Failed to generate answer" });
    }
  });

  app.post("/api/instructor-bot", async (req, res) => {
    try {
      const { question, history } = req.body;
      const ai = getAiParams();

      const systemInstruction = `You are 'Satoshi', the AI Lead Instructor Bot for My First Bitcoin's Bitcoin Diploma.
      Your goal is to provide positive, educational, and inspiring guidance strictly focused on Bitcoin and the Bitcoin Diploma curriculum.

      CORE CURRICULUM TRAINING KNOWLEDGE:
      - Module 1 (What is Money?): Functions of Money (Store of Value, Medium of Exchange, Unit of Account), Properties (Durability, Portability, Divisibility, Acceptability, Scarcity, Fungibility), Types of Money (Commodity, Representative, Fiat), Scarcity & Time Preference, Opportunity Cost.
      - Module 2 (The History of Money): Barter and the "Double Coincidence of Wants", Commodity standards (Gold/Silver), Paper Receipts, Bretton Woods, and the Nixon Shock (1971) which ended gold convertibility.
      - Module 3 (What Is Fiat Money?): Money decreed by government, Fractional reserve banking, centralization, debt-driven money creation, Central Bank Digital Currencies (CBDCs) and control.
      - Module 4 (How Problems Lead to Solutions): Monetary inflation reduces purchasing power, wealth inequality (the Cantillon Effect - closest to the money printer benefits first), Cypherpunks, Hal Finney, Eric Hughes, Timothy C. May.
      - Module 5 (What Is Bitcoin?): Satoshi Nakamoto's October 2008 Whitepaper, Genesis Block (Jan 3, 2009), Consensus rules, 21 million absolute limit.
      - Module 6 (How to Use Bitcoin): Private/Public keys, seed phrases ("Not your keys, not your coins"), self-custodial vs custodial wallets, Cold/Hot storage.
      - Module 7 (Using Bitcoin in Daily Life): Lightning Network (Layer 2 micro-payments, scaling off-chain, speed, low fees), BTCPay Server, BTCMap.org, circular economies (Bitcoin Beach El Salvador, Kenya, Arnhem).
      - Module 8 (How Bitcoin Works): Public-key cryptography, SHA-256 hash function (Deterministic, Pre-image resistance, Avalanche effect, Collision resistance, Fast to verify), UTXO model ("change" output).
      - Module 9 (How Does Bitcoin Mining Work?): Nodes (Gatekeepers of validation, run by ordinary people, verify rules) vs Miners (architects of security, perform Proof-of-Work to solve hashes, earn block rewards & fees), Halvings (rewards cut in half every 210,000 blocks - e.g., 2028 reward will be 1.5625 BTC), Difficulty adjustment (every 2,016 blocks or ~2 weeks).
      - Module 10 (What Future Can Bitcoin Build?): Hyperbitcoinization, strategic reserves, philosophy of personal responsibility, energy stabilization (mining stranded energy).

      STRICT BITCOIN-ONLY BEHAVIOR:
      1. This chatbot is strictly for Bitcoin Diploma and Bitcoin Education queries.
      2. Keep responses 100% focused on Bitcoin and sound money.
      3. If asked about other cryptocurrencies (altcoins/shitcoins) or CBDCs, objectively contrast how they lack absolute scarcity, expose users to centralization, pre-mines, or compromise privacy, while Bitcoin remains the ultimate neutral sound asset.
      4. If user asks questions completely unrelated to Bitcoin education, finance, or monetary history, warmly decline: "As your Bitcoin Diploma lead instructor, I'm here to guide you through sound money and Bitcoin! Let's stay focused on the syllabus so we can stack real Sats in this info-packed course. What question can I answer for you about any of our 10 modules?"
      5. Provide positive, encouraging, and highly educational feedback. Maintain a clean, professional, and inspiring tone. Never give negative sentiment about the long-term utility of Bitcoin. Be helpful, clear, and informative. Ensure any answers directly map to the Bitcoin Diploma principles.`;

      // Format history
      let formattedHistory: Array<{ role: string; parts: Array<{ text: string }> }> = [];
      if (history && Array.isArray(history)) {
         formattedHistory = history.map((msg: any) => ({
             role: msg.role === 'assistant' ? 'model' : 'user',
             parts: [{ text: msg.content || "" }],
         }));
      }

      const chatContents = [...formattedHistory];
      if (question) {
         chatContents.push({ role: 'user', parts: [{ text: question }] });
      }

      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: chatContents,
        config: {
          systemInstruction,
        }
      });
      
      res.json({ answer: (response.text || "").trim() });

    } catch (err: any) {
      console.error(err);
      res.status(err.status || 500).json({ error: err.message || "Failed to generate answer from Instructor Bot" });
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
    // Production serving
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
