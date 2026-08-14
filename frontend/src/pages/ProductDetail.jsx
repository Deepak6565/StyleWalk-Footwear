import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Star, 
  ShoppingBag, 
  Ruler, 
  ArrowLeft, 
  ShieldCheck, 
  Sparkles, 
  Check, 
  MessageSquare, 
  Send,
  Truck,
  Flame,
  Heart,
  CreditCard,
  Clock,
  RefreshCw,
  Share2,
  ThumbsUp,
  Info,
  Package,
  Zap
} from 'lucide-react';
import ProductMediaGallery from '../components/ProductMediaGallery';
import ShoeSizeAdvisorModal from '../components/ShoeSizeAdvisorModal';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { user } = useAuth();

  const [timeLeft, setTimeLeft] = useState({ hours: 2, minutes: 45, seconds: 30 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 3, minutes: 0, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [ratingFilter, setRatingFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState('Size 8');
  const [isSizeAdvisorOpen, setIsSizeAdvisorOpen] = useState(false);
  const [addedToast, setAddedToast] = useState(false);
  const [activeTab, setActiveTab] = useState('specs');

  // Review Form state
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchProductDetails();
    fetchReviews();
  }, [id]);

  const fetchProductDetails = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/products/${id}`);
      setProduct(res.data);
      if (res.data.sizes && res.data.sizes.length > 0) {
        setSelectedSize(res.data.sizes[2] || res.data.sizes[0]);
      }
    } catch (err) {
      console.error('Failed to load product details:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/products/${id}/reviews`);
      setReviews(res.data);
    } catch (err) {
      console.error('Failed to load reviews:', err);
    }
  };

  const handleAddToCart = () => {
    if (!product) return;
    addToCart(product, selectedSize);
    setAddedToast(true);
    setTimeout(() => setAddedToast(false), 2000);
  };

  const handleBuyNow = () => {
    if (!product) return;
    addToCart(product, selectedSize);
    navigate('/checkout');
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setSubmittingReview(true);

    try {
      const token = localStorage.getItem('stylewalk_token');
      await axios.post(
        `http://localhost:5000/api/products/${id}/reviews`,
        { rating: newRating, comment: newComment },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNewComment('');
      fetchReviews();
      fetchProductDetails();
    } catch (err) {
      alert('Failed to post review. Please ensure you are logged in.');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] text-[#0F172A] flex items-center justify-center">
        <p className="text-xs font-bold text-[#64748B] uppercase tracking-widest animate-pulse">
          Loading Footwear Details...
        </p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] text-[#0F172A] flex flex-col items-center justify-center p-4">
        <h2 className="text-xl font-bold font-heading">Footwear Product Not Found</h2>
        <button onClick={() => navigate('/')} className="mt-4 px-4 py-2 rounded-xl bg-[#4F46E5] text-white font-bold text-xs">
          Return to Gallery
        </button>
      </div>
    );
  }

  const priceInr = product.price_inr !== undefined ? product.price_inr : product.price;
  const mrpInr = Math.round(priceInr * 1.4);
  const discountPercent = Math.round(((mrpInr - priceInr) / mrpInr) * 100);

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#0F172A] pt-6 pb-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      
      {/* Top Header Breadcrumb & Back Navigation */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3">
        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-white hover:bg-gray-100 text-[#475569] hover:text-[#0F172A] text-xs font-bold transition border border-gray-200 cursor-pointer shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>BACK TO GALLERY</span>
        </button>

        <div className="flex items-center space-x-2 text-xs font-semibold text-[#64748B]">
          <span>Home</span>
          <span>/</span>
          <span>{product.category}</span>
          <span>/</span>
          <span className="text-[#4F46E5] font-bold truncate max-w-[150px]">{product.name}</span>
        </div>
      </div>

      {/* Main Product Showcase Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Interactive Product Media Gallery (Col 7) */}
        <div className="lg:col-span-7">
          <ProductMediaGallery product={product} />
        </div>

        {/* Right Column: Specifications, Delivery Checker, Action Controls (Col 5) */}
        <div className="lg:col-span-5 space-y-6 text-left">
          
          {/* Live Shoppers Banner */}
          <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-between">
            <div className="flex items-center space-x-2 text-xs font-bold text-amber-800">
              <Flame className="w-4 h-4 text-amber-600 animate-bounce" />
              <span>HIGH DEMAND: 18 people viewing this shoe right now</span>
            </div>
          </div>

          {/* Product Title & Brand Badges */}
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <span className="px-3 py-1 rounded-full text-[9px] font-extrabold uppercase tracking-widest bg-indigo-50 text-[#4F46E5] border border-indigo-200">
                {product.brand}
              </span>
              {product.material_badge && (
                <span className="px-3 py-1 rounded-full text-[9px] font-extrabold uppercase tracking-widest bg-emerald-50 text-[#059669] border border-emerald-200">
                  {product.material_badge}
                </span>
              )}
              <span className="px-3 py-1 rounded-full text-[9px] font-extrabold uppercase tracking-widest bg-rose-50 text-rose-600 border border-rose-200">
                {discountPercent}% OFF
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#0F172A] uppercase tracking-tight font-heading">
              {product.name}
            </h1>

            {/* Price & Rating Display */}
            <div className="flex flex-wrap items-baseline gap-3 mt-3">
              <span className="text-3xl sm:text-4xl font-extrabold text-[#059669]">
                ₹{priceInr ? priceInr.toLocaleString('en-IN') : '2,499'}
              </span>

              <span className="text-sm font-bold text-[#64748B] line-through">
                ₹{mrpInr.toLocaleString('en-IN')}
              </span>

              <span className="text-xs font-extrabold text-[#059669] bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200">
                Save ₹{(mrpInr - priceInr).toLocaleString('en-IN')}
              </span>

              <div className="flex items-center space-x-1 px-3 py-1 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 font-extrabold text-xs ml-auto">
                <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                <span>{product.rating} / 5.0 ({product.review_count || 12} reviews)</span>
              </div>
            </div>

            <p className="text-[11px] text-[#64748B] mt-1 font-semibold">
              Inclusive of all taxes &amp; GST • Free Shipping across India
            </p>
          </div>

          {/* Express Shipping Countdown & Stock Urgency Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-50/90 via-indigo-50/60 to-emerald-50/80 border border-amber-200/80 space-y-2.5 text-left shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold shrink-0 shadow-sm">
                  <Zap className="w-4 h-4 animate-pulse" />
                </div>
                <div>
                  <span className="text-[10px] font-extrabold uppercase text-amber-800 tracking-wider block">EXPRESS SAME-DAY DISPATCH</span>
                  <p className="text-xs font-bold text-[#0F172A]">
                    Order within <span className="text-[#4F46E5] font-extrabold">{String(timeLeft.hours).padStart(2, '0')}h {String(timeLeft.minutes).padStart(2, '0')}m {String(timeLeft.seconds).padStart(2, '0')}s</span> for dispatch today!
                  </p>
                </div>
              </div>

              <span className="hidden sm:inline-block px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-[#059669] text-white shadow-sm">
                FREE EXPRESS
              </span>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] font-bold text-[#475569] pt-2 border-t border-amber-200/60">
              <span className="flex items-center space-x-1 text-[#059669]">
                <Flame className="w-3.5 h-3.5 text-rose-500 animate-bounce" />
                <span>High Demand: 14 shoppers viewing this model</span>
              </span>

              <span className="flex items-center space-x-1 text-[#4F46E5]">
                <Package className="w-3.5 h-3.5" />
                <span>Only {product?.stock_quantity || 4} pairs left in {String(selectedSize).replace(/^UK\s*/i, 'Size ')}!</span>
              </span>
            </div>
          </div>



          {/* Size Selector */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-extrabold uppercase tracking-wider text-[#0F172A]">
                SELECT SHOE SIZE:
              </label>

              <button
                onClick={() => setIsSizeAdvisorOpen(true)}
                className="text-[11px] text-[#4F46E5] font-extrabold flex items-center space-x-1 hover:underline cursor-pointer"
              >
                <Ruler className="w-3.5 h-3.5" />
                <span>Size Calculator</span>
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {(product.sizes || ["Size 6", "Size 7", "Size 8", "Size 9", "Size 10", "Size 11"]).map((s) => {
                const sizeLabel = String(s).replace(/^UK\s*/i, 'Size ');
                return (
                  <button
                    key={s}
                    onClick={() => setSelectedSize(sizeLabel)}
                    className={`py-3 rounded-2xl text-xs font-extrabold transition border cursor-pointer ${
                      selectedSize === sizeLabel
                        ? 'bg-[#4F46E5] border-[#4F46E5] text-white shadow-md shadow-indigo-500/20'
                        : 'bg-white border-gray-200 text-[#475569] hover:bg-gray-100 hover:text-[#0F172A]'
                    }`}
                  >
                    {sizeLabel}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Action Buttons: Add to Cart & Buy Now */}
          <div className="space-y-3">
            <button
              onClick={handleAddToCart}
              disabled={product.stock_quantity === 0}
              className={`w-full py-4 rounded-2xl font-extrabold text-sm tracking-wider shadow-md flex items-center justify-center space-x-2 transition ${
                addedToast
                  ? 'bg-[#059669] text-white shadow-emerald-500/20'
                  : product.stock_quantity === 0
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-[#4F46E5] hover:bg-[#3730A3] text-white shadow-indigo-500/20 cursor-pointer'
              }`}
            >
              {addedToast ? (
                <>
                  <Check className="w-5 h-5" />
                  <span>ADDED TO CART</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-5 h-5" />
                  <span>ADD TO CART • {String(selectedSize).replace(/^UK\s*/i, 'Size ')}</span>
                </>
              )}
            </button>

            <button
              onClick={handleBuyNow}
              disabled={product.stock_quantity === 0}
              className="w-full py-3.5 rounded-2xl font-extrabold text-xs tracking-wider border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-[#059669] flex items-center justify-center space-x-2 transition cursor-pointer"
            >
              <CreditCard className="w-4 h-4" />
              <span>BUY NOW • DIRECT EXPRESS CHECKOUT</span>
            </button>
          </div>

          {/* Product Highlights */}
          <div className="space-y-3 pt-4 border-t border-white/10 text-xs text-gray-400 font-semibold">
            <div className="flex items-center space-x-3">
              <ShieldCheck className="w-5 h-5 text-indigo-400 shrink-0" />
              <span>100% Authentic Indian Brand Quality &amp; 30-Day Easy Exchange Guarantee</span>
            </div>
            <div className="flex items-center space-x-3">
              <Sparkles className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>Cash on Delivery (COD) Available All Over India</span>
            </div>
          </div>

        </div>
      </div>

      {/* TABBED PRODUCT INFORMATION SUITE */}
      <section className="mt-16 pt-10 border-t border-white/10 text-left">
        
        <div className="flex space-x-3 overflow-x-auto pb-3 mb-6 border-b border-white/10">
          {[
            { id: 'specs', label: 'Features & Comfort Specs' },
            { id: 'care', label: 'Material & Care Instructions' },
            { id: 'shipping', label: 'Shipping & Easy Returns' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-3 rounded-2xl text-xs font-black transition cursor-pointer whitespace-nowrap border ${
                activeTab === tab.id
                  ? 'bg-indigo-600 text-white border-indigo-400 shadow-lg'
                  : 'bg-white/5 text-gray-400 border-white/10 hover:bg-white/10 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-6 rounded-3xl glass-panel border border-white/10">
          {activeTab === 'specs' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-gray-300">
              <div className="space-y-2">
                <h4 className="font-black text-white text-sm uppercase text-indigo-400">Sole Construction</h4>
                <p>Vulcanized anti-skid rubber compound designed for damp pavement, wet tiles, and rocky trail surfaces.</p>
              </div>
              <div className="space-y-2">
                <h4 className="font-black text-white text-sm uppercase text-emerald-400">Midsole Cushioning</h4>
                <p>High-rebound CloudFoam structure returns kinetic energy to prevent fatigue during extended walking.</p>
              </div>
              <div className="space-y-2">
                <h4 className="font-black text-white text-sm uppercase text-cyan-400">Fit & Support</h4>
                <p>Anatomically contoured arch support bed suited for standard and wide Indian foot profiles.</p>
              </div>
            </div>
          )}

          {activeTab === 'care' && (
            <div className="space-y-3 text-xs text-gray-300">
              <p className="font-bold text-white">To preserve the longevity of your footwear:</p>
              <ul className="list-disc list-inside space-y-1.5 text-gray-400 font-medium">
                <li>Clean upper surface gently using a damp microfiber cloth with soft foam soap.</li>
                <li>Allow natural air drying away from direct intense sunlight to avoid color fading.</li>
                <li>Use cedar shoe trees or paper padding when storing to retain original structure shape.</li>
              </ul>
            </div>
          )}

          {activeTab === 'shipping' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-gray-300">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                <h4 className="font-black text-white mb-1 flex items-center gap-2">
                  <Truck className="w-4 h-4 text-emerald-400" />
                  Free Express Shipping
                </h4>
                <p className="text-gray-400">Dispatched within 24 hours of order placement. Delivered in 3-5 business days.</p>
              </div>

              <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                <h4 className="font-black text-white mb-1 flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 text-indigo-400" />
                  30-Day Hassle-Free Exchange
                </h4>
                <p className="text-gray-400">If the size doesn't fit perfectly, request a door-step size exchange at zero additional cost.</p>
              </div>
            </div>
          )}
        </div>

      </section>

      {/* VERIFIED CUSTOMER REVIEWS & RATING BREAKDOWN */}
      <section className="mt-16 pt-12 border-t border-gray-200">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h2 className="text-2xl font-extrabold text-[#0F172A] uppercase tracking-tight flex items-center gap-2 font-heading">
              <MessageSquare className="w-6 h-6 text-[#4F46E5]" />
              VERIFIED CUSTOMER REVIEWS
            </h2>
            <p className="text-xs text-[#64748B] mt-1 font-semibold">Real feedback from Indian footwear buyers</p>
          </div>

          <div className="flex items-center space-x-3 bg-white px-4 py-2.5 rounded-2xl border border-gray-200 shadow-sm">
            <span className="text-2xl font-extrabold text-amber-500 font-heading">{product.rating}</span>
            <div className="text-left">
              <div className="flex text-amber-400">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className="w-3.5 h-3.5 fill-current" />
                ))}
              </div>
              <span className="text-[10px] text-[#64748B] font-extrabold">{reviews.length} Verified Buyer Ratings</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Post Review Form (Col 5) */}
          <div className="lg:col-span-5 p-6 rounded-3xl bg-white border border-gray-200 h-fit text-left shadow-sm">
            <h3 className="text-lg font-extrabold text-[#0F172A] mb-1 font-heading">Write a Review</h3>
            <p className="text-xs text-[#64748B] mb-5 font-semibold">Share your experience regarding fit, comfort, and durability.</p>

            {user ? (
              <form onSubmit={handleReviewSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#0F172A] mb-1.5">Rating Score:</label>
                  <div className="flex space-x-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setNewRating(star)}
                        className={`p-2.5 rounded-xl border transition cursor-pointer ${
                          newRating >= star
                            ? 'bg-amber-50 border-amber-300 text-amber-500 shadow-sm'
                            : 'bg-gray-50 border-gray-200 text-gray-400 hover:bg-gray-100'
                        }`}
                      >
                        <Star className="w-5 h-5 fill-current" />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#0F172A] mb-1.5">Review Comment:</label>
                  <textarea
                    rows={4}
                    required
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Describe comfort, fit, sole grip, and build quality..."
                    className="w-full p-3.5 rounded-xl bg-gray-50 border border-gray-200 text-xs font-semibold text-[#0F172A] placeholder-[#64748B] focus:outline-none focus:border-[#4F46E5] focus:bg-white cursor-text"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submittingReview}
                  className="w-full py-3.5 rounded-xl bg-[#4F46E5] hover:bg-[#3730A3] text-white font-extrabold text-xs transition flex items-center justify-center space-x-2 cursor-pointer shadow-md shadow-indigo-500/20"
                >
                  <Send className="w-4 h-4" />
                  <span>{submittingReview ? 'Submitting...' : 'SUBMIT VERIFIED REVIEW'}</span>
                </button>
              </form>
            ) : (
              <div className="text-center py-6">
                <p className="text-xs text-[#64748B] mb-3 font-semibold">Log in to leave a customer review.</p>
              </div>
            )}
          </div>

          {/* Review Cards List (Col 7) */}
          <div className="lg:col-span-7 space-y-4 text-left">
            {/* Rating Filter Pills */}
            <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none mb-4">
              {['ALL', 5, 4, 3].map((f) => (
                <button
                  key={f}
                  onClick={() => setRatingFilter(f)}
                  className={`px-3 py-1.5 rounded-full text-xs font-extrabold transition border cursor-pointer flex items-center space-x-1 ${
                    ratingFilter === f
                      ? 'bg-[#4F46E5] text-white border-[#4F46E5] shadow-sm'
                      : 'bg-white text-[#475569] border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <span>{f === 'ALL' ? 'All Reviews' : `${f} Stars`}</span>
                  {f !== 'ALL' && <Star className="w-3 h-3 fill-amber-400 text-amber-400" />}
                </button>
              ))}
            </div>

            {reviews.filter(r => ratingFilter === 'ALL' || r.rating === ratingFilter).length === 0 ? (
              <div className="p-8 rounded-3xl bg-white border border-gray-200 text-center shadow-sm">
                <p className="text-xs text-[#64748B] font-semibold">No customer reviews match this rating filter.</p>
              </div>
            ) : (
              reviews
                .filter(r => ratingFilter === 'ALL' || r.rating === ratingFilter)
                .map((rev) => (
                  <div key={rev.id} className="p-5 rounded-2xl bg-white border border-gray-200 shadow-sm">
                    <div className="flex justify-between items-center mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center font-extrabold text-[#4F46E5] text-sm">
                          {rev.user_name ? rev.user_name.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <div>
                          <h4 className="text-xs font-extrabold text-[#0F172A]">{rev.user_name}</h4>
                          <span className="inline-flex items-center space-x-1 text-[10px] text-[#059669] font-extrabold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 mt-0.5">
                            <ShieldCheck className="w-3 h-3 text-[#059669]" />
                            <span>Verified Buyer</span>
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-1 text-amber-500 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                        <Star className="w-3.5 h-3.5 fill-current" />
                        <span className="text-xs font-extrabold">{rev.rating}.0</span>
                      </div>
                    </div>

                    <p className="text-xs text-[#475569] leading-relaxed font-semibold">
                      "{rev.comment}"
                    </p>
                  </div>
                ))
            )}
          </div>

        </div>
      </section>

      <ShoeSizeAdvisorModal
        isOpen={isSizeAdvisorOpen}
        onClose={() => setIsSizeAdvisorOpen(false)}
        onSelectSize={(size) => setSelectedSize(size)}
      />
    </div>
  );
}


