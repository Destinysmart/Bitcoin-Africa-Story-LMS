import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, X, Send, Bot, User, Loader2 } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

interface CourseCompanionProps {
  chapterTitle: string;
  chapterDescription: string;
}

export function CourseCompanion({ chapterTitle, chapterDescription }: CourseCompanionProps) {
  const { theme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{role: 'user' | 'assistant', content: string}[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // We read the anthropic key from local storage.
  // In a real app we'd proxy this securely via our own server's env vars if we don't want clients providing it,
  // but as per current app setup, admins input it, or it sits in localstorage as demo.
  const apiKey = localStorage.getItem('anthropic_api_key') || '';

  const getOfflineCompanionResponse = (q: string): string => {
    const query = q.toLowerCase();
    
    let baseResponse = `Hello there! I am your dynamic Course Companion studying "${chapterTitle}" alongside you. Since we are running in Offline Mode, I am glad to assist directly from local storage context!\n\n`;

    if (query.includes('explain') || query.includes('understand') || query.includes('what') || query.includes('how') || query.includes('why') || query.includes('concept')) {
      baseResponse += `Regarding **${chapterTitle}**, the core focus is:
*   *Core Concept:* ${chapterDescription || 'Building deep visual and functional literacy about Bitcoin and sound money.'}
*   *Key Takeaway:* Practicing self-sovereignty, understanding gold vs devaluing fiat currencies, and utilizing scaling options like the instant peer-to-peer Lightning Network.`;
    } else {
      baseResponse += `You are studying **${chapterTitle}**. This module specifically educates on:
*   *Curriculum Level:* ${chapterDescription || 'Understanding cryptographic proof, ledger mechanics, wallet security, and decentralized networks.'}
*   *Action:* Complete your readings and make sure to test your comprehension by passing the module's interactive Quiz to earn Sats and progress on your Bitcoin Diploma!`;
    }

    return baseResponse;
  };

  const sendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputMessage.trim()) return;

    const newMsgs: {role: 'user' | 'assistant', content: string}[] = [...messages, { role: 'user', content: inputMessage }];
    setMessages(newMsgs);
    setInputMessage('');
    setIsLoading(true);

    if (!navigator.onLine) {
      setTimeout(() => {
        const localAnswer = getOfflineCompanionResponse(newMsgs[newMsgs.length - 1].content);
        setMessages([...newMsgs, { role: 'assistant', content: localAnswer }]);
        setIsLoading(false);
      }, 500);
      return;
    }

    try {
      const response = await fetch('/api/course-companion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apiKey,
          chapterTitle,
          chapterDescription,
          history: newMsgs
        })
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed response from server');
      }

      const data = await response.json();
      setMessages([...newMsgs, { role: 'assistant', content: data.answer }]);
    } catch (err: any) {
      console.warn("Course Companion fetch failed, serving offline companion reply instead:", err);
      const localAnswer = getOfflineCompanionResponse(newMsgs[newMsgs.length - 1].content);
      setMessages([...newMsgs, { role: 'assistant', content: localAnswer }]);
    } finally {
      setIsLoading(false);
    }
  };

  

  return (
    <>
      {/* Floating Chat Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-20 md:bottom-6 right-6 bg-brand-gold text-black p-4 rounded-full shadow-lg hover:scale-105 transition-transform z-40"
      >
        <MessageSquare size={24} />
      </button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className={`fixed bottom-36 md:bottom-24 right-6 w-80 md:w-96 h-[500px] max-h-[70vh] rounded-2xl shadow-2xl flex flex-col z-50 overflow-hidden border ${
              theme === 'light'
                ? 'bg-[#ffffff] border-gray-200/80 text-gray-800 shadow-[0_16px_48px_rgba(0,0,0,0.06)]'
                : 'bg-[#1a1a1a] border-white/10 text-gray-200 shadow-2xl'
            }`}
          >
            {/* Header */}
            <div className={`flex justify-between items-center p-4 border-b ${theme === 'light' ? 'bg-[#f8f9fa] border-gray-100' : 'bg-black/40 border-white/10'}`}>
              <div className="flex items-center gap-2">
                <Bot className="text-brand-gold" size={20} />
                <h3 className={`font-bold text-sm ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}>Course Companion</h3>
              </div>
              <button 
                onClick={() => setIsOpen(false)} 
                className={`transition-colors ${theme === 'light' ? 'text-gray-500 hover:text-gray-900' : 'text-gray-400 hover:text-white'}`}
              >
                <X size={20} />
              </button>
            </div>

            {/* Messages */}
            <div className={`flex-1 overflow-y-auto p-4 flex flex-col gap-4 ${theme === 'light' ? 'bg-gray-50/50' : 'bg-transparent'}`}>
              {messages.length === 0 && (
                <div className={`text-center text-sm mt-4 p-4 border rounded-xl leading-relaxed ${theme === 'light' ? 'bg-gray-100/60 border-gray-200 text-gray-500' : 'bg-white/5 border-white/5 text-gray-400'}`}>
                  Ask the AI Course Companion any question about <strong>{chapterTitle}</strong> to get instant clarification!
                </div>
              )}
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className={`w-8 h-8 rounded-full flex justify-center items-center shrink-0 border ${
                    msg.role === 'user' 
                      ? 'bg-brand-gold text-black border-brand-gold/30 shadow-sm' 
                      : theme === 'light' 
                        ? 'bg-[#ffffff] text-brand-gold border-gray-200' 
                        : 'bg-black text-brand-gold border-white/5'
                  }`}>
                    {msg.role === 'user' ? <User size={15} /> : <Bot size={15} />}
                  </div>
                  <div className={`px-4 py-2.5 rounded-2xl max-w-[80%] text-xs md:text-sm whitespace-pre-wrap leading-relaxed border ${
                    msg.role === 'user' 
                      ? 'bg-brand-gold text-black border-brand-gold/30 rounded-tr-none shadow-sm font-medium' 
                      : theme === 'light'
                        ? 'bg-[#ffffff] text-gray-800 border-gray-200 shadow-sm rounded-tl-none'
                        : 'bg-brand-dark-2 text-gray-200 border-white/5 rounded-tl-none'
                  }`}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-3 flex-row">
                  <div className={`w-8 h-8 rounded-full flex justify-center items-center shrink-0 border ${
                    theme === 'light' ? 'bg-[#ffffff] text-brand-gold border-gray-200' : 'bg-black text-brand-gold border-white/5'
                  }`}>
                    <Bot size={15} />
                  </div>
                  <div className={`px-4 py-3 rounded-2xl border rounded-tl-none flex items-center gap-2 text-xs md:text-sm ${
                    theme === 'light' ? 'bg-[#ffffff] text-gray-650 border-gray-200 shadow-sm' : 'bg-brand-dark-2 text-gray-300 border-white/5'
                  }`}>
                    <Loader2 size={13} className="animate-spin text-brand-gold" /> Thinking...
                  </div>
                </div>
              )}
            </div>

            {/* Input Form */}
            <form onSubmit={sendMessage} className={`p-3 border-t flex gap-2 ${
              theme === 'light' ? 'bg-[#ffffff] border-gray-100' : 'border-white/10 bg-[#1a1a1a]'
            }`}>
              <input
                type="text"
                placeholder="Ask about this chapter..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                className={`flex-1 rounded-full px-4 py-2 text-sm focus:border-brand-gold outline-none focus:ring-1 focus:ring-brand-gold ${
                  theme === 'light'
                    ? 'bg-[#f8f9fa] border border-gray-200 text-gray-950 placeholder-gray-400'
                    : 'bg-black/50 border border-white/10 text-white placeholder-gray-500'
                }`}
              />
              <button
                type="submit"
                disabled={!inputMessage.trim() || isLoading}
                className="w-10 h-10 rounded-full bg-brand-gold text-black flex justify-center items-center hover:bg-[#e6a800] transition-colors disabled:opacity-50"
              >
                <Send size={16} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
