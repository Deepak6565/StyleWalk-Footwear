import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  HelpCircle,
  Mail,
  Phone,
  MessageSquare,
  Truck,
  RotateCcw,
  ShieldCheck,
  FileText,
  ChevronDown,
  ChevronUp,
  Ruler,
  Headphones
} from 'lucide-react';

export default function AssistanceModal({ isOpen, onClose, onOpenSizeAdvisor }) {
  const [activeFaq, setActiveFaq] = useState(null);

  const faqs = [
    {
      q: 'How do I download my order tax invoice?',
      a: 'Log into your account, open the sidebar navigation or More menu, and click "My Orders". Each confirmed purchase includes a "INVOICE (PDF)" button that generates an official GST tax invoice.'
    },
    {
      q: 'What is StyleWalk’s return and exchange policy?',
      a: 'We offer a 30-day hassle-free return and size exchange policy for all unworn footwear items in original packaging with brand tags intact.'
    },
    {
      q: 'How do I determine my correct shoe size?',
      a: 'Use our interactive 3D Size Advisor tool available on the homepage hero or in product details. It provides accurate UK/US/EU size conversions.'
    },
    {
      q: 'What payment methods are supported?',
      a: 'We accept Cash on Delivery (COD), UPI Payment (Google Pay, PhonePe, Paytm), Credit/Debit Cards, and encrypted Stripe online checkout.'
    },
    {
      q: 'How can I track my shipment?',
      a: 'Once an order is shipped, a logistics tracking number (e.g. SW-TRK-984712) is assigned by the store administrator and displayed live under "My Orders".'
    }
  ];

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-gray-950/80 backdrop-blur-xl"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="relative z-10 w-full max-w-2xl bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 text-left shadow-2xl text-[#0F172A] space-y-6 max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex justify-between items-center pb-4 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-[#4F46E5] flex items-center justify-center text-white shadow-md">
                <Headphones className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-extrabold uppercase font-heading text-[#0F172A]">
                  STYLEWALK ASSISTANCE HUB
                </h3>
                <p className="text-xs text-[#64748B]">Customer Support, Orders &amp; FAQ Center</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-[#0F172A] transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Help Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-200 text-xs text-left space-y-1">
              <div className="flex items-center space-x-2 text-[#4F46E5] font-extrabold">
                <Mail className="w-4 h-4" />
                <span>EMAIL SUPPORT</span>
              </div>
              <p className="text-[#0F172A] font-bold">support@stylewalk.com</p>
              <p className="text-[10px] text-[#64748B]">24/7 dedicated customer care</p>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200 text-xs text-left space-y-1">
              <div className="flex items-center space-x-2 text-[#059669] font-extrabold">
                <Phone className="w-4 h-4" />
                <span>HELPLINE</span>
              </div>
              <p className="text-[#0F172A] font-bold">+91 1800-STYLEWALK</p>
              <p className="text-[10px] text-[#64748B]">Mon - Sat: 9 AM - 8 PM IST</p>
            </div>

            <div className="p-4 rounded-2xl bg-purple-50/60 border border-purple-200 text-xs text-left space-y-1">
              <div className="flex items-center space-x-2 text-purple-700 font-extrabold">
                <RotateCcw className="w-4 h-4" />
                <span>RETURNS &amp; SIZE</span>
              </div>
              <p className="text-[#0F172A] font-bold">30-Day Policy</p>
              <p className="text-[10px] text-[#64748B]">Easy exchanges &amp; returns</p>
            </div>
          </div>

          {/* FAQ Accordion Section */}
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-extrabold uppercase text-[#4F46E5] tracking-wider flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4" />
              <span>FREQUENTLY ASKED QUESTIONS</span>
            </h4>

            <div className="space-y-2">
              {faqs.map((faq, idx) => {
                const isExpanded = activeFaq === idx;
                return (
                  <div
                    key={idx}
                    className="rounded-2xl border border-gray-200 overflow-hidden bg-gray-50/70 transition"
                  >
                    <button
                      onClick={() => setActiveFaq(isExpanded ? null : idx)}
                      className="w-full p-3.5 text-left font-bold text-xs text-[#0F172A] flex justify-between items-center hover:bg-gray-100/70 transition cursor-pointer"
                    >
                      <span>{faq.q}</span>
                      {isExpanded ? <ChevronUp className="w-4 h-4 text-[#4F46E5]" /> : <ChevronDown className="w-4 h-4 text-[#64748B]" />}
                    </button>
                    {isExpanded && (
                      <div className="p-3.5 pt-0 text-xs text-[#475569] leading-relaxed border-t border-gray-200/50 bg-white">
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Action Footer */}
          <div className="pt-4 border-t border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-3">
            <button
              onClick={() => {
                onClose();
                if (onOpenSizeAdvisor) onOpenSizeAdvisor();
              }}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-[#0F172A] text-xs font-extrabold transition flex items-center justify-center space-x-2 cursor-pointer border border-gray-200"
            >
              <Ruler className="w-4 h-4 text-[#059669]" />
              <span>OPEN SHOE SIZE ADVISOR</span>
            </button>

            <button
              onClick={onClose}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#4F46E5] hover:bg-[#3730A3] text-white text-xs font-extrabold transition cursor-pointer shadow-md shadow-indigo-500/20"
            >
              CLOSE ASSISTANCE
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
