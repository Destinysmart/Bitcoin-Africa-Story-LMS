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
function parseBoldAndInlineCode(text: string) {
  if (!text) return '';
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={i} className="text-white font-extrabold tracking-tight bg-white/5 px-1 rounded">
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
  if (!text) return null;
  const lines = text.split('\n');

  return (
    <div className="space-y-2.5 text-xs md:text-sm leading-relaxed text-gray-200">
      {lines.map((line, idx) => {
        const trimmed = line.trim();

        // Level 3 Headers
        if (trimmed.startsWith('### ')) {
          return (
            <h4 key={idx} className="text-xs font-bold text-brand-gold mt-3 mb-1 tracking-wide flex items-center gap-1.5 uppercase font-mono">
              <span className="inline-block w-1.5 h-3 bg-brand-gold rounded-full" />
              {parseBoldAndInlineCode(trimmed.substring(4))}
            </h4>
          );
        }

        // Level 2 Headers
        if (trimmed.startsWith('## ')) {
          return (
            <h3 key={idx} className="text-sm font-extrabold text-white mt-4 mb-2 tracking-tight flex items-center gap-2">
              <span className="w-2 h-2 bg-brand-gold rotate-45 shrink-0" />
              {parseBoldAndInlineCode(trimmed.substring(3))}
            </h3>
          );
        }

        // Level 1 Headers
        if (trimmed.startsWith('# ')) {
          return (
            <h2 key={idx} className="text-base font-black text-white mt-4 mb-2 tracking-tight border-b border-white/5 pb-1">
              {parseBoldAndInlineCode(trimmed.substring(2))}
            </h2>
          );
        }

        // Bullet Lists
        if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
          return (
            <div key={idx} className="flex items-start gap-2.5 ml-1 my-1">
              <span className="inline-flex items-center justify-center w-1.5 h-1.5 rounded-full bg-brand-gold mt-2 shrink-0 shadow-[0_0_8px_rgba(253,184,19,0.8)]" />
              <div className="flex-1 text-gray-300">
                {parseBoldAndInlineCode(trimmed.substring(2))}
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
              <div className="flex-1 text-gray-300">
                {parseBoldAndInlineCode(matchNum[2])}
              </div>
            </div>
          );
        }

        // Blockquotes
        if (trimmed.startsWith('> ')) {
          return (
            <blockquote key={idx} className="border-l-2 border-brand-gold/40 bg-brand-gold/5 px-3 py-2 rounded-r-xl my-2 text-xs italic text-gray-400">
              {parseBoldAndInlineCode(trimmed.substring(2))}
            </blockquote>
          );
        }

        // Spacing paragraphs
        if (trimmed === '') {
          return <div key={idx} className="h-1.5" />;
        }

        return (
          <p key={idx} className="text-xs md:text-sm text-gray-300/95 font-sans leading-relaxed">
            {parseBoldAndInlineCode(line)}
          </p>
        );
      })}
    </div>
  );
}

