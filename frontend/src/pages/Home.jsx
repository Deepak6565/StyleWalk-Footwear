import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
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
  Layers,
  Eye,
  ShoppingBag,
  Heart,
  Grid,
  Filter,
  Check
} from 'lucide-react';
import ProductTiltCard from '../components/ProductTiltCard';
import ShoeSizeAdvisorModal from '../components/ShoeSizeAdvisorModal';

export default function Home({ selectedCategory: propCategory, onSelectCategory, searchFilter }) {
  const navigate = useNavigate();
  const heroRef = useRef(null);

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [localCategory, setLocalCategory] = useState(propCategory || 'All');
  const [activeMainTab, setActiveMainTab] = useState('All'); // 'All', 'Men', 'Women', 'Kids', 'Bags', 'Collections'

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

  // Automatic background slideshow timer
  useEffect(() => {
    const bgTimer = setInterval(() => {
      setCurrentBgIdx((prevIdx) => (prevIdx + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(bgTimer);
  }, [heroImages.length]);

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, sortBy, searchFilter, activeMainTab]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const searchTerm = searchFilter || localSearch;
      const params = {};

      if (selectedCategory && selectedCategory !== 'All') {
        params.category = selectedCategory;
      } else if (activeMainTab !== 'All') {
        if (activeMainTab === 'Men') params.category = 'Sneakers';
        else if (activeMainTab === 'Women') params.category = 'Heels & Wedges';
        else if (activeMainTab === 'Kids') params.category = 'Boys Footwear';
        else if (activeMainTab === 'Bags') params.category = 'Bags';
      }

      if (searchTerm) params.search = searchTerm;
      if (sortBy) params.sort = sortBy;

      const res = await api.get('/products', { params });
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

  const mainTabs = [
    { id: 'All', label: 'All Collections', badge: '100% Authentic' },
    { id: 'Men', label: 'Men\'s Footwear', badge: 'Sneakers & Formals' },
    { id: 'Women', label: 'Women\'s Luxury', badge: 'Heels & Mojaris' },
    { id: 'Kids', label: 'Kids & Youth', badge: 'Boys, Girls & School' },
    { id: 'Bags', label: 'Bags & Accessories', badge: 'Backpacks & Travel' },
    { id: 'Collections', label: 'Curated Collections', badge: '2026 Editions' }
  ];

  const subCategories = [
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

  // Helper product filtering for dedicated homepage sections
  const menProducts = products.filter(p => ['Sneakers', 'Sports Shoes', 'Formal Shoes', 'Boots', 'Casual Shoes', 'Crocs & Clogs', 'Slippers & Sandals'].includes(p.category));
  const womenProducts = products.filter(p => ['Heels & Wedges', 'Flats & Mojaris', 'Ethnic Footwear'].includes(p.category) || p.name.toLowerCase().includes('women') || p.brand?.toLowerCase().includes('mochi'));
  const kidsProducts = products.filter(p => ['Boys Footwear', 'Girls Sandals', 'School Shoes'].includes(p.category) || p.name.toLowerCase().includes('school') || p.name.toLowerCase().includes('kid'));
  const bagsProducts = products.filter(p => ['Bags', 'Laptop Backpacks', 'Sport & Duffle Bags', 'Trekking Backpacks', 'Rider Bike Bags'].includes(p.category));

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

            {/* Gradient Overlays */}
            <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/80 to-transparent sm:to-transparent/30" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#FAFAFA] via-transparent to-white/50" />
          </motion.div>
        </AnimatePresence>

        {/* Hero Content */}
        <motion.div
          style={{ opacity: heroOpacity }}
          className="relative z-10 h-full flex items-center"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <div className="max-w-2xl space-y-6 text-left">

              {/* Tag */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-xl bg-white/90 backdrop-blur-md text-[#0F172A] border border-gray-200 shadow-sm text-xs font-extrabold uppercase tracking-widest"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#4F46E5]" />
                <span>NEW COLLECTION / 2026 • STYLEWALK</span>
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
                    STYLEWALK™ FOOTWEAR &amp; ACCESSORIES
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
                Curated premium footwear &amp; luggage designed for ultimate comfort, performance, and modern expression.
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
                    document.getElementById('category-showcase-section')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="group px-8 py-4 rounded-xl bg-[#4F46E5] hover:bg-[#3730A3] text-white font-extrabold text-xs tracking-wider shadow-md shadow-indigo-500/20 flex items-center space-x-3 transition-all duration-300 hover:scale-[1.02] cursor-pointer uppercase"
                >
                  <span>EXPLORE CATEGORIES</span>
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

        {/* Slide Indicators */}
        <div className="absolute bottom-6 right-8 z-20 flex items-center space-x-2">
          {heroImages.map((_, idx) => (
            <div
              key={idx}
              className={`h-1.5 rounded-full transition-all duration-500 ${currentBgIdx === idx ? 'w-6 bg-[#4F46E5]' : 'w-1.5 bg-gray-300'}`}
            />
          ))}
        </div>

        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-1 pointer-events-none"
        >
          <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Scroll</span>
          <ChevronDown className="w-4 h-4 text-slate-500" />
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

      {/* ═══════════════════════════════════════════════════════
          VISUAL CATEGORY SHOWCASE BANNER CARDS
          (Men, Women, Kids, Bags, Collections)
          ═══════════════════════════════════════════════════════ */}
      <section id="category-showcase-section" className="pt-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-left scroll-mt-20">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <span className="text-[10px] font-extrabold uppercase text-[#4F46E5] tracking-widest block mb-1">
              CURATED DEPARTMENTS
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] font-heading uppercase tracking-tight">
              EXPLORE STYLEWALK SECTIONS
            </h2>
          </div>
          <p className="text-xs text-[#64748B] max-w-md font-medium">
            Discover tailored collections for every style, activity, and age group with authentic brand assurance.
          </p>
        </div>

        {/* 5 Department Visual Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {[
            {
              id: 'Men',
              title: 'MEN\'S FOOTWEAR',
              subtitle: 'Sneakers, Formals & Boots',
              img: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80',
              cat: 'Sneakers',
              color: 'from-blue-600 to-indigo-900'
            },
            {
              id: 'Women',
              title: 'WOMEN\'S LUXURY',
              subtitle: 'Heels, Wedges & Mojaris',
              img: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=600&q=80',
              cat: 'Heels & Wedges',
              color: 'from-purple-600 to-pink-900'
            },
            {
              id: 'Kids',
              title: 'KIDS & YOUTH',
              subtitle: 'School Shoes & Sandals',
              img: 'https://images.unsplash.com/photo-1560769629-975ec94e6a86?auto=format&fit=crop&w=600&q=80',
              cat: 'Boys Footwear',
              color: 'from-emerald-600 to-teal-900'
            },
            {
              id: 'Bags',
              title: 'BAGS & LUGGAGE',
              subtitle: 'Laptop, Duffle & Bike Bags',
              img: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=80',
              cat: 'Bags',
              color: 'from-amber-600 to-orange-900'
            },
            {
              id: 'Collections',
              title: 'EXCLUSIVE 2026',
              subtitle: 'Limited Edition Cyber Craft',
              img: 'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?auto=format&fit=crop&w=600&q=80',
              cat: 'All',
              color: 'from-indigo-700 to-slate-900'
            }
          ].map((item) => (
            <motion.div
              key={item.id}
              whileHover={{ y: -6, scale: 1.02 }}
              transition={{ type: 'spring', stiffness: 350, damping: 22 }}
              onClick={() => {
                setActiveMainTab(item.id);
                handleCategoryChange(item.cat);
                document.getElementById('products-section')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="relative h-64 rounded-3xl overflow-hidden cursor-pointer shadow-md group border border-gray-200"
            >
              <img
                src={item.img}
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              />
              <div className={`absolute inset-0 bg-gradient-to-t ${item.color} opacity-70 group-hover:opacity-80 transition-opacity`} />

              <div className="absolute inset-0 p-5 flex flex-col justify-between text-white z-10">
                <span className="text-[10px] font-black tracking-widest uppercase bg-white/20 backdrop-blur-md px-2.5 py-1 rounded-full w-max border border-white/30">
                  {item.id}
                </span>

                <div>
                  <h3 className="text-base font-extrabold font-heading uppercase tracking-tight">{item.title}</h3>
                  <p className="text-[11px] text-gray-200 font-medium mt-0.5">{item.subtitle}</p>

                  <div className="mt-3 inline-flex items-center text-[10px] font-black uppercase tracking-wider text-white group-hover:translate-x-1 transition-transform">
                    <span>EXPLORE NOW</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>



      {/* ═══════════════════════════════════════════════════════
          PRODUCT GALLERY SECTION WITH CATEGORY FILTER
          ═══════════════════════════════════════════════════════ */}
      <section id="products-section" className="pt-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto scroll-mt-20 text-left">

        {/* Controls Suite */}
        <div className="p-4 sm:p-6 rounded-3xl bg-white border border-gray-200 mb-8 space-y-4 shadow-sm">

          <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 pb-4 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#059669] animate-pulse" />
              <h2 className="text-lg sm:text-xl font-extrabold text-[#0F172A] font-heading uppercase tracking-tight">
                {activeMainTab === 'All' ? 'ALL FOOTWEAR & BAGS' : `${activeMainTab.toUpperCase()} COLLECTION`}
              </h2>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              {/* Search Form */}
              <form onSubmit={handleSearchSubmit} className="relative sm:w-64">
                <Search className="w-4 h-4 text-[#64748B] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search Campus, Bata, Puma..."
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

          {/* Sub-Category Pills */}
          <div className="space-y-2">
            <span className="text-[10px] font-extrabold uppercase text-[#4F46E5] tracking-widest block">
              SUB-CATEGORY FILTER:
            </span>
            <div className="flex items-center gap-2 overflow-x-auto pb-2 flex-nowrap"
              style={{ scrollbarWidth: 'thin', scrollbarColor: '#4F46E5 #f1f5f9' }}
            >
              {subCategories.map((cat) => (
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

        {/* Item Count */}
        <div className="flex justify-between items-center mb-6">
          <p className="text-xs text-[#64748B] font-semibold">
            Showing {products.length} Authentic Footwear &amp; Bag Models
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
          <div className="py-24 bg-white rounded-3xl text-center border border-gray-200 p-8 shadow-sm">
            <p className="text-base font-bold text-gray-700">No products found matching your active filter.</p>
            <button
              onClick={() => {
                handleCategoryChange('All');
                setActiveMainTab('All');
                setLocalSearch('');
              }}
              className="mt-4 px-6 py-2.5 rounded-xl bg-[#4F46E5] text-white text-xs font-bold hover:bg-[#3730A3] transition cursor-pointer"
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
