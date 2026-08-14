import React from 'react';
import { Link } from 'react-router-dom';
import {
  Footprints,
  MapPin,
  Phone,
  Mail,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  Truck,
  RotateCcw,
  ExternalLink,
  Globe,
  Share2,
  MessageSquare,
  Lock,
  CreditCard
} from 'lucide-react';

export default function Footer({ onOpenRadialCategory }) {

  const scrollToStore = () => {
    const el = document.getElementById('store-location');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.location.href = '/#store-location';
    }
  };

  const scrollToProducts = () => {
    const el = document.getElementById('products-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.location.href = '/#products-section';
    }
  };

  return (
    <footer className="bg-[#030712] text-gray-400 text-xs border-t border-indigo-500/20 pt-16 pb-24 relative z-20 overflow-hidden font-sans">

      {/* Background Decorative Ambient Orbs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full filter blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-emerald-600/10 rounded-full filter blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-12">


        {/* ═════════════════════════════════════════════════════════════
            2. MAIN 4-COLUMN FOOTER GRID
            ═════════════════════════════════════════════════════════════ */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 text-left">

          {/* Col 1: Brand & Mission (Col 4) */}
          <div className="lg:col-span-4 space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-emerald-500 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                <Footprints className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-black text-white tracking-tight font-heading leading-none">
                  STYLE <span className="text-indigo-400">WALK</span>
                </span>
                <span className="text-[9px] text-emerald-400 font-extrabold tracking-[0.2em] uppercase leading-tight mt-0.5">
                  STEP INTO YOUR STYLE
                </span>
              </div>
            </div>

            <p className="text-gray-400 text-xs leading-relaxed font-medium">
              Style Walk: Cutting-edge footwear engineered for performance, styled for statement, and crafted for every step of your journey.
            </p>

            {/* Social Media Icons */}
            <div className="flex items-center gap-3 pt-1">
              <a
                href="https://www.instagram.com/stylewalk_tiruchengode/?hl=en"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 text-white font-extrabold text-[11px] flex items-center gap-2 shadow-md shadow-pink-600/30 hover:scale-105 transition-transform"
                title="Follow @stylewalk_tiruchengode on Instagram"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
                <span>@stylewalk_tiruchengode</span>
              </a>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/10">
              <div className="flex items-center gap-2 text-[11px] text-gray-300 font-semibold">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>100% Authentic</span>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-gray-300 font-semibold">
                <Truck className="w-4 h-4 text-indigo-400" />
                <span>Free Shipping ₹999+</span>
              </div>
            </div>
          </div>


          {/* Col 2: Navigation (Col 2) */}
          <div className="lg:col-span-2 space-y-4">
            <h4 className="text-xs font-black uppercase text-white tracking-widest font-heading border-b border-indigo-500/30 pb-2">
              NAVIGATION
            </h4>
            <ul className="space-y-2.5 text-gray-400 font-semibold">
              <li>
                <button onClick={scrollToProducts} className="hover:text-white transition-colors flex items-center gap-1.5 group cursor-pointer">
                  <ChevronRight className="w-3.5 h-3.5 text-indigo-400 group-hover:translate-x-1 transition-transform" />
                  <span>Footwear Gallery</span>
                </button>
              </li>
              <li>
                <button onClick={onOpenRadialCategory} className="hover:text-white transition-colors flex items-center gap-1.5 group cursor-pointer">
                  <ChevronRight className="w-3.5 h-3.5 text-indigo-400 group-hover:translate-x-1 transition-transform" />
                  <span>Category Hub</span>
                </button>
              </li>
              <li>
                <button onClick={scrollToStore} className="hover:text-white transition-colors flex items-center gap-1.5 group cursor-pointer">
                  <ChevronRight className="w-3.5 h-3.5 text-emerald-400 group-hover:translate-x-1 transition-transform" />
                  <span>Store Location & Map</span>
                </button>
              </li>
              <li>
                <Link to="/orders" className="hover:text-white transition-colors flex items-center gap-1.5 group">
                  <ChevronRight className="w-3.5 h-3.5 text-indigo-400 group-hover:translate-x-1 transition-transform" />
                  <span>Order Tracking</span>
                </Link>
              </li>
              <li>
                <Link to="/admin" className="hover:text-white transition-colors flex items-center gap-1.5 group">
                  <ChevronRight className="w-3.5 h-3.5 text-purple-400 group-hover:translate-x-1 transition-transform" />
                  <span>Admin Control Suite</span>
                </Link>
              </li>
            </ul>
          </div>


          {/* Col 3: Customer Care & Guarantees (Col 3) */}
          <div className="lg:col-span-3 space-y-4">
            <h4 className="text-xs font-black uppercase text-white tracking-widest font-heading border-b border-indigo-500/30 pb-2">
              CUSTOMER CARE
            </h4>
            <ul className="space-y-2.5 text-gray-400 font-semibold">
              <li className="flex items-center gap-2">
                <Lock className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Stripe Encrypted & Sandbox Payment</span>
              </li>
              <li className="flex items-center gap-2">
                <RotateCcw className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                <span>30-Day Zero Cost Easy Returns</span>
              </li>
              <li className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>AI Size Advisor Fit Guarantee</span>
              </li>
              <li className="flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                <span>Authenticity & Warranty Card</span>
              </li>
            </ul>
          </div>


          {/* Col 4: Showroom Contact (Col 3) */}
          <div className="lg:col-span-3 space-y-4">
            <h4 className="text-xs font-black uppercase text-white tracking-widest font-heading border-b border-indigo-500/30 pb-2">
              SHOWROOM CONTACT
            </h4>

            <div className="space-y-3 font-medium">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>New Bus Stand Road, Tiruchengode-637211, Tamil Nadu</span>
              </div>

              <div className="flex flex-wrap items-center gap-x-3.5 gap-y-1.5 text-xs">
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-indigo-400 shrink-0" />
                  <a href="tel:+919715362378" className="hover:text-white transition-colors">+91 97153 62378</a>
                </div>
                <span className="text-gray-600 hidden sm:inline">•</span>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-emerald-400 shrink-0" />
                  <a href="mailto:support@stylewalk.in" className="hover:text-white transition-colors">support@stylewalk.in</a>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={scrollToStore}
                className="w-full py-2.5 px-3 rounded-xl bg-white/5 hover:bg-indigo-600/30 text-indigo-300 hover:text-white font-extrabold text-[11px] flex items-center justify-center gap-2 border border-indigo-500/30 transition cursor-pointer"
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>View Flagship Map & Hours</span>
                <ExternalLink className="w-3 h-3 opacity-70" />
              </button>
            </div>
          </div>

        </div>


        {/* ═════════════════════════════════════════════════════════════
            3. BOTTOM COPYRIGHT & PAYMENTS BAR
            ═════════════════════════════════════════════════════════════ */}
        <div className="pt-8 border-t border-white/10 flex flex-col items-center justify-center text-center gap-4 text-[11px] text-gray-500">
          <p className="text-center font-medium text-gray-400 tracking-wide">
            © 2026 StyleWalk Footwear Gallery. All Rights Reserved.
          </p>
        </div>

      </div>
    </footer>
  );
}
