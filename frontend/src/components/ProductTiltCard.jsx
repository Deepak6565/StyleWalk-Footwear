import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, ShoppingBag, Heart, Check } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

export default function ProductTiltCard({ product }) {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const cardRef = useRef(null);

  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [glare, setGlare] = useState({ x: 50, y: 50, opacity: 0 });
  const [selectedSize, setSelectedSize] = useState(() => {
    const raw = (product.sizes && product.sizes.length > 0) ? product.sizes[2] || product.sizes[0] : "Size 8";
    return String(raw).replace(/^UK\s*/i, 'Size ');
  });
  const [addedToast, setAddedToast] = useState(false);

  const isFavorited = isInWishlist(product.id);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const rotateX = ((mouseY - height / 2) / (height / 2)) * -6;
    const rotateY = ((mouseX - width / 2) / (width / 2)) * 6;

    setTilt({ x: rotateX, y: rotateY });

    const glareX = (mouseX / width) * 100;
    const glareY = (mouseY / height) * 100;
    setGlare({ x: glareX, y: glareY, opacity: 0.15 });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
    setGlare({ x: 50, y: 50, opacity: 0 });
  };

  const handleQuickAdd = (e) => {
    e.stopPropagation();
    addToCart(product, selectedSize);
    setAddedToast(true);
    setTimeout(() => setAddedToast(false), 2000);
  };

  const handleWishlistClick = (e) => {
    e.stopPropagation();
    toggleWishlist(product);
  };

  const priceInr = product.price_inr !== undefined ? product.price_inr : product.price;

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={() => navigate(`/product/${product.id}`)}
      style={{
        transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
        transition: 'transform 0.15s ease-out'
      }}
      className="relative rounded-3xl bg-white border border-gray-200 hover:border-indigo-300 p-5 overflow-hidden flex flex-col justify-between group cursor-pointer text-left transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
    >
      {/* Glare Sheen Layer */}
      <div
        className="absolute inset-0 pointer-events-none transition-opacity duration-300 rounded-3xl"
        style={{
          background: `radial-gradient(circle at ${glare.x}% ${glare.y}%, rgba(99, 102, 241, 0.08) 0%, transparent 60%)`,
          opacity: glare.opacity
        }}
      />

      <div>
        {/* Top Badges & Wishlist Toggle */}
        <div className="flex justify-between items-center mb-3">
          <span className="px-2.5 py-1 rounded-lg text-[9px] font-extrabold uppercase tracking-widest bg-indigo-50 text-[#4F46E5] border border-indigo-200/80">
            {product.brand}
          </span>

          <button
            onClick={handleWishlistClick}
            className={`p-2 rounded-xl border transition-all cursor-pointer ${
              isFavorited
                ? 'bg-rose-50 border-rose-200 text-rose-500'
                : 'bg-gray-100 border-gray-200 text-gray-400 hover:text-gray-700 hover:bg-gray-200'
            }`}
            title={isFavorited ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <Heart className={`w-4 h-4 ${isFavorited ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* 1:1 Aspect Ratio Product Image Stage */}
        <div className="relative w-full aspect-square flex items-center justify-center p-2 rounded-2xl bg-slate-50 border border-gray-100 group-hover:border-indigo-200 transition-all duration-300">
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-contain filter drop-shadow-md group-hover:scale-105 transition-transform duration-300"
          />
        </div>

        {/* Title & Star Rating */}
        <div className="mt-4">
          <div className="flex justify-between items-start">
            <h3 className="text-sm font-bold text-[#0F172A] font-heading line-clamp-1 group-hover:text-[#4F46E5] transition-colors">
              {product.name}
            </h3>

            <div className="flex items-center space-x-1 text-amber-500 text-xs font-bold shrink-0 ml-2">
              <Star className="w-3.5 h-3.5 fill-current text-amber-500" />
              <span>{product.rating}</span>
            </div>
          </div>

          <p className="text-[11px] text-[#64748B] font-medium tracking-wide mt-0.5">
            {product.category}
          </p>
        </div>
      </div>

      {/* Quick Size Pills & Price CTA Footer */}
      <div className="mt-4 pt-3 border-t border-gray-100">
        <div className="flex items-center justify-between text-[10px] font-bold text-[#64748B] mb-2">
          <span>Available Sizes:</span>
          <span className="text-[#059669]">{product.stock_quantity > 0 ? `${product.stock_quantity} left` : 'Out of Stock'}</span>
        </div>

        <div className="flex items-center space-x-1 overflow-x-auto pb-1" onClick={(e) => e.stopPropagation()}>
          {(product.sizes || ["Size 6", "Size 7", "Size 8", "Size 9", "Size 10"]).slice(0, 4).map((s) => {
            const sizeLabel = String(s).replace(/^UK\s*/i, 'Size ');
            return (
              <button
                key={s}
                onClick={() => setSelectedSize(sizeLabel)}
                className={`px-2 py-1 rounded-lg text-[10px] font-bold transition border ${
                  selectedSize === sizeLabel
                    ? 'bg-[#4F46E5] text-white border-[#4F46E5]'
                    : 'bg-gray-100 text-[#475569] border-gray-200 hover:bg-gray-200'
                }`}
              >
                {sizeLabel}
              </button>
            );
          })}
        </div>

        {/* Price & Add to Bag CTA */}
        <div className="flex justify-between items-center mt-3 pt-2">
          <div>
            <span className="text-[10px] text-[#64748B] block font-bold uppercase tracking-wider">Price</span>
            <span className="text-base font-extrabold text-[#059669]">
              ₹{priceInr ? priceInr.toLocaleString('en-IN') : '2,499'}
            </span>
          </div>

          <button
            onClick={handleQuickAdd}
            disabled={product.stock_quantity === 0}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 shadow-md ${
              addedToast
                ? 'bg-[#059669] text-white shadow-emerald-500/20'
                : product.stock_quantity === 0
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-[#4F46E5] hover:bg-[#3730A3] text-white shadow-indigo-500/20 cursor-pointer'
            }`}
          >
            {addedToast ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>ADDED</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>ADD TO BAG</span>
              </>
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
}

