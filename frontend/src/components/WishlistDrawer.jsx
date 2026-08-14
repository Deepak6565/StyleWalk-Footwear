import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart, ShoppingBag, Trash2 } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';

export default function WishlistDrawer() {
  const { wishlistItems, isWishlistOpen, setIsWishlistOpen, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();
  const navigate = useNavigate();

  return (
    <AnimatePresence>
      {isWishlistOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="wishlist-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsWishlistOpen(false)}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50"
          />

          {/* Drawer Panel */}
          <motion.div
            key="wishlist-panel"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 32 }}
            className="fixed right-0 top-0 h-full w-full max-w-sm bg-white z-50 flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-rose-50 flex items-center justify-center">
                  <Heart className="w-4 h-4 text-rose-500 fill-current" />
                </div>
                <div>
                  <h2 className="text-sm font-extrabold text-[#0F172A]">My Wishlist</h2>
                  <p className="text-[11px] text-[#94A3B8]">{wishlistItems.length} saved item{wishlistItems.length !== 1 ? 's' : ''}</p>
                </div>
              </div>
              <button
                onClick={() => setIsWishlistOpen(false)}
                className="w-8 h-8 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition cursor-pointer"
              >
                <X className="w-4 h-4 text-[#475569]" />
              </button>
            </div>

            {/* Items List */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
              {wishlistItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-16 space-y-3">
                  <div className="w-16 h-16 rounded-2xl bg-rose-50 flex items-center justify-center">
                    <Heart className="w-8 h-8 text-rose-200" />
                  </div>
                  <p className="text-sm font-bold text-[#0F172A]">Your wishlist is empty</p>
                  <p className="text-xs text-[#94A3B8]">Tap the ♡ on any product to save it here</p>
                  <button
                    onClick={() => setIsWishlistOpen(false)}
                    className="mt-2 px-5 py-2.5 rounded-xl bg-[#4F46E5] text-white text-xs font-bold cursor-pointer hover:bg-[#3730A3] transition"
                  >
                    Explore Products
                  </button>
                </div>
              ) : (
                wishlistItems.map((item) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: 40 }}
                    className="flex items-center gap-3 p-3 rounded-2xl bg-gray-50 border border-gray-100 hover:border-indigo-200 transition group"
                  >
                    {/* Image */}
                    <div
                      className="w-16 h-16 rounded-xl bg-white border border-gray-200 flex items-center justify-center overflow-hidden shrink-0 cursor-pointer"
                      onClick={() => { setIsWishlistOpen(false); navigate(`/product/${item.id}`); }}
                    >
                      <img src={item.image_url} alt={item.name} className="w-full h-full object-contain p-1" />
                    </div>

                    {/* Info */}
                    <div className="flex-1 overflow-hidden">
                      <p
                        className="text-xs font-bold text-[#0F172A] truncate cursor-pointer hover:text-[#4F46E5] transition"
                        onClick={() => { setIsWishlistOpen(false); navigate(`/product/${item.id}`); }}
                      >
                        {item.name}
                      </p>
                      <p className="text-[10px] text-[#64748B] mt-0.5">{item.brand} · {item.category}</p>
                      <p className="text-sm font-extrabold text-[#059669] mt-1">
                        ₹{(item.price_inr || 0).toLocaleString('en-IN')}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-1.5 shrink-0">
                      <button
                        onClick={() => { addToCart(item, 'Size 8'); }}
                        className="w-8 h-8 rounded-xl bg-[#4F46E5] hover:bg-[#3730A3] text-white flex items-center justify-center transition cursor-pointer shadow-sm shadow-indigo-500/20"
                        title="Add to bag"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => toggleWishlist(item)}
                        className="w-8 h-8 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-500 flex items-center justify-center transition cursor-pointer"
                        title="Remove from wishlist"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {/* Footer */}
            {wishlistItems.length > 0 && (
              <div className="px-4 py-4 border-t border-gray-100 space-y-2">
                <button
                  onClick={() => {
                    wishlistItems.forEach(item => addToCart(item, 'Size 8'));
                    setIsWishlistOpen(false);
                  }}
                  className="w-full py-3 rounded-xl bg-[#4F46E5] hover:bg-[#3730A3] text-white text-xs font-extrabold transition cursor-pointer flex items-center justify-center gap-2 shadow-md shadow-indigo-500/20"
                >
                  <ShoppingBag className="w-4 h-4" />
                  Add All to Bag
                </button>
                <button
                  onClick={() => setIsWishlistOpen(false)}
                  className="w-full py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-[#475569] text-xs font-bold transition cursor-pointer"
                >
                  Continue Shopping
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
