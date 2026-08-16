import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Heart, Eye, ShoppingBag, RefreshCw, Sparkles, Gem } from 'lucide-react';
import Markdown from 'react-markdown';
import { Message, ProfileState, RecommendedProduct } from '../types';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';

// ─── Constants ────────────────────────────────────────────────────────────────

const SESSION_KEY = 'nazakatai_session_v2';

const OCCASION_CHIPS = [
  { label: 'Wedding Guest',     emoji: '💍' },
  { label: 'Eid Celebration',   emoji: '🌙' },
  { label: 'Minimal Chikankari',emoji: '🪡' },
  { label: 'Festive Glam',      emoji: '✨' },
  { label: 'Banarasi Evening',  emoji: '👑' },
  { label: 'Luxury Mehendi',    emoji: '🌸' },
];

// ─── Session helpers ───────────────────────────────────────────────────────────

function getInitialMessages(): Message[] {
  return [{
    id: '1',
    role: 'bot',
    content: `Namaste 🙏 Welcome to **Nazakatai.**\n\nI'm your personal AI stylist — here to curate the perfect look for your celebration, from timeless Chikankari to regal Banarasi silk.\n\n*What's the occasion?* Tell me your vision and I'll weave something beautiful for you.`,
  }];
}

function loadSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.messages?.length) return parsed;
    }
  } catch (_) {}
  return { messages: getInitialMessages(), profile: { occasion: '', budget: '', style: '', size: '' } };
}

function saveSession(messages: Message[], profile: ProfileState) {
  try { localStorage.setItem(SESSION_KEY, JSON.stringify({ messages, profile })); } catch (_) {}
}

// ─── Profile extraction ────────────────────────────────────────────────────────

function extractProfile(text: string, current: ProfileState): ProfileState {
  const lower = text.toLowerCase();
  const next = { ...current };
  const oMap: Record<string, string> = {
    wedding: 'Wedding', bridal: 'Wedding', shaadi: 'Wedding',
    eid: 'Eid', haldi: 'Haldi', mehendi: 'Mehendi', mehndi: 'Mehendi',
    reception: 'Reception', festive: 'Festive', office: 'Office', casual: 'Casual',
  };
  for (const [kw, val] of Object.entries(oMap)) {
    if (lower.includes(kw) && !next.occasion) { next.occasion = val; break; }
  }
  const bm = lower.match(/(?:under|below|within|budget[:\s]+)[\s₹]*([\d,]+)/);
  if (bm && !next.budget) next.budget = `₹${bm[1]}`;
  const sm = lower.match(/\b(xs|s\b|m\b|l\b|xl|xxl|free size)\b/);
  if (sm && !next.size) next.size = sm[1].toUpperCase();
  return next;
}

// ─── Main Component ────────────────────────────────────────────────────────────

