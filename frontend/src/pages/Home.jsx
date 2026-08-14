import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import {
  Sparkles,
  Ruler,
  Search,
  ArrowRight,
  RefreshCw,
  ChevronDown,
  Truck,
  ShieldCheck,
  Clock,
  Star,
  Check,
  Layers,
  Eye,
  ExternalLink
} from 'lucide-react';
import ProductTiltCard from '../components/ProductTiltCard';
import ShoeSizeAdvisorModal from '../components/ShoeSizeAdvisorModal';

export default function Home({ selectedCategory: propCategory, onSelectCategory, searchFilter }) {
  const navigate = useNavigate();
  const heroRef = useRef(null);

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [localCategory, setLocalCategory] = useState(propCategory || 'All');
  
  const selectedCategory = propCategory !== undefined ? propCategory : localCategory;

  const handleCategoryChange = (cat) => {
    setLocalCategory(cat);
    if (onSelectCategory) {
      onSelectCategory(cat);
    }
  };

  const [sortBy, setSortBy] = useState('newest');
  const [localSearch, setLocalSearch] = useState('');
  const [isSizeAdvisorOpen, setIsSizeAdvisorOpen] = useState(false);
  const [globalColorFilter, setGlobalColorFilter] = useState('Cyber Black');
  const [globalViewAngle, setGlobalViewAngle] = useState(0);

  // Automatic Background Image Slideshow State
  const heroImages = [
    '/images/hero_banner_light_1.png',
    '/images/hero_banner_light_2.png',
    '/images/hero_banner_light_3.png'
  ];
  const [currentBgIdx, setCurrentBgIdx] = useState(0);

  // Parallax scroll
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 500], [0, 150]);
  const heroOpacity = useTransform(scrollY, [0, 400], [1, 0]);

  // Automatic 5-second background image rotation timer
  useEffect(() => {
    const bgTimer = setInterval(() => {
      setCurrentBgIdx((prevIdx) => (prevIdx + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(bgTimer);
  }, [heroImages.length]);

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, sortBy, searchFilter]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const searchTerm = searchFilter || localSearch;
      const params = {};
      if (selectedCategory && selectedCategory !== 'All') params.category = selectedCategory;
      if (searchTerm) params.search = searchTerm;
      if (sortBy) params.sort = sortBy;

      const res = await axios.get('http://localhost:5000/api/products', { params });
      setProducts(res.data);
    } catch (err) {
      console.error('Failed to fetch products:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchProducts();
  };

  const categories = [
    'All',
    'Sneakers',
    'Sports Shoes',
    'Formal Shoes',
    'Boots',
    'Casual Shoes',
    'Crocs & Clogs',
    'Slippers & Sandals',
    'Heels & Wedges',
    'Flats & Mojaris',
    'Ethnic Footwear',
    'Boys Footwear',
    'Girls Sandals',
    'School Shoes',
    'Bags',
    'Laptop Backpacks',
    'Sport & Duffle Bags',
    'Trekking Backpacks',
    'Rider Bike Bags'
  ];

  const features = [
    { icon: Truck, title: 'Free Shipping', desc: 'On orders above ₹999' },
    { icon: ShieldCheck, title: '100% Authentic', desc: 'Genuine brand products' },
    { icon: Clock, title: '30-Day Returns', desc: 'Easy hassle-free returns' },
    { icon: Star, title: 'Top Rated', desc: '4.8★ avg customer rating' }
  ];

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#0F172A] pb-32">

      {/* ═══════════════════════════════════════════════════════
          CINEMATIC HERO SECTION
          ═══════════════════════════════════════════════════════ */}
      <section ref={heroRef} className="relative w-full h-[88vh] min-h-[600px] overflow-hidden bg-slate-100">

        {/* Hero Background Image Slideshow */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentBgIdx}
            initial={{ opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, ease: 'easeInOut' }}
            style={{ y: heroY }}
            className="absolute inset-0 w-full h-[110%] -top-[5%]"
          >
            <img
              src={heroImages[currentBgIdx]}
              alt="StyleWalk Premium Footwear Collection"
              className="w-full h-full object-cover object-center filter brightness-[0.98] contrast-[1.02]"
            />

            {/* Soft, ultra-clean gradient overlays tailored for light mode */}
            <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/80 to-transparent sm:to-transparent/30" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#FAFAFA] via-transparent to-white/50" />
          </motion.div>
        </AnimatePresence>

        {/* Ambient Glow Orbs (Soft Indigo & Emerald) */}
        <div className="absolute top-1/3 left-1/4 w-[500px] h-[500px] bg-indigo-300/20 rounded-full filter blur-[160px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-emerald-300/20 rounded-full filter blur-[140px] pointer-events-none" />

        {/* Hero Content */}
        <motion.div
          style={{ opacity: heroOpacity }}
          className="relative z-10 h-full flex items-center"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <div className="max-w-2xl space-y-6 text-left">

              {/* Editorial Tag */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-xl bg-white/90 backdrop-blur-md text-[#0F172A] border border-gray-200 shadow-sm text-xs font-extrabold uppercase tracking-widest"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#4F46E5]" />
                <span>NEW COLLECTION / 2026 • STYLE WALK</span>
              </motion.div>

              {/* Main Headline */}
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.15, ease: 'easeOut' }}
                className="space-y-1"
              >
                <h1 className="text-5xl sm:text-7xl lg:text-[5.5rem] font-extrabold tracking-tight leading-[0.95] uppercase font-heading">
                  <span className="block text-[#0F172A]">Step Into</span>
                  <span
                    className="block"
                    style={{
                      background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 40%, #059669 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text'
                    }}
                  >
                    Your Style.
                  </span>
                </h1>
                {/* Brand name accent */}
                <div className="flex items-center gap-2 pt-1">
                  <div className="h-px w-8 bg-gradient-to-r from-[#4F46E5] to-transparent" />
                  <span
                    className="text-[11px] font-extrabold tracking-[0.3em] uppercase"
                    style={{
                      background: 'linear-gradient(90deg, #4F46E5, #7C3AED)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text'
                    }}
                  >
                    STYLE WALK™
                  </span>
                  <div className="h-px flex-1 bg-gradient-to-r from-[#7C3AED]/40 to-transparent" />
                </div>
              </motion.div>

              {/* Sub-headline */}
              <motion.p
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.3, ease: 'easeOut' }}
                className="text-base sm:text-lg text-[#475569] font-medium max-w-lg leading-relaxed"
              >
                Footwear designed for movement, comfort and everyday expression.
              </motion.p>

              {/* CTA Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 25 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.45, ease: 'easeOut' }}
                className="flex flex-wrap gap-4 pt-2"
              >
                <button
                  onClick={() => {
                    document.getElementById('gallery-section')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="group px-8 py-4 rounded-xl bg-[#4F46E5] hover:bg-[#3730A3] text-white font-extrabold text-xs tracking-wider shadow-md shadow-indigo-500/20 flex items-center space-x-3 transition-all duration-300 hover:scale-[1.02] cursor-pointer uppercase"
                >
                  <span>EXPLORE COLLECTION</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>

                <button
                  onClick={() => setIsSizeAdvisorOpen(true)}
                  className="px-6 py-4 rounded-xl bg-white hover:bg-gray-100 text-[#0F172A] border border-gray-200 font-extrabold text-xs flex items-center space-x-2 transition-all duration-300 cursor-pointer uppercase shadow-sm"
                >
                  <Ruler className="w-4 h-4 text-[#059669]" />
                  <span>SIZE ADVISOR</span>
                </button>
              </motion.div>

            </div>
          </div>
        </motion.div>

        {/* Bottom Slide Indicators */}
        <div className="absolute bottom-6 right-8 z-20 flex items-center space-x-2">
          {heroImages.map((_, idx) => (
            <div
              key={idx}
              className={`h-1.5 rounded-full transition-all duration-500 ${currentBgIdx === idx ? 'w-6 bg-[#4F46E5]' : 'w-1.5 bg-gray-300'}`}
            />
          ))}
        </div>

        {/* Scroll Down Indicator */}
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-1 pointer-events-none"
        >
          <span className="text-[9px] text-slate-300 font-bold uppercase tracking-widest">Scroll</span>
          <ChevronDown className="w-4 h-4 text-white" />
        </motion.div>

      </section>

      {/* TRUST BADGES STRIP */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {features.map((feat, i) => (
            <motion.div
              key={feat.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-white rounded-2xl p-5 flex items-start gap-4 border border-gray-200 hover:border-indigo-300 transition-all duration-300 group text-left shadow-sm hover:shadow-md"
            >
              <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0 group-hover:bg-indigo-100 transition-colors">
                <feat.icon className="w-5 h-5 text-[#4F46E5]" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-[#0F172A] font-heading">{feat.title}</h4>
                <p className="text-[11px] text-[#64748B] mt-0.5">{feat.desc}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>



      {/* ═══════════════════════════════════════════════
          PRODUCT GALLERY SECTION
          ═══════════════════════════════════════════════ */}
      <section id="products-section" className="pt-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto scroll-mt-20">

        {/* Neat Professional 2-Tier Controls Suite */}
        <div className="p-4 sm:p-6 rounded-3xl bg-white border border-gray-200 mb-8 text-left space-y-4 shadow-sm">

          {/* Top Row: Gallery Title + Search Input + Sort Dropdown */}
          <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 pb-4 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#059669] animate-pulse" />
              <h2 className="text-lg sm:text-xl font-extrabold text-[#0F172A] font-heading uppercase tracking-tight">
                FOOTWEAR & BAGS GALLERY
              </h2>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              {/* Search Form */}
              <form onSubmit={handleSearchSubmit} className="relative sm:w-64">
                <Search className="w-4 h-4 text-[#64748B] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search Campus, Bata, Crocs..."
                  value={localSearch}
                  onChange={(e) => setLocalSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-xs font-semibold text-[#0F172A] placeholder-[#64748B] focus:outline-none focus:border-[#4F46E5] focus:bg-white cursor-text"
                />
              </form>

              {/* Sort Dropdown */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="py-2.5 px-3 rounded-xl bg-gray-50 border border-gray-200 text-xs font-semibold text-[#0F172A] focus:outline-none focus:border-[#4F46E5] cursor-pointer"
              >
                <option value="newest">Sort: Featured</option>
                <option value="price_asc">Price: Low to High (₹)</option>
                <option value="price_desc">Price: High to Low (₹)</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>
          </div>

          {/* Bottom Row: Category Filter Pills */}
          <div className="space-y-2">
            <span className="text-[10px] font-extrabold uppercase text-[#4F46E5] tracking-widest block">
              FILTER BY CATEGORY:
            </span>
            <div className="flex items-center gap-2 overflow-x-auto pb-2 flex-nowrap"
              style={{ scrollbarWidth: 'thin', scrollbarColor: '#4F46E5 #f1f5f9' }}
            >
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => handleCategoryChange(cat)}
                  className={`px-4 py-2 rounded-xl text-xs font-extrabold tracking-wider uppercase transition-all shrink-0 cursor-pointer border ${selectedCategory === cat
                    ? 'bg-[#4F46E5] text-white border-[#4F46E5] shadow-md shadow-indigo-500/20'
                    : 'bg-gray-100 text-[#475569] border-gray-200 hover:bg-gray-200 hover:text-[#0F172A]'
                    }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Gallery Subtitle & Item Count */}
        <div className="flex justify-between items-center mb-6 text-left">
          <p className="text-xs text-[#64748B] font-semibold">
            Showing {products.length} Authentic Footwear Models
          </p>

          <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-[#059669] border border-emerald-200">
            {selectedCategory === 'All' ? 'All Collections' : selectedCategory}
          </span>
        </div>

        {/* 3D Tilt Product Card Grid */}
        {loading ? (
          <div className="py-24 text-center">
            <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin mx-auto mb-3" />
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
              Fetching StyleWalk Footwear Collection...
            </p>
          </div>
        ) : products.length === 0 ? (
          <div className="py-24 glass-panel rounded-3xl text-center border border-white/10">
            <p className="text-base font-bold text-gray-300">No footwear models found matching your search.</p>
            <button
              onClick={() => {
                setSelectedCategory('All');
                setLocalSearch('');
              }}
              className="mt-4 px-6 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-500 transition cursor-pointer"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductTiltCard key={product.id} product={product} />
            ))}
          </div>
        )}

      </section>



      {/* SIZE ADVISOR MODAL */}
      <ShoeSizeAdvisorModal
        isOpen={isSizeAdvisorOpen}
        onClose={() => setIsSizeAdvisorOpen(false)}
      />
    </div>
  );
}
