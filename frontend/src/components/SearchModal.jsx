import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, TrendingUp, Sparkles, ArrowRight, Package } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

export default function SearchModal({ isOpen, onClose }) {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const trendingTags = [
    'Sneakers',
    'Campus Oxyfit',
    'Puma High-Top',
    'Leather Boots',
    'Bata Oxford',
    'Crocs Clogs',
    'Velvet Mojari',
    'Wildcraft Bag'
  ];

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await api.get(`/products?search=${encodeURIComponent(query)}`);
        setResults(res.data.slice(0, 5));
      } catch (err) {
        console.error('Search failed:', err);
      } finally {
        setLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-start justify-center pt-16 sm:pt-24 px-4">
        
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.96 }}
          transition={{ duration: 0.25 }}
          className="relative z-10 w-full max-w-2xl bg-white border border-gray-200 rounded-3xl p-6 shadow-2xl text-left"
        >
          {/* Header Input */}
          <div className="flex items-center justify-between pb-4 border-b border-gray-200">
            <div className="relative flex-1 flex items-center">
              <Search className="w-5 h-5 text-[#4F46E5] absolute left-3" />
              <input
                type="text"
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search style, brand, sneakers, leather boots..."
                className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-semibold text-[#0F172A] placeholder-[#64748B] focus:outline-none focus:border-[#4F46E5] focus:bg-white"
              />
            </div>
            
            <button
              onClick={onClose}
              className="ml-3 p-2.5 rounded-2xl bg-gray-100 hover:bg-gray-200 text-[#475569] hover:text-[#0F172A] transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Trending Searches Tags */}
          {!query && (
            <div className="pt-5 space-y-4">
              <div className="flex items-center space-x-2 text-xs font-bold text-[#64748B] uppercase tracking-wider">
                <TrendingUp className="w-4 h-4 text-[#4F46E5]" />
                <span>Trending Searches</span>
              </div>

              <div className="flex flex-wrap gap-2">
                {trendingTags.map((tag, idx) => (
                  <button
                    key={idx}
                    onClick={() => setQuery(tag)}
                    className="px-3.5 py-1.5 rounded-xl bg-gray-50 hover:bg-indigo-50 text-[#0F172A] hover:text-[#4F46E5] text-xs font-semibold border border-gray-200 hover:border-indigo-300 transition cursor-pointer flex items-center space-x-1.5"
                  >
                    <span>{tag}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Search Results List */}
          {query && (
            <div className="pt-4 space-y-3 max-h-[60vh] overflow-y-auto">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#64748B] block">
                {loading ? 'Searching catalog...' : `${results.length} Products Found`}
              </span>

              {results.length === 0 && !loading ? (
                <div className="py-12 text-center text-[#64748B]">
                  <Package className="w-10 h-10 mx-auto mb-2 opacity-50" />
                  <p className="text-xs font-bold">No matching footwear found for "{query}"</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {results.map((product) => (
                    <div
                      key={product.id}
                      onClick={() => {
                        onClose();
                        navigate(`/product/${product.id}`);
                      }}
                      className="p-3 rounded-2xl bg-gray-50 hover:bg-indigo-50/70 border border-gray-200 hover:border-indigo-300 flex items-center space-x-4 cursor-pointer transition"
                    >
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-12 h-12 object-contain rounded-xl bg-white p-1 border border-gray-200 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#4F46E5]">
                          {product.brand}
                        </span>
                        <h4 className="text-xs font-bold text-[#0F172A] truncate font-heading">{product.name}</h4>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-extrabold text-[#059669]">
                          ₹{(product.price_inr || product.price).toLocaleString('en-IN')}
                        </span>
                        <ArrowRight className="w-4 h-4 text-[#64748B] ml-auto mt-1" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </motion.div>
      </div>
    </AnimatePresence>
  );
}