export default function ChatInterface() {
  const sess = loadSession();
  const [messages, setMessages] = useState<Message[]>(sess.messages);
  const [profile, setProfile]   = useState<ProfileState>(sess.profile);
  const [input, setInput]       = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const isFirstMessage = messages.length <= 1;

  const endRef      = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => { saveSession(messages, profile); }, [messages, profile]);

  useEffect(() => {
    const el = scrollAreaRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
  }, [messages, isStreaming]);

  const resizeTextarea = () => {
    const ta = textareaRef.current;
    if (ta) { ta.style.height = 'auto'; ta.style.height = Math.min(ta.scrollHeight, 130) + 'px'; }
  };

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isStreaming) return;

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: text.trim() };
    const next = [...messages, userMsg];
    setMessages(next);
    setInput('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
    setIsStreaming(true);
    setProfile(p => extractProfile(text, p));

    const botId = (Date.now() + 1).toString();
    setMessages(prev => [...prev, { id: botId, role: 'bot', content: '' }]);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: next, profile }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      if (!res.body) throw new Error('No body');

      const reader  = res.body.getReader();
      const decoder = new TextDecoder();
      let done = false, acc = '';

      while (!done) {
        const { value, done: d } = await reader.read();
        done = d;
        if (value) {
          const lines = decoder.decode(value, { stream: true }).split('\n\n');
          for (const line of lines) {
            if (!line.startsWith('data: ')) continue;
            const payload = line.slice(6);
            if (payload === '[DONE]') { done = true; break; }
            try {
              const { text: t } = JSON.parse(payload);
              if (t) {
                acc += t;
                setMessages(prev => prev.map(m => m.id === botId ? { ...m, content: acc } : m));
                setProfile(p => extractProfile(acc, p));
              }
            } catch (_) {}
          }
        }
      }
    } catch (err) {
      console.error(err);
      setMessages(prev => prev.map(m =>
        m.id === botId ? { ...m, content: '*Apologies — the atelier is momentarily unavailable.* Please try again in a moment.' } : m
      ));
    } finally {
      setIsStreaming(false);
    }
  }, [messages, profile, isStreaming]);

  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); sendMessage(input); };
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input); }
  };

  const clearSession = () => {
    localStorage.removeItem(SESSION_KEY);
    setMessages(getInitialMessages());
    setProfile({ occasion: '', budget: '', style: '', size: '' });
  };

  const hasProfile = Object.values(profile).some(Boolean);

  return (
    <div
      className="flex-1 flex flex-col overflow-hidden relative"
      style={{
        background: 'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(200,155,60,0.09) 0%, transparent 60%), radial-gradient(ellipse 60% 40% at 80% 100%, rgba(74,31,27,0.07) 0%, transparent 50%), #F8F4EE',
      }}
    >
      {/* ── Sub-header ───────────────────────────────────────────────────────── */}
      <div className="shrink-0 border-b border-gold/15 glass-nav z-20 px-4 sm:px-8 h-[52px] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <motion.div
            animate={{ boxShadow: isStreaming ? '0 0 0 3px rgba(200,155,60,0.4)' : '0 0 0 0px rgba(200,155,60,0)' }}
            transition={{ duration: 0.4 }}
            className="w-8 h-8 rounded-full bg-maroon flex items-center justify-center text-white font-serif italic text-sm shadow-sm"
          >
            N
          </motion.div>
          <div className="leading-none">
            <p className="text-[11px] font-bold text-ink uppercase tracking-[0.18em]">Nazakatai Stylist</p>
            <p className="text-[9px] font-bold uppercase tracking-[0.2em] mt-0.5">
              {isStreaming
                ? <span className="shimmer-text">Curating your look…</span>
                : <span className="text-gold">Heritage Atelier · Online</span>
              }
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Profile context pills */}
          {hasProfile && Object.entries(profile).filter(([,v]) => v).map(([k, v]) => (
            <span key={k} className="hidden md:inline-flex px-2.5 py-1 bg-white/80 border border-gold/20 text-[8px] font-bold uppercase tracking-widest text-ink rounded-full shadow-sm">
              {v as string}
            </span>
          ))}
          <button
            onClick={clearSession}
            title="New conversation"
            className="p-1.5 text-muted hover:text-gold transition-colors rounded-full hover:bg-gold/10"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ── Messages ─────────────────────────────────────────────────────────── */}
      <div
        ref={scrollAreaRef}
        className="flex-1 overflow-y-auto scrollbar-hide"
      >
        <div className="max-w-3xl mx-auto px-4 sm:px-8 py-8 pb-52 space-y-7">
          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <ChatMessage key={msg.id} message={msg} />
            ))}
          </AnimatePresence>

          {/* Typing indicator — only while streaming AND bot bubble is empty */}
          <AnimatePresence>
            {isStreaming && messages[messages.length - 1]?.content === '' && (
              <motion.div
                key="typing"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4, scale: 0.96 }}
                transition={{ duration: 0.25 }}
                className="flex items-end gap-3"
              >
                <div className="w-9 h-9 rounded-full bg-ivory border border-gold/40 flex items-center justify-center font-serif italic text-ink text-base shadow-sm shrink-0">
                  N
                </div>
                <div className="bg-white border border-gold/20 rounded-2xl rounded-tl-none px-5 py-4 shadow-soft-luxury flex items-center gap-3">
                  <span className="flex gap-1.5">
                    <span className="typing-dot" />
                    <span className="typing-dot" />
                    <span className="typing-dot" />
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-widest shimmer-text">
                    Nazakatai is curating your look…
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div ref={endRef} />
        </div>
      </div>

      {/* ── Occasion chips (visible only on first load) ───────────────────── */}
      <AnimatePresence>
        {isFirstMessage && (
          <motion.div
            key="chips"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="absolute bottom-[110px] left-0 right-0 px-4 sm:px-8 pointer-events-none z-10"
          >
            <div className="max-w-3xl mx-auto">
              <p className="text-[8px] uppercase tracking-[0.3em] text-muted/70 font-bold mb-2.5">
                Quick start — choose your occasion
              </p>
              <div className="flex flex-wrap gap-2 pointer-events-auto">
                {OCCASION_CHIPS.map((chip, i) => (
                  <motion.button
                    key={chip.label}
                    initial={{ opacity: 0, scale: 0.88 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.6 + i * 0.07, duration: 0.35, ease: [0.16,1,0.3,1] }}
                    onClick={() => sendMessage(`I'm looking for something for ${chip.label}.`)}
                    className="occasion-chip"
                  >
                    <span className="text-sm leading-none">{chip.emoji}</span>
                    {chip.label}
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Input bar ────────────────────────────────────────────────────────── */}
      <div className="absolute bottom-0 left-0 right-0 px-4 sm:px-8 pb-5 z-20">
        {/* Fade gradient */}
        <div
          className="absolute -top-16 left-0 right-0 h-16 pointer-events-none"
          style={{ background: 'linear-gradient(to bottom, transparent, rgba(248,244,238,1))' }}
        />
        <div className="max-w-3xl mx-auto">
          <form
            onSubmit={handleSubmit}
            className="glass-input rounded-2xl flex items-end gap-2 p-2.5 shadow-[0_8px_40px_rgba(0,0,0,0.1),0_2px_8px_rgba(200,155,60,0.08)]"
          >
            <textarea
              ref={textareaRef}
              rows={1}
              value={input}
              onChange={e => { setInput(e.target.value); resizeTextarea(); }}
              onKeyDown={handleKeyDown}
              disabled={isStreaming}
              placeholder="Describe your occasion, mood, or celebration…"
              className="flex-1 bg-transparent resize-none outline-none text-sm text-ink placeholder:text-muted/50 font-sans leading-relaxed py-2 px-2.5 min-h-[38px] max-h-[130px] scrollbar-hide disabled:opacity-40"
            />
            <motion.button
              type="submit"
              disabled={!input.trim() || isStreaming}
              whileHover={{ scale: 1.07 }}
              whileTap={{ scale: 0.93 }}
              className="w-11 h-11 bg-maroon rounded-xl flex items-center justify-center text-ivory shrink-0 disabled:opacity-35 disabled:cursor-not-allowed shadow-[0_4px_16px_rgba(74,31,27,0.4)] transition-colors hover:bg-maroon/90"
            >
              {isStreaming
                ? <div className="w-4 h-4 border-2 border-ivory/30 border-t-ivory rounded-full animate-spin" />
                : <Send className="w-4 h-4 -ml-px -mt-px" />
              }
            </motion.button>
          </form>
          <p className="text-center text-[8px] text-muted/40 mt-2 uppercase tracking-[0.2em] font-bold">
            Nazakatai AI Stylist · Enter to send · Shift+Enter for new line
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── ChatMessage ──────────────────────────────────────────────────────────────

function ChatMessage({ message }: { message: Message }) {
  const isUser = message.role === 'user';

  let contentText = message.content;
  const productsList: RecommendedProduct[][] = [];
  const regex = /PRODUCTS_JSON:(\[.*?\])/gs;
  let m: RegExpExecArray | null;
  while ((m = regex.exec(message.content)) !== null) {
    contentText = contentText.replace(m[0], '');
    try { productsList.push(JSON.parse(m[1])); } catch (_) {}
  }
  contentText = contentText.replace(/PRODUCTS_JSON:\[.*/s, '').trim();

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
      className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
    >
      <div className={`flex gap-3 items-end ${isUser ? 'flex-row-reverse' : 'flex-row'} max-w-[88%]`}>
        {/* Avatar */}
        <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 mb-0.5 text-sm font-bold ${
          isUser
            ? 'bg-maroon/10 border border-maroon/25 text-maroon'
            : 'bg-ivory border border-gold/40 font-serif italic text-ink text-base shadow-sm'
        }`}>
          {isUser ? 'You' : 'N'}
        </div>

        {/* Bubble */}
        {contentText ? (
          <div className={`rounded-2xl px-5 py-4 text-sm leading-relaxed shadow-sm ${
            isUser
              ? 'bg-maroon text-ivory rounded-tr-none'
              : 'bg-white border border-gold/15 text-ink rounded-tl-none shadow-[0_2px_20px_rgba(0,0,0,0.06),0_0_0_1px_rgba(200,155,60,0.08)]'
          }`}>
            <div className={`prose prose-sm max-w-none font-sans leading-relaxed ${
              isUser ? 'prose-invert text-ivory' : 'text-ink'
            }`}>
              <React.Suspense fallback={<div className="h-4 animate-pulse bg-muted/20 rounded w-32" />}>
                <Markdown>{contentText}</Markdown>
              </React.Suspense>
            </div>
          </div>
        ) : (
          !message.content && <div className="h-4 w-4" />
        )}
      </div>

      {/* Sender label */}
      <p className={`text-[8px] mt-1.5 uppercase tracking-[0.2em] font-bold ${
        isUser ? 'mr-12 text-muted/60' : 'ml-12 text-gold/80'
      }`}>
        {isUser ? 'You' : 'Nazakatai'}
      </p>

      {/* Product recommendation panels */}
      {productsList.map((products, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18, duration: 0.55, ease: [0.16,1,0.3,1] }}
          className="mt-5 w-full ml-0 sm:ml-12"
        >
          {/* Dossier header */}
          <div className="flex items-center gap-3 mb-4">
            <div className="h-px flex-1 bg-gradient-to-r from-gold/40 to-transparent" />
            <span className="text-[8px] uppercase tracking-[0.3em] font-bold text-gold flex items-center gap-1.5">
              <Gem className="w-2.5 h-2.5" />
              Styling Dossier · {products.length} Recommendation{products.length > 1 ? 's' : ''}
            </span>
            <div className="h-px flex-1 bg-gradient-to-l from-gold/40 to-transparent" />
          </div>

          <div className="flex flex-col gap-4">
            {products.map((product, idx) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.22 + idx * 0.14, duration: 0.5, ease: [0.16,1,0.3,1] }}
              >
                <ProductCard product={product} index={idx} />
              </motion.div>
            ))}
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}

// ─── ProductCard — Text-Only Luxury Editorial ─────────────────────────────────

const CURATION_LABELS = [
  'Curated by Nazakatai',
  'Heritage Pick',
  'Editor\'s Recommendation',
  'Wedding Atelier',
  'Timeless Selection',
  'AI Recommended',
];

function ProductCard({ product, index }: { product: RecommendedProduct; index: number }) {
  const navigate = useNavigate();
  const [wishlisted, setWishlisted] = useState(false);
  const label = CURATION_LABELS[index % CURATION_LABELS.length];

  return (
    <motion.div
      whileHover={{ y: -3, boxShadow: '0 20px 60px rgba(200,155,60,0.15), 0 4px 20px rgba(0,0,0,0.07)' }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="group relative cursor-pointer"
      style={{
        background: 'linear-gradient(135deg, #FAF7F2 0%, #F5EFE6 100%)',
        border: '1px solid rgba(200,155,60,0.2)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.05), 0 1px 4px rgba(200,155,60,0.08)',
      }}
      onClick={() => navigate(`/product/${product.id}`)}
    >
      {/* Top accent line */}
      <div className="absolute top-0 left-0 right-0 h-[2px]"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(200,155,60,0.6), transparent)' }}
      />

      <div className="p-6 md:p-7">

        {/* Header row — curation label + wishlist */}
        <div className="flex items-start justify-between mb-5">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5"
            style={{
              background: 'rgba(200,155,60,0.08)',
              border: '1px solid rgba(200,155,60,0.25)',
              fontSize: 8,
              fontWeight: 700,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: '#C89B3C',
            }}
          >
            <Sparkles style={{ width: 9, height: 9 }} />
            {label}
          </span>

          <button
            onClick={e => { e.stopPropagation(); setWishlisted(w => !w); }}
            className="flex items-center gap-1.5 text-[8px] font-bold uppercase tracking-widest transition-colors"
            style={{ color: wishlisted ? '#A44B2A' : '#8D8175' }}
          >
            <Heart
              style={{ width: 12, height: 12 }}
              strokeWidth={1.5}
              fill={wishlisted ? '#A44B2A' : 'none'}
            />
            {wishlisted ? 'Saved' : 'Save'}
          </button>
        </div>

        {/* Brand */}
        <p className="text-[9px] uppercase tracking-[0.3em] font-bold mb-1.5" style={{ color: '#C89B3C' }}>
          {product.brand}
        </p>

        {/* Product name — dominant typographic element */}
        <h3
          className="font-editorial leading-tight mb-4 text-ink"
          style={{ fontSize: 'clamp(20px, 4vw, 26px)', fontStyle: 'italic', fontWeight: 400, letterSpacing: '-0.01em' }}
        >
          {product.name}
        </h3>

        {/* Gold divider */}
        <div className="mb-5 h-px" style={{ background: 'linear-gradient(90deg, rgba(200,155,60,0.5) 0%, rgba(200,155,60,0.1) 60%, transparent 100%)' }} />

        {/* Styling reason — centerpiece copy */}
        <p className="font-serif italic leading-relaxed mb-5"
          style={{ fontSize: 13, color: '#5C5248', fontStyle: 'italic' }}
        >
          &ldquo;{product.reason}&rdquo;
        </p>

        {/* Metadata pills row */}
        <div className="flex flex-wrap gap-2 mb-5">
          <div className="px-3 py-1.5" style={{ background: 'rgba(23,20,18,0.04)', border: '1px solid rgba(23,20,18,0.08)' }}>
            <p className="text-[7px] uppercase tracking-[0.25em] font-bold mb-0.5" style={{ color: '#8D8175' }}>Fabric</p>
            <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: '#171412' }}>{product.fabric}</p>
          </div>
          <div className="px-3 py-1.5" style={{ background: 'rgba(23,20,18,0.04)', border: '1px solid rgba(23,20,18,0.08)' }}>
            <p className="text-[7px] uppercase tracking-[0.25em] font-bold mb-0.5" style={{ color: '#8D8175' }}>Colour</p>
            <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: '#171412' }}>{product.color}</p>
          </div>
        </div>

        {/* Bottom divider */}
        <div className="mb-5 h-px" style={{ background: 'rgba(200,155,60,0.15)' }} />

        {/* Price + CTAs */}
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[9px] uppercase tracking-[0.2em] font-bold mb-0.5" style={{ color: '#8D8175' }}>Atelier Price</p>
            <div className="flex items-baseline gap-2">
              <p className="font-serif font-bold" style={{ fontSize: 20, color: '#171412' }}>
                ₹{product.price.toLocaleString('en-IN')}
              </p>
              {product.mrp && product.mrp > product.price && (
                <p className="text-[10px] line-through" style={{ color: '#8D8175' }}>
                  ₹{product.mrp.toLocaleString('en-IN')}
                </p>
              )}
            </div>
          </div>

          <div className="flex gap-2">
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              onClick={e => { e.stopPropagation(); navigate(`/product/${product.id}`); }}
              className="flex items-center gap-1.5 px-5 py-3 text-white font-bold uppercase tracking-widest"
              style={{
                background: '#4A1F1B',
                fontSize: 8,
                letterSpacing: '0.2em',
                color: '#FFFFFF',
              }}
            >
              <Eye style={{ width: 10, height: 10 }} />
              View Details
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.04, borderColor: '#C89B3C', color: '#C89B3C' }}
              whileTap={{ scale: 0.97 }}
              onClick={e => { e.stopPropagation(); navigate(`/product/${product.id}`); }}
              className="flex items-center gap-1.5 px-5 py-3 font-bold uppercase tracking-widest"
              style={{
                background: 'transparent',
                border: '1px solid rgba(23,20,18,0.2)',
                color: '#171412',
                fontSize: 8,
                letterSpacing: '0.2em',
              }}
            >
              <ShoppingBag style={{ width: 10, height: 10 }} />
              Trousseau
            </motion.button>
          </div>
        </div>
      </div>

      {/* Bottom accent line */}
      <div className="absolute bottom-0 left-0 right-0 h-px" style={{ background: 'rgba(200,155,60,0.15)' }} />
    </motion.div>
  );
}