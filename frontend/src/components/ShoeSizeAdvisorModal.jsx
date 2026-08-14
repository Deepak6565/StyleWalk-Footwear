import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Ruler, CheckCircle2, X } from 'lucide-react';

export default function ShoeSizeAdvisorModal({ isOpen, onClose, onSelectSize }) {
  const [footCm, setFootCm] = useState(26.5);
  const [footWidth, setFootWidth] = useState('regular');

  if (!isOpen) return null;

  // Convert Foot length (cm) to Shoe Size
  const calculateUKSize = (cm) => {
    if (cm < 24.5) return 'Size 6';
    if (cm < 25.5) return 'Size 7';
    if (cm < 26.5) return 'Size 8';
    if (cm < 27.5) return 'Size 9';
    if (cm < 28.5) return 'Size 10';
    return 'Size 11';
  };

  const calculatedUK = calculateUKSize(footCm);

  const getUSSize = (ukStr) => {
    const num = parseInt(String(ukStr).replace(/\D/g, '')) || 8;
    return `US ${num + 1}`;
  };

  const getEUSize = (ukStr) => {
    const num = parseInt(String(ukStr).replace(/\D/g, '')) || 8;
    return `EU ${num + 34}`;
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-gray-950/60 backdrop-blur-md flex items-center justify-center p-4"
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
              <Ruler className="w-5 h-5 text-[#059669]" />
              <h3 className="text-xl font-extrabold text-[#0F172A] uppercase tracking-tight font-heading">
                SHOE SIZE ADVISOR
              </h3>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-[#475569] transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <p className="text-xs text-[#64748B] font-semibold leading-relaxed">
            Measure your heel-to-toe foot length in centimeters (cm) for an optimal fit across footwear models.
          </p>

          {/* Foot Length Slider */}
          <div className="space-y-5">
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-bold text-[#0F172A]">Foot Heel-to-Toe Length:</label>
                <span className="text-sm font-extrabold text-[#4F46E5] bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200">{footCm} cm</span>
              </div>

              <input
                type="range"
                min="23.5"
                max="29.5"
                step="0.5"
                value={footCm}
                onChange={(e) => setFootCm(parseFloat(e.target.value))}
                className="w-full h-2.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#4F46E5]"
              />
              <div className="flex justify-between text-[10px] text-[#64748B] font-bold mt-1.5">
                <span>23.5 cm (Size 5)</span>
                <span>26.5 cm (Size 8)</span>
                <span>29.5 cm (Size 11)</span>
              </div>
            </div>

            {/* Foot Width Option */}
            <div>
              <label className="block text-xs font-bold text-[#0F172A] mb-2">Foot Width Profile:</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFootWidth('regular')}
                  className={`p-3 rounded-2xl text-xs font-bold border transition cursor-pointer ${
                    footWidth === 'regular'
                      ? 'bg-indigo-50 border-[#4F46E5] text-[#4F46E5] shadow-sm'
                      : 'bg-gray-50 border-gray-200 text-[#475569] hover:bg-gray-100'
                  }`}
                >
                  Regular / Narrow
                </button>

                <button
                  type="button"
                  onClick={() => setFootWidth('wide')}
                  className={`p-3 rounded-2xl text-xs font-bold border transition cursor-pointer ${
                    footWidth === 'wide'
                      ? 'bg-indigo-50 border-[#4F46E5] text-[#4F46E5] shadow-sm'
                      : 'bg-gray-50 border-gray-200 text-[#475569] hover:bg-gray-100'
                  }`}
                >
                  Wide Foot (+0.5 size)
                </button>
              </div>
            </div>
          </div>

          {/* Recommended Result */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-indigo-50 via-emerald-50/60 to-indigo-50 border border-indigo-100 text-center">
            <span className="text-[10px] font-extrabold uppercase text-[#059669] tracking-widest block">
              RECOMMENDED SHOE SIZE
            </span>
            <div className="text-4xl font-black text-[#0F172A] mt-1 font-heading">
              {calculatedUK}
            </div>

            <div className="flex justify-center items-center space-x-4 mt-2 text-xs font-bold text-[#475569]">
              <span>{getUSSize(calculatedUK)}</span>
              <span>•</span>
              <span>{getEUSize(calculatedUK)}</span>
            </div>
          </div>

          {/* Action button */}
          <button
            onClick={() => {
              if (onSelectSize) onSelectSize(calculatedUK);
              onClose();
            }}
            className="w-full py-3.5 rounded-xl bg-[#4F46E5] hover:bg-[#3730A3] text-white font-extrabold text-xs transition flex items-center justify-center space-x-2 cursor-pointer shadow-md shadow-indigo-500/20"
          >
            <CheckCircle2 className="w-4 h-4 text-[#059669]" />
            <span>APPLY {calculatedUK} TO MY FIT</span>
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
