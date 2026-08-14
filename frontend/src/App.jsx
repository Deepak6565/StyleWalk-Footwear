import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { ThemeProvider } from './context/ThemeContext';


import SpatialDock from './components/SpatialDock';
import RadialCategorySelector from './components/RadialCategorySelector';
import FullScreenKineticMenu from './components/FullScreenKineticMenu';
import CartDrawer from './components/CartDrawer';
import AuthModal from './components/AuthModal';
import GiftCardModal from './components/GiftCardModal';
import WishlistDrawer from './components/WishlistDrawer';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

import ScrollToTop from './components/ScrollToTop';

import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import ProductDetail from './pages/ProductDetail';
import Checkout from './pages/Checkout';
import CustomerOrders from './pages/CustomerOrders';
import AdminDashboard from './pages/AdminDashboard';

import { Footprints, MapPin, Phone, Mail, Sparkles, Search, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function App() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isRadialOpen, setIsRadialOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchFilter, setSearchFilter] = useState('');

  return (
    <ThemeProvider>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <Router>
              <ScrollToTop />
              <div className="min-h-screen bg-[#FAFAFA] text-[#0F172A] flex flex-col selection:bg-[#4F46E5] selection:text-white relative transition-colors duration-300">
                <Navbar onSelectCategory={(cat) => setSelectedCategory(cat)} />
                <CartDrawer />
                <WishlistDrawer />

              {/* Auth Modal */}
              <AnimatePresence>
                {isAuthModalOpen && <AuthModal onClose={() => setIsAuthModalOpen(false)} />}
              </AnimatePresence>


              {/* Radial Category Selector Overlay */}
              <RadialCategorySelector
                isOpen={isRadialOpen}
                onClose={() => setIsRadialOpen(false)}
                selectedCategory={selectedCategory}
                onSelectCategory={(cat) => {
                  setSelectedCategory(cat);
                  setSearchFilter('');
                }}
              />

              {/* Full-Screen Kinetic Overlay Menu */}
              <FullScreenKineticMenu
                isOpen={isMenuOpen}
                onClose={() => setIsMenuOpen(false)}
              />

              {/* Quick Search Modal */}
              <AnimatePresence>
                {isSearchModalOpen && (
                  <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onClick={() => setIsSearchModalOpen(false)}
                      className="absolute inset-0 bg-gray-950/80 backdrop-blur-xl"
                    />
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="relative z-10 w-full max-w-lg p-6 rounded-3xl glass-panel border border-indigo-500/30 text-white"
                    >
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-sm font-black uppercase text-indigo-400">SEARCH FOOTWEAR</h3>
                        <button onClick={() => setIsSearchModalOpen(false)} className="text-gray-400 hover:text-white">
                          <X className="w-5 h-5" />
                        </button>
                      </div>

                      <div className="relative">
                        <Search className="w-5 h-5 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          autoFocus
                          placeholder="Search Phantom, Aerogel, Running, Leather Boot..."
                          value={searchFilter}
                          onChange={(e) => setSearchFilter(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') setIsSearchModalOpen(false);
                          }}
                          className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm font-bold text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                    </motion.div>
                  </div>
                )}
              </AnimatePresence>

              {/* Application Main Content Routes */}
              <div className="flex-1">
                <Routes>
                  <Route
                    path="/"
                    element={
                      <Home
                        selectedCategory={selectedCategory}
                        onSelectCategory={(cat) => {
                          setSelectedCategory(cat);
                          setSearchFilter('');
                        }}
                        searchFilter={searchFilter}
                      />
                    }
                  />
                  <Route path="/product/:id" element={<ProductDetail />} />
                  <Route path="/checkout" element={<Checkout />} />
                  <Route path="/orders" element={<CustomerOrders />} />
                  <Route
                    path="/admin"
                    element={
                      <ProtectedRoute allowedRoles={['admin']}>
                        <AdminDashboard />
                      </ProtectedRoute>
                    }
                  />
                </Routes>
              </div>

              {/* Floating Spatial Navigation Dock */}
              <SpatialDock
                onToggleSearch={() => setIsSearchModalOpen(true)}
                onToggleRadial={() => setIsRadialOpen(true)}
                onToggleMenu={() => setIsMenuOpen(true)}
                onOpenAuth={() => setIsAuthModalOpen(true)}
              />

              {/* Cyber-Luxury StyleWalk Footer */}
              <Footer onOpenRadialCategory={() => setIsRadialOpen(true)} />

            </div>
          </Router>
        </WishlistProvider>
      </CartProvider>
    </AuthProvider>
  </ThemeProvider>
  );
}
