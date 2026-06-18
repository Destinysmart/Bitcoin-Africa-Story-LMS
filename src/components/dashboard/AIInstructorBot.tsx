import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { getCurrentUser } from '../../lib/storage';
import { 
  MessageSquare, 
  Send, 
  Sparkles, 
  User, 
  Trash2, 
  Copy, 
  Check, 
  Zap, 
  Activity, 
  Cpu, 
  Compass, 
  Coins, 
  BookOpen, 
  HelpCircle,
  Mic,
  MicOff
} from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';
import { useTheme } from '../../contexts/ThemeContext';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

const PRESET_PROMPTS = [
  { text: "What roles does money play?", icon: Coins },
  { text: "How is Bitcoin different from bank money?", icon: Cpu },
  { text: "What is the Lightning Network?", icon: Zap },
  { text: "Explain the Cantillon Effect simply", icon: Compass }
];

// Helper to format text markdown dynamically into modern polished components
function parseBoldAndInlineCode(text: string, theme: 'light' | 'dark') {
  if (!text) return '';
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={i} className={`font-extrabold tracking-tight px-1 rounded ${
          theme === 'light' ? 'text-gray-950 bg-gray-100' : 'text-white bg-white/5'
        }`}>
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code key={i} className="font-mono text-[11px] bg-brand-gold/15 border border-brand-gold/25 text-brand-gold px-1.5 py-0.5 rounded leading-relaxed inline-block mx-0.5 whitespace-nowrap">
          {part.slice(1, -1)}
        </code>
      );
    }
    return part;
  });
}

function BitcoinFormattedText({ text }: { text: string }) {
  const { theme } = useTheme();
  if (!text) return null;
  const lines = text.split('\n');

  return (
    <div className={`space-y-2.5 text-xs md:text-sm leading-relaxed ${
      theme === 'light' ? 'text-gray-800' : 'text-gray-200'
    }`}>
      {lines.map((line, idx) => {
        const trimmed = line.trim();

        // Level 3 Headers
        if (trimmed.startsWith('### ')) {
          return (
            <h4 key={idx} className="text-xs font-bold text-brand-gold mt-3 mb-1 tracking-wide flex items-center gap-1.5 uppercase font-mono">
              <span className="inline-block w-1.5 h-3 bg-brand-gold rounded-full" />
              {parseBoldAndInlineCode(trimmed.substring(4), theme)}
            </h4>
          );
        }

        // Level 2 Headers
        if (trimmed.startsWith('## ')) {
          return (
            <h3 key={idx} className={`text-sm font-extrabold mt-4 mb-2 tracking-tight flex items-center gap-2 ${
              theme === 'light' ? 'text-gray-900' : 'text-white'
            }`}>
              <span className="w-2 h-2 bg-brand-gold rotate-45 shrink-0" />
              {parseBoldAndInlineCode(trimmed.substring(3), theme)}
            </h3>
          );
        }

        // Level 1 Headers
        if (trimmed.startsWith('# ')) {
          return (
            <h2 key={idx} className={`text-base font-black mt-4 mb-2 tracking-tight border-b pb-1 ${
              theme === 'light' ? 'text-gray-950 border-gray-100' : 'text-white border-white/5'
            }`}>
              {parseBoldAndInlineCode(trimmed.substring(2), theme)}
            </h2>
          );
        }

        // Bullet Lists
        if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
          return (
            <div key={idx} className="flex items-start gap-2.5 ml-1 my-1">
              <span className="inline-flex items-center justify-center w-1.5 h-1.5 rounded-full bg-brand-gold mt-2 shrink-0 shadow-[0_0_8px_rgba(253,184,19,0.8)]" />
              <div className={theme === 'light' ? 'text-gray-700' : 'text-gray-300'}>
                {parseBoldAndInlineCode(trimmed.substring(2), theme)}
              </div>
            </div>
          );
        }

        // Numbered Lists
        const matchNum = trimmed.match(/^(\d+)\.\s(.*)/);
        if (matchNum) {
          return (
            <div key={idx} className="flex items-start gap-2 ml-1 my-1">
              <span className="text-[9px] font-mono font-bold bg-brand-gold/10 text-brand-gold border border-brand-gold/25 px-1.5 py-0.5 rounded mt-0.5 min-w-[18px] text-center">
                {matchNum[1]}
              </span>
              <div className={theme === 'light' ? 'text-gray-700' : 'text-gray-300'}>
                {parseBoldAndInlineCode(matchNum[2], theme)}
              </div>
            </div>
          );
        }

        // Blockquotes
        if (trimmed.startsWith('> ')) {
          return (
            <blockquote key={idx} className={`border-l-2 bg-brand-gold/5 px-3 py-2 rounded-r-xl my-2 text-xs italic ${
              theme === 'light' ? 'border-brand-gold/50 bg-brand-gold/[0.03] text-gray-600' : 'border-brand-gold/40 bg-brand-gold/5 text-gray-400'
            }`}>
              {parseBoldAndInlineCode(trimmed.substring(2), theme)}
            </blockquote>
          );
        }

        // Spacing paragraphs
        if (trimmed === '') {
          return <div key={idx} className="h-1.5" />;
        }

        return (
          <p key={idx} className={`text-xs md:text-sm font-sans leading-relaxed ${
            theme === 'light' ? 'text-gray-800' : 'text-gray-300/95'
          }`}>
            {parseBoldAndInlineCode(line, theme)}
          </p>
        );
      })}
    </div>
  );
}

