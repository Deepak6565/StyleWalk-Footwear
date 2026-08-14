import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, Plus, Minus, Tag, ArrowRight, ShoppingBag, CheckCircle } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function CartDrawer() {
  const navigate = useNavigate();
  const {
    cartItems,
    isCartOpen,
    setIsCartOpen,
    removeFromCart,
    updateQuantity,
    subtotal,
    appliedCoupon,
    discountAmount,
    totalAmount,
    applyCoupon,
    removeCoupon
  } = useCart();

  const [promoCodeInput, setPromoCodeInput] = useState('');
  const [promoError, setPromoError] = useState('');
  const [validating, setValidating] = useState(false);

  if (!isCartOpen) return null;

  const handleApplyPromo = async (e) => {
    e.preventDefault();
    if (!promoCodeInput.trim()) return;

    setValidating(true);
    setPromoError('');

    const success = await applyCoupon(promoCodeInput.trim());
    if (success) {
      setPromoCodeInput('');
    } else {
      setPromoError('Invalid coupon code. Try DESI10 or FESTIVE20');
    }
    setValidating(false);
  };

  const handleCheckoutClick = () => {
    setIsCartOpen(false);
    navigate('/checkout');
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-gray-950/80 backdrop-blur-xl flex justify-end"
        onClick={() => setIsCartOpen(false)}
      >
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-md bg-white border-l border-gray-200 h-full flex flex-col justify-between p-6 shadow-2xl overflow-y-auto text-left"
        >
          {/* Header */}
          <div>
            <div className="flex justify-between items-center pb-4 border-b border-gray-200">
              <div className="flex items-center space-x-2">
                <ShoppingBag className="w-5 h-5 text-[#4F46E5]" />
                <h2 className="text-lg font-bold text-[#0F172A] font-heading uppercase tracking-tight">
                  YOUR BAG ({cartItems.reduce((a, b) => a + b.quantity, 0)})
                </h2>
              </div>

              <button
                onClick={() => setIsCartOpen(false)}
                className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-[#475569] transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Cart Items List */}
            <div className="py-4 space-y-4 max-h-[50vh] overflow-y-auto pr-1">
              {cartItems.length === 0 ? (
                <div className="py-16 text-center text-[#64748B] font-medium">
                  <ShoppingBag className="w-12 h-12 mx-auto mb-3 opacity-30 text-[#4F46E5]" />
                  <p className="text-xs">Your shopping bag is empty.</p>
                  <button
                    onClick={() => setIsCartOpen(false)}
                    className="mt-4 px-4 py-2.5 rounded-xl bg-[#4F46E5] text-white text-xs font-bold"
                  >
                    Start Shopping
                  </button>
                </div>
              ) : (
                cartItems.map((item) => {
                  const priceInr = item.price || item.price_inr;
                  return (
                    <div
                      key={`${item.id}-${item.selectedSize}`}
                      className="p-3 rounded-2xl bg-gray-50 border border-gray-200 flex space-x-3 items-center"
                    >
                      <img
                        src={item.image_url}
                        alt={item.name}
                        className="w-16 h-16 object-contain bg-white rounded-xl p-1 border border-gray-200 shrink-0"
                      />

                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-bold text-[#0F172A] truncate font-heading">{item.name}</h4>
                        <div className="flex items-center space-x-2 text-[10px] text-[#64748B] font-semibold mt-0.5">
                          <span>{item.brand}</span>
                          <span>•</span>
                          <span className="text-[#4F46E5] font-bold">{item.selectedSize}</span>
                        </div>
                        <span className="text-xs font-extrabold text-[#059669] block mt-1">
                          ₹{priceInr ? priceInr.toLocaleString('en-IN') : '2,499'}
                        </span>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center space-x-1 bg-white border border-gray-200 rounded-xl p-1">
                        <button
                          onClick={() => updateQuantity(item.id, item.selectedSize, item.quantity - 1)}
                          className="p-1 rounded-lg hover:bg-gray-100 text-[#475569] hover:text-[#0F172A]"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-bold text-[#0F172A] w-4 text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.selectedSize, item.quantity + 1)}
                          className="p-1 rounded-lg hover:bg-gray-100 text-[#475569] hover:text-[#0F172A]"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <button
                        onClick={() => removeFromCart(item.id, item.selectedSize)}
                        className="p-2 text-[#64748B] hover:text-rose-500 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Footer Checkout Summary */}
          {cartItems.length > 0 && (
            <div className="pt-4 border-t border-gray-200 space-y-4">
              
              {/* Promo Code Input Form */}
              <div>
                {appliedCoupon ? (
                  <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 flex justify-between items-center text-xs text-[#059669] font-bold">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4" />
                      <span>COUPON '{appliedCoupon.code}' APPLIED (-₹{discountAmount})</span>
                    </div>
                    <button
                      onClick={removeCoupon}
                      className="text-rose-600 hover:underline text-[10px] font-bold"
                    >
                      REMOVE
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyPromo} className="flex space-x-2">
                    <div className="relative flex-1">
                      <Tag className="w-4 h-4 text-[#64748B] absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Coupon (DESI10 or FESTIVE20)"
                        value={promoCodeInput}
                        onChange={(e) => setPromoCodeInput(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-xs font-semibold text-[#0F172A] placeholder-[#64748B] focus:outline-none focus:border-[#4F46E5] focus:bg-white cursor-text"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={validating}
                      className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-[#0F172A] font-bold text-xs border border-gray-200 transition cursor-pointer"
                    >
                      {validating ? '...' : 'APPLY'}
                    </button>
                  </form>
                )}
                {promoError && (
                  <p className="text-[10px] text-rose-500 font-semibold mt-1">{promoError}</p>
                )}
              </div>

              {/* Cost Summary Breakdown */}
              <div className="space-y-1.5 text-xs text-[#475569] font-medium">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span className="text-[#0F172A] font-bold">₹{subtotal.toLocaleString('en-IN')}</span>
                </div>

                {discountAmount > 0 && (
                  <div className="flex justify-between text-[#059669] font-bold">
                    <span>Discount:</span>
                    <span>-₹{discountAmount.toLocaleString('en-IN')}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span>Shipping:</span>
                  <span className="text-[#059669] font-bold">FREE (India)</span>
                </div>

                <div className="flex justify-between pt-2 border-t border-gray-200 text-base font-bold text-[#0F172A]">
                  <span>Total Amount:</span>
                  <span className="text-[#059669]">₹{totalAmount.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Checkout Action Button */}
              <button
                onClick={handleCheckoutClick}
                className="w-full py-4 rounded-xl bg-[#4F46E5] hover:bg-[#3730A3] text-white font-extrabold text-xs uppercase tracking-wider shadow-md shadow-indigo-500/20 flex items-center justify-center space-x-2 transition cursor-pointer"
              >
                <span>PROCEED TO CHECKOUT</span>
                <ArrowRight className="w-4 h-4" />
              </button>

            </div>
          )}

        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
