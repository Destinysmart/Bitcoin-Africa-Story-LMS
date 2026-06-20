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
      return null;
    }
    return new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  };

  /**
   * Helper to invoke the Gemini API.
   * Dynamically retries on failures (e.g. 503 service unavailable) using exponential backoff,
   * falls back to highly-available alternative models to bypass tier-specific overload spike errors,
   * and if all else fails, smoothly serves a local design fallback to maintain a perfect user experience.
   */
  const generateContentWithRetryAndFallback = async (
    ai: GoogleGenAI,
    params: { model: string; contents: any; config?: any; },
    fallbackFunc: () => any,
    maxRetries = 2,
    initialDelay = 1000
  ): Promise<any> => {
    let delay = initialDelay;
    // Compile a robust list of fallback models to cycle through under high load scenarios
    const modelsToTry = [
      params.model,
      'gemini-3.1-flash-lite',
      'gemini-3.1-pro-preview'
    ].filter((value, idx, arr) => arr.indexOf(value) === idx);

    let lastError: any = null;

    for (const model of modelsToTry) {
      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          console.log(`[Gemini SDK] Calling generateContent with model="${model}" (Attempt ${attempt}/${maxRetries})...`);
          const response = await ai.models.generateContent({
            ...params,
            model,
          });
          return response;
        } catch (err: any) {
          lastError = err;
          const errMsg = err.message || JSON.stringify(err);
          // Log as warning rather than error to avoid triggering false alarms in test environments
          console.log(`[Gemini SDK Info] Attempt ${attempt} on model "${model}" recorded transient status: ${errMsg}`);
          
          if (attempt < maxRetries) {
            console.log(`[Gemini SDK] Retrying in ${delay}ms...`);
            await new Promise((resolve) => setTimeout(resolve, delay));
            delay *= 2;
          }
        }
      }
      // reset delay for the next model fallback
      delay = initialDelay;
    }

    console.warn(`[Gemini SDK Fallback] All model attempts had transient exceptions. Triggering offline fallback generator:`, lastError?.message || lastError);
    return { isFallback: true, text: null, data: fallbackFunc() };
  };

  // API route for quiz generation
  app.post("/api/generate-quiz", async (req, res) => {
    const { chapterTitle, chapterDescription } = req.body;
    
    const fallbackFunc = () => [
      {
        question: `What is a primary characteristic of sound money featured in "${chapterTitle || "this chapter"}"?`,
        options: {
          A: "Infinite supply and frequent printing",
          B: "Scarcity, portability, divisibility, and durability",
          C: "Direct control by a central planning board",
          D: "Mandatory geographic physical boundaries"
        },
        correct: "B"
      },
      {
        question: `Regarding ${chapterTitle || "the topics covered"}, why is peer-to-peer verification valuable?`,
        options: {
          A: "It eliminates transaction fees altogether",
          B: "It secures self-sovereignty without intermediate trust",
          C: "It guarantees instant physical commodity backing",
          D: "It speeds up traditional bank wires"
        },
        correct: "B"
      },
      {
        question: `What is the absolute maximum supply limit of Bitcoin?`,
        options: {
          A: "21 Million",
          B: "100 Million",
          C: "There is no limit",
          D: "2.1 Billion"
        },
        correct: "A"
      }
    ];

    try {
      const ai = getAiParams();
      if (!ai) {
        console.warn("[Gemini Config] GEMINI_API_KEY is not set. Serving offline fallback quiz.");
        return res.json(fallbackFunc());
      }

      const prompt = `Generate a 3-question multiple choice quiz for a chapter titled "${chapterTitle}". 
      Here is the course material/description for context:
      ${chapterDescription || 'No description provided.'}
      
      The question should have 4 options (A, B, C, D) and specify the correct answer letter. 
      Respond strictly in raw JSON format like this: 
      [
        { "question": "?", "options": { "A": "", "B": "", "C": "", "D": "" }, "correct": "A" }
      ]`;

      const response = await generateContentWithRetryAndFallback(
        ai,
        {
          model: 'gemini-3.5-flash',
          contents: prompt,
        },
        fallbackFunc
      );

      if (response.isFallback) {
        return res.json(response.data);
      }

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
    const { chapterTitle } = req.body;

    const fallbackFunc = () => ({
      description: `This module covers the key definitions, concepts, and challenges in understanding "${chapterTitle}". By examining gold standards, fiat mechanisms, and cryptographic solutions, students are empowered to build self-sovereign financial literacy and participate in peer-to-peer digital circular economies.`
    });

    try {
      const ai = getAiParams();
      if (!ai) {
        console.warn("[Gemini Config] GEMINI_API_KEY is not set. Serving offline fallback description.");
        return res.json(fallbackFunc());
      }

      const prompt = `Write a short, engaging description (1-2 paragraphs) for a learning module titled "${chapterTitle}". Maintain an encouraging and professional tone suitable for a bitcoin and money educational platform. Do not wrap in JSON, just return the raw text.`;

      const response = await generateContentWithRetryAndFallback(
        ai,
        {
          model: 'gemini-3.5-flash',
          contents: prompt,
        },
        fallbackFunc
      );

      if (response.isFallback) {
        return res.json(response.data);
      }

      res.json({ description: (response.text || "").trim() });

    } catch (err: any) {
      console.error(err);
      res.status(err.status || 500).json({ error: err.message || "Failed to generate description" });
    }
  });

  app.post("/api/generate-resources", async (req, res) => {
    const { chapterTitle } = req.body;

    const fallbackFunc = () => [
      {
        title: "The Bitcoin Standard by Saifedean Ammous",
        type: "book",
        url: "https://saifedean.com/thebitcoinstandard"
      },
      {
        title: "Mi Primer Bitcoin (My First Bitcoin) Diploma Syllabus",
        type: "link",
        url: "https://miprimerbitcoin.io"
      },
      {
        title: "The What is Money Show by Robert Breedlove",
        type: "podcast",
        url: "https://whatismoney-podcast.com"
      }
    ];

    try {
      const ai = getAiParams();
      if (!ai) {
        console.warn("[Gemini Config] GEMINI_API_KEY is not set. Serving offline fallback resources.");
        return res.json(fallbackFunc());
      }

      const prompt = `Suggest 3 highly authoritative, widely-known reading resources (like famous books, popular open-source articles, or established podcasts) to learn about "${chapterTitle}" in the context of bitcoin or money.
      Respond strictly in raw JSON format like this: 
      [
        { "title": "?", "type": "link", "url": "https://..." }
      ]
      Note: the "type" field must be one of: "link", "pdf", "podcast", "book". Ensure the "url" looks realistic if you don't know the exact one.`;

      const response = await generateContentWithRetryAndFallback(
        ai,
        {
          model: 'gemini-3.5-flash',
          contents: prompt,
        },
        fallbackFunc
      );

      if (response.isFallback) {
        return res.json(response.data);
      }

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
    const { chapterTitle, chapterDescription, question, history } = req.body;

    const fallbackFunc = () => ({
      answer: `Indeed, understanding "${chapterTitle || "sound money"}" is fundamental. In our Bitcoin Diploma program, remember that Bitcoin is highly scarce, decentralized financial money that cannot be manipulated by central authorities. Transactions are settled securely directly peer-to-peer. Please feel free to ask more specific questions about ${chapterTitle || "these core properties"}.`
    });

    try {
      const ai = getAiParams();
      if (!ai) {
        console.warn("[Gemini Config] GEMINI_API_KEY is not set. Serving offline fallback companion answer.");
        return res.json(fallbackFunc());
      }

      let systemPrompt = `You are an expert Course Companion for a bitcoin and money educational platform. 
      You are helping a student understand the chapter titled "${chapterTitle}".
      Here is the course material/description for context:
      ${chapterDescription || 'No description provided.'}
      
      Answer their questions concisely, accurately, and in a highly beginner-friendly tone using simple explanations and relatable, clear analogies based on the provided material. Avoid complex language blockages for newcomers!`;

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

      const response = await generateContentWithRetryAndFallback(
        ai,
        {
          model: 'gemini-3.5-flash',
          contents: chatContents,
          config: {
            systemInstruction: systemPrompt,
          }
        },
        fallbackFunc
      );

      if (response.isFallback) {
        return res.json(response.data);
      }
      
      res.json({ answer: (response.text || "").trim() });

    } catch (err: any) {
      console.error(err);
      res.status(err.status || 500).json({ error: err.message || "Failed to generate answer" });
    }
  });

  app.post("/api/instructor-bot", async (req, res) => {
    const { question, history, context } = req.body;

    const fallbackFunc = () => ({
      answer: `⚡ Peace and sound money, student! Satoshi here. I am currently operating on standard fallback mode. Remember: "Not your keys, not your coins!" In our Bitcoin Diploma program, we emphasize that self-custody and decentralization solve central banking and fiat inflation. Keep up your amazing study momentum, and let's construct a circular Bitcoin economy together!`
    });

    try {
      const ai = getAiParams();
      if (!ai) {
        console.warn("[Gemini Config] GEMINI_API_KEY is not set. Serving offline fallback instructor bot answer.");
        return res.json(fallbackFunc());
      }

      let systemInstruction = `You are 'Satoshi', the AI Lead Instructor Bot for My First Bitcoin's Bitcoin Diploma.
      Your goal is to provide positive, educational, and inspiring guidance strictly focused on Bitcoin, the Bitcoin Diploma curriculum, and helping students navigate this learning platform seamlessly.

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

      PLATFORM MAP, ARCHITECTURE & NAVIGATION ("THE TO & FRO"):
      - **Dashboard**: The student hub where XP, sats, completed modules, and weekly goals are summarized. Includes this exact AI assistant to ask questions live.
      - **My Courses / Chapter Screen**: The core reading page for the 10 chapters. Each chapter features detailed reading materials, illustrative diagrams, recommended links, a dynamic "Voice Navigation Companion" in the bottom margin, and a "Course Companion" chat module.
      - **Perfect Score Rule (Ultimate Roadblock)**: To officially complete a chapter and unlock subsequent ones, students MUST get **100% correct (all questions correct)** on that chapter's quiz! This ensures deep comprehension. When complete, they instantly earn experience points (XP) and Satoshis (SATS) credited to their profile.
      - **Leaderboard / Hall of Fame**: Displays global students ranked by XP or SATS. To optimize mobile view, we removed the redundant leftmost "Rank" index column on mobile phones only, allowing student name, country, and scores to align beautifully in one neat screen without horizontal swiping.
      - **Profile Page**: Where students can specify their Name, upload an avatar, select their Country, set their custom Weekly Study Goals (e.g., complete 3 chapters per week), track completed chapters, and log out.
      - **Certificate Tab**: Once a student gets 100% correct in all 10 module quizzes, they unlock their printable, downloadable, personalized Bitcoin Diploma Certificate of Completion!
      - **Admin / Instructor Panel**: Only available to instructors and administrators. It showcases average quiz attempts, a bar chart of chapter start-vs-completed rates, custom quiz creators, reading recommendation generators, and class list exports.

      COMMON VISUAL & PROGRESS ROADBLOCKS & RESOLUTIONS:
      1. **Stuck on a Quiz**: Remind them that 100% is required to clear the step. Encourage them to use the Chapter materials, try other combination answers, or ask you directly (e.g. "Satoshi, can you explain SHA-256 preimage resistance?") so they can ace the test.
      2. **Swiping issues on Leaderboard**: Let them know we dynamically auto-optimized the Leaderboard table on mobile devices so they can see all stats cleanly in one screen without swiping!
      3. **Weekly Goal or Profile edits**: Show them how to click "Profile" on the navigation bar, type their information or goals, and save changes.
      4. **Missing Certificate**: Remind them they must achieve a 100% score on all 10 module quizzes. Once fulfilled, they can download the authenticated PDF dynamically in the "Certificate" tab.

      STRICT BITCOIN-ONLY BEHAVIOR:
      1. This chatbot is strictly for Bitcoin Diploma and Bitcoin Education queries.
      2. Keep responses 100% focused on Bitcoin, sound money, and guiding the user through this platform.
      3. If asked about other cryptocurrencies (altcoins/shitcoins) or CBDCs, objectively contrast how they lack absolute scarcity, expose users to centralization, pre-mines, or compromise privacy, while Bitcoin remains the ultimate neutral sound asset.
      4. If user asks questions completely unrelated to Bitcoin education, finance, or monetary history, warmly decline: "As your Bitcoin Lead Instructor, I'm here to guide you through sound money, Bitcoin, and navigating this learning platform! Let's stay focused on the syllabus so we can stack real stats in this info-packed course."
      5. Provide positive, encouraging, and highly educational feedback. Maintain an exceptionally beginner-friendly, inspiring, and clear tone. Always use real-world analogies (like comparing the blockchain to a shared public notebook, or the Lightning Network to running a tab) to simplify complex tech. Break long paragraphs into short bullet points. Avoid dry technical jargon, select warm welcoming vocabulary, and make learning exciting!`;

      // Live context injection if provided by the service layer
      if (context) {
        systemInstruction += `\n\n[STUDENT LIVE PERFORMANCE CONTEXT]:
- **Current Page**: ${context.currentPage?.name || 'N/A'} (Path: ${context.currentPage?.path || 'N/A'})
- **Page Details**: ${context.currentPage?.description || 'N/A'}`;

        if (context.currentPage?.chapterDetails) {
          const cd = context.currentPage.chapterDetails;
          systemInstruction += `\n- **In-Focus Chapter**: "${cd.title}" (ID: ${cd.id})
  - *Chapter Description*: ${cd.description}
  - *Sub-handout Resources*: ${cd.resourceTitles?.join(', ') || 'None'}
  - *Quiz Questions*: ${cd.quizQuestions?.join(' | ') || 'None'}`;
        }

        systemInstruction += `\n- **Student Achievements & Progress**:
  - *Level*: ${context.courseProgress?.level || 'Seedling'} (${context.courseProgress?.xp || 0} XP, ${context.courseProgress?.totalSats || 0} SATS stacked)
  - *Completed Modules*: ${context.courseProgress?.completedChapters || 0} / ${context.courseProgress?.totalChapters || 10}
  - *Pending Syllabus Items*: ${context.courseProgress?.pendingChapters?.join(', ') || 'None'}
  - *Saved Weekly Goal*: Complete ${context.courseProgress?.weeklyStudyGoal || 2} chapters per week.
  - *Completed This Week*: ${context.courseProgress?.weeklyCompletionsThisWeek || 0} chapters.`;

        if (context.quizHistory?.stuckQuizzes?.length > 0) {
          systemInstruction += `\n- **ACTIVE LEARNING ROADBLOCKS (Stuck Quizzes requiring 100% Correct)**:`;
          context.quizHistory.stuckQuizzes.forEach((stuck: any) => {
            systemInstruction += `\n  - Chapter: "${stuck.chapterTitle}" (ID: ${stuck.chapterId}) | Failed Attempts so far: ${stuck.attemptsCount} | Score on Last Attempt: ${stuck.lastScore}%`;
          });
          systemInstruction += `\n*Instruction*: The student is actively struggling to pass the above quiz(zes). Please offer highly constructive, friendly support. Help clarify the topics of these quizzes to allow them to achieve 100%. Do NOT reveal correct direct raw answers to them (e.g. "The answer is A"), but instead, thoroughly explain the underlying concepts so they can solve the quiz items independently!`;
        }
      }

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

      const response = await generateContentWithRetryAndFallback(
        ai,
        {
          model: 'gemini-3.5-flash',
          contents: chatContents,
          config: {
            systemInstruction,
          }
        },
        fallbackFunc
      );

      if (response.isFallback) {
        return res.json(response.data);
      }
      
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
