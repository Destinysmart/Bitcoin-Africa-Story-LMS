import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, X, Send, Bot, User, Loader2 } from 'lucide-react';

interface CourseCompanionProps {
  chapterTitle: string;
  chapterDescription: string;
}

export function CourseCompanion({ chapterTitle, chapterDescription }: CourseCompanionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{role: 'user' | 'assistant', content: string}[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // We read the anthropic key from local storage.
  // In a real app we'd proxy this securely via our own server's env vars if we don't want clients providing it,
  // but as per current app setup, admins input it, or it sits in localstorage as demo.
  const apiKey = localStorage.getItem('anthropic_api_key') || '';

  const sendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputMessage.trim()) return;

    const newMsgs: {role: 'user' | 'assistant', content: string}[] = [...messages, { role: 'user', content: inputMessage }];
    setMessages(newMsgs);
    setInputMessage('');
    setIsLoading(true);

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
      console.error(err);
      setMessages([...newMsgs, { role: 'assistant', content: `Error: ${err.message}` }]);
    } finally {
      setIsLoading(false);
    }
  };

  

  return (
    <>
      {/* Floating Chat Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-brand-gold text-black p-4 rounded-full shadow-lg hover:scale-105 transition-transform z-40"
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
            className="fixed bottom-24 right-6 w-80 md:w-96 h-[500px] max-h-[70vh] bg-[#1a1a1a] border border-white/10 rounded-2xl shadow-2xl flex flex-col z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="flex justify-between items-center p-4 bg-black/40 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Bot className="text-brand-gold" size={20} />
                <h3 className="font-bold text-sm">Course Companion</h3>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
              {messages.length === 0 && (
                <div className="text-center text-gray-500 text-sm mt-4">
                  Ask a question about <strong>{chapterTitle}</strong>!
                </div>
              )}
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex gap-3 \${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className={`w-8 h-8 rounded-full flex justify-center items-center shrink-0 \${msg.role === 'user' ? 'bg-brand-gold text-black' : 'bg-black text-brand-gold'}`}>
                    {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                  </div>
                  <div className={`px-4 py-2 rounded-2xl max-w-[80%] text-sm \${msg.role === 'user' ? 'bg-brand-gold text-black rounded-tr-none' : 'bg-white/5 text-gray-200 rounded-tl-none'}`}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-3 flex-row">
                  <div className="w-8 h-8 rounded-full bg-black text-brand-gold flex justify-center items-center shrink-0">
                    <Bot size={16} />
                  </div>
                  <div className="px-4 py-3 rounded-2xl bg-white/5 text-gray-200 rounded-tl-none flex items-center gap-2 text-sm">
                    <Loader2 size={14} className="animate-spin" /> Thinking...
                  </div>
                </div>
              )}
            </div>

            {/* Input Form */}
            <form onSubmit={sendMessage} className="p-3 border-t border-white/10 flex gap-2">
              <input
                type="text"
                placeholder="Ask about this chapter..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                className="flex-1 bg-black/50 border border-white/10 rounded-full px-4 py-2 text-sm text-white focus:border-brand-gold outline-none focus:ring-1 focus:ring-brand-gold"
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
