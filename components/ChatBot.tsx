
import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, X, Bot, User, Sparkles, Loader2, Minimize2, Maximize2 } from 'lucide-react';
import { chatWithConsultant } from '../services/geminiService';
import { PredictionResult } from '../types';

interface ChatBotProps {
  prediction: PredictionResult | null;
}

export const ChatBot: React.FC<ChatBotProps> = ({ prediction }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [showGreeting, setShowGreeting] = useState(true);
  const [messages, setMessages] = useState<{ role: 'bot' | 'user'; text: string }[]>([
    { role: 'bot', text: "Welcome! I am Consultant PS. I can help you decode market trends or analyze your property valuation. How can I assist you today?" }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  useEffect(() => {
    const timer = setTimeout(() => setShowGreeting(false), 10000);
    return () => clearTimeout(timer);
  }, []);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;
    const userMsg = input.trim();
    setInput('');
    setShowGreeting(false);
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsTyping(true);

    try {
      const reply = await chatWithConsultant(userMsg, prediction);
      setMessages(prev => [...prev, { role: 'bot', text: reply }]);
    } catch (e) {
      setMessages(prev => [...prev, { role: 'bot', text: "My neural link is flickering. Please try again in a moment." }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end gap-3">
      {/* Proactive Greeting */}
      {!isOpen && showGreeting && (
        <div className="bg-slate-900 text-white p-4 rounded-2xl rounded-br-none shadow-2xl animate-in slide-in-from-bottom-4 duration-500 max-w-[220px] relative border border-white/10 mb-2 group">
          <p className="text-[11px] font-medium leading-relaxed">
            Need an ROI breakdown or strategic advice? I'm ready to consult.
          </p>
          <button onClick={() => setShowGreeting(false)} className="absolute -top-2 -left-2 bg-slate-800 p-1 rounded-full text-white/50 hover:text-white transition-colors opacity-0 group-hover:opacity-100">
            <X size={10} />
          </button>
        </div>
      )}

      {/* Main Chat Window */}
      {isOpen && (
        <div className={`bg-white rounded-[32px] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.14)] border border-slate-100 overflow-hidden flex flex-col transition-all duration-500 ease-out ${isMinimized ? 'h-16 w-64' : 'h-[580px] w-[380px] md:w-[420px]'}`}>
          <header className="bg-slate-900 p-4 flex items-center justify-between text-white shrink-0">
            <div className="flex items-center gap-3">
              <div className="bg-emerald-500 p-1.5 rounded-lg">
                <Bot size={18} className="text-slate-900" />
              </div>
              <div>
                <h4 className="font-black text-xs tracking-tight">Consultant PS</h4>
                <div className="flex items-center gap-1">
                  <span className="w-1 h-1 bg-emerald-400 rounded-full animate-pulse" />
                  <span className="text-[8px] text-emerald-400 font-bold uppercase tracking-widest">Active Intelligence</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => setIsMinimized(!isMinimized)} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors">
                {isMinimized ? <Maximize2 size={14} /> : <Minimize2 size={14} />}
              </button>
              <button onClick={() => setIsOpen(false)} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors">
                <X size={14} />
              </button>
            </div>
          </header>

          {!isMinimized && (
            <>
              <div ref={scrollRef} className="flex-1 p-5 overflow-y-auto space-y-4 bg-slate-50/50 scroll-smooth">
                {messages.map((m, i) => (
                  <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                    <div className={`max-w-[88%] p-4 rounded-2xl text-[13px] font-medium leading-relaxed shadow-sm ${
                      m.role === 'user' 
                        ? 'bg-emerald-600 text-white rounded-br-none' 
                        : 'bg-white text-slate-800 rounded-bl-none border border-slate-100'
                    }`}>
                      {m.text}
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="flex justify-start animate-pulse">
                    <div className="bg-white p-4 rounded-2xl rounded-bl-none border border-slate-100 flex items-center gap-2">
                       <Loader2 size={14} className="animate-spin text-emerald-500" />
                       <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">PS is thinking...</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-4 bg-white border-t border-slate-100">
                <div className="flex gap-2 bg-slate-50 p-1.5 rounded-2xl border border-slate-100 focus-within:border-emerald-500 focus-within:ring-4 focus-within:ring-emerald-500/5 transition-all">
                  <input 
                    type="text" 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Ask about ROI, trends, or valuation..." 
                    className="flex-1 bg-transparent px-3 py-2 outline-none text-[13px] font-medium placeholder:text-slate-400"
                  />
                  <button 
                    onClick={handleSend} 
                    disabled={!input.trim() || isTyping}
                    className="bg-slate-900 text-white p-2.5 rounded-xl hover:bg-emerald-600 transition-all disabled:opacity-30 flex items-center justify-center"
                  >
                    <Send size={16} />
                  </button>
                </div>
                <div className="mt-3 flex gap-1.5 justify-center">
                   {['Market ROI', 'Circle Rates', 'Future Growth'].map(tag => (
                     <button 
                       key={tag}
                       onClick={() => setInput(tag)}
                       className="text-[9px] font-bold text-slate-400 border border-slate-100 px-2 py-1 rounded-full hover:bg-slate-50 hover:text-slate-600 transition-all"
                     >
                       {tag}
                     </button>
                   ))}
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Toggle Button */}
      {!isOpen && (
        <button 
          onClick={() => setIsOpen(true)}
          className="bg-slate-900 text-white p-5 rounded-full shadow-[0_12px_24px_rgba(0,0,0,0.15)] hover:scale-105 active:scale-95 transition-all group relative border-4 border-emerald-500/20"
        >
          <MessageSquare size={26} className="group-hover:rotate-12 transition-transform" />
          <div className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-500 border-2 border-slate-900"></span>
          </div>
        </button>
      )}
    </div>
  );
};
