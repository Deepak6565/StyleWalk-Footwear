import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Maximize2, 
  Sparkles, 
  ShieldCheck, 
  Zap, 
  Wind, 
  Award, 
  X,
  Heart
} from 'lucide-react';

export default function ProductMediaGallery({ product }) {
  const [isFullscreenModalOpen, setIsFullscreenModalOpen] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 50, y: 50, show: false });

  const techFeatures = [
    {
      icon: Zap,
      title: 'Cloud-Rebound Foam',
      desc: 'High-density EVA foam midsole absorbs 94% impact shock per step.',
      color: 'text-amber-400 bg-amber-500/10 border-amber-500/30'
    },
    {
      icon: ShieldCheck,
      title: 'Wet-Grip Tread',
      desc: 'Anti-skid vulcanized rubber sole engineered for Indian monsoon terrain.',
      color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30'
    },
    {
      icon: Wind,
      title: 'Air-Knit Breathability',
      desc: 'Micro-perforated upper weave allows continuous 360° airflow.',
      color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30'
    },
    {
      icon: Award,
      title: 'Ergonomic Arch Support',
      desc: 'Anatomically contoured footbed supports long hours of walking.',
      color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30'
    }
  ];

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPosition({ x, y, show: true });
  };

  const handleMouseLeave = () => {
    setZoomPosition({ x: 50, y: 50, show: false });
  };

  return (
    <div className="space-y-6 text-left">
      
      {/* Primary Product Image Stage */}
      <div className="relative rounded-3xl glass-panel border border-white/10 p-6 sm:p-8 overflow-hidden group shadow-2xl bg-gradient-to-b from-white/5 via-transparent to-black/40">
        
        {/* Top Floating Action Bar */}
        <div className="absolute top-4 left-4 right-4 z-20 flex justify-between items-center pointer-events-none">
          <div className="flex items-center space-x-2 pointer-events-auto">
            <span className="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 backdrop-blur-md flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              AUTHENTIC {product.brand || 'STYLEWALK'} CRAFT
            </span>
          </div>

          <div className="flex items-center space-x-2 pointer-events-auto">
            <button
              onClick={() => setIsWishlisted(!isWishlisted)}
              className={`p-2.5 rounded-2xl border transition-all cursor-pointer backdrop-blur-md ${
                isWishlisted
                  ? 'bg-rose-500 text-white border-rose-400 shadow-lg shadow-rose-500/30'
                  : 'bg-white/10 hover:bg-white/20 text-gray-300 border-white/15'
              }`}
              title="Save to Wishlist"
            >
              <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
            </button>

            <button
              onClick={() => setIsFullscreenModalOpen(true)}
              className="p-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-gray-300 border border-white/15 backdrop-blur-md transition cursor-pointer"
              title="Fullscreen High-Res View"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Main Image Viewport with Hover Zoom */}
        <div 
          className="relative w-full h-80 sm:h-96 flex items-center justify-center cursor-zoom-in my-4 overflow-hidden"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          onClick={() => setIsFullscreenModalOpen(true)}
        >
          <motion.img
            key={product.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-contain filter drop-shadow-[0_25px_35px_rgba(0,0,0,0.85)] group-hover:scale-105 transition-transform duration-300"
          />

          {/* Hover Magnifier Tooltip Lens */}
          {zoomPosition.show && (
            <div 
              className="absolute pointer-events-none hidden md:block w-36 h-36 rounded-full border-2 border-indigo-400 shadow-2xl overflow-hidden backdrop-blur-xs"
              style={{
                top: `calc(${zoomPosition.y}% - 4.5rem)`,
                left: `calc(${zoomPosition.x}% - 4.5rem)`,
                backgroundImage: `url(${product.image_url})`,
                backgroundPosition: `${zoomPosition.x}% ${zoomPosition.y}%`,
                backgroundSize: '300%',
                boxShadow: '0 0 30px rgba(99, 102, 241, 0.5), inset 0 0 15px rgba(255, 255, 255, 0.4)'
              }}
            />
          )}
        </div>

      </div>

      {/* Craftsmanship & Tech Specs Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {techFeatures.map((feat) => {
          const Icon = feat.icon;
          return (
            <div
              key={feat.title}
              className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-start space-x-3 hover:border-indigo-500/40 transition group"
            >
              <div className={`p-2.5 rounded-xl border ${feat.color} shrink-0 group-hover:scale-105 transition-transform`}>
                <Icon className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-black text-white group-hover:text-indigo-400 transition-colors">
                  {feat.title}
                </h4>
                <p className="text-[10px] text-gray-400 mt-0.5 leading-relaxed font-medium">
                  {feat.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* FULLSCREEN LIGHTBOX MODAL */}
      <AnimatePresence>
        {isFullscreenModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-2xl flex items-center justify-center p-4"
            onClick={() => setIsFullscreenModalOpen(false)}
          >
            <button
              onClick={() => setIsFullscreenModalOpen(false)}
              className="absolute top-6 right-6 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition cursor-pointer z-10"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="max-w-4xl w-full text-center relative" onClick={(e) => e.stopPropagation()}>
              <img
                src={product.image_url}
                alt={product.name}
                className="max-h-[75vh] w-auto mx-auto object-contain drop-shadow-[0_30px_40px_rgba(0,0,0,0.9)]"
              />
              <div className="mt-6 space-y-1">
                <h3 className="text-xl font-black text-white uppercase">{product.name}</h3>
                <p className="text-xs text-emerald-400 font-bold">Original High-Resolution Product Inspection View</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
