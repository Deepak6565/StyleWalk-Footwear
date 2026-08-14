import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Footprints, Shield, Compass, Flame, Crown, X, Filter, Tag, Check } from 'lucide-react';

export default function RadialCategorySelector({ isOpen, onClose, onSelectCategory }) {
  const [selectedGender, setSelectedGender] = useState('All');
  const [selectedPriceRange, setSelectedPriceRange] = useState('All');

  if (!isOpen) return null;

  const categories = [
    { name: 'Sneakers', icon: Flame, color: 'from-indigo-500 to-purple-600', badge: 'POPULAR', desc: 'Campus, Puma & High-Street Sneakers', count: '48 Models' },
    { name: 'Sports Shoes', icon: Sparkles, color: 'from-blue-500 to-indigo-600', badge: 'ATHLETIC', desc: 'Nike, Adidas & Asics Performance Running Shoes', count: '35 Models' },
    { name: 'Formal Shoes', icon: Crown, color: 'from-amber-500 to-yellow-600', badge: 'PREMIUM', desc: 'Bata & Louis Philippe Leather Oxfords', count: '32 Models' },
    { name: 'Boots', icon: Shield, color: 'from-orange-500 to-red-600', badge: 'RUGGED', desc: 'Red Chief & Liberty Heavy-Duty Boots', count: '18 Models' },
    { name: 'Casual Shoes', icon: Footprints, color: 'from-teal-500 to-emerald-600', badge: 'EVERYDAY', desc: 'Woodland, Red Tape & Sparx Loafers', count: '28 Models' },
    { name: 'Crocs & Clogs', icon: Sparkles, color: 'from-cyan-400 to-blue-600', badge: 'TRENDING', desc: 'Crocs & All-Weather Waterproof Clogs', count: '24 Models' },
    { name: 'Slippers & Sandals', icon: Footprints, color: 'from-emerald-400 to-teal-600', badge: 'DAILY COMFORT', desc: 'Woodland & Paragon Comfort Sliders', count: '40 Models' },
    { name: 'Heels & Wedges', icon: Crown, color: 'from-pink-500 to-rose-600', badge: 'GLAMOUR', desc: 'Stilettos, Block Heels & Platform Wedges', count: '22 Models' },
    { name: 'Flats & Mojaris', icon: Compass, color: 'from-purple-500 to-pink-600', badge: 'COMFORT', desc: 'Mochi, Metro & Bata Handcrafted Flats', count: '30 Models' },
    { name: 'Ethnic Footwear', icon: Compass, color: 'from-rose-500 to-pink-600', badge: 'HERITAGE', desc: 'Mochi Kolhapuris & Royal Silk Mojaris', count: '26 Models' },
    { name: 'Boys Footwear', icon: Flame, color: 'from-sky-500 to-blue-600', badge: 'KIDS BOYS', desc: 'Nike, Adidas & Puma Junior Sports Shoes', count: '20 Models' },
    { name: 'Girls Sandals', icon: Sparkles, color: 'from-pink-400 to-rose-500', badge: 'KIDS GIRLS', desc: 'Bata & Paragon Soft Cushion Sandals', count: '18 Models' },
    { name: 'School Shoes', icon: Shield, color: 'from-slate-600 to-gray-800', badge: 'SCHOOL', desc: 'Bata Prefect & Paragon Durable School Shoes', count: '25 Models' },
    { name: 'Bags', icon: Tag, color: 'from-violet-500 to-indigo-700', badge: 'GEAR', desc: 'Wildcraft, Puma, Woodland & RE Bags', count: '40 Models' }
  ];

  const genderOptions = ['All', "Men's", "Women's", "Unisex"];
  const priceOptions = ['All Prices', 'Under ₹1,500', '₹1,500 - ₹3,000', 'Above ₹3,000'];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-gray-950/85 backdrop-blur-xl flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="relative max-w-3xl w-full glass-panel border border-indigo-500/30 rounded-3xl p-6 sm:p-8 text-center shadow-2xl my-auto text-left"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-gray-300 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center space-x-2 mb-2">
              <span className="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                STYLEWALK CATEGORY HUB
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
              EXPLORE FOOTWEAR COLLECTIONS
            </h2>
            <p className="text-xs text-gray-400 font-semibold mt-1">
              Select a category to filter authentic shoes, sneakers, sandals, and boots
            </p>
          </div>

          {/* Quick Filters Row */}
          <div className="mb-6 p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
            <div className="flex items-center text-xs font-black uppercase text-indigo-400 tracking-wider">
              <Filter className="w-3.5 h-3.5 mr-1.5" />
              <span>Filter By Gender & Price</span>
            </div>

            <div className="flex flex-wrap gap-2">
              <span className="text-[10px] font-bold text-gray-400 self-center mr-1">Gender:</span>
              {genderOptions.map((opt) => (
                <button
                  key={opt}
                  onClick={() => setSelectedGender(opt)}
                  className={`px-3 py-1 rounded-xl text-xs font-extrabold transition cursor-pointer border ${
                    selectedGender === opt
                      ? 'bg-indigo-600 text-white border-indigo-400 shadow-md'
                      : 'bg-white/5 text-gray-400 border-white/10 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap gap-2 pt-1 border-t border-white/5">
              <span className="text-[10px] font-bold text-gray-400 self-center mr-1">Price:</span>
              {priceOptions.map((opt) => (
                <button
                  key={opt}
                  onClick={() => setSelectedPriceRange(opt)}
                  className={`px-3 py-1 rounded-xl text-xs font-extrabold transition cursor-pointer border ${
                    selectedPriceRange === opt
                      ? 'bg-emerald-600 text-white border-emerald-400 shadow-md'
                      : 'bg-white/5 text-gray-400 border-white/10 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          {/* Category Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((cat) => {
              const Icon = cat.icon;
              return (
                <button
                  key={cat.name}
                  onClick={() => {
                    onSelectCategory(cat.name);
                    onClose();
                  }}
                  className="p-5 rounded-2xl bg-white/5 hover:bg-white/15 border border-white/10 hover:border-indigo-500/50 flex flex-col justify-between space-y-4 group transition text-left cursor-pointer relative overflow-hidden"
                >
                  <div className="flex justify-between items-start">
                    <div className={`w-11 h-11 rounded-xl bg-gradient-to-tr ${cat.color} flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest bg-white/10 text-indigo-300 border border-white/15">
                      {cat.badge}
                    </span>
                  </div>

                  <div>
                    <div className="flex justify-between items-center">
                      <h3 className="text-sm font-black text-white group-hover:text-indigo-400 transition-colors">
                        {cat.name}
                      </h3>
                      <span className="text-[10px] font-bold text-emerald-400">{cat.count}</span>
                    </div>
                    <p className="text-[10px] text-gray-400 mt-1 line-clamp-2 leading-relaxed">
                      {cat.desc}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Bottom Action Footer */}
          <div className="mt-6 pt-4 border-t border-white/10 flex justify-between items-center text-xs">
            <span className="text-gray-400 font-semibold">
              Looking for all products?
            </span>
            <button
              onClick={() => {
                onSelectCategory('All');
                onClose();
              }}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs transition cursor-pointer"
            >
              VIEW ALL PRODUCTS
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

