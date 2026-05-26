import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Send, Sparkles, ShoppingBag, Heart, Eye, MessageCircle,
  RefreshCw, ChevronRight, Star, X
} from 'lucide-react';
import Markdown from 'react-markdown';
import { Message, ProfileState, RecommendedProduct } from '../types';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';

// ─── Constants ────────────────────────────────────────────────────────────────

const SESSION_KEY = 'nazakatai_session';

const OCCASION_CHIPS = [
  { label: 'Wedding Guest', emoji: '💍' },
  { label: 'Eid Celebration', emoji: '🌙' },
  { label: 'Minimal Chikankari', emoji: '🪡' },
  { label: 'Festive Glam', emoji: '✨' },
  { label: 'Office Ethnic', emoji: '🌸' },
  { label: 'Luxury Banarasi', emoji: '👑' },
];

const INSPIRATIONS = [
  {
    title: 'Royal Banarasi',
    sub: 'Timeless wedding drapes',
    img: 'https://images.unsplash.com/photo-1583391733958-d25e77b2ce43?q=80&w=400&auto=format&fit=crop',
  },
  {
    title: 'Summer Chikankari',
    sub: 'Breezy festive pastels',
    img: 'https://images.unsplash.com/photo-1584488349132-72365a6c02cb?q=80&w=400&auto=format&fit=crop',
  },
  {
    title: 'Minimal Ivory',
    sub: 'Quiet luxury in white',
    img: 'https://images.unsplash.com/photo-1596450514735-111a2fe02935?q=80&w=400&auto=format&fit=crop',
  },
];

const STYLE_QUOTES = [
  '"Elegance is not about being noticed, it is about being remembered."',
  '"The right outfit is armour for the soul."',
  '"Heritage craftsmanship, intelligent curation."',
];

// ─── Session helpers ───────────────────────────────────────────────────────────

function loadSession(): { messages: Message[]; profile: ProfileState } {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (raw) return JSON.parse(raw);
  } catch (_) {}
  return {
    messages: [
      {
        id: '1',
        role: 'bot',
        content:
          "Namaste 🙏 Welcome to **Nazakatai**.\n\nI'm your personal AI stylist, here to curate the perfect look for your celebration.\n\nTell me — what's the occasion, and I'll weave something timeless for you.",
      },
    ],
    profile: { occasion: '', budget: '', style: '', size: '' },
  };
}

function saveSession(messages: Message[], profile: ProfileState) {
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify({ messages, profile }));
  } catch (_) {}
}

// ─── Profile extraction ────────────────────────────────────────────────────────

function extractProfile(text: string, current: ProfileState): ProfileState {
  const lower = text.toLowerCase();
  const updated = { ...current };

  // Occasion keywords
  const occasionMap: Record<string, string> = {
    wedding: 'Wedding', eid: 'Eid', festive: 'Festive', haldi: 'Haldi',
    mehendi: 'Mehendi', reception: 'Reception', office: 'Office', casual: 'Casual',
    'day-wedding': 'Day Wedding', bridal: 'Bridal',
  };
  for (const [kw, val] of Object.entries(occasionMap)) {
    if (lower.includes(kw) && !updated.occasion) updated.occasion = val;
  }

  // Budget extraction
  const budgetMatch = lower.match(/(?:under|below|within|budget[:\s]+)[\s₹]*([\d,]+)/);
  if (budgetMatch && !updated.budget) updated.budget = `₹${budgetMatch[1]}`;

  // Size extraction
  const sizeMatch = lower.match(/\b(xs|s|m|l|xl|xxl|free size)\b/);
  if (sizeMatch && !updated.size) updated.size = sizeMatch[1].toUpperCase();

  return updated;
}

// ─── Main Component ────────────────────────────────────────────────────────────

