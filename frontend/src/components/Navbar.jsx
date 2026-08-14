import React, { useState, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingBag, Search, User, LogOut, Footprints, Heart, ArrowRight, ChevronRight, Sun, Moon, ShieldAlert } from 'lucide-react';
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

  const megaMenuData = {
    Men: {
      type: 'grid',
      columns: [
        {
          title: 'Footwear',
          items: ['Sneakers', 'Sports Shoes', 'Formal Shoes', 'Boots', 'Casual Shoes']
        },
        {
          title: 'Sandals & Slippers',
          items: ['Crocs & Clogs', 'Sliders', 'Flip-Flops', 'Leather Sandals']
        },
        {
          title: 'Featured',
          items: ['New Arrivals', 'Trending', 'Campus', 'Woodland', 'Red Chief']
        }
      ]
    },
    Women: {
      type: 'grid',
      columns: [
        {
          title: 'Footwear',
          items: ['Sneakers', 'Heels & Wedges', 'Flats & Mojaris', 'Casual Shoes']
        },
        {
          title: 'Comfort & Ethnic',
          items: ['Ethnic Footwear', 'Orthotic Clogs', 'Handcrafted Mojaris', 'Embellished Sandals']
        },
        {
          title: 'Featured',
          items: ['Puma Women', 'Metro Ethnic', 'Crocs Classic', 'Mochi Velvet']
        }
      ]
    },
    Kids: {
      type: 'list',
      items: [
        { label: 'Boys Footwear', category: 'Boys Footwear' },
        { label: 'Girls Sandals', category: 'Girls Sandals' },
        { label: 'School Shoes', category: 'School Shoes' }
      ]
    },
    Bags: {
      type: 'list',
      items: [
        { label: 'Laptop Backpacks', category: 'Laptop Backpacks' },
        { label: 'Sport & Duffle Bags', category: 'Sport & Duffle Bags' },
        { label: 'Trekking Backpacks', category: 'Trekking Backpacks' },
        { label: 'Rider Bike Bags', category: 'Rider Bike Bags' }
      ]
    },
    Collections: {
      type: 'list',
      items: [
        { label: 'New Arrivals 2026', category: 'All' },
        { label: 'Trending Indian Brands', category: 'All' },
        { label: 'Premium Leather Craft', category: 'Formal Shoes' },
        { label: 'Limited Edition Sneakers', category: 'Sneakers' }
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

          {/* Middle: Navigation Category Tabs */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2 text-xs font-bold">
            {navCategories.map((catName) => {
              const isActive = activeHoverMenu === catName;
              return (
                <button
                  key={catName}
                  onMouseEnter={() => handleMouseEnter(catName)}
                  onClick={() => handleItemClick(catName === 'Bags' ? 'Bags' : 'All')}
                  className={`px-4 py-2 rounded-xl transition-all duration-200 cursor-pointer font-bold ${
                    isActive
                      ? 'bg-indigo-50 text-[#4F46E5] border border-indigo-200'
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

          </div>

        </div>

        {/* ═════════════════════════════════════════════════════════════
            MEGA MENU DROPDOWN PANEL — Pops up when hovering nav tabs
            ═════════════════════════════════════════════════════════════ */}
        {activeHoverMenu && megaMenuData[activeHoverMenu] && (
          <div
            onMouseEnter={() => handleMouseEnter(activeHoverMenu)}
            onMouseLeave={handleMouseLeave}
            className="absolute top-full left-0 w-full bg-white/98 backdrop-blur-2xl border-b border-gray-200 shadow-2xl z-40 transition-all duration-300 py-6 px-4 sm:px-8 text-left animate-fadeIn"
          >
            <div className="max-w-7xl mx-auto">

              {/* Type 1: Grid Multi-Column Mega Menu (Men & Women) */}
              {megaMenuData[activeHoverMenu].type === 'grid' && (
                <div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pb-6 border-b border-gray-200">
                    {megaMenuData[activeHoverMenu].columns.map((col, idx) => (
                      <div key={idx} className="space-y-3">
                        <h4 className="text-sm font-bold uppercase text-[#0F172A] font-heading tracking-wider pb-1 border-b border-gray-200">
                          {col.title}
                        </h4>
                        <ul className="space-y-2 text-xs">
                          {col.items.map((subItem) => (
                            <li key={subItem}>
                              <button
                                onClick={() => handleItemClick(subItem)}
                                className="text-[#475569] hover:text-[#4F46E5] hover:translate-x-1 transition-all cursor-pointer block font-semibold"
                              >
                                {subItem}
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>

                  {/* View All Bottom Bar */}
                  <div className="pt-4 flex items-center justify-between">
                    <button
                      onClick={() => handleItemClick('All')}
                      className="text-xs font-bold uppercase tracking-wider text-[#4F46E5] hover:text-[#3730A3] flex items-center gap-2 group cursor-pointer"
                    >
                      <span>VIEW ALL {activeHoverMenu.toUpperCase()} COLLECTION</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              )}

              {/* Type 2: Sub-list Mega Menu Dropdown (Boys/Kids, Bags, About) */}
              {megaMenuData[activeHoverMenu].type === 'list' && (
                <div className="max-w-xs space-y-2">
                  {megaMenuData[activeHoverMenu].items.map((itemObj) => (
                    <button
                      key={itemObj.label}
                      onClick={() => handleItemClick(itemObj.category || itemObj.label)}
                      className="w-full px-4 py-2.5 rounded-xl bg-gray-50 hover:bg-indigo-50 text-[#0F172A] hover:text-[#4F46E5] text-xs font-bold flex items-center justify-between transition-all cursor-pointer border border-gray-200 group"
                    >
                      <span>{itemObj.label}</span>
                      <ChevronRight className="w-4 h-4 text-[#64748B] group-hover:text-[#4F46E5] group-hover:translate-x-1 transition-transform" />
                    </button>
                  ))}
                </div>
              )}

            </div>
          </div>
        )}
      </header>

      {/* Auth Modal Popup */}
      {isAuthModalOpen && <AuthModal onClose={() => setIsAuthModalOpen(false)} />}

      {/* Search Modal Overlay */}
      <SearchModal isOpen={isSearchModalOpen} onClose={() => setIsSearchModalOpen(false)} />
    </>
  );
}




