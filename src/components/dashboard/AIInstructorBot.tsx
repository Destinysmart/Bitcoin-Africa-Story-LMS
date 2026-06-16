import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { getCurrentUser } from '../../lib/storage';
import { MessageSquare, Send, Sparkles, RefreshCw, User, Trash2 } from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

const PRESET_PROMPTS = [
  "What are the 3 functions of money?",
  "Explain Bitcoin vs CBDCs",
  "How does the Lightning Network scale?",
  "What is the Cantillon Effect?"
];

export function AIInstructorBot() {
  const user = getCurrentUser();
  const chatKey = user ? `bas_instructor_chat_${user.email}` : 'bas_instructor_chat_guest';
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
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
      content: `Welcome back, student! ₿ I am **Satoshi**, your lead AI Instructor for the **Bitcoin Diploma**.\n\nWhether you are curious about the properties of money (M1), fractional reserve banking (M3), how to secure and backup your mobile wallet (M6), or Layer-2 scaling via the Lightning Network (M7), I am ready to guide you with sound, Bitcoin-only educational feedback.\n\nWhat topic from the 10 syllabus modules can I explain for you today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ];

  const persistMessages = (newMsgs: Message[]) => {
    setMessages(newMsgs);
    localStorage.setItem(chatKey, JSON.stringify(newMsgs));
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

    try {
      // Map history to server payload structure: [{ role: 'user' | 'assistant', content: string }]
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
        throw new Error('Could not connect to the Satoshi AI Instructor Server. Please try again.');
      }

      const data = await res.json();
      
      const assistantMsg: Message = {
        role: 'assistant',
        content: data.answer || "I'm sorry, I couldn't generate a proper response. Let's get back to discussing the Bitcoin Diploma!",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      persistMessages([...updatedHistory, assistantMsg]);
    } catch (e: any) {
      console.error(e);
      setErrorMsg(e.message || 'Something went wrong. Please check your internet connection.');
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
    if (window.confirm('Do you want to reset your chat history with Lead Instructor Satoshi?')) {
      persistMessages(getInitialWelcome());
      setErrorMsg('');
    }
  };

  const renderText = (text: string) => {
    if (!text) return null;
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return (
      <span className="whitespace-pre-line leading-relaxed text-sm block gap-y-2">
        {parts.map((part, i) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={i} className="text-brand-gold font-bold">{part.slice(2, -2)}</strong>;
          }
          return part;
        })}
      </span>
    );
  };

  return (
    <GlassCard className="bg-brand-dark-2 relative overflow-hidden border border-white/5 flex flex-col h-[520px] shadow-2xl">
      {/* Glow highlight */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-brand-gold/5 rounded-full blur-3xl pointer-events-none" />
      
      {/* Card Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="relative">
            <div className="w-8 h-8 rounded-full bg-brand-gold/15 flex items-center justify-center text-brand-gold font-bold border border-brand-gold/20">
              ₿
            </div>
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-status-success rounded-full border border-brand-dark-2" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-sm tracking-wide">Satoshi Bot</span>
              <Sparkles size={11} className="text-brand-gold animate-pulse fill-brand-gold" />
            </div>
            <p className="text-[10px] text-brand-gold/90 font-medium">Bitcoin Diploma AI Instructor</p>
          </div>
        </div>
        
        <button 
          onClick={clearChat}
          className="text-gray-500 hover:text-status-error p-1.5 rounded-lg hover:bg-white/5 transition-all outline-none cursor-pointer"
          title="Reset conversation"
        >
          <Trash2 size={16} />
        </button>
      </div>

      {/* Message Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        <AnimatePresence initial={false}>
          {messages.map((msg, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
            >
              {/* Avatar circle */}
              <div className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-xs font-bold border ${
                msg.role === 'user' 
                  ? 'bg-white/10 border-white/15 text-white' 
                  : 'bg-brand-gold/10 border-brand-gold/20 text-brand-gold'
              }`}>
                {msg.role === 'user' ? <User size={13} /> : '₿'}
              </div>

              {/* Bubble body */}
              <div className="flex flex-col space-y-1">
                <div className={`p-3 rounded-2xl text-left ${
                  msg.role === 'user'
                    ? 'bg-white/10 text-white rounded-tr-none'
                    : 'bg-brand-dark-1/80 text-gray-200 border border-brand-gold/5 rounded-tl-none font-sans'
                }`}>
                  {renderText(msg.content)}
                </div>
                <span className={`text-[9px] text-gray-500 font-mono self-end ${msg.role === 'user' ? 'mr-1' : 'ml-1 self-start'}`}>
                  {msg.timestamp}
                </span>
              </div>
            </motion.div>
          ))}

          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex gap-3 max-w-[85%]"
            >
              <div className="w-8 h-8 rounded-full shrink-0 bg-brand-gold/10 border border-brand-gold/20 text-brand-gold flex items-center justify-center text-xs font-bold animate-pulse">
                ₿
              </div>
              <div className="bg-brand-dark-1/80 text-gray-400 border border-brand-gold/5 p-3 rounded-2xl rounded-tl-none flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-brand-gold rounded-full animate-bounce [animation-delay:-0.3s]" />
                <span className="w-1.5 h-1.5 bg-brand-gold rounded-full animate-bounce [animation-delay:-0.15s]" />
                <span className="w-1.5 h-1.5 bg-brand-gold rounded-full animate-bounce" />
              </div>
            </motion.div>
          )}

          {errorMsg && (
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              className="p-3 bg-status-error/10 border border-status-error/30 text-status-error rounded-xl text-xs flex items-center gap-2"
            >
              <span>⚠️</span>
              <span>{errorMsg}</span>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={chatEndRef} />
      </div>

      {/* Preset suggestions */}
      {messages.length <= 2 && (
        <div className="px-4 py-2 bg-black/10 border-t border-b border-white/5">
          <p className="text-[10px] text-brand-gold font-medium mb-1.5 uppercase tracking-wider flex items-center gap-1">
            <Sparkles size={9} className="fill-brand-gold text-brand-gold" />
            Suggested Questions:
          </p>
          <div className="flex flex-wrap gap-1.5">
            {PRESET_PROMPTS.map((prompt) => (
              <button
                key={prompt}
                onClick={() => handleSend(prompt)}
                className="text-[11px] bg-white/5 border border-white/5 hover:border-brand-gold/30 hover:bg-brand-gold/5 transition-all text-gray-300 hover:text-white px-2.5 py-1 rounded-full text-left line-clamp-1 cursor-pointer"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input panel */}
      <div className="p-3 bg-[#131313] border-t border-white/5 flex gap-2 items-center">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSend(input);
          }}
          disabled={loading}
          placeholder="Ask Satoshi about the Bitcoin Diploma..."
          className="flex-1 bg-black/60 border border-white/5 hover:border-white/15 focus:border-brand-gold/50 rounded-xl px-4 py-2.5 text-xs text-white placeholder-gray-500 outline-none transition-all focus:ring-1 focus:ring-brand-gold/20"
        />
        <button
          onClick={() => handleSend(input)}
          disabled={!input.trim() || loading}
          className="bg-brand-gold text-black hover:bg-brand-gold/80 hover:scale-[1.02] transform transition-all p-2.5 rounded-xl disabled:opacity-40 disabled:hover:scale-100 disabled:pointer-events-none flex items-center justify-center cursor-pointer shadow-[0_0_10px_rgba(253,184,19,0.2)]"
        >
          <Send size={14} className="fill-black" />
        </button>
      </div>
      
      {/* Subtle certification footer */}
      <div className="bg-black/40 border-t border-white/5 px-4 py-1.5 text-[8.5px] text-gray-500 font-mono flex items-center justify-between">
        <span>Verified "My First Bitcoin" curriculum</span>
        <span className="text-brand-gold font-bold">● Sound Money Only</span>
      </div>
    </GlassCard>
  );
}