export function AIInstructorBot() {
  const user = getCurrentUser();
  const chatKey = user ? `bas_instructor_chat_${user.email}` : 'bas_instructor_chat_guest';
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [copiedId, setCopiedId] = useState<number | null>(null);
  
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
    if (window.confirm('Do you want to reset your conversation with Satoshi?')) {
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
    <GlassCard className="bg-brand-dark-2 border border-white/5 flex flex-col h-[480px] md:h-[650px] lg:h-[700px] shadow-[0_20px_50px_rgba(0,0,0,0.5)] rounded-xl md:rounded-2xl overflow-hidden relative">
      
      {/* Premium Header Bar */}
      <div className="px-3.5 py-3 md:px-5 md:py-4 border-b border-white/5 bg-black/20 backdrop-blur-md flex items-center justify-between relative z-10">
        <div className="flex items-center gap-2.5 md:gap-3">
          {/* Animated Avatar Box */}
          <div className="relative">
            <div className={`w-8.5 h-8.5 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-gradient-to-br from-brand-gold/20 to-brand-gold/5 flex items-center justify-center text-brand-gold font-black border border-brand-gold/30 shadow-[0_0_15px_rgba(253,184,19,0.1)] relative overflow-hidden transition-all duration-300 ${loading ? 'scale-105' : ''}`}>
              <span className="text-base md:text-xl select-none font-sans">₿</span>
              {loading && (
                <motion.div
                  className="absolute inset-0 border-2 border-brand-gold/50 rounded-lg md:rounded-xl pointer-events-none"
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                />
              )}
            </div>
            {/* Pulsing Status Dot */}
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 md:-bottom-1 md:-right-1 md:w-3.5 md:h-3.5 bg-status-success rounded-full border-2 border-brand-dark-2 flex items-center justify-center">
              <span className="w-1 md:w-1.5 h-1 md:h-1.5 bg-status-success rounded-full animate-ping" />
            </span>
          </div>

          <div>
            <div className="flex items-center gap-1">
              <span className="font-extrabold text-xs md:text-sm text-white tracking-wide">Satoshi Assistant</span>
              <Sparkles size={10} className="text-brand-gold animate-pulse fill-brand-gold shrink-0" />
            </div>
            {/* Live Core Feed details */}
            <div className="flex items-center gap-1 text-[9px] md:text-[10px] text-gray-400 mt-0.5">
              <span className="flex items-center gap-1">
                <span className="w-1 h-1 md:w-1.5 md:h-1.5 rounded-full bg-status-success inline-block shrink-0" />
                Active
              </span>
              <span className="text-gray-600 font-bold">•</span>
              <span className="text-brand-gold/80 font-medium">Syllabus Master</span>
            </div>
          </div>
        </div>
        
        {/* Actions panel */}
        <div className="flex items-center gap-2">
          {/* Subtle latency statistics label strictly descriptive */}
          <div className="hidden sm:flex flex-col items-end mr-1 text-right text-[9px] font-mono text-gray-500">
            <span>Model: Gemini SDK</span>
            <span className="text-[8px] text-brand-gold/60">Response Rate ~ 120ms</span>
          </div>
          
          <button 
            onClick={clearChat}
            className="text-gray-400 hover:text-status-error p-1.5 md:p-2 rounded-lg md:rounded-xl hover:bg-white/5 border border-transparent hover:border-white/5 transition-all outline-none cursor-pointer"
            title="Reset conversation"
          >
            <Trash2 size={14} className="md:w-4 md:h-4" />
          </button>
        </div>
      </div>

      {/* Main Interactive Chat List */}
      <div className="flex-1 overflow-y-auto px-3.5 py-3 md:px-5 md:py-4 space-y-3.5 md:space-y-4 custom-scrollbar relative z-10 bg-black/5">
        <AnimatePresence initial={false}>
          {messages.map((msg, index) => {
            const isUser = msg.role === 'user';
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: "spring", damping: 25, stiffness: 240 }}
                className={`flex gap-2 md:gap-3 max-w-[95%] md:max-w-[82%] relative group ${isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
              >
                {/* Micro Avatar icons */}
                <div className={`w-7 h-7 md:w-8.5 md:h-8.5 rounded-lg md:rounded-xl shrink-0 flex items-center justify-center text-[10px] md:text-xs font-bold border transition-all duration-300 ${
                  isUser 
                    ? 'bg-white/15 border-white/20 text-white shadow-md' 
                    : 'bg-brand-gold/15 border-brand-gold/25 text-brand-gold shadow-[0_2px_8px_rgba(253,184,19,0.05)]'
                }`}>
                  {isUser ? <User size={12} className="md:w-3.5 md:h-3.5" /> : '₿'}
                </div>

                {/* Message Speech Body */}
                <div className="flex flex-col space-y-1 items-start min-w-[100px]">
                  <div className={`p-2.5 md:p-3.5 rounded-xl md:rounded-2xl shadow-[0_4px_16px_rgba(0,0,0,0.15)] text-left border relative transition-all duration-200 ${
                    isUser
                      ? 'bg-[#fbaf17]/10 border-[#fbaf17]/20 text-white rounded-tr-md font-medium'
                      : 'bg-white/[0.02] border-white/5 text-gray-200 rounded-tl-md font-sans'
                  }`}>
                    <BitcoinFormattedText text={msg.content} />
                    
                    {/* Floating micro-action clipboard buttons only visible on assistant message */}
                    {!isUser && (
                      <div className="absolute right-2 -bottom-2.5 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity flex gap-1">
                        <button
                          onClick={() => copyToClipboard(msg.content, index)}
                          className="bg-brand-dark-2 hover:bg-brand-dark-1 border border-white/10 p-1 rounded-md text-gray-400 hover:text-brand-gold shadow-md transition-all flex items-center justify-center cursor-pointer"
                          title="Copy response content"
                        >
                          {copiedId === index ? <Check size={10} className="text-status-success animate-bounce" /> : <Copy size={10} />}
                        </button>
                      </div>
                    )}
                  </div>
                  
                  {/* Timestamp alignment based on role */}
                  <span className={`text-[8px] text-gray-500 font-mono tracking-wider ${isUser ? 'align-self-end text-right self-end mr-1' : 'ml-1 self-start'}`}>
                    {msg.timestamp}
                  </span>
                </div>
              </motion.div>
            );
          })}

          {/* Glowing Loading Micro-State */}
          {loading && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex gap-3 max-w-[80%]"
            >
              <div className="w-8.5 h-8.5 rounded-xl shrink-0 bg-brand-gold/10 border border-brand-gold/25 text-brand-gold flex items-center justify-center text-xs font-bold animate-pulse">
                ₿
              </div>
              <div className="bg-white/[0.02] border border-white/5 p-3.5 rounded-2xl rounded-tl-md flex items-center gap-1.5">
                <span className="w-2 h-2 bg-brand-gold rounded-full animate-bounce [animation-delay:-0.3s]" />
                <span className="w-2 h-2 bg-brand-gold rounded-full animate-bounce [animation-delay:-0.15s]" />
                <span className="w-2 h-2 bg-brand-gold rounded-full animate-bounce" />
              </div>
            </motion.div>
          )}

          {errorMsg && (
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              className="p-3 bg-status-error/10 border border-status-error/30 text-status-error rounded-xl text-xs flex items-center gap-2 max-w-[90%]"
            >
              <span className="shrink-0 text-sm">⚠️</span>
              <span>{errorMsg}</span>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={chatEndRef} />
      </div>

      {/* Dynamic interactive Suggested Prompts Section - styled on a clean beautiful swiping carousel */}
      {messages.length <= 1 && (
        <div className="px-3.5 py-2.5 md:px-5 md:py-3 border-t border-b border-white/5 bg-black/30 backdrop-blur-sm relative z-10">
          <p className="text-[9px] md:text-[10px] text-brand-gold/80 font-bold mb-1.5 md:mb-2 uppercase tracking-widest flex items-center gap-1 select-none">
            <Sparkles size={9} className="fill-brand-gold text-brand-gold shrink-0" />
            Instant Syllabus Queries:
          </p>
          
          {/* Horizontal scroll container with hidden scrollbar but swipeable */}
          <div className="flex gap-1.5 items-center overflow-x-auto pb-0.5 scrolls-none max-w-full custom-scrollbar-horizontal">
            {PRESET_PROMPTS.map((prompt) => (
              <button
                key={prompt.text}
                onClick={() => handleSend(prompt.text)}
                className="text-[10px] md:text-[11px] font-medium bg-white/[0.03] border border-white/5 hover:border-brand-gold/30 hover:bg-brand-gold/5 transition-all text-gray-300 hover:text-white px-2.5 py-1 md:px-3 md:py-1.5 rounded-full flex items-center gap-1 md:gap-1.5 shrink-0 select-none cursor-pointer"
              >
                <prompt.icon size={10} className="text-brand-gold shrink-0 md:w-[11px] md:h-[11px]" />
                {prompt.text}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Speech Notes indicator above typing area */}
      <AnimatePresence>
        {isListening && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="px-3.5 py-1.5 md:px-5 md:py-2 bg-rose-500/10 border-t border-rose-500/25 flex items-center justify-between text-[10px] md:text-[11px] text-rose-400 font-mono relative z-10"
          >
            <div className="flex items-center gap-1.5 md:gap-2">
              <span className="relative flex h-1.5 w-1.5 md:h-2 md:w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 md:h-2 md:w-2 bg-rose-500"></span>
              </span>
              <span>{speechNotes || 'Listening...'}</span>
            </div>
            
            <button 
              onClick={stopListening}
              className="text-[8px] md:text-[9px] uppercase tracking-wider font-extrabold text-white bg-rose-600/55 hover:bg-rose-600 px-2 md:px-2.5 py-0.5 rounded-full transition-colors cursor-pointer"
            >
              Cancel
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input panel with dynamic focus outlines */}
      <div className="p-2.5 md:p-4 bg-brand-dark-3/90 border-t border-white/5 flex gap-1.5 md:gap-2 items-center relative z-10">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSend(input);
          }}
          disabled={loading}
          placeholder={isListening ? "Say your question aloud..." : "Ask Satoshi a question..."}
          className="flex-1 bg-black/60 border border-white/5 hover:border-white/15 focus:border-brand-gold/40 rounded-lg md:rounded-xl px-3 py-2 md:px-4 md:py-3 text-xs md:text-sm text-white placeholder-gray-500 outline-none transition-all focus:ring-1 focus:ring-brand-gold/25"
        />
        
        {/* Modern Voice Microphone Button */}
        <button
          id="chat-voice-typing-btn"
          type="button"
          onClick={toggleListening}
          disabled={loading}
          title={!speechSupported ? "Voice typing not supported" : isListening ? "Stop listening" : "Ask questions with voice"}
          className={`p-2 md:p-3 rounded-lg md:rounded-xl flex items-center justify-center transition-all cursor-pointer relative shrink-0 border ${
            !speechSupported
              ? 'opacity-30 cursor-not-allowed text-gray-500 border-white/5 bg-white/[0.02]'
              : isListening
                ? 'bg-rose-500/20 text-rose-400 border-rose-500/40 animate-pulse ring-4 ring-rose-500/10'
                : 'bg-white/[0.03] text-gray-300 hover:text-brand-gold border-white/5 hover:border-brand-gold/30 hover:bg-brand-gold/5'
          }`}
        >
          {isListening ? (
            <>
              <Mic size={13} className="animate-bounce md:w-[15px] md:h-[15px]" />
              {/* Dynamic Soundwave Rings */}
              <span className="absolute inset-0 rounded-lg md:rounded-xl border border-rose-400 animate-ping opacity-25 pointer-events-none" />
            </>
          ) : (
            <Mic size={13} className="md:w-[15px] md:h-[15px]" />
          )}
        </button>

        <button
          onClick={() => handleSend(input)}
          disabled={!input.trim() || loading}
          className="bg-brand-gold text-black hover:bg-brand-gold/90 hover:scale-[1.03] active:scale-[0.98] transform transition-all p-2 md:p-3 rounded-lg md:rounded-xl disabled:opacity-30 disabled:hover:scale-100 disabled:pointer-events-none flex items-center justify-center cursor-pointer shadow-[0_4px_12px_rgba(253,184,19,0.25)] shrink-0"
        >
          <Send size={13} className="fill-black text-black shrink-0 md:w-[15px] md:h-[15px]" />
        </button>
      </div>
      
      {/* Dynamic certification standard note strictly literal and informative */}
      <div className="bg-black/60 border-t border-white/5 px-3.5 md:px-5 py-1.5 md:py-2 text-[8px] md:text-[9px] text-gray-500 font-mono flex items-center justify-between relative z-10">
        <span className="flex items-center gap-1 font-sans">
          <BookOpen size={9} className="text-brand-gold inline-block md:w-2.5 md:h-2.5" />
          Syllabus helper
        </span>
        <span className="text-brand-gold font-bold uppercase tracking-wider font-mono">Sound Money Only</span>
      </div>
    </GlassCard>
  );
}
