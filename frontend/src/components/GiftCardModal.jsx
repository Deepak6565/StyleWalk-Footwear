import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gift, X, Sparkles, Copy, CheckCircle2, Send, CreditCard } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function GiftCardModal({ isOpen, onClose }) {
  const { applyCoupon } = useCart();
  const [selectedAmount, setSelectedAmount] = useState(2500);
  const [recipientName, setRecipientName] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [giftNote, setGiftNote] = useState('');
  const [generatedCode, setGeneratedCode] = useState(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleGenerateGiftCard = (e) => {
    e.preventDefault();
    const code = `STYLEGIFT-${Math.floor(1000 + Math.random() * 9000)}-LUX`;
    setGeneratedCode(code);
  };

  const handleCopyCode = () => {
    if (!generatedCode) return;
    navigator.clipboard.writeText(generatedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRedeemNow = () => {
    if (!generatedCode) return;
    applyCoupon('DESI10');
    onClose();
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] bg-gray-950/60 backdrop-blur-md flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="relative max-w-lg w-full bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 text-left shadow-2xl space-y-6"
        >
          {/* Header */}
          <div className="flex justify-between items-center pb-2 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <div className="w-9 h-9 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-[#4F46E5]">
                <Gift className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-[#0F172A] uppercase tracking-tight font-heading">
                  STYLE WALK DIGITAL GIFT CARD
                </h3>
                <span className="text-[10px] text-[#059669] font-bold">Instant E-Voucher Generation</span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-[#475569] transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {!generatedCode ? (
            <form onSubmit={handleGenerateGiftCard} className="space-y-4">
              {/* Voucher Value Options */}
              <div>
                <label className="block text-xs font-bold text-[#0F172A] mb-2">Select Gift Voucher Amount:</label>
                <div className="grid grid-cols-4 gap-2">
                  {[1000, 2500, 5000, 10000].map((amt) => (
                    <button
                      type="button"
                      key={amt}
                      onClick={() => setSelectedAmount(amt)}
                      className={`py-3 rounded-2xl text-xs font-extrabold transition border cursor-pointer ${
                        selectedAmount === amt
                          ? 'bg-[#4F46E5] text-white border-[#4F46E5] shadow-md shadow-indigo-500/20'
                          : 'bg-gray-50 border-gray-200 text-[#475569] hover:bg-gray-100'
                      }`}
                    >
                      ₹{amt.toLocaleString('en-IN')}
                    </button>
                  ))}
                </div>
              </div>

              {/* Recipient Details */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#475569] mb-1">Recipient Name:</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rahul Sharma"
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-gray-50 border border-gray-200 text-xs font-bold text-[#0F172A] focus:outline-none focus:border-[#4F46E5] focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#475569] mb-1">Recipient Email:</label>
                  <input
                    type="email"
                    required
                    placeholder="rahul@example.com"
                    value={recipientEmail}
                    onChange={(e) => setRecipientEmail(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-gray-50 border border-gray-200 text-xs font-bold text-[#0F172A] focus:outline-none focus:border-[#4F46E5] focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#475569] mb-1">Personal Note:</label>
                <textarea
                  rows={2}
                  placeholder="Enjoy these luxury shoes on me! Happy Birthday!"
                  value={giftNote}
                  onChange={(e) => setGiftNote(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-gray-50 border border-gray-200 text-xs font-semibold text-[#0F172A] focus:outline-none focus:border-[#4F46E5] focus:bg-white"
                />
              </div>

              {/* Action Button */}
              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-[#4F46E5] hover:bg-[#3730A3] text-white font-extrabold text-xs transition flex items-center justify-center space-x-2 cursor-pointer shadow-md shadow-indigo-500/20"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>GENERATE DIGITAL GIFT VOUCHER</span>
              </button>
            </form>
          ) : (
            /* Generated Voucher Card Display */
            <div className="space-y-5 text-center">
              <div className="p-6 rounded-3xl bg-gradient-to-tr from-indigo-600 via-indigo-700 to-emerald-600 text-white shadow-xl space-y-4 relative overflow-hidden">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black uppercase tracking-widest bg-white/20 px-2.5 py-1 rounded-full backdrop-blur-md">
                    STYLE WALK GIFT CARD
                  </span>
                  <Gift className="w-6 h-6 text-emerald-300" />
                </div>

                <div>
                  <span className="text-xs text-indigo-200 font-bold block">GIFT VALUE</span>
                  <div className="text-4xl font-black font-heading mt-0.5">
                    ₹{selectedAmount.toLocaleString('en-IN')}
                  </div>
                </div>

                <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/20">
                  <span className="text-[10px] text-indigo-200 font-bold block uppercase">REDEEM VOUCHER CODE</span>
                  <div className="text-lg font-mono font-black text-amber-300 tracking-wider mt-0.5">
                    {generatedCode}
                  </div>
                </div>

                {recipientName && (
                  <p className="text-xs font-bold text-white/90 italic">
                    "To {recipientName}: {giftNote || 'Enjoy your new shoes!'}"
                  </p>
                )}
              </div>

              {/* Copy & Redeem Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="py-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-[#0F172A] font-extrabold text-xs transition flex items-center justify-center space-x-1.5 cursor-pointer"
                >
                  {copied ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-[#059669]" />
                      <span>COPIED!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>COPY CODE</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleRedeemNow}
                  className="py-3 rounded-xl bg-[#4F46E5] hover:bg-[#3730A3] text-white font-extrabold text-xs transition flex items-center justify-center space-x-1.5 cursor-pointer shadow-md shadow-indigo-500/20"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>REDEEM IN CART</span>
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
