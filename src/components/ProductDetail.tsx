import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Product } from '../types';
import { MOCK_CATALOG } from '../data';
import { Sparkles, ArrowLeft, Heart, Share2, ShoppingBag } from 'lucide-react';
import { motion } from 'motion/react';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedSize, setSelectedSize] = useState<string>('');

  useEffect(() => {
    // In a real app we would fetch this. For now, use mock data or an API route.
    const p = MOCK_CATALOG.find(x => x.id === id);
    if (p) setProduct(p);
  }, [id]);

  if (!product) return (
    <div className="flex-1 bg-ivory h-full flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 bg-grain pointer-events-none"></div>
      <div className="flex flex-col items-center">
        <div className="w-12 h-12 rounded-full border-b-2 border-gold animate-spin mb-4"></div>
        <p className="text-[10px] uppercase font-bold tracking-[0.3em] text-gold animate-pulse">Curating with Nazakatai</p>
      </div>
    </div>
  );

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.8 } }
  };

  return (
    <motion.div 
       initial={{ opacity: 0 }}
       animate={{ opacity: 1 }}
       exit={{ opacity: 0 }}
       className="flex-1 bg-ivory overflow-auto w-full bg-grain"
    >
      <div className="container py-12 md:py-20 max-w-6xl mx-auto px-6">
        <button className="flex items-center text-[10px] uppercase tracking-[0.2em] text-muted hover:text-gold transition-colors mb-12 font-bold z-10 relative" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Curations
        </button>

        <motion.div 
           variants={containerVariants}
           initial="hidden"
           animate="show"
           className="grid lg:grid-cols-2 gap-16 md:gap-24 items-start"
        >
          {/* Images */}
          <motion.div variants={itemVariants} className="relative z-10 mt-6 lg:mt-0">
            {/* Background Arch Shape Decoration */}
            <div className="absolute -top-10 -left-6 w-full h-[110%] bg-sand/20 arch-mughal -z-10 blur-xl"></div>
            
            <div className="bg-sand/10 p-6 md:p-12 border border-gold/10 flex items-center justify-center arch-simple shadow-soft-luxury group">
              <div className="absolute top-12 left-1/2 -translate-x-1/2 bg-sage text-white px-4 py-1.5 text-[9px] font-bold uppercase tracking-[0.2em] z-10 shadow-sm whitespace-nowrap border border-white/20">
                In Stock
              </div>
              <img 
                 src={product.images[0]} 
                 alt={product.name} 
                 className="w-full h-auto object-cover max-h-[75vh] shadow-[0_20px_40px_rgba(0,0,0,0.1)] border-[6px] border-white arch-simple transition-transform duration-1000 group-hover:scale-105" 
              />
            </div>
          </motion.div>

          {/* Details */}
          <motion.div variants={itemVariants} className="flex flex-col py-4 z-10">
            <div className="mb-4">
              <span className="text-[9px] uppercase tracking-[0.3em] text-gold font-bold">
                {product.brand_id}
              </span>
            </div>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-editorial leading-[1.1] mb-6 text-ink italic font-light">
              {product.name}
            </h1>
            
            <div className="text-3xl font-serif text-ink mb-10">
              ₹{product.price.toLocaleString('en-IN')}
            </div>

            <p className="text-sm text-muted/90 leading-relaxed mb-12 border-l border-gold/30 pl-5 py-2 font-serif italic w-5/6">
              {product.description}
            </p>

            <div className="mb-12">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-[10px] uppercase tracking-[0.2em] font-bold text-ink">Select Size</h3>
                <button className="text-[9px] uppercase tracking-[0.2em] text-gold hover:text-plum transition-colors font-bold">Size Guide</button>
              </div>
              <div className="flex gap-4">
                {product.sizes_available.map(size => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`w-12 h-12 flex items-center justify-center text-[10px] font-bold uppercase tracking-wider transition-all duration-300
                      ${selectedSize === size ? 'bg-maroon text-ivory shadow-glow-gold scale-110' : 'bg-white border border-gold/20 text-ink hover:border-gold hover:text-gold shadow-sm'}
                    `}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6 mb-16">
               <div className="bg-ivory p-6 border border-gold/20 shadow-soft-luxury">
                 <p className="text-[9px] text-muted uppercase tracking-[0.3em] font-bold mb-3">Fabric</p>
                 <p className="font-editorial text-2xl text-ink capitalize italic">{product.fabric_type}</p>
               </div>
               <div className="bg-ivory p-6 border border-gold/20 shadow-soft-luxury">
                 <p className="text-[9px] text-muted uppercase tracking-[0.3em] font-bold mb-3">Craft</p>
                 <p className="font-editorial text-2xl text-ink capitalize italic">{product.craft_type}</p>
               </div>
            </div>

            <div className="flex flex-col gap-4 mt-auto">
               <button 
                 className="w-full bg-maroon hover:bg-maroon/90 text-ivory h-16 text-[11px] font-bold uppercase tracking-[0.2em] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-soft-luxury hover:shadow-glow-gold flex items-center justify-center" 
                 disabled={!selectedSize}
               >
                 Add to Trousseau — ₹{product.price.toLocaleString('en-IN')}
               </button>
               
               <button 
                 className="w-full bg-transparent border border-gold text-ink hover:bg-gold hover:text-ivory h-16 text-[11px] font-bold uppercase tracking-[0.2em] transition-all flex items-center justify-center shadow-sm" 
                 onClick={() => navigate('/chat')}
               >
                 <Sparkles className="w-4 h-4 mr-3" strokeWidth={1.5} /> Ask Nazakatai About This
               </button>

               <div className="flex justify-center gap-12 mt-8 text-muted">
                 <button className="flex items-center text-[9px] uppercase font-bold tracking-[0.2em] hover:text-terracotta transition-colors group">
                   <Heart className="w-4 h-4 mr-2 group-hover:fill-terracotta transition-colors"/> Save
                 </button>
                 <button className="flex items-center text-[9px] uppercase font-bold tracking-[0.2em] hover:text-gold transition-colors">
                   <Share2 className="w-4 h-4 mr-2"/> Share
                 </button>
               </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
}
