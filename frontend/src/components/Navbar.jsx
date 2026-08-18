import React, { useState, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingBag,
  Search,
  User,
  LogOut,
  Footprints,
  Heart,
  ArrowRight,
  ChevronRight,
  Sun,
  Moon,
  ShieldAlert,
  Sparkles,
  ArrowUpRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useTheme } from '../context/ThemeContext';
import AuthModal from './AuthModal';
import SearchModal from './SearchModal';

export default function Navbar({ onSelectCategory }) {
  const { user, logout } = useAuth();
  const { cartItems, setIsCartOpen } = useCart();
  const { wishlistCount, setIsWishlistOpen } = useWishlist();
  const { theme, toggleTheme } = useTheme();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [activeHoverMenu, setActiveHoverMenu] = useState(null);
  const [showProfileCard, setShowProfileCard] = useState(false);
  const profileRef = useRef(null);

  const timeoutRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const isAdminPage = location.pathname === '/admin';

  const megaMenuData = {
    Men: {
      tagline: "MEN'S FOOTWEAR COLLECTION",
      description: "Performance sneakers, handcrafted formal shoes, and rugged boots.",
      featured: {
        title: "Phantom Stealth X1 Runner",
        subtitle: "Aerogel Cushioning & Breathable Mesh",
        category: "Sneakers",
        image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80",
        badge: "HOT DROP"
      },
      columns: [
        {
          title: "Footwear & Athletics",
          items: [
            { label: "Sneakers", category: "Sneakers" },
            { label: "Sports Shoes", category: "Sports Shoes" },
            { label: "Formal Leather Shoes", category: "Formal Shoes" },
            { label: "Boots & High-Tops", category: "Boots" },
            { label: "Casual Shoes", category: "Casual Shoes" }
          ]
        },
        {
          title: "Sandals & Indian Brands",
          items: [
            { label: "Crocs & Clogs", category: "Crocs & Clogs" },
            { label: "Sliders & Flip-Flops", category: "Slippers & Sandals" },
            { label: "Leather Sandals", category: "Slippers & Sandals" },
            { label: "Campus & Woodland", category: "Sneakers" },
            { label: "Red Chief Genuine Leather", category: "Formal Shoes" }
          ]
        }
      ]
    },
    Women: {
      tagline: "WOMEN'S LUXURY & HERITAGE COMFORT",
      description: "Statement heels, handcrafted velvet mojaris, and orthotic clogs.",
      featured: {
        title: "Handcrafted Velvet Mojari",
        subtitle: "Gold Zardozi Embroidery & Velvet Finish",
        category: "Flats & Mojaris",
        image: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=600&q=80",
        badge: "EXCLUSIVE"
      },
      columns: [
        {
          title: "Heels & Fashion",
          items: [
            { label: "Heels & Wedges", category: "Heels & Wedges" },
            { label: "Flats & Mojaris", category: "Flats & Mojaris" },
            { label: "Casual Sneakers", category: "Sneakers" },
            { label: "Embellished Sandals", category: "Slippers & Sandals" }
          ]
        },
        {
          title: "Comfort & Heritage",
          items: [
            { label: "Ethnic Footwear", category: "Flats & Mojaris" },
            { label: "Orthotic Clogs", category: "Crocs & Clogs" },
            { label: "Crocs Classic Women", category: "Crocs & Clogs" },
            { label: "Mochi Velvet Collection", category: "Flats & Mojaris" }
          ]
        }
      ]
    },
    Kids: {
      tagline: "JUNIOR & KIDS FOOTWEAR",
      description: "Lightweight, shock-absorbing, and durable footwear for active kids.",
      featured: {
        title: "Campus Junior Air-Bounce",
        subtitle: "Flexible Sole & Shock Absorbing Cushion",
        category: "Boys Footwear",
        image: "https://images.unsplash.com/photo-1560769629-975ec94e6a86?auto=format&fit=crop&w=600&q=80",
        badge: "BESTSELLER"
      },
      columns: [
        {
          title: "Boys & Girls Footwear",
          items: [
            { label: "Boys Footwear & Sneakers", category: "Boys Footwear" },
            { label: "Girls Sandals & Flats", category: "Girls Sandals" },
            { label: "Lightweight Kids Clogs", category: "Crocs & Clogs" }
          ]
        },
        {
          title: "School & Active",
          items: [
            { label: "Black School Shoes", category: "School Shoes" },
            { label: "White Sports Shoes", category: "School Shoes" },
            { label: "Campus Junior Runners", category: "Boys Footwear" }
          ]
        }
      ]
    },
    Bags: {
      tagline: "TRAVEL & CYBER BACKPACKS",
      description: "Ergonomic laptop backpacks, duffle bags, and rider bike gear.",
      featured: {
        title: "Tactical Rider Bike Bag",
        subtitle: "100% Waterproof Heavy Duty Canvas",
        category: "Laptop Backpacks",
        image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=80",
        badge: "WATERPROOF"
      },
      columns: [
        {
          title: "Backpacks & Travel",
          items: [
            { label: "Laptop Backpacks (15.6\")", category: "Laptop Backpacks" },
            { label: "Trekking & Hiking Backpacks", category: "Trekking Backpacks" }
          ]
        },
        {
          title: "Sport & Rider Gear",
          items: [
            { label: "Sport & Duffle Bags", category: "Sport & Duffle Bags" },
            { label: "Rider Bike Bags (Waterproof)", category: "Rider Bike Bags" }
          ]
        }
      ]
    },
    Collections: {
      tagline: "CURATED EXCLUSIVES & LOOKBOOKS",
      description: "Limited drops, premium Indian leather heritage, and new season edits.",
      featured: {
        title: "Red Chief Pure Leather Craft",
        subtitle: "Hand-Stitched Italian Heritage Finish",
        category: "Formal Shoes",
        image: "https://images.unsplash.com/photo-1608256246200-53e635b5b65f?auto=format&fit=crop&w=600&q=80",
        badge: "ROYAL EDITION"
      },
      columns: [
        {
          title: "Trending Edits",
          items: [
            { label: "New Arrivals 2026", category: "All" },
            { label: "Trending Indian Brands", category: "All" }
          ]
        },
        {
          title: "Special Craft",
          items: [
            { label: "Premium Leather Craft", category: "Formal Shoes" },
            { label: "Limited Edition Sneakers", category: "Sneakers" }
          ]
        }
      ]
    }
  };

  const navCategories = ['Men', 'Women', 'Kids', 'Bags', 'Collections'];

  const handleMouseEnter = (menuName) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setActiveHoverMenu(menuName);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setActiveHoverMenu(null);
    }, 180);
  };

  const handleItemClick = (catValue) => {
    setActiveHoverMenu(null);
    if (location.pathname !== '/') {
      navigate('/');
    }

    let targetCat = catValue;
    if (['Clogs', 'Crocs Classic', 'Orthotic Clogs'].includes(catValue)) targetCat = 'Crocs & Clogs';
    else if (['Sliders', 'Flip-Flops', 'Leather Sandals', 'Embellished Sandals'].includes(catValue)) targetCat = 'Slippers & Sandals';
    else if (['Handcrafted Mojaris', 'Velvet Mojari', 'Mochi Velvet', 'Metro Ethnic'].includes(catValue)) targetCat = 'Flats & Mojaris';

    if (onSelectCategory) {
      onSelectCategory(targetCat);
    }

    setTimeout(() => {
      const el = document.getElementById('products-section');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  return (
    <>
      <header
        onMouseLeave={handleMouseLeave}
        className="bg-white/95 backdrop-blur-xl border-b border-gray-200/90 sticky top-0 z-50 transition-all py-2.5 shadow-sm"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-14 relative">

          {/* Top Left: StyleWalk Brand Logo */}
          <Link to="/" className="flex items-center gap-3 group shrink-0">
            <div className="w-9 h-9 rounded-xl bg-[#4F46E5] flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform duration-300">
              <Footprints className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col text-left">
              <span className="text-base font-extrabold tracking-tight text-[#0F172A] font-heading leading-none">
                STYLE <span className="text-[#4F46E5]">WALK</span>
              </span>
              <span className="text-[9px] text-[#059669] font-extrabold tracking-[0.2em] uppercase leading-tight mt-0.5">
                STEP INTO YOUR STYLE
              </span>
            </div>
          </Link>

          {/* Middle: Clean & Symmetric Category Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1.5 lg:gap-2">
            {navCategories.map((catName) => {
              const isActive = activeHoverMenu === catName;
              return (
                <button
                  key={catName}
                  onMouseEnter={() => handleMouseEnter(catName)}
                  onClick={() => handleItemClick(catName === 'Bags' ? 'Bags' : 'All')}
                  className={`px-4 py-2 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                    isActive
                      ? 'bg-indigo-50 text-[#4F46E5] border border-indigo-200 shadow-sm'
                      : 'text-[#475569] hover:text-[#0F172A] hover:bg-gray-100/80'
                  }`}
                >
                  {catName}
                </button>
              );
            })}
          </nav>

          {/* Top Right Corner Utilities */}
          <div className="flex items-center gap-1 sm:gap-2">

            {/* ☀️ / 🌙 Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 text-[#475569] hover:text-[#0F172A] rounded-xl hover:bg-gray-100 transition duration-200 cursor-pointer"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5 text-amber-500" />
              ) : (
                <Moon className="w-5 h-5 text-[#4F46E5]" />
              )}
            </button>

            {/* 🔍 Search Button Trigger */}
            <button
              onClick={() => setIsSearchModalOpen(true)}
              className="p-2 text-[#475569] hover:text-[#0F172A] rounded-xl hover:bg-gray-100 transition duration-200 cursor-pointer"
              title="Search Footwear"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* ♡ Wishlist Counter Button */}
            {!isAdminPage && (
              <button
                onClick={() => setIsWishlistOpen(true)}
                className="p-2 text-[#475569] hover:text-[#0F172A] rounded-xl hover:bg-gray-100 transition duration-200 relative cursor-pointer"
                title="Wishlist & Saved Items"
              >
                <Heart className="w-5 h-5" />
                {wishlistCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-[#4F46E5] text-white text-[10px] font-black flex items-center justify-center">
                    {wishlistCount}
                  </span>
                )}
              </button>
            )}

            {/* 👤 Account / User */}
            {user ? (
              <div className="relative flex items-center space-x-1" ref={profileRef}>
                {user.role === 'admin' && (
                  <button
                    onClick={() => navigate('/admin')}
                    className="px-3 py-1.5 text-[#4F46E5] hover:text-white bg-indigo-50 hover:bg-[#4F46E5] rounded-xl transition cursor-pointer text-xs font-extrabold border border-indigo-200 flex items-center space-x-1"
                    title="Admin Control Suite"
                  >
                    <ShieldAlert className="w-4 h-4" />
                    <span>ADMIN</span>
                  </button>
                )}

                {/* Profile icon button */}
                <button
                  onClick={() => setShowProfileCard(!showProfileCard)}
                  className={`p-2 rounded-xl transition cursor-pointer ${
                    showProfileCard
                      ? 'bg-[#4F46E5] text-white'
                      : 'text-[#475569] hover:text-[#4F46E5] hover:bg-gray-100'
                  }`}
                  title="My Profile"
                >
                  <User className="w-5 h-5" />
                </button>

                {/* Profile Popover Card */}
                {showProfileCard && (
                  <div className="absolute right-0 top-10 w-60 bg-white border border-gray-200 rounded-2xl shadow-2xl shadow-black/10 z-50 overflow-hidden">
                    {/* Header */}
                    <div className="px-4 py-4 bg-gradient-to-br from-indigo-50 to-white border-b border-gray-100">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#4F46E5] flex items-center justify-center text-white font-extrabold text-sm shadow">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="overflow-hidden">
                          <p className="text-sm font-extrabold text-[#0F172A] truncate">{user.name}</p>
                          <p className="text-[11px] text-[#64748B] truncate">{user.email}</p>
                        </div>
                      </div>
                      <span className={`inline-block mt-3 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                        user.role === 'admin'
                          ? 'bg-indigo-100 text-[#4F46E5]'
                          : 'bg-emerald-100 text-[#059669]'
                      }`}>
                        {user.role === 'admin' ? '⚡ Administrator' : '💎 Verified Member'}
                      </span>
                    </div>

                    {/* Close / Sign Out */}
                    <div className="p-2">
                      <button
                        onClick={() => { setShowProfileCard(false); logout(); navigate('/'); }}
                        className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}

                {/* Click-outside close */}
                {showProfileCard && (
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowProfileCard(false)}
                  />
                )}
              </div>
            ) : (
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="p-2 text-[#475569] hover:text-[#0F172A] rounded-xl hover:bg-gray-100 transition cursor-pointer"
                title="Account / Sign In"
              >
                <User className="w-5 h-5" />
              </button>
            )}

            {/* 🛍️ Shopping Cart Button */}
            {!isAdminPage && (
              <button
                onClick={() => setIsCartOpen(true)}
                className="p-2 text-[#475569] hover:text-[#0F172A] rounded-xl hover:bg-gray-100 transition relative cursor-pointer ml-1"
                title="View Bag"
              >
                <ShoppingBag className="w-5 h-5 text-[#4F46E5]" />
                {cartCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-[#059669] text-white text-[10px] font-black flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </button>
            )}

          </div>

        </div>

        {/* ═════════════════════════════════════════════════════════════
            BALANCED & NEAT MEGA MENU OVERLAY
            ═════════════════════════════════════════════════════════════ */}
        <AnimatePresence>
          {activeHoverMenu && megaMenuData[activeHoverMenu] && (
            <motion.div
              onMouseEnter={() => handleMouseEnter(activeHoverMenu)}
              onMouseLeave={handleMouseLeave}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
              className="absolute top-full left-0 w-full bg-white/98 backdrop-blur-2xl border-b border-gray-200 shadow-2xl shadow-black/10 z-40 py-6 px-4 sm:px-8 text-left"
            >
              <div className="max-w-7xl mx-auto">

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                  {/* Left & Center: 2 Balanced Sub-Columns (Col 8) */}
                  <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-8">
                    {megaMenuData[activeHoverMenu].columns.map((col, cIdx) => (
                      <div key={cIdx} className="space-y-3">
                        <h4 className="text-xs font-black uppercase text-[#0F172A] font-heading tracking-wider pb-1.5 border-b border-gray-200">
                          {col.title}
                        </h4>
                        <ul className="space-y-2 text-xs">
                          {col.items.map((subItem) => (
                            <li key={subItem.label}>
                              <button
                                onClick={() => handleItemClick(subItem.category || subItem.label)}
                                className="text-[#475569] hover:text-[#4F46E5] hover:translate-x-1 transition-all cursor-pointer font-semibold flex items-center gap-1.5 group text-left"
                              >
                                <ChevronRight className="w-3.5 h-3.5 text-[#94A3B8] group-hover:text-[#4F46E5] transition-colors shrink-0" />
                                <span>{subItem.label}</span>
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>

                  {/* Right: Uniform Featured Spotlight Card (Col 4) */}
                  <div className="lg:col-span-4 border-l border-gray-100 lg:pl-8">
                    <div
                      onClick={() => handleItemClick(megaMenuData[activeHoverMenu].featured.category)}
                      className="rounded-2xl border border-gray-200/90 bg-gradient-to-b from-indigo-50/40 to-white p-3.5 group cursor-pointer hover:border-indigo-300 hover:shadow-lg transition-all duration-300"
                    >
                      <div className="relative aspect-[16/10] rounded-xl overflow-hidden bg-slate-100 mb-3">
                        <img
                          src={megaMenuData[activeHoverMenu].featured.image}
                          alt={megaMenuData[activeHoverMenu].featured.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <span className="absolute top-2 left-2 text-[9px] font-black uppercase tracking-wider bg-[#4F46E5] text-white px-2 py-0.5 rounded-md shadow">
                          {megaMenuData[activeHoverMenu].featured.badge}
                        </span>
                      </div>

                      <div className="text-left">
                        <h4 className="text-sm font-extrabold text-[#0F172A] font-heading group-hover:text-[#4F46E5] transition-colors flex items-center justify-between">
                          <span>{megaMenuData[activeHoverMenu].featured.title}</span>
                          <ArrowUpRight className="w-4 h-4 text-[#4F46E5] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform shrink-0" />
                        </h4>
                        <p className="text-[11px] text-[#64748B] font-semibold mt-0.5">
                          {megaMenuData[activeHoverMenu].featured.subtitle}
                        </p>
                      </div>
                    </div>

                    <div className="pt-3">
                      <button
                        onClick={() => handleItemClick('All')}
                        className="text-[11px] font-extrabold uppercase tracking-wider text-[#4F46E5] hover:text-[#3730A3] flex items-center gap-1.5 group cursor-pointer"
                      >
                        <span>VIEW ALL {activeHoverMenu.toUpperCase()} COLLECTION</span>
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                      </button>
                    </div>
                  </div>

                </div>

              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Auth Modal Popup */}
      {isAuthModalOpen && <AuthModal onClose={() => setIsAuthModalOpen(false)} />}

      {/* Search Modal Overlay */}
      <SearchModal isOpen={isSearchModalOpen} onClose={() => setIsSearchModalOpen(false)} />
    </>
  );
}
