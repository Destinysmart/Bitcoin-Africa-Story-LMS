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
             parts: [{ text: msg.content }],
         }));
      }

      const chatContents = [
         ...formattedHistory,
         { role: 'user', parts: [{ text: question }] }
      ];

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
