import React, { useState } from 'react';
import { APIProvider, Map, AdvancedMarker, Pin } from '@vis.gl/react-google-maps';
import { MapPin, Phone, Mail, Clock, Navigation, ExternalLink, Sparkles, Check, Copy } from 'lucide-react';

export default function StoreLocationMap() {
  const [copied, setCopied] = useState(false);
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

  // Flagship Store Coordinates: Tiruchengode, Tamil Nadu 637211
  const storePosition = { lat: 11.3807, lng: 77.8944 };
  const storeAddress = "New Bus Stand Road, Tiruchengode-637211, Tamil Nadu, India";
  const googleMapsDirectionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(storeAddress)}`;

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(storeAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="store-location" className="py-16 bg-[#05070c] text-white border-t border-indigo-500/20 relative z-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-left mb-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 me-2 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Sparkles className="w-3 h-3" />
            <span>VISIT OUR EXPERIENTIAL SHOWROOM</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-black uppercase tracking-tight text-white font-heading">
            STORE <span className="text-[#4F46E5]">LOCATION</span> & SHOWROOM
          </h2>
          <p className="text-xs sm:text-sm text-gray-400 max-w-2xl leading-relaxed">
            Experience our 2026 flagship collection in person. Try on custom fitting sizes, meet our footwear specialists, and explore exclusive offline releases.
          </p>
        </div>

        {/* 2-Column Grid: Map + Store Info Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">

          {/* Left / Top: Interactive Google Map Stage (Col 7) */}
          <div className="lg:col-span-7 rounded-3xl overflow-hidden border border-indigo-500/30 shadow-2xl relative min-h-[380px] sm:min-h-[440px] flex flex-col bg-gray-950">
            {apiKey ? (
              <APIProvider apiKey={apiKey}>
                <Map
                  defaultCenter={storePosition}
                  defaultZoom={15}
                  defaultMapTypeId="terrain"
                  mapTypeId="terrain"
                  mapId="DEMO_MAP_ID"
                  gestureHandling="cooperative"
                  disableDefaultUI={false}
                  internalUsageAttributionIds={["gmp_git_agentskills_v1"]}
                  className="w-full h-full min-h-[380px] sm:min-h-[440px]"
                >
                  <AdvancedMarker position={storePosition} title="StyleWalk Flagship Store">
                    <Pin background="#4F46E5" borderColor="#059669" glyphColor="#FFFFFF" />
                  </AdvancedMarker>
                </Map>
              </APIProvider>
            ) : (
              // Full-Color Interactive Terrain View Google Maps
              <div className="relative w-full h-full min-h-[380px] sm:min-h-[440px]">
                <iframe
                  title="StyleWalk Showroom Location Map"
                  width="100%"
                  height="100%"
                  className="w-full h-full min-h-[380px] sm:min-h-[440px] border-0"
                  loading="lazy"
                  allowFullScreen
                  src="https://maps.google.com/maps?q=11.3807,77.8944(StyleWalk%20Flagship%20Store)&t=p&z=15&ie=UTF8&iwloc=B&output=embed"
                />
                <div className="absolute top-4 right-4 bg-gray-950/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 text-[10px] font-bold text-gray-200 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Google Maps Terrain View</span>
                </div>
              </div>
            )}
          </div>

          {/* Right / Bottom: Showroom Info & Actions (Col 5) */}
          <div className="lg:col-span-5 bg-white/5 backdrop-blur-xl rounded-3xl p-6 sm:p-8 border border-white/10 flex flex-col justify-between space-y-6 text-left shadow-xl">
            
            <div className="space-y-6">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-[#059669] block mb-1">
                  MAIN SHOWROOM HEADQUARTERS
                </span>
                <h3 className="text-xl font-black text-white uppercase font-heading">
                  StyleWalk Flagship Store
                </h3>
              </div>

              {/* Address */}
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-500/30">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider">Address</h4>
                  <p className="text-xs text-white font-medium leading-relaxed mt-0.5">
                    New Bus Stand Road, Tiruchengode-637211, Tamil Nadu, India
                  </p>
                </div>
              </div>

              {/* Working Hours */}
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider">Store Hours</h4>
                  <p className="text-xs text-white font-medium mt-0.5">
                    Mon – Sat: <span className="text-emerald-400 font-bold">9:30 AM – 9:00 PM</span>
                  </p>
                  <p className="text-xs text-gray-400">
                    Sun: <span className="text-emerald-400 font-bold">10:00 AM – 8:00 PM</span>
                  </p>
                </div>
              </div>

              {/* Phone & Contact */}
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-purple-600/20 text-purple-400 flex items-center justify-center shrink-0 border border-purple-500/30">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider">Direct Hotline</h4>
                  <p className="text-xs text-white font-medium mt-0.5">+91 97153 62378</p>
                  <p className="text-xs text-gray-400">support@stylewalk.in</p>
                </div>
              </div>

            </div>

            {/* Action Buttons */}
            <div className="space-y-3 pt-4 border-t border-white/10">
              <a
                href={googleMapsDirectionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3.5 px-4 rounded-xl bg-[#4F46E5] hover:bg-[#3730A3] text-white font-extrabold text-xs tracking-wider uppercase flex items-center justify-center gap-2 transition shadow-lg shadow-indigo-600/30 cursor-pointer"
              >
                <Navigation className="w-4 h-4" />
                <span>Get Driving Directions</span>
                <ExternalLink className="w-3.5 h-3.5 opacity-70" />
              </a>

              <button
                onClick={handleCopyAddress}
                className="w-full py-3 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white font-bold text-xs flex items-center justify-center gap-2 border border-white/10 transition cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span className="text-emerald-400 font-extrabold">Address Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copy Full Address</span>
                  </>
                )}
              </button>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
