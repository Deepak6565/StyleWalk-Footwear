import React from 'react';
import { Sparkles, Zap, Flame, Tag, ShieldCheck } from 'lucide-react';

export default function KineticMarquee() {
  const items = [
    { icon: Sparkles, text: "NEXT-GEN LUXURY FOOTWEAR COLLECTION", highlight: "2026 EDITION" },
    { icon: Zap, text: "USE CODE 'STYLE10' FOR 10% EXTRA DISCOUNT", highlight: "PROMO ACTIVE" },
    { icon: Flame, text: "AEROGEL SOLE TECHNOLOGY & TITANIUM WEAVE", highlight: "PATENTED FIT" },
    { icon: Tag, text: "USE CODE 'WALK20' FOR $20 INSTANT SAVINGS", highlight: "LIMITED TIME" },
    { icon: ShieldCheck, text: "EXPRESS GLOBAL SHIPPING & 30-DAY ZERO COST RETURNS", highlight: "VERIFIED" }
  ];

  return (
    <div className="w-full bg-gradient-to-r from-indigo-950/90 via-slate-900/90 to-indigo-950/90 border-y border-indigo-500/20 py-2.5 overflow-hidden backdrop-blur-md relative z-30 select-none">
      <div className="animate-marquee flex items-center space-x-12">
        {/* Repeat list twice for smooth infinite marquee loop */}
        {[...items, ...items, ...items].map((item, idx) => {
          const Icon = item.icon;
          return (
            <div key={idx} className="flex items-center space-x-3 shrink-0">
              <span className="p-1 rounded-md bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
                <Icon className="w-3.5 h-3.5" />
              </span>
              <span className="text-xs font-extrabold tracking-wider text-gray-200 uppercase">
                {item.text}
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                {item.highlight}
              </span>
              <span className="text-indigo-500/40 font-black ml-4">///</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
