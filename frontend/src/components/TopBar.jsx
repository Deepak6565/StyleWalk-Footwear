import React from 'react';
import { MapPin, Phone, Heart, Globe, Share2, Send } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function TopBar({ onOpenAuth }) {
  const { user } = useAuth();

  return (
    <div className="bg-black text-gray-300 text-[11px] py-2 px-4 border-b border-gray-800 hidden md:block">
      <div className="max-w-7xl mx-auto flex justify-between items-center">

        {/* Left: Address & Contact */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-1.5 hover:text-white transition-colors">
            <MapPin className="w-3.5 h-3.5 text-red-500" />
            <span>St.10, Tiruchengode, TamilNadu</span>
          </div>
          <div className="flex items-center gap-1.5 hover:text-white transition-colors">
            <Phone className="w-3.5 h-3.5 text-emerald-400" />
            <span>+919715362378</span>
          </div>
        </div>

        {/* Center: Quick Links */}
        <div className="flex items-center gap-4 text-gray-400 font-semibold">
          <span className="text-gray-500">Connect:</span>
          <a href="#contact" className="hover:text-white transition-colors flex items-center gap-1">
            <Send className="w-3 h-3 text-red-500" /> Contact
          </a>
          <a href="#about" className="hover:text-white transition-colors flex items-center gap-1">
            <Globe className="w-3 h-3 text-indigo-400" /> About
          </a>
          <a href="#gallery" className="hover:text-white transition-colors flex items-center gap-1">
            <Share2 className="w-3 h-3 text-emerald-400" /> Gallery
          </a>
        </div>

        {/* Right: Policy Links & Wishlist Button */}
        <div className="flex items-center gap-4">
          <a href="#privacy" className="hover:text-white transition-colors">&gt; Privacy</a>
          <a href="#terms" className="hover:text-white transition-colors">&gt; T &amp; C</a>
          <a href="#returns" className="hover:text-white transition-colors">&gt; Returns</a>

          <button
            onClick={onOpenAuth}
            className="bg-[#F6E0B5] hover:bg-[#ebd099] text-gray-900 font-bold px-3 py-1 rounded text-[10px] tracking-wide transition-colors flex items-center gap-1"
          >
            <Heart className="w-3 h-3 text-red-600 fill-red-600" />
            <span>{user ? `Hi, ${user.name.split(' ')[0]}` : 'My Wishlist'}</span>
          </button>
        </div>

      </div>
    </div>
  );
}
