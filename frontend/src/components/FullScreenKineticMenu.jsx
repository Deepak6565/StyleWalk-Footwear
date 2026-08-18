import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowUpRight, Sparkles, Footprints, ShieldAlert } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function FullScreenKineticMenu({ isOpen, onClose }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [activeImage, setActiveImage] = useState('https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=800&q=80');
  const [activeLabel, setActiveLabel] = useState('Phantom Stealth X1');

  const isAdminPage = location.pathname === '/admin';

  const menuItems = [
    {
      title: 'GALLERY',
      subtitle: 'Explore 2026 Footwear Collection',
      path: '/',
      image: 'https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=800&q=80',
      badge: 'FEATURED'
    },
    ...(!isAdminPage ? [
      {
        title: 'ORDER HISTORY',
        subtitle: 'Track Order Shipments & Invoices',
        path: '/orders',
        image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80',
        badge: 'LIVE STATUS'
      }
    ] : []),
    {
      title: 'CHECKOUT & CART',
      subtitle: 'Complete Stripe Encrypted Checkout',
      path: '/checkout',
      image: 'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?auto=format&fit=crop&w=800&q=80',
      badge: 'SECURE'
    },
    {
      title: 'ADMIN MANAGEMENT',
      subtitle: 'Inventory Modifiers & Realtime Stock',
      path: '/admin',
      image: 'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?auto=format&fit=crop&w=800&q=80',
      badge: 'RESTRICTED',
      adminOnly: true
    }
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: '-100%' }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: '-100%' }}
          transition={{ type: 'spring', damping: 30, stiffness: 220 }}
          className="fixed inset-0 z-[100] bg-white/98 backdrop-blur-2xl text-[#0F172A] flex flex-col justify-between p-6 md:p-12 overflow-hidden shadow-2xl border-b border-gray-200"
        >
          {/* Header Bar */}
          <div className="flex justify-between items-center z-10">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-[#4F46E5] flex items-center justify-center shadow-md">
                <Footprints className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-extrabold tracking-widest text-[#0F172A] font-heading">
                STYLE <span className="text-[#4F46E5]">WALK</span>
              </span>
            </div>

            <button
              onClick={onClose}
              className="p-3 rounded-full bg-gray-100 hover:bg-[#4F46E5] hover:text-white text-[#0F172A] transition-all flex items-center space-x-2 border border-gray-200 cursor-pointer shadow-sm"
              data-cursor="hover"
            >
              <span className="text-xs font-extrabold uppercase tracking-wider hidden sm:inline">Close</span>
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Center Main Section: Menu Items & Hover Image Preview */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center my-auto z-10">
            {/* Menu Nav Links (Col 7) */}
            <div className="lg:col-span-7 space-y-4">
              {menuItems.map((item, idx) => (
                <motion.div
                  key={idx}
                  onMouseEnter={() => {
                    setActiveImage(item.image);
                    setActiveLabel(item.title);
                  }}
                  whileHover={{ x: 20 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  onClick={() => {
                    if (item.adminOnly && (!user || user.role !== 'admin')) {
                      alert('Access Denied: Admin section is restricted to authorized administrators only.');
                      return;
                    }
                    navigate(item.path);
                    onClose();
                  }}
                  className="group cursor-pointer py-4 border-b border-gray-200 flex items-center justify-between transition-colors hover:border-[#4F46E5]"
                  data-cursor="view"
                >
                  <div>
                    <div className="flex items-center space-x-3">
                      <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-[#0F172A] group-hover:text-[#4F46E5] transition-all font-heading">
                        {item.title}
                      </h2>
                      <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-50 text-[#4F46E5] border border-indigo-200 group-hover:bg-emerald-50 group-hover:text-[#059669] group-hover:border-emerald-200 font-extrabold">
                        {item.badge}
                      </span>
                    </div>
                    <p className="text-xs text-[#64748B] group-hover:text-[#475569] mt-1 font-semibold">
                      {item.subtitle}
                    </p>
                  </div>

                  <div className="w-12 h-12 rounded-full bg-gray-100 group-hover:bg-[#4F46E5] text-[#475569] group-hover:text-white flex items-center justify-center transition-all border border-gray-200 shadow-sm">
                    <ArrowUpRight className="w-6 h-6 transform group-hover:rotate-45 transition-transform" />
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Live Hover Image Preview Stage (Col 5) */}
            <div className="lg:col-span-5 hidden lg:flex flex-col items-center justify-center">
              <motion.div
                key={activeImage}
                initial={{ opacity: 0, scale: 0.9, rotate: -2 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                transition={{ duration: 0.3 }}
                className="relative w-80 h-96 rounded-3xl overflow-hidden bg-white border border-gray-200 shadow-2xl p-2 group"
              >
                <img
                  src={activeImage}
                  alt={activeLabel}
                  className="w-full h-full object-cover rounded-2xl filter brightness-95 group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A]/80 via-transparent to-transparent" />
                <div className="absolute bottom-6 left-6 right-6 text-left">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#059669] bg-emerald-50 px-2 py-1 rounded-md border border-emerald-200">
                    KINETIC PREVIEW
                  </span>
                  <h4 className="text-lg font-black text-white mt-1.5 font-heading">{activeLabel}</h4>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Footer Bar */}
          <div className="flex flex-col sm:flex-row justify-between items-center text-xs text-[#64748B] pt-6 border-t border-gray-200 z-10">
            <p>© 2026 Style Walk Footwear Gallery. All Rights Reserved.</p>
            <div className="flex space-x-6 font-bold mt-2 sm:mt-0">
              <span className="text-[#4F46E5] flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> Luxury-Edition
              </span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