export default function ChatInterface() {
  const session = loadSession();
  const [messages, setMessages] = useState<Message[]>(session.messages);
  const [profile, setProfile] = useState<ProfileState>(session.profile);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [showWelcome, setShowWelcome] = useState(session.messages.length <= 1);
  const [quoteIdx] = useState(() => Math.floor(Math.random() * STYLE_QUOTES.length));

  const endRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-save session
  useEffect(() => {
    saveSession(messages, profile);
  }, [messages, profile]);

  // Auto-scroll
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isStreaming]);

  // Auto-resize textarea
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    const ta = e.target;
    ta.style.height = 'auto';
    ta.style.height = Math.min(ta.scrollHeight, 120) + 'px';
  };

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || isStreaming) return;

      setShowWelcome(false);

      const userMsg: Message = { id: Date.now().toString(), role: 'user', content: text };
      const newMessages = [...messages, userMsg];
      setMessages(newMessages);
      setInput('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
      setIsStreaming(true);

      // Update profile from user message
      setProfile((prev) => extractProfile(text, prev));

      const botMsgId = (Date.now() + 1).toString();
      setMessages((prev) => [...prev, { id: botMsgId, role: 'bot', content: '' }]);

      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: newMessages, profile }),
        });

        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        if (!response.body) throw new Error('No response body');

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let done = false;
        let accumulated = '';

        while (!done) {
          const { value, done: doneReading } = await reader.read();
          done = doneReading;
          if (value) {
            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split('\n\n');
            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const dataStr = line.slice(6);
                if (dataStr === '[DONE]') { done = true; break; }
                try {
                  const data = JSON.parse(dataStr);
                  if (data.text) {
                    accumulated += data.text;
                    setMessages((prev) =>
                      prev.map((m) => (m.id === botMsgId ? { ...m, content: accumulated } : m))
                    );
                    // Extract profile from bot responses too
                    setProfile((prev) => extractProfile(accumulated, prev));
                  }
                } catch (_) {}
              }
            }
          }
        }
      } catch (error) {
        console.error('Chat error:', error);
        setMessages((prev) =>
          prev.map((m) =>
            m.id === botMsgId
              ? {
                  ...m,
                  content:
                    '*Apologies — the atelier is momentarily unavailable.*\n\nOur stylist will return shortly. Please try again in a moment.',
                }
              : m
          )
        );
      } finally {
        setIsStreaming(false);
      }
    },
    [messages, profile, isStreaming]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const handleChipClick = (label: string) => {
    sendMessage(`I'm looking for something for ${label}.`);
  };

  const clearSession = () => {
    localStorage.removeItem(SESSION_KEY);
    setMessages([
      {
        id: Date.now().toString(),
        role: 'bot',
        content:
          "Namaste 🙏 Welcome back to **Nazakatai**.\n\nI'm your personal AI stylist. Tell me your occasion and I'll curate something timeless.",
      },
    ]);
    setProfile({ occasion: '', budget: '', style: '', size: '' });
    setShowWelcome(true);
  };

  const hasProfile = Object.values(profile).some(Boolean);

  return (
    <div className="flex-1 flex overflow-hidden chat-bg-warm relative">

      {/* ── LEFT PANEL ──────────────────────────────────────────────────── */}
      <motion.aside
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="hidden xl:flex flex-col w-72 shrink-0 chat-side-panel border-r border-gold/10 overflow-hidden"
      >
        {/* Style Quote */}
        <div className="p-8 border-b border-gold/10">
          <p className="text-[9px] uppercase tracking-[0.3em] text-gold font-bold mb-4">Today's Inspiration</p>
          <p className="font-editorial text-lg text-ink italic leading-snug">{STYLE_QUOTES[quoteIdx]}</p>
        </div>

        {/* Editorial Lookbook */}
        <div className="p-6 flex-1 overflow-y-auto scrollbar-hide">
          <p className="text-[9px] uppercase tracking-[0.3em] text-muted font-bold mb-5">Style Editorials</p>
          <div className="space-y-4">
            {INSPIRATIONS.map((ins, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.15, duration: 0.6 }}
                className="group cursor-pointer"
              >
                <div className="relative aspect-[3/2] overflow-hidden arch-simple border-2 border-white shadow-soft-luxury mb-2">
                  <img
                    src={ins.img}
                    alt={ins.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-ink/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center">
                    <span className="text-[9px] font-bold uppercase tracking-widest text-white bg-maroon/80 px-3 py-1.5">View</span>
                  </div>
                </div>
                <p className="font-editorial text-base text-ink italic">{ins.title}</p>
                <p className="text-[9px] uppercase tracking-widest text-muted font-bold">{ins.sub}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Craft Heritage Footer */}
        <div className="p-6 border-t border-gold/10 bg-ink/3">
          <p className="text-[9px] uppercase tracking-[0.25em] text-gold font-bold mb-2">Heritage Craft</p>
          <p className="text-[11px] text-muted font-serif italic leading-relaxed">
            Hand-embroidered by artisans in Lucknow's old city since generations.
          </p>
        </div>
      </motion.aside>

      {/* ── CENTER CHAT ─────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, scale: 0.99 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="flex-1 flex flex-col min-w-0 relative border-x border-gold/10"
      >
        {/* Chat Header */}
        <div className="shrink-0 h-14 flex items-center justify-between px-5 border-b border-gold/10 glass-nav sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-maroon flex items-center justify-center text-white font-serif italic text-base shadow-glow-gold">
              N
            </div>
            <div>
              <p className="text-[11px] font-bold text-ink uppercase tracking-widest leading-tight">Nazakatai Stylist</p>
              <p className="text-[9px] text-gold uppercase tracking-[0.2em] font-bold">
                {isStreaming ? (
                  <span className="shimmer-text">Curating your look…</span>
                ) : (
                  'Heritage Atelier · Online'
                )}
              </p>
            </div>
          </div>

          {/* Profile pills */}
          <div className="flex items-center gap-2">
            {hasProfile &&
              Object.entries(profile)
                .filter(([, v]) => v)
                .map(([k, v]) => (
                  <span
                    key={k}
                    className="hidden sm:inline-flex px-2.5 py-1 bg-white border border-gold/20 text-[9px] font-bold uppercase tracking-widest text-ink rounded-full shadow-sm"
                  >
                    {v}
                  </span>
                ))}
            <button
              onClick={clearSession}
              title="Clear session"
              className="ml-2 p-2 text-muted hover:text-gold transition-colors rounded-full hover:bg-gold/10"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto scrollbar-hide px-5 md:px-10 py-8 space-y-6 pb-40">

          <AnimatePresence initial={false}>
            {messages.map((msg, idx) => (
              <ChatMessage
                key={msg.id}
                message={msg}
                isLatest={idx === messages.length - 1}
              />
            ))}
          </AnimatePresence>

          {/* Typing indicator — shows while streaming and bot msg is empty */}
          <AnimatePresence>
            {isStreaming && messages[messages.length - 1]?.content === '' && (
              <motion.div
                key="typing"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                className="flex items-center gap-3"
              >
                <div className="w-9 h-9 rounded-full bg-ivory border border-gold/40 flex items-center justify-center text-ink font-serif italic text-lg shadow-sm shrink-0">
                  N
                </div>
                <div className="bg-ivory border border-gold/20 rounded-2xl rounded-tl-none px-5 py-4 shadow-soft-luxury flex items-center gap-3">
                  <div className="flex gap-1.5 items-center">
                    <span className="typing-dot" />
                    <span className="typing-dot" />
                    <span className="typing-dot" />
                  </div>
                  <span className="text-[10px] uppercase font-bold tracking-widest shimmer-text">
                    Nazakatai is curating your look…
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div ref={endRef} />
        </div>

        {/* Welcome overlay — occasion chips */}
        <AnimatePresence>
          {showWelcome && messages.length <= 1 && (
            <motion.div
              key="welcome-chips"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="absolute bottom-32 left-0 right-0 px-5 md:px-10 pointer-events-none"
            >
              <p className="text-[9px] uppercase tracking-[0.3em] text-muted font-bold mb-3">
                Quick Start — Choose Your Occasion
              </p>
              <div className="flex flex-wrap gap-2 pointer-events-auto">
                {OCCASION_CHIPS.map((chip, i) => (
                  <motion.button
                    key={chip.label}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.7 + i * 0.08 }}
                    className="occasion-chip"
                    onClick={() => handleChipClick(chip.label)}
                  >
                    <span>{chip.emoji}</span>
                    {chip.label}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Input Area */}
        <div className="absolute bottom-0 left-0 right-0 p-5 md:p-6 z-10">
          {/* Fade gradient above input */}
          <div className="absolute top-[-80px] left-0 right-0 h-20 pointer-events-none"
            style={{ background: 'linear-gradient(to bottom, transparent, rgba(248,244,238,0.98))' }}
          />
          <form
            onSubmit={handleSubmit}
            className="glass-input rounded-2xl flex items-end gap-3 p-3 shadow-soft-luxury relative"
          >
            <textarea
              ref={textareaRef}
              rows={1}
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Describe your occasion, mood, or celebration…"
              disabled={isStreaming}
              className="flex-1 bg-transparent resize-none outline-none text-sm text-ink placeholder:text-muted/60 font-sans leading-relaxed py-1.5 px-2 min-h-[36px] max-h-[120px] scrollbar-hide disabled:opacity-50"
            />
            <motion.button
              type="submit"
              disabled={!input.trim() || isStreaming}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.95 }}
              className="w-11 h-11 bg-maroon rounded-xl flex items-center justify-center text-ivory shrink-0 disabled:opacity-40 disabled:cursor-not-allowed transition-colors hover:bg-maroon/90 shadow-[0_4px_14px_rgba(74,31,27,0.35)]"
            >
              {isStreaming ? (
                <div className="w-4 h-4 border-2 border-ivory/40 border-t-ivory rounded-full animate-spin" />
              ) : (
                <Send className="w-4 h-4 ml-[-1px] mt-[-1px]" />
              )}
            </motion.button>
          </form>
          <p className="text-center text-[9px] text-muted/50 mt-2 uppercase tracking-widest font-bold">
            Powered by Nazakatai AI · Press Enter to send
          </p>
        </div>
      </motion.div>

      {/* ── RIGHT PANEL ─────────────────────────────────────────────────── */}
      <motion.aside
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="hidden xl:flex flex-col w-64 shrink-0 chat-side-panel border-l border-gold/10 overflow-hidden"
      >
        {/* Your Session */}
        <div className="p-6 border-b border-gold/10">
          <p className="text-[9px] uppercase tracking-[0.3em] text-gold font-bold mb-4">Your Styling Profile</p>
          {hasProfile ? (
            <div className="space-y-3">
              {Object.entries(profile)
                .filter(([, v]) => v)
                .map(([k, v]) => (
                  <div key={k} className="flex items-center justify-between">
                    <span className="text-[9px] uppercase tracking-widest text-muted font-bold">{k}</span>
                    <span className="text-[11px] font-serif italic text-ink">{v as string}</span>
                  </div>
                ))}
            </div>
          ) : (
            <p className="text-[11px] font-serif italic text-muted leading-relaxed">
              Share your occasion and preferences to build your profile.
            </p>
          )}
        </div>

        {/* Craft Tags */}
        <div className="p-6 border-b border-gold/10">
          <p className="text-[9px] uppercase tracking-[0.3em] text-muted font-bold mb-4">Crafts We Curate</p>
          <div className="flex flex-wrap gap-2">
            {['Chikankari', 'Banarasi', 'Zardozi', 'Mukaish', 'Phulkari', 'Kalamkari'].map((craft) => (
              <span
                key={craft}
                className="px-3 py-1.5 bg-white border border-gold/20 text-[9px] font-bold uppercase tracking-wider text-ink rounded-sm shadow-sm"
              >
                {craft}
              </span>
            ))}
          </div>
        </div>

        {/* Atelier Info */}
        <div className="p-6 mt-auto">
          <div className="flex items-center gap-2 mb-3">
            <Star className="w-3.5 h-3.5 text-gold" strokeWidth={1.5} fill="#C89B3C" />
            <p className="text-[9px] uppercase tracking-[0.25em] text-gold font-bold">Premium Atelier</p>
          </div>
          <p className="text-[11px] text-muted font-serif italic leading-relaxed">
            All pieces are hand-verified and sourced from certified artisan collectives in Lucknow and Banaras.
          </p>
        </div>
      </motion.aside>
    </div>
  );
}

// ─── ChatMessage ──────────────────────────────────────────────────────────────

function ChatMessage({ message, isLatest }: { message: Message; isLatest: boolean }) {
  const isUser = message.role === 'user';

  // Parse products from message content
  let contentText = message.content;
  const productsList: RecommendedProduct[][] = [];

  const completeRegex = /PRODUCTS_JSON:(\[.*?\])/gs;
  let match;
  while ((match = completeRegex.exec(message.content)) !== null) {
    contentText = contentText.replace(match[0], '');
    try {
      productsList.push(JSON.parse(match[1]));
    } catch (_) {}
  }
  // Hide partial streaming JSON
  contentText = contentText.replace(/PRODUCTS_JSON:\[.*/s, '').trim();

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
    >
      {/* Avatar + Bubble */}
      <div className={`flex gap-3 items-end max-w-[85%] ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        {/* Avatar */}
        {!isUser && (
          <div className="w-9 h-9 rounded-full bg-ivory border border-gold/40 flex items-center justify-center text-ink font-serif italic text-lg shadow-sm shrink-0 mb-1">
            N
          </div>
        )}
        {isUser && (
          <div className="w-9 h-9 rounded-full bg-maroon/10 border border-maroon/20 flex items-center justify-center text-maroon shrink-0 mb-1">
            <span className="text-[11px] font-bold uppercase">You</span>
          </div>
        )}

        {/* Bubble */}
        <div
          className={`rounded-2xl px-5 py-4 shadow-sm text-sm leading-relaxed ${
            isUser
              ? 'bg-maroon text-ivory rounded-tr-none'
              : 'bg-white border border-gold/20 text-ink rounded-tl-none shadow-soft-luxury'
          }`}
        >
          {contentText ? (
            <div
              className={`prose prose-sm max-w-none leading-relaxed font-sans ${
                isUser ? 'text-ivory prose-invert' : 'text-ink'
              }`}
            >
              <React.Suspense fallback={<div className="animate-pulse h-4 bg-muted/20 rounded w-24" />}>
                <Markdown>{contentText}</Markdown>
              </React.Suspense>
            </div>
          ) : (
            // Empty streaming placeholder — show dots in the typing indicator instead
            <div className="h-4" />
          )}
        </div>
      </div>

      {/* Label */}
      <span className={`text-[9px] mt-1.5 uppercase tracking-[0.2em] font-bold ${
        isUser ? 'text-muted mr-12' : 'text-gold ml-12'
      }`}>
        {isUser ? 'You' : 'Nazakatai'}
      </span>

      {/* Product cards */}
      {productsList.map((products, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="flex gap-5 overflow-x-auto py-5 px-1 -mx-1 mt-4 w-full scrollbar-hide"
        >
          {products.map((product, idx) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.25 + idx * 0.15, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            >
              <ProductCard product={product} />
            </motion.div>
          ))}
        </motion.div>
      ))}
    </motion.div>
  );
}

// ─── ProductCard ──────────────────────────────────────────────────────────────

function ProductCard({ product }: { product: RecommendedProduct }) {
  const navigate = useNavigate();
  const [wishlisted, setWishlisted] = useState(false);

  return (
    <div className="product-card-luxury group relative bg-white border border-gold/20 flex flex-col w-[260px] shrink-0 shadow-soft-luxury cursor-pointer overflow-hidden">
      {/* Image */}
      <div
        className="relative h-[300px] overflow-hidden arch-simple bg-sand/10 flex items-center justify-center"
        onClick={() => navigate(`/product/${product.id}`)}
      >
        {/* Curated badge */}
        <div className="absolute top-5 left-1/2 -translate-x-1/2 z-10 bg-ivory/95 backdrop-blur-sm text-ink px-4 py-1.5 text-[9px] font-bold uppercase tracking-[0.2em] border border-gold/30 shadow-sm whitespace-nowrap">
          Curated For You
        </div>

        {/* Wishlist button */}
        <button
          className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center border border-gold/20 shadow-sm transition-transform hover:scale-110"
          onClick={(e) => { e.stopPropagation(); setWishlisted((w) => !w); }}
        >
          <Heart
            className="w-3.5 h-3.5 transition-colors"
            strokeWidth={1.5}
            color={wishlisted ? '#A44B2A' : '#5C5248'}
            fill={wishlisted ? '#A44B2A' : 'none'}
          />
        </button>

        <img
          src={product.imageUrl}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-cover arch-simple transition-transform duration-1000 group-hover:scale-110 border-[5px] border-white shadow-md"
        />

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-ink/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500 arch-simple flex items-end justify-center pb-6">
          <span className="text-[9px] font-bold uppercase tracking-widest text-white bg-maroon/80 backdrop-blur-sm px-5 py-2">
            View Details
          </span>
        </div>
      </div>

      {/* Details */}
      <div className="p-4 flex flex-col flex-1">
        <div className="flex justify-between items-start mb-2">
          <div className="flex-1 pr-2">
            <p className="text-[8px] uppercase tracking-[0.3em] text-gold font-bold mb-1">{product.brand}</p>
            <h3 className="font-editorial text-[17px] leading-snug text-ink line-clamp-2">{product.name}</h3>
          </div>
          <div className="text-right shrink-0">
            <p className="text-sm font-bold text-ink">₹{product.price.toLocaleString('en-IN')}</p>
            {product.mrp && product.mrp > product.price && (
              <p className="text-[9px] line-through text-muted">₹{product.mrp.toLocaleString('en-IN')}</p>
            )}
          </div>
        </div>

        {/* Fabric tag */}
        <span className="self-start px-2.5 py-1 border border-gold/20 text-[8px] uppercase tracking-wider text-muted font-bold bg-sand/10 mb-3">
          {product.fabric} · {product.color}
        </span>

        {/* Styling reason */}
        <p className="text-[10px] italic text-muted border-l-2 border-gold/30 pl-3 leading-relaxed line-clamp-2 mb-4">
          "{product.reason}"
        </p>

        {/* Actions */}
        <div className="mt-auto grid grid-cols-2 gap-2">
          <button
            onClick={() => navigate(`/product/${product.id}`)}
            className="flex items-center justify-center gap-1.5 py-2.5 bg-maroon text-ivory text-[9px] font-bold uppercase tracking-wider hover:bg-maroon/90 transition-colors"
          >
            <Eye className="w-3 h-3" /> View
          </button>
          <button
            onClick={() => navigate(`/product/${product.id}`)}
            className="flex items-center justify-center gap-1.5 py-2.5 bg-transparent border border-gold/30 text-ink text-[9px] font-bold uppercase tracking-wider hover:border-gold hover:text-gold transition-colors"
          >
            <ShoppingBag className="w-3 h-3" /> Add
          </button>
        </div>
      </div>
    </div>
  );
}