import { useState, useRef, useEffect } from "react";
import { GoogleGenAI } from "@google/genai";
import { X, Send, Loader2, Brain, User, Bot, Sparkles, MessageSquare } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../lib/utils";
import Markdown from "react-markdown";

interface Message {
  role: "user" | "model";
  text: string;
}

export function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "model", text: "Hi! I'm your SMART AI assistant. How can I help you manage your NFC profile today?" }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const chatRef = useRef<any>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const toggleChat = () => setIsOpen(!isOpen);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", text: userMessage }]);
    setIsLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      
      if (!chatRef.current) {
        chatRef.current = ai.chats.create({
          model: "gemini-3-flash-preview",
          config: {
            systemInstruction: "You are a helpful AI assistant for SMARTCARD, an NFC business card platform. You help users manage their profile, understand analytics, or explain how NFC works. Keep responses concise, friendly, and professional. Use markdown for formatting when helpful.",
          },
        });
      }

      const response = await chatRef.current.sendMessage({ message: userMessage });
      const botText = response.text;
      
      setMessages(prev => [...prev, { role: "model", text: botText }]);
    } catch (error) {
      console.error("Chat Error:", error);
      setMessages(prev => [...prev, { role: "model", text: "Sorry, I encountered an error. Please try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-8 right-8 z-[100]">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20, filter: "blur(10px)" }}
            animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, scale: 0.9, y: 20, filter: "blur(10px)" }}
            className="absolute bottom-20 right-0 w-[22rem] md:w-[26rem] h-[32rem] glass rounded-[2.5rem] shadow-2xl border-white/10 overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="p-6 border-b border-white/10 bg-white/5 flex items-center justify-between relative overflow-hidden">
              <div className="absolute inset-0 pointer-events-none opacity-10">
                <motion.div 
                  animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                  transition={{ duration: 4, repeat: Infinity }}
                  className="absolute -top-1/2 -left-1/2 w-full h-full bg-gold blur-[60px] rounded-full"
                />
              </div>
              
              <div className="flex items-center space-x-3 relative z-10">
                <div className="w-10 h-10 bg-gold/10 rounded-2xl flex items-center justify-center text-gold border border-gold/20">
                  <Brain size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-bold tracking-tight">SMART AI</h3>
                  <div className="flex items-center space-x-1.5">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-[10px] text-light/40 uppercase font-black tracking-widest">Online</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={toggleChat}
                className="p-2 text-light/20 hover:text-light transition-colors relative z-10"
              >
                <X size={20} />
              </button>
            </div>

            {/* Messages */}
            <div 
              ref={scrollRef}
              className="flex-grow overflow-y-auto p-6 space-y-6 custom-scrollbar"
            >
              {messages.map((msg, i) => (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={i}
                  className={cn(
                    "flex w-full",
                    msg.role === "user" ? "justify-end" : "justify-start"
                  )}
                >
                  <div className={cn(
                    "flex max-w-[85%] space-x-3",
                    msg.role === "user" ? "flex-row-reverse space-x-reverse" : "flex-row"
                  )}>
                    <div className={cn(
                      "w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 border",
                      msg.role === "user" ? "bg-gold/10 border-gold/20 text-gold" : "bg-white/5 border-white/10 text-light/40"
                    )}>
                      {msg.role === "user" ? <User size={14} /> : <Bot size={14} />}
                    </div>
                    <div className={cn(
                      "p-4 rounded-2xl text-sm leading-relaxed",
                      msg.role === "user" 
                        ? "bg-gold text-dark font-medium rounded-tr-none" 
                        : "bg-white/5 border border-white/10 text-light/80 rounded-tl-none"
                    )}>
                      <div className="markdown-body">
                        <Markdown>{msg.text}</Markdown>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div className="flex space-x-3">
                    <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-light/40">
                      <Bot size={14} />
                    </div>
                    <div className="bg-white/5 border border-white/10 p-4 rounded-2xl rounded-tl-none">
                      <Loader2 size={16} className="animate-spin text-gold" />
                    </div>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Input */}
            <form 
              onSubmit={handleSend}
              className="p-6 bg-white/5 border-t border-white/10"
            >
              <div className="relative">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type your message..."
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-5 pr-14 outline-none focus:border-gold transition-all text-sm"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 bg-gold text-dark rounded-xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:hover:scale-100"
                >
                  <Send size={18} />
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={toggleChat}
        className={cn(
          "w-16 h-16 rounded-[1.5rem] flex items-center justify-center shadow-2xl transition-all relative z-10 border",
          isOpen 
            ? "bg-dark text-gold border-gold/20" 
            : "bg-gold text-dark border-gold/50 shadow-gold/20"
        )}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={isOpen ? "open" : "closed"}
            initial={{ opacity: 0, rotate: -90 }}
            animate={{ opacity: 1, rotate: 0 }}
            exit={{ opacity: 0, rotate: 90 }}
            transition={{ duration: 0.2 }}
          >
            {isOpen ? <X size={28} /> : <MessageSquare size={28} />}
          </motion.div>
        </AnimatePresence>
        
        {!isOpen && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 w-5 h-5 bg-gold rounded-full border-4 border-[#050505] flex items-center justify-center"
          >
            <div className="w-1.5 h-1.5 bg-dark rounded-full animate-pulse" />
          </motion.div>
        )}
      </motion.button>
    </div>
  );
}
