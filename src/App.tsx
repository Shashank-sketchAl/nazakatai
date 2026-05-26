import { motion } from 'motion/react';
import { BrowserRouter, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { Button } from './components/ui/button';
import ChatInterface from './components/ChatInterface';
import { Sparkles, ShoppingBag } from 'lucide-react';
import ProductDetail from './components/ProductDetail';

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-ivory flex flex-col font-sans overflow-hidden bg-grain">
        {/* Navigation */}
        <nav className="h-20 flex items-center justify-between px-6 md:px-10 border-b border-black/5 glass-nav shrink-0 z-50 w-full fixed top-0 transition-all duration-300">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center space-x-2">
              <span className="font-serif italic text-3xl md:text-4xl font-bold tracking-tight text-ink">Nazakatai.</span>
            </Link>
            <div className="hidden lg:flex gap-8 text-[10px] uppercase tracking-[0.2em] font-bold text-ink">
              <Link to="/brands" className="transition-colors hover:text-plum relative group">
                Collections
                <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-gold transition-all duration-300 group-hover:w-full"></span>
              </Link>
              <Link to="/lookbook" className="transition-colors hover:text-plum relative group">
                Occasions
                <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-gold transition-all duration-300 group-hover:w-full"></span>
              </Link>
              <span className="transition-colors hover:text-plum cursor-pointer relative group">
                Brands
                <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-gold transition-all duration-300 group-hover:w-full"></span>
              </span>
            </div>
          </div>
          <div className="flex items-center gap-4">
             <div className="text-right mr-4 hidden md:block">
               <p className="text-[9px] uppercase tracking-[0.2em] text-muted">Stylist Online</p>
               <p className="text-[11px] font-bold text-ink uppercase tracking-wider">Heritage Atelier</p>
             </div>
             <motion.div whileHover={{ scale: 1.05 }} className="w-10 h-10 rounded-full bg-plum flex items-center justify-center text-white font-serif italic text-xl shadow-glow-gold cursor-pointer">
               N
             </motion.div>
             <button className="text-ink hover:text-plum transition-colors ml-2 hidden sm:block">
               <ShoppingBag className="h-5 w-5" strokeWidth={1.5} />
             </button>
          </div>
        </nav>

        <main className="flex-1 flex overflow-hidden pt-20">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/chat" element={<ChatInterface />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="*" element={
              <div className="flex-1 bg-ivory h-full flex items-center justify-center relative overflow-hidden bg-grain">
                 <div className="text-center space-y-6">
                    <h1 className="text-4xl md:text-5xl font-editorial italic text-ink">Awaiting Curation...</h1>
                    <p className="text-sm text-sand/80 font-serif max-w-md mx-auto italic mb-8">This collection is currently being curated in our atelier.</p>
                    <Link to="/">
                      <button className="px-8 py-4 bg-maroon text-ivory text-[10px] font-bold uppercase tracking-[0.2em] rounded-sm hover:bg-ink transition-all shadow-soft-luxury">
                        Return Home
                      </button>
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

function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="flex-1 flex flex-col overflow-auto w-full">
      {/* HERO SECTION */}
      <section className="relative w-full min-h-[90vh] flex flex-col lg:flex-row items-center justify-center px-6 lg:px-16 overflow-hidden pt-10 pb-20">
        
        {/* Cinematic Lighting Background */}
        <div 
          className="absolute inset-0 pointer-events-none -z-10"
          style={{ background: 'radial-gradient(circle at top left, rgba(200,155,60,0.15), transparent 40%), radial-gradient(circle at bottom right, rgba(164,75,42,0.12), transparent 45%)' }}
        >
        </div>

        {/* Left Content */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="flex-1 flex flex-col justify-center items-start max-w-2xl z-10 space-y-8 pt-10 lg:pt-0"
        >
          <div className="space-y-4">
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 1 }}
              className="text-[10px] uppercase tracking-[0.3em] font-bold text-gold"
            >
              Nazakatai Bridal & Festive
            </motion.p>
            <h1 className="font-editorial text-6xl md:text-7xl lg:text-8xl text-ink leading-[1.05] tracking-tight">
              Crafted for <br/>
              <span className="italic font-light">celebrations.</span><br/>
              Curated with <span className="text-plum">Nazakatai.</span>
            </h1>
          </div>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 1 }}
            className="text-ink/90 text-sm md:text-base leading-relaxed max-w-md font-sans font-medium"
          >
            Nazakatai blends heritage craftsmanship with intelligent styling to create timeless ethnic fashion experiences.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.9, duration: 0.8 }}
            className="flex flex-col sm:flex-row gap-4 pt-4"
          >
            <button 
              onClick={() => navigate('/chat')}
              className="px-8 py-5 bg-maroon text-ivory text-[10px] font-bold uppercase tracking-[0.2em] rounded-sm hover:bg-ink transition-all shadow-[0_10px_30px_rgba(74,31,27,0.3)] hover:shadow-[0_15px_40px_rgba(74,31,27,0.4)]"
            >
              Begin Your Styling Journey
            </button>
            <button 
              className="px-10 py-5 bg-transparent border border-ink/20 text-ink text-[10px] font-bold uppercase tracking-[0.2em] rounded-sm hover:border-gold hover:text-gold transition-all"
            >
              Explore Lookbook
            </button>
          </motion.div>
        </motion.div>

        {/* Right Visual (Mughal Arch / Lookbook Preview) */}
        <motion.div 
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
          className="flex-1 w-full flex items-center justify-center lg:justify-end mt-16 md:mt-24 lg:mt-0 z-10 relative"
        >
           <div className="relative w-full max-w-md aspect-[3/4] arch-mughal overflow-hidden border-[8px] border-ivory shadow-soft-luxury bg-ivory p-0 group cursor-pointer" onClick={() => navigate('/chat')}>
              <img 
                src="https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=1500&auto=format&fit=crop" 
                alt="Luxury Indian Ethnic Wear" 
                className="w-full h-full object-cover arch-mughal transition-transform duration-1000 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-maroon/60 via-transparent to-transparent arch-mughal"></div>
              
              {/* Floating Chat UI Preview */}
              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 1.5, duration: 0.8 }}
                className="absolute bottom-8 left-1/2 -translate-x-1/2 w-[85%] bg-ivory/95 backdrop-blur-md p-5 border border-gold/40 shadow-[0_10px_40px_rgba(0,0,0,0.15)] rounded-sm"
              >
                 <p className="text-xs font-serif italic text-maroon mb-1 font-bold">Nazakatai recommends</p>
                 <p className="text-[10px] font-sans text-ink uppercase tracking-widest line-clamp-1 font-bold">Ivory Georgette Kurta Set for Mehendi</p>
              </motion.div>
           </div>
           
           {/* Decorative Elements */}
           <motion.div 
             animate={{ y: [-5, 5, -5] }}
             transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
             className="absolute top-[10%] right-[-5%] lg:right-[5%] w-32 aspect-[3/4] bg-white border-4 border-ivory shadow-2xl overflow-hidden hidden md:block"
           >
             <img src="https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=800&auto=format&fit=crop" alt="Detail" className="w-full h-full object-cover"/>
           </motion.div>
        </motion.div>

      </section>

      {/* STORY SECTION */}
      <section className="w-full py-32 bg-ink text-ivory relative overflow-hidden bg-grain">
        <div className="container px-6 md:px-12 mx-auto max-w-5xl">
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1 }}
            className="text-center space-y-8"
          >
            <Sparkles className="w-8 h-8 text-gold mx-auto opacity-80" strokeWidth={1} />
            <h2 className="font-editorial text-4xl md:text-5xl lg:text-6xl font-light italic leading-tight text-sand">
              Where heritage weaves <br/> meet intelligent curation.
            </h2>
            <div className="w-[1px] h-24 bg-gradient-to-b from-gold to-transparent mx-auto my-12"></div>
            <div className="grid md:grid-cols-3 gap-12 text-left pt-12">
               <div>
                  <h3 className="text-xs uppercase tracking-[0.2em] text-gold font-bold mb-4">The Atelier</h3>
                  <p className="text-sm text-sand/80 font-serif leading-relaxed italic">Sourced directly from generational artisans in Lucknow and Banaras, ensuring pristine quality and authenticity in every thread.</p>
               </div>
               <div>
                  <h3 className="text-xs uppercase tracking-[0.2em] text-gold font-bold mb-4">The Stylist</h3>
                  <p className="text-sm text-sand/80 font-serif leading-relaxed italic">Nazakatai's intelligence understands the nuances of Indian festivities—from Haldi rituals to grand Receptions—curating the perfect mood.</p>
               </div>
               <div>
                  <h3 className="text-xs uppercase tracking-[0.2em] text-gold font-bold mb-4">The Trousseau</h3>
                  <p className="text-sm text-sand/80 font-serif leading-relaxed italic">Build your bespoke digital wardrobe with hand-matched recommendations stored and organized for your big occasions.</p>
               </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* LOOKBOOK SECTION */}
      <section className="w-full py-32 bg-sand/20 relative overflow-hidden">
        <div className="container px-6 md:px-12 mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-col md:flex-row justify-between items-end mb-16"
          >
            <div>
              <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-gold mb-3">Curated Aesthetics</p>
              <h2 className="font-editorial text-4xl md:text-5xl lg:text-6xl text-ink leading-tight italic">
                Festive Editorials
              </h2>
            </div>
            <button className="hidden md:block text-[10px] uppercase tracking-[0.2em] font-bold text-ink border-b border-ink/30 pb-1 hover:border-gold hover:text-gold transition-colors">
              Explore All Lookbooks
            </button>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: "Royal Banarasi",
                desc: "A timeless curation for weddings.",
                img: "https://images.unsplash.com/photo-1583391733958-d25e77b2ce43?q=80&w=800&auto=format&fit=crop"
              },
              {
                title: "Summer Chikankari",
                desc: "Breezy pastels for daytime festivities.",
                img: "https://images.unsplash.com/photo-1584488349132-72365a6c02cb?q=80&w=800&auto=format&fit=crop"
              },
              {
                title: "Minimal Ivory",
                desc: "Quiet luxury in signature whites.",
                img: "https://images.unsplash.com/photo-1596450514735-111a2fe02935?q=80&w=800&auto=format&fit=crop"
              }
            ].map((look, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: i * 0.15, duration: 0.8 }}
                className="group cursor-pointer"
              >
                <div className="aspect-[3/4] overflow-hidden arch-simple mb-6 border-4 border-white shadow-soft-luxury relative">
                  <img src={look.img} alt={look.title} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-ink/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center">
                     <span className="bg-ivory/90 backdrop-blur-sm text-ink px-6 py-2 text-[10px] uppercase tracking-widest font-bold">View Lookbook</span>
                  </div>
                </div>
                <h3 className="font-editorial text-2xl text-ink mb-2 italic">{look.title}</h3>
                <p className="text-xs text-muted font-sans uppercase tracking-wider">{look.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
