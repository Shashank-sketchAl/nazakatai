import { motion, useScroll, useTransform } from 'motion/react';
import { BrowserRouter, Routes, Route, Link, useNavigate } from 'react-router-dom';
import ChatInterface from './components/ChatInterface';
import { Sparkles, ShoppingBag, ArrowRight, Star } from 'lucide-react';
import ProductDetail from './components/ProductDetail';
import { MOCK_CATALOG } from './data';

// ─── Root App ─────────────────────────────────────────────────────────────────

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-ivory flex flex-col font-sans bg-grain">
        {/* ── Navbar ── */}
        <nav className="h-20 flex items-center justify-between px-6 md:px-10 border-b border-black/5 glass-nav shrink-0 z-50 w-full fixed top-0">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center">
              <span className="font-serif italic text-3xl md:text-4xl font-bold tracking-tight text-ink">
                Nazakatai.
              </span>
            </Link>
            <div className="hidden lg:flex gap-8 text-[10px] uppercase tracking-[0.2em] font-bold text-ink">
              {['Collections', 'Occasions', 'Brands'].map(label => (
                <span key={label} className="relative group cursor-pointer transition-colors hover:text-gold">
                  {label}
                  <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-gold transition-all duration-300 group-hover:w-full" />
                </span>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right mr-3 hidden md:block">
              <p className="text-[9px] uppercase tracking-[0.2em] text-muted">Stylist Online</p>
              <p className="text-[11px] font-bold text-ink uppercase tracking-wider">Heritage Atelier</p>
            </div>
            <Link to="/chat">
              <motion.div
                whileHover={{ scale: 1.07 }}
                className="w-10 h-10 rounded-full bg-maroon flex items-center justify-center text-white font-serif italic text-xl shadow-glow-gold cursor-pointer"
              >
                N
              </motion.div>
            </Link>
            <button className="text-ink hover:text-gold transition-colors ml-1 hidden sm:block">
              <ShoppingBag className="h-5 w-5" strokeWidth={1.5} />
            </button>
          </div>
        </nav>

        <main className="flex-1 flex overflow-hidden pt-20">
          <Routes>
            <Route path="/"        element={<LandingPage />} />
            <Route path="/chat"    element={<ChatInterface />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="*" element={
              <div className="flex-1 bg-ivory h-full flex items-center justify-center">
                <div className="text-center space-y-6">
                  <h1 className="text-5xl font-editorial italic text-ink">Awaiting Curation…</h1>
                  <p className="text-sm text-muted font-serif italic max-w-md mx-auto mb-8">
                    This collection is being curated in our atelier.
                  </p>
                  <Link to="/">
                    <button className="btn-luxury">Return Home</button>
                  </Link>
                </div>
              </div>
            } />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

// ─── Landing Page ─────────────────────────────────────────────────────────────

function LandingPage() {
  const navigate = useNavigate();

  // Carousel items — 8 products drawn from catalog
  const carouselItems = MOCK_CATALOG.slice(0, 8).map(p => ({
    id: p.id,
    title: p.name,
    brand: p.brand_id,
    price: p.price,
    img: p.images[0],
    tag: p.craft_type,
    label: p.occasions[0] === 'wedding' ? 'Wedding Favourite'
         : p.occasions[0] === 'bridal'  ? 'Bridal Exclusive'
         : p.craft_type === 'Chikankari' ? 'Heritage Pick'
         : p.craft_type === 'Banarasi'   ? 'Editor\'s Selection'
         : 'Curated by Nazakatai',
    note: p.description.slice(0, 68) + '…',
  }));

  // Editorial grid — 6 products in asymmetric layout
  const editorialItems = MOCK_CATALOG.slice(2, 10).map(p => ({
    id: p.id,
    title: p.name,
    price: p.price,
    img: p.images[0],
    tag: p.craft_type,
    note: p.description.slice(0, 72) + '…',
    tall: [0, 2, 5].includes(MOCK_CATALOG.indexOf(p) - 2),
  }));

  return (
    <div className="flex-1 flex flex-col overflow-auto w-full">

      {/* ══════════════════════════════════════════════════════════════════
          1 · HERO
      ══════════════════════════════════════════════════════════════════ */}
      <section className="relative w-full min-h-[92vh] flex flex-col lg:flex-row items-center justify-center px-6 lg:px-16 overflow-hidden pt-10 pb-20">
        {/* Cinematic radial lights */}
        <div className="absolute inset-0 pointer-events-none -z-10"
          style={{ background: 'radial-gradient(ellipse 70% 60% at 20% 20%, rgba(200,155,60,0.13) 0%, transparent 60%), radial-gradient(ellipse 60% 50% at 80% 80%, rgba(74,31,27,0.10) 0%, transparent 55%)' }}
        />

        {/* Left */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="flex-1 flex flex-col justify-center items-start max-w-2xl z-10 space-y-8 pt-10 lg:pt-0"
        >
          <motion.p
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 1 }}
            className="text-[10px] uppercase tracking-[0.35em] font-bold text-gold"
          >
            Nazakatai Bridal &amp; Festive
          </motion.p>

          <h1 className="font-editorial text-6xl md:text-7xl lg:text-[88px] text-ink leading-[1.03] tracking-tight">
            Crafted for <br />
            <span className="italic font-light">celebrations.</span><br />
            Curated with{' '}
            <span style={{ color: '#4A1F1B' }}>Nazakatai.</span>
          </h1>

          <motion.p
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 1 }}
            className="text-ink/80 text-sm md:text-[15px] leading-relaxed max-w-[420px] font-sans"
          >
            Heritage craftsmanship meets intelligent styling — curated by AI,
            hand-made by artisans in Lucknow's old city.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.8 }}
            className="flex flex-col sm:flex-row gap-4 pt-2"
          >
            <button onClick={() => navigate('/chat')} className="btn-luxury">
              Begin Your Styling Journey
            </button>
            <button
              onClick={() => document.getElementById('collections')?.scrollIntoView({ behavior: 'smooth' })}
              className="btn-ghost-luxury"
            >
              Explore Collections
            </button>
          </motion.div>

          {/* Trust row */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ delay: 1.1, duration: 0.8 }}
            className="flex items-center gap-6 pt-4"
          >
            {[
              { val: '500+', label: 'Artisan Families' },
              { val: '12K+', label: 'Looks Curated' },
              { val: '4.9', label: 'Stylist Rating', icon: true },
            ].map(item => (
              <div key={item.label}>
                <p className="text-xl font-serif font-bold text-ink flex items-center gap-1">
                  {item.val}
                  {item.icon && <Star className="w-3.5 h-3.5 text-gold" fill="#C89B3C" strokeWidth={0} />}
                </p>
                <p className="text-[8px] uppercase tracking-[0.25em] text-muted font-bold">{item.label}</p>
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* Right — hero image */}
        <motion.div
          initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
          className="flex-1 w-full flex items-center justify-center lg:justify-end mt-16 lg:mt-0 z-10 relative"
        >
          <div
            className="relative w-full max-w-[420px] aspect-[3/4] arch-mughal overflow-hidden border-[8px] border-ivory shadow-soft-luxury cursor-pointer group"
            onClick={() => navigate('/chat')}
          >
            <img
              src="https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=1400&auto=format&fit=crop"
              alt="Luxury Indian Ethnic Wear"
              className="w-full h-full object-cover arch-mughal transition-transform duration-[1200ms] group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-maroon/55 via-transparent to-transparent arch-mughal" />

            {/* Floating recommendation chip */}
            <motion.div
              initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 1.6, duration: 0.8 }}
              className="absolute bottom-8 left-1/2 -translate-x-1/2 w-[82%] bg-ivory/96 backdrop-blur-md p-5 border border-gold/35 shadow-[0_10px_40px_rgba(0,0,0,0.15)]"
            >
              <p className="text-[10px] font-serif italic text-maroon mb-1 font-bold">Nazakatai recommends</p>
              <p className="text-[10px] font-sans text-ink uppercase tracking-widest font-bold line-clamp-1">
                Ivory Georgette Kurta Set for Mehendi
              </p>
            </motion.div>
          </div>

          {/* Floating decorative card */}
          <motion.div
            animate={{ y: [-6, 6, -6] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-[8%] right-[-4%] lg:right-[4%] w-28 aspect-[3/4] border-4 border-ivory shadow-2xl overflow-hidden hidden md:block"
          >
            <img
              src="https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=600&auto=format&fit=crop"
              alt="Detail"
              className="w-full h-full object-cover"
            />
          </motion.div>
        </motion.div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          2 · CAROUSEL — "Curated for Celebrations"
      ══════════════════════════════════════════════════════════════════ */}
      <section id="collections" className="w-full py-20 overflow-hidden" style={{ background: 'linear-gradient(180deg, #F8F4EE 0%, #F2ECE3 100%)' }}>
        <div className="px-6 md:px-12 mb-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-end justify-between"
          >
            <div>
              <p className="text-[9px] uppercase tracking-[0.35em] font-bold text-gold mb-2">AI Curated</p>
              <h2 className="font-editorial text-4xl md:text-5xl text-ink italic leading-tight">
                Curated for Celebrations
              </h2>
            </div>
            <button
              onClick={() => navigate('/chat')}
              className="hidden md:flex items-center gap-2 text-[9px] uppercase tracking-[0.25em] font-bold text-ink hover:text-gold transition-colors group"
            >
              Style with AI
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
            </button>
          </motion.div>
        </div>

        <div className="carousel-scroll px-6 md:px-12">
          {carouselItems.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ delay: i * 0.08, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="carousel-item editorial-card border border-gold/10 w-[280px] md:w-[300px]"
              onClick={() => navigate(`/product/${item.id}`)}
            >
              {/* Image */}
              <div className="relative h-[380px] overflow-hidden bg-sand/10">
                {/* AI label */}
                <span className="ai-label absolute top-4 left-4 z-10">
                  <Sparkles className="w-2.5 h-2.5" />
                  {item.label}
                </span>
                <img src={item.img} alt={item.title} className="w-full h-full object-cover" loading="lazy" />
                <div className="card-overlay" />
                <div className="card-cta">
                  <p className="text-[8px] font-bold uppercase tracking-widest text-ivory/70 mb-1">{item.brand}</p>
                  <p className="text-white font-editorial text-xl leading-snug mb-3">{item.title}</p>
                  <button
                    className="text-[8px] font-bold uppercase tracking-widest text-white border border-white/40 px-4 py-2 hover:bg-white/10 transition-colors"
                    onClick={e => { e.stopPropagation(); navigate('/chat'); }}
                  >
                    Style This Look
                  </button>
                </div>
              </div>
              {/* Info bar */}
              <div className="p-4 bg-white border-t border-gold/10">
                <div className="flex justify-between items-start">
                  <div className="flex-1 min-w-0 pr-3">
                    <p className="text-[8px] uppercase tracking-[0.25em] text-gold font-bold mb-0.5">{item.tag}</p>
                    <p className="font-editorial text-[16px] leading-snug text-ink truncate">{item.title}</p>
                  </div>
                  <p className="text-[13px] font-bold text-ink shrink-0">₹{item.price.toLocaleString('en-IN')}</p>
                </div>
                <p className="text-[10px] text-muted italic mt-2 line-clamp-1 font-serif">{item.note}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          3 · STORY SECTION
      ══════════════════════════════════════════════════════════════════ */}
      <section className="w-full py-32 bg-ink text-ivory relative overflow-hidden bg-grain">
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 50% 60% at 50% 0%, rgba(200,155,60,0.08), transparent 70%)' }}
        />
        <div className="container px-6 md:px-12 mx-auto max-w-5xl relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 1 }}
            className="text-center space-y-8"
          >
            <Sparkles className="w-8 h-8 text-gold mx-auto opacity-70" strokeWidth={1} />
            <h2 className="font-editorial text-4xl md:text-5xl lg:text-6xl font-light italic leading-tight text-sand">
              Where heritage weaves<br />meet intelligent curation.
            </h2>
            <div className="w-px h-24 bg-gradient-to-b from-gold to-transparent mx-auto" />
            <div className="grid md:grid-cols-3 gap-12 text-left pt-8">
              {[
                { title: 'The Atelier', body: 'Sourced directly from generational artisans in Lucknow and Banaras, ensuring pristine quality and authenticity in every thread.' },
                { title: 'The Stylist', body: "Nazakatai's intelligence understands the nuances of Indian festivities—from Haldi rituals to grand Receptions—curating the perfect mood." },
                { title: 'The Trousseau', body: 'Build your bespoke digital wardrobe with hand-matched recommendations stored and organized for your big occasions.' },
              ].map(s => (
                <div key={s.title}>
                  <h3 className="text-[10px] uppercase tracking-[0.25em] text-gold font-bold mb-4">{s.title}</h3>
                  <p className="text-sm text-sand/75 font-serif leading-relaxed italic">{s.body}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          4 · EDITORIAL GRID — Asymmetric
      ══════════════════════════════════════════════════════════════════ */}
      <section className="w-full py-24 relative" style={{ background: '#F5F0E8' }}>
        {/* Subtle warm overlay */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 60% 40% at 80% 60%, rgba(200,155,60,0.06), transparent)' }}
        />
        <div className="container px-6 md:px-12 mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-col md:flex-row justify-between items-end mb-14"
          >
            <div>
              <p className="text-[9px] uppercase tracking-[0.35em] font-bold text-gold mb-2">The Atelier Collection</p>
              <h2 className="font-editorial text-4xl md:text-5xl lg:text-6xl text-ink italic leading-tight">
                Festive Editorials
              </h2>
            </div>
            <button
              onClick={() => navigate('/chat')}
              className="hidden md:flex items-center gap-2 text-[9px] uppercase tracking-[0.2em] font-bold text-ink hover:text-gold transition-colors mt-4 md:mt-0 group"
            >
              Explore All
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
            </button>
          </motion.div>

          {/* Asymmetric masonry grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 auto-rows-[220px]">
            {[
              { product: MOCK_CATALOG[1], span: 'row-span-2', label: 'Editor\'s Selection' },
              { product: MOCK_CATALOG[2], span: 'row-span-1', label: 'Heritage Pick' },
              { product: MOCK_CATALOG[6], span: 'row-span-1', label: 'Quiet Luxury' },
              { product: MOCK_CATALOG[3], span: 'row-span-2', label: 'Wedding Favourite' },
              { product: MOCK_CATALOG[4], span: 'row-span-1', label: 'Haldi Essential' },
              { product: MOCK_CATALOG[7], span: 'row-span-1', label: 'Evening Regal' },
              { product: MOCK_CATALOG[5], span: 'row-span-1', label: 'Bridal Trousseau' },
              { product: MOCK_CATALOG[9], span: 'row-span-1', label: 'Mehendi Collection' },
            ].map(({ product, span, label }, i) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ delay: (i % 4) * 0.1, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                className={`editorial-card border border-white/60 shadow-soft-luxury ${span}`}
                onClick={() => navigate(`/product/${product.id}`)}
              >
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                <div className="card-overlay" />

                {/* Always-visible label */}
                <span className="ai-label absolute top-3 left-3 z-10">
                  <Sparkles className="w-2 h-2" />
                  {label}
                </span>

                {/* Hover reveal */}
                <div className="card-cta">
                  <p className="text-[8px] font-bold uppercase tracking-widest text-gold mb-1">{product.brand_id}</p>
                  <p className="text-white font-editorial text-lg leading-snug mb-1">{product.name}</p>
                  <p className="text-[11px] font-bold text-white/80">₹{product.price.toLocaleString('en-IN')}</p>
                  <p className="text-[10px] italic text-white/60 mt-1 font-serif line-clamp-1">
                    {product.description.slice(0, 55)}…
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          5 · LOOKBOOK STRIP — 3 columns
      ══════════════════════════════════════════════════════════════════ */}
      <section className="w-full py-28 bg-ivory relative overflow-hidden">
        <div className="container px-6 md:px-12 mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-col md:flex-row justify-between items-end mb-14"
          >
            <div>
              <p className="text-[9px] uppercase tracking-[0.35em] font-bold text-gold mb-2">Curated Aesthetics</p>
              <h2 className="font-editorial text-4xl md:text-5xl lg:text-6xl text-ink italic">Occasion Lookbooks</h2>
            </div>
            <button className="hidden md:block text-[9px] uppercase tracking-[0.2em] font-bold text-ink border-b border-ink/30 pb-1 hover:border-gold hover:text-gold transition-colors">
              Explore All Lookbooks
            </button>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: 'Royal Banarasi', desc: 'Timeless wedding drapes crafted in Varanasi.', img: 'https://images.unsplash.com/photo-1583391733958-d25e77b2ce43?q=80&w=800&auto=format&fit=crop', tag: 'Wedding' },
              { title: 'Summer Chikankari', desc: 'Breezy pastels for intimate daytime festivities.', img: 'https://images.unsplash.com/photo-1584488349132-72365a6c02cb?q=80&w=800&auto=format&fit=crop', tag: 'Festive' },
              { title: 'Minimal Ivory', desc: 'Quiet luxury in signature heritage whites.', img: 'https://images.unsplash.com/photo-1596450514735-111a2fe02935?q=80&w=800&auto=format&fit=crop', tag: 'Everyday Luxury' },
            ].map((look, i) => (
              <motion.div
                key={look.title}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ delay: i * 0.15, duration: 0.8 }}
                className="group cursor-pointer"
                onClick={() => navigate('/chat')}
              >
                <div className="aspect-[3/4] overflow-hidden arch-simple mb-6 border-4 border-white shadow-soft-luxury relative">
                  <img src={look.img} alt={look.title} className="w-full h-full object-cover transition-transform duration-[1000ms] group-hover:scale-108" />
                  <div className="absolute inset-0 bg-ink/25 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end justify-center pb-10">
                    <span className="bg-ivory/93 backdrop-blur-sm text-ink px-6 py-2.5 text-[9px] uppercase tracking-widest font-bold">
                      View Lookbook
                    </span>
                  </div>
                  <span className="ai-label absolute top-5 right-5 z-10">{look.tag}</span>
                </div>
                <h3 className="font-editorial text-2xl text-ink mb-1.5 italic">{look.title}</h3>
                <p className="text-[10px] text-muted font-sans uppercase tracking-wider">{look.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          6 · CTA BANNER
      ══════════════════════════════════════════════════════════════════ */}
      <section className="w-full py-28 relative overflow-hidden bg-grain" style={{ background: '#171412' }}>
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 60% 70% at 50% 50%, rgba(200,155,60,0.09), transparent 70%)' }}
        />
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
          className="text-center px-6 relative z-10"
        >
          <p className="text-[9px] uppercase tracking-[0.35em] font-bold text-gold mb-6">Your Personal AI Stylist</p>
          <h2 className="font-editorial text-5xl md:text-6xl lg:text-7xl font-light italic text-sand leading-tight mb-8 max-w-3xl mx-auto">
            Your perfect look is<br />one conversation away.
          </h2>
          <p className="text-sm text-sand/60 font-serif italic max-w-md mx-auto mb-12">
            Tell Nazakatai your occasion, and our AI stylist will curate
            hand-picked recommendations from our atelier collection.
          </p>
          <motion.button
            onClick={() => navigate('/chat')}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="btn-luxury inline-flex items-center gap-3 px-12 py-5 text-sm"
            style={{ fontSize: 11, letterSpacing: '0.22em' }}
          >
            <Sparkles className="w-4 h-4" strokeWidth={1.5} />
            Begin Your Styling Journey
          </motion.button>
        </motion.div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          7 · FOOTER
      ══════════════════════════════════════════════════════════════════ */}
      <footer className="bg-ink text-sand/50 py-12 px-6 md:px-12">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-start gap-8">
          <div>
            <p className="font-serif italic text-2xl text-sand font-bold mb-2">Nazakatai.</p>
            <p className="text-[10px] uppercase tracking-[0.25em] font-bold text-gold">Heritage Atelier</p>
          </div>
          <div className="flex gap-16 text-[10px] uppercase tracking-[0.2em] font-bold">
            {['Collections', 'Occasions', 'Brands', 'About', 'Contact'].map(item => (
              <span key={item} className="cursor-pointer hover:text-gold transition-colors">{item}</span>
            ))}
          </div>
        </div>
        <div className="max-w-6xl mx-auto mt-10 pt-8 border-t border-white/5 flex justify-between items-center">
          <p className="text-[9px] uppercase tracking-widest">© 2025 Nazakatai. All rights reserved.</p>
          <p className="text-[9px] uppercase tracking-widest">Hand-crafted with ♥ in Lucknow</p>
        </div>
      </footer>
    </div>
  );
}