export function AIInstructorBot() {
  const { theme } = useTheme();
  const user = getCurrentUser();
  const chatKey = user ? `bas_instructor_chat_${user.email}` : 'bas_instructor_chat_guest';
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const confirmTimeoutRef = useRef<any>(null);
  
  // Voice recognition states
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);
  const [speechNotes, setSpeechNotes] = useState('');
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognitionAPI) {
      setSpeechSupported(false);
    }
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
      if (confirmTimeoutRef.current) {
        clearTimeout(confirmTimeoutRef.current);
      }
    };
  }, []);

  const startListening = () => {
    const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognitionAPI) {
      setErrorMsg("Voice typing is not supported by your current web browser. Try using Google Chrome, Apple Safari, or Microsoft Edge!");
      return;
    }

    try {
      setErrorMsg('');
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }

      const rec = new SpeechRecognitionAPI();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = 'en-US';

      rec.onstart = () => {
        setIsListening(true);
        setSpeechNotes('🎙️ Listening... Speak your question clearly into your microphone now!');
      };

      rec.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setInput(prev => prev ? `${prev} ${transcript}` : transcript);
          setSpeechNotes('');
        }
      };

      rec.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error);
        if (event.error === 'not-allowed') {
          setErrorMsg("Microphone permission denied. Please allow microphone access in your browser address bar settings to talk!");
        } else {
          setErrorMsg(`Voice typing paused: ${event.error}`);
        }
        setIsListening(false);
        setSpeechNotes('');
      };

      rec.onend = () => {
        setIsListening(false);
        setSpeechNotes('');
      };

      recognitionRef.current = rec;
      rec.start();
    } catch (err) {
      console.error("Speech recognition start failed:", err);
      setIsListening(false);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Load chat history or set initial welcoming message
  useEffect(() => {
    const saved = localStorage.getItem(chatKey);
    if (saved) {
      try {
        setMessages(JSON.parse(saved));
      } catch (e) {
        setMessages(getInitialWelcome());
      }
    } else {
      setMessages(getInitialWelcome());
    }
  }, [chatKey]);

  // Scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const getInitialWelcome = (): Message[] => [
    {
      role: 'assistant',
      content: `Welcome to your learning journey! ₿ I am **Satoshi**, your friendly AI companion for the **Bitcoin Diploma**.\n\nWhether you are an absolute beginner or already know a little, I am here to help you make sense of money, banking, wallets, and Bitcoin in a simple, friendly way with no confusing jargon!\n\nWhat question can I make easy for you today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ];

  const persistMessages = (newMsgs: Message[]) => {
    setMessages(newMsgs);
    localStorage.setItem(chatKey, JSON.stringify(newMsgs));
  };

  const getOfflineSatoshiResponse = (q: string): string => {
    const query = q.toLowerCase();
    
    if (query.includes('cantillon') || query.includes('unequal') || query.includes('print') || query.includes('fiat') || query.includes('inflation') || query.includes('power') || query.includes('depreciate') || query.includes('central bank') || query.includes('debt')) {
      return `Hey there! Since we are studying offline, let me explain **Fiat Money and Inflation** directly:

*   **What is Fiat Money?** It is money declared by a government decree, backed only by trust. Because central banks can print unlimited amounts of fiat, the supply expands constantly.
*   **Monetary Inflation:** This unlimited printing dilutes the value of existing currency, causing your purchasing power to drop.
*   **The Cantillon Effect:** When new fiat is printed, those closest to the printer (banks, governments, ultra-wealthy) get to spend it first before prices rise. By the time it trickles down to ordinary citizens, prices have already soared. This creates extreme systemic inequality.

Bitcoin solves this by having a hard-coded maximum supply limit of strictly **21 Million** coins.`;
    }
    
    if (query.includes('lightning') || query.includes('layer 2') || query.includes('layer2') || query.includes('micro-payment') || query.includes('channel') || query.includes('fast') || query.includes('speed') || query.includes('fee')) {
      return `Great question! Here is how the **Lightning Network** acts as Bitcoin's Layer 2 solution:

*   **The Scaling Challenge:** Bitcoin's main blockchain averages 10-minute block times for security. This cannot directly handle millions of global daily coffee purchases.
*   **The Solution:** The Lightning Network operates "off-chain." It allows users to open secure, bidirectional payment channels.
*   **The Result:** You can send payments instantly with virtually zero transaction fees. It's like keeping an ongoing tab at a bar—only settles on the main blockchain when the tab is closed. This empowers real-world circular economies, just like in El Salvador's El Zonte!`;
    }
    
    if (query.includes('wallet') || query.includes('key') || query.includes('seed') || query.includes('custody') || query.includes('private') || query.includes('phrase') || query.includes('cold') || query.includes('hot')) {
      return `Satoshi here! Let's talk about **Self-Custody and Wallets**:

*   **Private Key:** It is a giant random number (represented as a 12 or 24-word seed phrase) that proves ownership of your coins. Anyone with access to your seed phrase has full control over your funds.
*   **Public Key / Address:** Think of this as your email address. It's safe to share so people can send you Bitcoin.
*   **The Golden Rule:** **"Not your keys, not your coins."**
    *   *Custodial:* A third-party exchange holds the private key. If they block you or go bankrupt, your funds are gone.
    *   *Self-Custodial:* You hold the private keys. No middleman can censor or touch your wealth.
    *   *Cold Storage:* Hardware wallets kept offline. These are the safest, most secure vault option.`;
    }
    
    if (query.includes('mining') || query.includes('proof of work') || query.includes('pow') || query.includes('hash') || query.includes('halving') || query.includes('halve') || query.includes('reward') || query.includes('sha-256') || query.includes('sha256') || query.includes('difficulty')) {
      return `Welcome to the core of Bitcoin security! Let's examine **Bitcoin Mining & Proof-of-Work (PoW)**:

*   **How Mining Works:** Miners compete using specialized computing power to solve a highly complex mathematical puzzle based on the **SHA-256** hash function. This process requires real-world physics and energy.
*   **Proof-of-Work:** Once solved, a block of valid transactions is immutable. Re-writing history would require recalculating all subsequent blocks, which is mathematically impossible, securing the ledger.
*   **The Halving:** Every 210,000 blocks (about every 4 years), the block reward issued to miners is cut in half. This makes Bitcoin increasingly scarce over time.
*   **Difficulty Adjustment:** Every 2,016 blocks (~2 weeks), Bitcoin automatically adjusts how hard the puzzle is to ensure blocks always average exactly 10 minutes. It's Bitcoin's ultimate self-regulating thermostat.`;
    }
    
    if (query.includes('node') || query.includes('nodes') || query.includes('validate') || query.includes('verify') || query.includes('rule') || query.includes('consensus')) {
      return `This is a very important distinction: **Nodes vs. Miners**:

*   **Miners:** They compete to bundle new transactions into blocks, providing security via Proof-of-Work energy expenditure.
*   **Nodes:** They are the individual gatekeepers of the network. Ordinary people run nodes on simple home computers.
*   **Consensus Rules:** Nodes validate every transaction and block to ensure miners aren't cheating (such as printing extra coins, or double-spending).
*   **Your Sovereignty:** By running your own node, you don't have to trust anyone else to tell you the state of the ledger. You enforce the rules of the system yourself!`;
    }
    
    if (query.includes('cypherpunks') || query.includes('hal finney') || query.includes('finney') || query.includes('genesis') || query.includes('nakamoto') || query.includes('satoshi') || query.includes('whitepaper') || query.includes('2008') || query.includes('2009')) {
      return `Peace, scholar! Let's travel back to the **Origins of Bitcoin**:

*   **The Cypherpunks:** A group of passionate scientists, developers, and activists who advocated for privacy and free speech using cryptography. Legendary names include Eric Hughes, Timothy May, and Hal Finney.
*   **The Whitepaper:** On October 31, 2008, Satoshi Nakamoto released the Bitcoin Whitepaper titled *"Bitcoin: A Peer-to-Peer Electronic Cash System"*.
*   **The Genesis Block:** On January 3, 2009, Satoshi mined the first block (Genesis Block) containing the immortalized Times headline: *"The Times 03/Jan/2009 Chancellor on brink of second bailout for banks"*, signaling Bitcoin's purpose as a peaceful alternative to failing central banking.
*   **Hal Finney:** A brilliant cryptographer who received the very first Bitcoin transaction from Satoshi. He is one of Bitcoin's most important early pioneers.`;
    }
    
    if (query.includes('cbdc') || query.includes('cbdcs') || query.includes('digital currency') || query.includes('stablecoin') || query.includes('altcoin') || query.includes('crypto')) {
      return `Let's clarify the fundamental difference between **Bitcoin vs. CBDCs & Crypto**:

*   **CBDCs (Central Bank Digital Currencies):** They are simply digital government fiat with upgraded surveillance capabilities, full programmability, and zero privacy. The issuer can alter interest rates, track your spending, or freeze your funds at the click of a button.
*   **Crypto / Altcoins:** These projects are overwhelmingly centralized, controlled by founders or foundations, heavily pre-mined, and can alter consensus rules at whim.
*   **Bitcoin:** It has **no CEO, no founders, and no central pre-mine**. It is completely decentralized, globally neutral, open-source, and has a strictly immutable supply of 21 Million. It is sound peer-to-peer money.`;
    }
    
    if (query.includes('money') || query.includes('store of value') || query.includes('medium of exchange') || query.includes('unit of account') || query.includes('scarcity') || query.includes('barter') || query.includes('gold')) {
      return `Let's break down the **Core Fundamentals of Money**:

*   **Three Functions of Money:**
    1.  *Medium of Exchange:* Used to trade goods without the struggle of barter (the *Double Coincidence of Wants*).
    2.  *Store of Value:* Preserves your purchasing power and hard work across future time.
    3.  *Unit of Account:* A standard numeric measure to price goods and services.
*   **Key Properties:** For something to serve as good money, it must be **Scarce, Divisible, Portable, Durable, and Acceptable**.
*   **Gold Standard:** Societies gold-backed paper slips until governments printed more paper than gold existed, leading to the collapse of the gold standard and the birth of infinite fiat debt.`;
    }
    
    return `Greetings, student! Satoshi here. We are currently operating in our highly advanced **Offline Learning Mode** which guarantees 100% stable performance with zero internet dependencies!

As your Bitcoin Diploma lead instructor, I am here to discuss the entire 10-chapter curriculum:
*   **Modules 1-3:** What is Money, History of Money, and the Fiat Debt System.
*   **Modules 4-5:** The Cypherpunk movement and Satoshi's Whitepaper.
*   **Modules 6-7:** Setting up self-custody wallets and utilizing the instant Lightning Network.
*   **Modules 8-9:** SHA-256 cryptography, the UTXO model, Nodes, and Proof-of-Work Mining.
*   **Module 10:** Hyperbitcoinization and building local circular economies.

What key concept or module would you like me to make simple for you today?`;
  };

  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim() || loading) return;
    
    setErrorMsg('');
    const userMsg: Message = {
      role: 'user',
      content: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const updatedHistory = [...messages, userMsg];
    persistMessages(updatedHistory);
    setInput('');
    setLoading(true);

    // If completely offline (navigator.onLine is false), immediately run local generation with zero delay
    if (!navigator.onLine) {
      setTimeout(() => {
        const localAnswer = getOfflineSatoshiResponse(userMsg.content);
        const assistantMsg: Message = {
          role: 'assistant',
          content: localAnswer,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        persistMessages([...updatedHistory, assistantMsg]);
        setLoading(false);
      }, 600);
      return;
    }

    try {
      const apiHistory = updatedHistory.slice(0, -1).map(m => ({
        role: m.role,
        content: m.content
      }));

      const res = await fetch('/api/instructor-bot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: userMsg.content,
          history: apiHistory
        })
      });

      if (!res.ok) {
        throw new Error('Connection timed out. Please retry in a few moments.');
      }

      const data = await res.json();
      
      const assistantMsg: Message = {
        role: 'assistant',
        content: data.answer || "I'm sorry, I couldn't generate a response. Let's retry that question!",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      persistMessages([...updatedHistory, assistantMsg]);
    } catch (e: any) {
      console.warn("Instructor bot connection failed, rolling back seamlessly to offline model logic:", e);
      // Seamlessly fall back if request fails (e.g. server down or intermittent packet drop)
      const localAnswer = getOfflineSatoshiResponse(userMsg.content);
      const assistantMsg: Message = {
        role: 'assistant',
        content: localAnswer + "\n\n*(Note: Reconnect to internet for live cloud answers)*",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      persistMessages([...updatedHistory, assistantMsg]);
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
    if (!showConfirmDelete) {
      setShowConfirmDelete(true);
      if (confirmTimeoutRef.current) clearTimeout(confirmTimeoutRef.current);
      confirmTimeoutRef.current = setTimeout(() => {
        setShowConfirmDelete(false);
      }, 4000);
    } else {
      if (confirmTimeoutRef.current) clearTimeout(confirmTimeoutRef.current);
      setShowConfirmDelete(false);
      persistMessages(getInitialWelcome());
      setErrorMsg('');
    }
  };

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedId(index);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className={`flex flex-col h-[520px] md:h-[650px] lg:h-[720px] rounded-2xl overflow-hidden relative font-sans transition-all duration-300 ${
      theme === 'light'
        ? 'bg-white border border-gray-200/80 shadow-[0_16px_48px_rgba(0,0,0,0.06)] text-gray-800'
        : 'bg-[#0b0b0b] border border-white/5 shadow-[0_24px_60px_rgba(0,0,0,0.8)] text-gray-200'
    }`}>
      
      {/* ChatGPT-style Sleek Header Bar */}
      <div className={`px-4 py-3 md:px-6 md:py-4 border-b flex items-center justify-between relative z-10 shrink-0 transition-colors ${
        theme === 'light'
          ? 'border-gray-100 bg-gray-50/90'
          : 'border-white/5 bg-[#0d0d0d]/90 backdrop-blur-md'
      }`}>
        <div className="flex items-center gap-2">
          <div className={`flex items-center gap-1.5 cursor-pointer px-2.5 py-1.5 rounded-xl transition-all select-none ${
            theme === 'light' ? 'hover:bg-gray-100' : 'hover:bg-white/5'
          }`}>
            <span className="text-brand-gold font-black text-sm md:text-base">Satoshi AI</span>
            <span className={`text-xs text-[10px] md:text-[11px] font-medium font-sans ${theme === 'light' ? 'text-gray-500' : 'text-gray-500'}`}>3.5</span>
            <span className={`text-[10px] ml-0.5 mt-0.5 ${theme === 'light' ? 'text-gray-400' : 'text-gray-500'}`}>▼</span>
          </div>
          {loading && (
            <span className="inline-flex h-2 w-2 rounded-full bg-brand-gold animate-ping" />
          )}
        </div>
        
        {/* Top Right Header Controls */}
        <div className="flex items-center gap-2 md:gap-3">
          <div className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono transition-colors ${
            theme === 'light'
              ? 'bg-gray-100 border border-gray-200 text-gray-600'
              : 'bg-white/[0.02] border border-white/5 text-gray-400'
          }`}>
            <span className="w-1.5 h-1.5 rounded-full bg-status-success animate-pulse inline-block" />
            <span>Syllabus Master</span>
          </div>

          <button 
            onClick={clearChat}
            className={`px-2.5 py-1.5 rounded-xl border transition-all text-xs flex items-center gap-1.5 font-bold cursor-pointer ${
              showConfirmDelete 
                ? 'bg-status-error/10 text-status-error border-status-error/30 animate-pulse scale-102 shadow-[0_0_12px_rgba(239,68,68,0.2)]'
                : theme === 'light'
                  ? 'text-gray-500 hover:text-status-error bg-transparent border-gray-250 hover:bg-gray-100 hover:border-status-error/30'
                  : 'text-gray-400 hover:text-status-error bg-transparent border-white/5 hover:bg-white/5 hover:border-status-error/20'
            }`}
            title={showConfirmDelete ? "Click again to confirm delete!" : "Reset conversation"}
          >
            <Trash2 size={13} className={showConfirmDelete ? 'text-status-error animate-bounce' : ''} />
            <span>{showConfirmDelete ? 'Confirm?' : 'Delete Chat'}</span>
          </button>
        </div>
      </div>

      {/* Main Interactive Container Area */}
      <div className={`flex-1 overflow-hidden flex flex-col relative transition-colors ${theme === 'light' ? 'bg-gray-50/50' : 'bg-[#0d0d0d]'}`}>
        
        {messages.length <= 1 ? (
          /* ==========================================================
             CHATGPT CENTER STATE: Empty conversation view
             ========================================================== */
          <div className="flex-1 flex flex-col items-center justify-center p-4 md:p-8 max-w-2xl mx-auto w-full z-10">
            
            {/* Pulsing Central Icon */}
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.4 }}
              className={`w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center text-brand-gold font-bold text-xl md:text-3xl mb-6 select-none transition-colors ${
                theme === 'light'
                  ? 'bg-brand-gold/10 border border-brand-gold/20 shadow-[0_4px_16px_rgba(253,184,19,0.12)]'
                  : 'bg-white/[0.02] border border-white/10 shadow-[0_4px_20px_rgba(253,184,19,0.05)]'
              }`}
            >
              ₿
            </motion.div>

            {/* Central Main Headline */}
            <motion.h2 
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.4 }}
              className={`text-2xl md:text-3xl font-extrabold tracking-tight mb-8 text-center transition-colors ${
                theme === 'light' ? 'text-gray-900' : 'text-white'
              }`}
            >
              Ready when you are.
            </motion.h2>

            {/* ChatGPT Pill styled Input Panel inside center screen */}
            <motion.div 
              initial={{ y: 15, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.4 }}
              className="w-full relative group"
            >
              <div className={`px-3 py-2 md:px-4 md:py-3.5 rounded-2xl flex items-center gap-2 transition-all border ${
                theme === 'light'
                  ? 'bg-white border-gray-200 focus-within:border-gray-300 shadow-[0_8px_24px_rgba(0,0,0,0.05)]'
                  : 'bg-[#1e1e1e] border-white/5 focus-within:border-white/15 shadow-[0_8px_32px_rgba(0,0,0,0.4)]'
              }`}>
                {/* Visual plus button */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-lg select-none cursor-pointer transition-colors ${
                  theme === 'light'
                    ? 'bg-gray-100 text-gray-500 hover:text-gray-700'
                    : 'bg-white/[0.03] text-gray-400 hover:text-white'
                }`}>
                  +
                </div>

                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSend(input);
                  }}
                  disabled={loading}
                  placeholder={isListening ? "Say your question aloud..." : "Ask anything about Bitcoin..."}
                  className={`flex-1 bg-transparent border-none text-sm md:text-base outline-none focus:outline-none focus:ring-0 ${
                    theme === 'light' ? 'text-gray-900 placeholder-gray-400/80' : 'text-white placeholder-gray-500'
                  }`}
                />

                {/* Microphone Button on the right inside input bar */}
                <button
                  type="button"
                  onClick={toggleListening}
                  disabled={loading}
                  title={!speechSupported ? "Voice typing not supported" : isListening ? "Stop listening" : "Talk with Voice"}
                  className={`w-9 h-9 rounded-full flex items-center justify-center transition-all cursor-pointer border ${
                    !speechSupported
                      ? 'opacity-20 cursor-not-allowed text-gray-500 border-transparent'
                      : isListening
                        ? 'bg-[#ef4444]/20 border-[#ef4444]/40 text-[#ef4444] animate-pulse'
                        : theme === 'light'
                          ? 'bg-gray-50 text-gray-500 hover:text-gray-800 border-gray-250 hover:bg-gray-100'
                          : 'bg-white/[0.02] text-gray-400 hover:text-white border-white/5 hover:bg-white/5'
                  }`}
                >
                  <Mic size={15} className={isListening ? 'animate-bounce' : ''} />
                </button>

                {/* Rounded send action button */}
                <button
                  onClick={() => handleSend(input)}
                  disabled={!input.trim() || loading}
                  className={`w-9 h-9 rounded-full transition-all flex items-center justify-center shrink-0 border ${
                    theme === 'light'
                      ? 'bg-gray-950 text-white hover:bg-gray-800 disabled:bg-gray-100 disabled:text-gray-300 border-transparent'
                      : 'bg-white text-black hover:bg-white/95 disabled:bg-white/[0.05] disabled:text-gray-600 border-transparent'
                  }`}
                >
                  <Send size={14} className="ml-0.5" />
                </button>
              </div>

              {/* Listening status notice */}
              <AnimatePresence>
                {isListening && (
                  <motion.p 
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="text-xs text-rose-400 font-mono mt-2 text-center"
                  >
                    {speechNotes || '🎙️ Listening...'}
                  </motion.p>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Quick action suggest chips below input */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.35, duration: 0.4 }}
              className="mt-8 w-full"
            >
              <p className="text-[10px] md:text-xs text-gray-500 font-semibold mb-3 text-center uppercase tracking-widest">
                Suggested Starters
              </p>
              <div className="grid grid-cols-2 gap-2 w-full max-w-xl mx-auto">
                {PRESET_PROMPTS.map((prompt) => (
                  <button
                    key={prompt.text}
                    onClick={() => handleSend(prompt.text)}
                    className={`text-xs text-left p-3 rounded-xl transition-all flex items-start gap-2.5 cursor-pointer select-none border ${
                      theme === 'light'
                        ? 'text-gray-700 bg-white border-gray-200/80 hover:border-gray-300 hover:bg-gray-50 shadow-[0_1px_3px_rgba(0,0,0,0.02)]'
                        : 'text-gray-400 hover:text-white bg-white/[0.02] border-white/5 hover:border-white/10 hover:bg-[#1e1e1e]'
                    }`}
                  >
                    <prompt.icon size={14} className="text-brand-gold shrink-0 mt-0.5" />
                    <span className="truncate">{prompt.text}</span>
                  </button>
                ))}
              </div>
            </motion.div>

          </div>
        ) : (
          /* ==========================================================
             CHATGPT ACTIVE CONVERSATION STATE: Flowing thread
             ========================================================== */
          <div className="flex-1 flex flex-col overflow-hidden">
            
            {/* Stream List container */}
            <div className="flex-1 overflow-y-auto px-4 py-4 md:px-8 md:py-6 space-y-6 custom-scrollbar bg-transparent">
              <AnimatePresence initial={false}>
                {messages.map((msg, index) => {
                  const isUser = msg.role === 'user';
                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`max-w-3xl mx-auto flex gap-4 ${isUser ? 'justify-end' : 'justify-start'}`}
                    >
                      {/* Avatar representation */}
                      {!isUser && (
                        <div className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-brand-gold text-sm font-bold select-none border ${
                          theme === 'light'
                            ? 'bg-brand-gold/10 border-brand-gold/12'
                            : 'bg-white/[0.02] border border-white/10'
                        }`}>
                          ₿
                        </div>
                      )}

                      <div className={`flex flex-col space-y-1.5 ${isUser ? 'items-end' : 'items-start'} max-w-[85%] sm:max-w-[78%]`}>
                        {/* ChatGPT message bubbles: user uses sleek capsule, bot has plain flat text markdown */}
                        <div className={`p-3 md:p-4 rounded-2xl relative group transition-all ${
                          isUser 
                            ? theme === 'light'
                              ? 'bg-white text-gray-900 border border-gray-200 shadow-sm rounded-tr-sm'
                              : 'bg-[#1e1e1e] text-white border border-white/5 rounded-tr-sm' 
                            : 'bg-transparent border-none pl-0'
                        }`}>
                          
                          <BitcoinFormattedText text={msg.content} />

                          {/* Float clipboard on assistant responses */}
                          {!isUser && (
                            <div className="mt-2.5 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => copyToClipboard(msg.content, index)}
                                className={`px-2.5 py-1 rounded-lg text-[10px] transition-all flex items-center gap-1.5 cursor-pointer border ${
                                  theme === 'light'
                                    ? 'bg-white hover:bg-gray-100 border-gray-200 text-gray-500 hover:text-gray-800'
                                    : 'bg-white/[0.02] hover:bg-white/[0.06] border border-white/5 text-gray-400 hover:text-white'
                                }`}
                              >
                                {copiedId === index ? (
                                  <>
                                    <Check size={10} className="text-status-success animate-bounce" />
                                    <span>Copied</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy size={10} />
                                    <span>Copy</span>
                                  </>
                                )}
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Speech meta stats */}
                        <span className={`text-[9px] font-mono ${theme === 'light' ? 'text-gray-500' : 'text-gray-650'}`}>
                          {isUser ? 'You' : 'Satoshi AI'} • {msg.timestamp}
                        </span>
                      </div>
                    </motion.div>
                  );
                })}

                {/* Loader block for live text stream typing effect */}
                {loading && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="max-w-3xl mx-auto flex gap-4 justify-start pr-12"
                  >
                    <div className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-brand-gold text-sm font-bold animate-pulse border ${
                      theme === 'light'
                        ? 'bg-brand-gold/10 border-brand-gold/12'
                        : 'bg-white/[0.02] border border-white/10'
                    }`}>
                      ₿
                    </div>
                    <div className="bg-transparent py-3 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 bg-brand-gold rounded-full animate-bounce [animation-delay:-0.3s]" />
                      <span className="w-1.5 h-1.5 bg-brand-gold rounded-full animate-bounce [animation-delay:-0.15s]" />
                      <span className="w-1.5 h-1.5 bg-brand-gold rounded-full animate-bounce" />
                    </div>
                  </motion.div>
                )}

                {/* Error Box display */}
                {errorMsg && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="max-w-xl mx-auto p-3.5 bg-status-error/10 border border-status-error/20 text-status-error text-xs rounded-xl flex items-center gap-2"
                  >
                    <span className="text-sm">⚠️</span>
                    <span>{errorMsg}</span>
                  </motion.div>
                )}

              </AnimatePresence>
              <div ref={chatEndRef} />
            </div>

            {/* Chat footer dynamic dock */}
            <div className={`px-4 py-4 md:px-8 border-t shrink-0 transition-colors ${
              theme === 'light' ? 'bg-white border-gray-100' : 'bg-[#0a0a0a] border-white/5'
            }`}>
              <div className="max-w-2xl mx-auto w-full relative">
                <div className={`p-1.5 pr-2 pl-3 rounded-2xl flex items-center gap-2 border transition-all ${
                  theme === 'light'
                    ? 'bg-gray-50 border-gray-200 focus-within:border-gray-300'
                    : 'bg-[#1e1e1e] border-white/5 focus-within:border-white/12'
                }`}>
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSend(input);
                    }}
                    disabled={loading}
                    placeholder={isListening ? "Say your question aloud..." : "Message Satoshi..."}
                    className={`flex-1 bg-transparent border-none text-sm outline-none focus:outline-none focus:ring-0 ${
                      theme === 'light' ? 'text-gray-950 placeholder-gray-400/80' : 'text-white placeholder-gray-500'
                    }`}
                  />

                  {/* Mic inside doc input */}
                  <button
                    type="button"
                    onClick={toggleListening}
                    disabled={loading}
                    title={!speechSupported ? "Voice typing not supported" : isListening ? "Stop listening" : "Talk with Voice"}
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                      isListening
                        ? 'bg-[#ef4444]/20 text-[#ef4444]'
                        : theme === 'light'
                          ? 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
                          : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Mic size={14} className={isListening ? 'animate-bounce' : ''} />
                  </button>

                  {/* Send inside doc input */}
                  <button
                    onClick={() => handleSend(input)}
                    disabled={!input.trim() || loading}
                    className={`w-8 h-8 rounded-full transition-all flex items-center justify-center shrink-0 border ${
                      theme === 'light'
                        ? 'bg-gray-950 text-white hover:bg-gray-800 disabled:bg-gray-100/50 disabled:text-gray-350 border-transparent'
                        : 'bg-white text-black hover:bg-white/95 disabled:bg-white/[0.03] disabled:text-gray-600 border-transparent'
                    }`}
                  >
                    <Send size={12} className="ml-0.5" />
                  </button>
                </div>

                {/* Sub info prompt style */}
                <p className={`text-[9px] text-center mt-2.5 font-medium select-none ${theme === 'light' ? 'text-gray-500' : 'text-gray-600'}`}>
                  Satoshi AI can make mistakes. Consider checking important facts about Bitcoin circular economies.
                </p>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
