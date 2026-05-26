import React, { useState, useRef, useEffect } from 'react';
import { Send, User as UserIcon, Loader2, Sparkles, ShoppingBag } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent } from './ui/card';
import { Avatar, AvatarFallback } from './ui/avatar';
import Markdown from 'react-markdown';
import { Message, ProfileState, RecommendedProduct } from '../types';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';

const MarkdownViewer = React.lazy(() => Promise.resolve({ default: Markdown }));

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'bot',
      content: "Welcome to Nazakatai.\nTell me your occasion, and we'll curate something timeless for you."
    }
  ]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [profile, setProfile] = useState<ProfileState>({
    occasion: '',
    budget: '',
    style: '',
    size: ''
  });
  
  const endOfMessagesRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isStreaming) return;

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsStreaming(true);

    const botMsgId = (Date.now() + 1).toString();
    setMessages(prev => [...prev, { id: botMsgId, role: 'bot', content: '' }]);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMsg],
          profile
        })
      });

      if (!response.body) throw new Error('No response body');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let done = false;
      let text = '';

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        if (value) {
          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n\n');
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const dataStr = line.slice(6);
              if (dataStr === '[DONE]') {
                done = true;
                break;
              }
              try {
                const data = JSON.parse(dataStr);
                if (data.text) {
                  text += data.text;
                  setMessages(prev => 
                    prev.map(m => m.id === botMsgId ? { ...m, content: text } : m)
                  );
                }
              } catch (err) {
                // Ignore parse errors from chunking
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => prev.map(m => 
        m.id === botMsgId ? { ...m, content: 'Sorry, I encountered an error. Please try again.' } : m
      ));
    } finally {
      setIsStreaming(false);
    }
  };

  const handleQuickReply = (text: string) => {
    setInput(text);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex-1 max-w-4xl w-full mx-auto flex flex-col h-[calc(100vh-5rem)] bg-ivory/95 backdrop-blur-md border-x border-gold/10 shadow-soft-luxury relative"
    >
      
      {/* Profile Bar */}
      <div className="py-4 border-b border-black/5 flex gap-2 flex-wrap shrink-0 items-center justify-center bg-ivory/95 backdrop-blur-md z-10 sticky top-0 shadow-sm">
        <span className="px-3 py-1 bg-maroon text-ivory text-[9px] rounded-full font-bold uppercase tracking-widest shadow-sm">
          Nazakatai Stylist Session
        </span>
        {['Occasion', 'Budget', 'Style', 'Size'].map(key => {
          if (!profile[key as keyof ProfileState]) return null;
          return (
             <span key={key} className="px-3 py-1 border border-gold/20 text-[9px] rounded-full font-bold uppercase tracking-widest text-ink bg-white shadow-sm">
                {key}: {profile[key as keyof ProfileState]}
             </span>
          )
        })}
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto relative p-6 md:p-10 space-y-8 pb-32">
        <AnimatePresence>
          {messages.map(msg => (
            <ChatMessage key={msg.id} message={msg} />
          ))}
          {isStreaming && messages[messages.length - 1].role === 'user' && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex items-center space-x-2 text-muted px-4 py-2"
            >
               <div className="w-10 h-10 rounded-full bg-ivory flex items-center justify-center text-ink font-serif italic text-xl shadow-sm border border-gold/50">
                 N
               </div>
               <span className="text-[10px] uppercase font-bold tracking-widest animate-pulse ml-2 text-gold">Nazakatai is curating your look...</span>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={endOfMessagesRef} />
      </div>

      {/* Input Area */}
      <div className="shrink-0 p-6 pt-0 flex flex-col relative mt-auto z-10">
        <div className="absolute top-[-100px] left-0 right-0 h-28 chat-gradient pointer-events-none"></div>
        {/* Quick Replies */}
        <AnimatePresence>
          {messages.length === 1 && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex gap-2 mb-4 overflow-x-auto pb-2 scrollbar-hide px-2"
            >
              {["I need something for Eid", "Looking for a wedding guest outfit", "Just browsing casuals"].map(qr => (
                <button key={qr} className="px-4 py-2 bg-white border border-gold/30 rounded-full text-[10px] uppercase tracking-wider hover:border-gold hover:text-plum transition-colors shadow-sm shrink-0 font-bold text-ink/70" onClick={() => handleQuickReply(qr)}>
                  {qr}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit} className="relative flex items-center shadow-soft-luxury">
          <input 
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask Nazakatai about fabrics, styling..."
            className="w-full bg-white border border-gold/20 rounded-full py-4 px-6 pr-16 text-sm focus:outline-none focus:border-gold text-ink placeholder:text-muted/70 font-sans shadow-inner"
            disabled={isStreaming}
          />
          <button 
            type="submit"
            className="absolute right-2 w-10 h-10 bg-maroon rounded-full flex items-center justify-center text-ivory hover:bg-maroon/90 transition-colors disabled:opacity-50"
            disabled={!input.trim() || isStreaming}
          >
            <Send className="w-4 h-4 ml-[-2px]" />
          </button>
        </form>
      </div>
    </motion.div>
  );
}

function ChatMessage({ message }: { message: Message }) {
  const isUser = message.role === 'user';
  
  // Parse for products JSON
  let contentText = message.content;
  const productsList: RecommendedProduct[][] = [];
  
  // Extract complete JSON arrays
  const completeRegex = /PRODUCTS_JSON:(\[.*?\])/gs;
  let match;
  while ((match = completeRegex.exec(message.content)) !== null) {
    contentText = contentText.replace(match[0], '');
    try {
      productsList.push(JSON.parse(match[1]));
    } catch {
      // Ignore parse errors
    }
  }

  // Hide partial JSON stream
  contentText = contentText.replace(/PRODUCTS_JSON:\[.*/s, '');

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex flex-col ${isUser ? 'items-end' : 'items-start max-w-[95%]'}`}
    >
      <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start max-w-full'}`}>
        <div className={`p-5 md:p-6 shadow-sm text-sm leading-relaxed ${
            isUser 
              ? 'bg-maroon text-ivory rounded-2xl rounded-tr-none' 
              : 'bg-ivory border border-gold/30 rounded-2xl rounded-tl-none text-ink shadow-soft-luxury'
          }`}
        >
          {contentText && (
             <div className={`prose prose-sm max-w-none text-sm md:text-base leading-relaxed font-sans ${isUser ? 'text-ivory' : 'text-ink'}`}>
                <React.Suspense fallback={<div className="animate-pulse h-4 bg-muted/20 rounded w-24"></div>}>
                   <MarkdownViewer>{contentText}</MarkdownViewer>
                </React.Suspense>
             </div>
          )}
        </div>
        <span className={`text-[9px] mt-2 uppercase tracking-[0.2em] font-bold ${isUser ? 'text-muted' : 'text-gold'}`}>
          {isUser ? 'You' : 'Nazakatai'}
        </span>
      </div>

      {productsList.map((products, i) => (
        <div key={i} className="flex gap-6 overflow-x-auto py-6 px-2 -mx-2 pl-2 mt-4 max-w-[100vw] sm:max-w-full scrollbar-hide relative">
          {products.map((product, idx) => (
            <motion.div 
               key={product.id}
               initial={{ opacity: 0, x: 20 }}
               animate={{ opacity: 1, x: 0 }}
               transition={{ delay: idx * 0.1 }}
            >
               <ProductCard product={product} />
            </motion.div>
          ))}
        </div>
      ))}
    </motion.div>
  );
}

function ProductCard({ product }: { product: RecommendedProduct }) {
  const navigate = useNavigate();

  return (
    <div className="group relative bg-white border border-gold/20 p-4 flex flex-col w-[280px] shrink-0 shadow-soft-luxury hover:shadow-glow-gold hover:border-gold transition-all duration-500 cursor-pointer" onClick={() => navigate(`/product/${product.id}`)}>
      <div className="flex-1 bg-sand/10 mb-6 relative overflow-hidden flex items-center justify-center p-3 h-[320px] arch-simple">
        <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-ivory/90 backdrop-blur-sm text-ink px-4 py-1.5 text-[9px] font-bold uppercase tracking-[0.2em] border border-gold/30 z-10 shadow-sm whitespace-nowrap">
          Curated For You
        </div>
        <img 
          src={product.imageUrl} 
          alt={product.name} 
          className="w-full h-full object-cover arch-simple group-hover:scale-105 transition-transform duration-1000 border-4 border-white shadow-md mx-auto"
          loading="lazy"
        />
      </div>
      <div className="flex justify-between items-start mb-3 px-2">
        <div className="space-y-1.5 pr-2">
          <p className="text-[9px] uppercase tracking-[0.3em] text-gold font-bold">{product.brand}</p>
          <h3 className="font-editorial text-xl leading-tight text-ink line-clamp-2">{product.name}</h3>
          <p className="text-[10px] text-muted italic capitalize font-serif">{product.fabric}</p>
        </div>
        <div className="text-right shrink-0 mt-1">
          <p className="text-sm font-bold text-ink">₹{product.price.toLocaleString('en-IN')}</p>
        </div>
      </div>
      <p className="text-[11px] mt-2 italic text-muted line-clamp-3 border-l-2 border-gold/30 pl-3 leading-relaxed mx-2">
        "{product.reason}"
      </p>
      <button className="mt-6 mx-2 bg-maroon text-ivory py-3.5 text-[10px] uppercase tracking-[0.2em] font-bold opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity" onClick={(e) => {
        e.stopPropagation();
        // Added to cart logic
      }}>
        Add to Trousseau
      </button>
    </div>
  );
}