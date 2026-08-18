import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home,
  Grid,
  Compass,
  Search,
  ShoppingBag,
  User,
  ShieldAlert,
  Menu as MenuIcon,
  X,
  PackageCheck,
  Headphones,
  ShieldCheck,
  LogOut,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export default function SpatialDock({
  onToggleSearch,
  onToggleRadial,
  onToggleMenu,
  onOpenAuth,
  onOpenAssistance,
  wishlistCount = 0
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const { cartItems, setIsCartOpen } = useCart();
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const panelRef = useRef(null);

  const totalCartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  // Close panel on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [isOpen]);

  const close = () => setIsOpen(false);
  const isAdminPage = location.pathname === '/admin';

  const sections = [
    {
      label: 'Main Navigation',
      items: [
        {
          id: 'home',
          label: 'Home',
          icon: Home,
          action: () => { navigate('/'); close(); },
          active: location.pathname === '/'
        },
        {
          id: 'gallery',
          label: 'Gallery',
          icon: Grid,
          action: () => {
            navigate('/');
            setTimeout(() => {
              document.getElementById('products-section')?.scrollIntoView({ behavior: 'smooth' });
            }, 100);
            close();
          },
          active: false
        },
        {
          id: 'categories',
          label: 'Categories',
          icon: Compass,
          action: () => { onToggleRadial(); close(); },
          active: false
        },
        {
          id: 'search',
          label: 'Search Products',
          icon: Search,
          action: () => { onToggleSearch(); close(); },
          active: false
        }
      ]
    },
    ...(!isAdminPage ? [{
      label: 'Store & Orders',
      items: [
        {
          id: 'cart',
          label: 'Shopping Bag',
          icon: ShoppingBag,
          action: () => { setIsCartOpen(true); close(); },
          badge: totalCartCount > 0 ? totalCartCount : null,
          active: false
        },
        {
          id: 'orders',
          label: 'My Orders',
          icon: PackageCheck,
          action: () => { if (!user) onOpenAuth(); else navigate('/orders'); close(); },
          active: location.pathname === '/orders'
        },
        {
          id: 'assistance',
          label: 'Assistance',
          icon: Headphones,
          action: () => { if (onOpenAssistance) onOpenAssistance(); close(); },
          active: false,
          color: 'indigo'
        }
      ]
    }] : []),
    {
      label: 'Account & Admin',
      items: [
        ...(user ? [
          ...(user.role === 'admin' ? [
            {
              id: 'admin-dashboard',
              label: 'Admin Dashboard',
              icon: ShieldAlert,
              action: () => { navigate('/admin'); close(); },
              active: location.pathname === '/admin',
              color: 'indigo'
            }
          ] : []),
          {
            id: 'user',
            label: user.name,
            icon: User,
            sublabel: user.role === 'admin' ? 'Store Manager' : user.email,
            action: () => { },
            active: false,
            noHover: true
          },
          {
            id: 'logout',
            label: 'Sign Out',
            icon: LogOut,
            action: () => { logout(); navigate('/'); close(); },
            active: false,
            color: 'red'
          }
        ] : [
          {
            id: 'login',
            label: 'Sign In / Register',
            icon: User,
            action: () => { onOpenAuth(); close(); },
            active: false,
            color: 'indigo'
          }
        ]),
        {
          id: 'more-menu',
          label: 'More Navigation',
          icon: MenuIcon,
          action: () => { onToggleMenu(); close(); },
          active: false
        }
      ]
    }
  ];

  return (
    <div ref={panelRef} className="fixed left-4 top-4 z-50 pointer-events-auto">

      {/* ── HAMBURGER TOGGLE BUTTON ── */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.94 }}
        transition={{ type: 'spring', stiffness: 400, damping: 20 }}
        className={`w-10 h-10 rounded-xl flex items-center justify-center cursor-pointer shadow-md border transition-all duration-200 ${isOpen
            ? 'bg-[#4F46E5] text-white border-[#4F46E5] shadow-indigo-400/40'
            : 'bg-white text-[#0F172A] border-gray-200 hover:border-[#4F46E5] hover:text-[#4F46E5]'
          }`}
        aria-label="Toggle Navigation Menu"
      >
        <AnimatePresence mode="wait" initial={false}>
          {isOpen ? (
            <motion.span
              key="x"
              initial={{ rotate: -45, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 45, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <X className="w-4 h-4" />
            </motion.span>
          ) : (
            <motion.span
              key="menu"
              initial={{ rotate: 45, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -45, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <MenuIcon className="w-4 h-4" />
            </motion.span>
          )}
        </AnimatePresence>

        {/* Cart badge on toggle when closed */}
        {!isOpen && !isAdminPage && totalCartCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-[#059669] text-white text-[9px] font-extrabold flex items-center justify-center border border-white shadow"
          >
            {totalCartCount}
          </motion.span>
        )}
      </motion.button>

      {/* ── DROPDOWN PANEL ── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="nav-panel"
            initial={{ opacity: 0, scale: 0.95, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -8 }}
            transition={{ type: 'spring', stiffness: 380, damping: 28 }}
            className="absolute top-12 left-0 w-56 bg-white border border-gray-200 rounded-2xl shadow-2xl shadow-black/10 overflow-hidden"
          >
            {sections.map((section, sIdx) => (
              <div key={sIdx}>
                {/* Section divider */}
                {sIdx > 0 && <div className="h-px bg-gray-100 mx-3" />}

                {/* Section label */}
                {section.label && (
                  <p className="px-4 pt-3 pb-1 text-[10px] font-extrabold uppercase tracking-widest text-[#94A3B8]">
                    {section.label}
                  </p>
                )}

                {section.items.map((item, iIdx) => {
                  const Icon = item.icon;
                  const isFirst = sIdx === 0 && iIdx === 0;
                  const isLast = sIdx === sections.length - 1 && iIdx === section.items.length - 1;

                  if (item.noHover) {
                    // User info row — non-clickable display
                    return (
                      <div
                        key={item.id}
                        className="flex items-center gap-3 px-4 py-2.5"
                      >
                        <div className="w-7 h-7 rounded-lg bg-[#4F46E5] flex items-center justify-center text-white text-xs font-extrabold shrink-0">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="overflow-hidden">
                          <p className="text-xs font-bold text-[#0F172A] truncate">{item.label}</p>
                          <p className="text-[10px] text-[#94A3B8] truncate">{item.sublabel}</p>
                        </div>
                      </div>
                    );
                  }

                  const colorMap = {
                    indigo: 'text-[#4F46E5] hover:bg-indigo-50',
                    red: 'text-rose-600 hover:bg-rose-50',
                    default: 'text-[#334155] hover:bg-gray-50'
                  };
                  const colorClass = colorMap[item.color] || colorMap.default;
                  const activeClass = item.active
                    ? 'bg-indigo-50 text-[#4F46E5] font-extrabold'
                    : '';

                  return (
                    <motion.button
                      key={item.id}
                      onClick={item.action}
                      whileHover={{ x: 2 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors cursor-pointer group
                        ${isFirst ? 'pt-3' : ''}
                        ${isLast ? 'pb-3' : ''}
                        ${activeClass || colorClass}
                      `}
                    >
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-colors ${item.active
                          ? 'bg-[#4F46E5] text-white'
                          : item.color === 'indigo'
                            ? 'bg-indigo-100 text-[#4F46E5] group-hover:bg-[#4F46E5] group-hover:text-white'
                            : item.color === 'red'
                              ? 'bg-rose-50 text-rose-500 group-hover:bg-rose-500 group-hover:text-white'
                              : 'bg-gray-100 text-[#64748B] group-hover:bg-[#4F46E5] group-hover:text-white'
                        }`}>
                        <Icon className="w-3.5 h-3.5" />
                      </div>

                      <span className="text-xs font-semibold flex-1 truncate">{item.label}</span>

                      {/* Badge */}
                      {item.badge && (
                        <span className="ml-auto px-1.5 py-0.5 min-w-[18px] h-[18px] rounded-full bg-[#059669] text-white text-[9px] font-extrabold flex items-center justify-center">
                          {item.badge}
                        </span>
                      )}

                      {/* Active chevron */}
                      {item.active && (
                        <ChevronRight className="w-3 h-3 ml-auto opacity-60 shrink-0" />
                      )}
                    </motion.button>
                  );
                })}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
