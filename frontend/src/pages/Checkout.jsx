import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, 
  CreditCard, 
  Lock, 
  CheckCircle2, 
  ArrowLeft, 
  Tag, 
  UploadCloud, 
  QrCode, 
  Banknote, 
  Clock, 
  AlertTriangle,
  X,
  FileCheck,
  Check
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export default function Checkout() {
  const navigate = useNavigate();
  const { cartItems, subtotal, appliedCoupon, discountAmount, totalAmount, clearCart, applyCoupon } = useCart();
  const { user } = useAuth();

  const [paymentMethod, setPaymentMethod] = useState('COD'); // 'COD' | 'ONLINE'
  const [shippingAddress, setShippingAddress] = useState('104 Cyberway Blvd, Bandra Kurla Complex, Mumbai, Maharashtra 400051');
  const [promoCodeInput, setPromoCodeInput] = useState('');
  const [processing, setProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Admin QR Code & Online Payment Screenshot state
  const [adminQrCode, setAdminQrCode] = useState('https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=upi://pay?pa=stylewalk@upi%26pn=StyleWalk%20Store%26cu=INR');
  const [screenshotPreview, setScreenshotPreview] = useState(null);
  const [uploadedScreenshotUrl, setUploadedScreenshotUrl] = useState('');
  const [uploadingScreenshot, setUploadingScreenshot] = useState(false);

  useEffect(() => {
    fetchAdminQrCode();
  }, []);

  const fetchAdminQrCode = async () => {
    try {
      const res = await axios.get('/api/admin/qr-code');
      if (res.data && res.data.qr_code) {
        setAdminQrCode(res.data.qr_code);
      }
    } catch (err) {
      console.error('Failed to fetch admin QR code:', err);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-[#080b11] text-white flex flex-col items-center justify-center p-4">
        <h2 className="text-xl font-bold">Your cart is empty</h2>
        <button onClick={() => navigate('/')} className="mt-4 px-5 py-2.5 rounded-xl bg-indigo-600 font-bold text-xs cursor-pointer">
          Return to Footwear Gallery
        </button>
      </div>
    );
  }

  const handleApplyPromo = async (e) => {
    e.preventDefault();
    if (!promoCodeInput.trim()) return;
    const ok = await applyCoupon(promoCodeInput.trim());
    if (ok) setPromoCodeInput('');
    else setErrorMsg('Invalid coupon. Try DESI10 or FESTIVE20');
  };

  const handleScreenshotFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMsg('Please upload a valid image file (PNG, JPG, JPEG).');
      return;
    }

    setUploadingScreenshot(true);
    setErrorMsg('');

    // Local Preview
    const reader = new FileReader();
    reader.onload = () => {
      setScreenshotPreview(reader.result);
    };
    reader.readAsDataURL(file);

    try {
      const token = localStorage.getItem('stylewalk_token');
      if (!token) {
        setErrorMsg('Please log in before uploading payment proof.');
        setUploadingScreenshot(false);
        return;
      }

      // Convert file to base64 for API upload
      const base64Reader = new FileReader();
      base64Reader.onload = async () => {
        try {
          const res = await axios.post(
            '/api/upload/screenshot',
            { imageBase64: base64Reader.result },
            { headers: { Authorization: `Bearer ${token}` } }
          );
          setUploadedScreenshotUrl(res.data.imageUrl);
        } catch (uploadErr) {
          console.error('Upload failed:', uploadErr);
          setErrorMsg(uploadErr.response?.data?.error || 'Failed to upload screenshot image.');
        } finally {
          setUploadingScreenshot(false);
        }
      };
      base64Reader.readAsDataURL(file);
    } catch (err) {
      console.error('File handler error:', err);
      setUploadingScreenshot(false);
    }
  };

  const handleRemoveScreenshot = () => {
    setScreenshotPreview(null);
    setUploadedScreenshotUrl('');
  };

  const handleOrderSubmit = async (e) => {
    e.preventDefault();
    setProcessing(true);
    setErrorMsg('');

    try {
      const token = localStorage.getItem('stylewalk_token');
      if (!token) {
        setErrorMsg('Please log in before placing an order.');
        setProcessing(false);
        return;
      }

      if (!shippingAddress.trim()) {
        setErrorMsg('Delivery shipping address is required.');
        setProcessing(false);
        return;
      }

      if (paymentMethod === 'ONLINE' && !uploadedScreenshotUrl) {
        setErrorMsg('Payment screenshot proof must be uploaded before confirming online payment.');
        setProcessing(false);
        return;
      }

      const orderPayload = {
        items: cartItems,
        subtotal,
        discount_amount: discountAmount,
        total_amount: totalAmount,
        coupon_used: appliedCoupon ? appliedCoupon.code : null,
        payment_method: paymentMethod,
        payment_screenshot: paymentMethod === 'ONLINE' ? uploadedScreenshotUrl : null,
        shipping_address: shippingAddress
      };

      await axios.post(
        '/api/orders',
        orderPayload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      clearCart();
      navigate('/orders');
    } catch (err) {
      console.error('Order submission failed:', err);
      setErrorMsg(err.response?.data?.error || 'Order placement failed. Please verify login status.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#0F172A] pt-8 pb-32 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-left">

      {/* Back Button */}
      <button
        onClick={() => navigate('/')}
        className="mb-6 inline-flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-white hover:bg-gray-100 text-[#475569] hover:text-[#0F172A] text-xs font-bold transition border border-gray-200 cursor-pointer shadow-sm"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>BACK TO GALLERY</span>
      </button>

      {/* Multi-step Progress Header */}
      <div className="mb-8 bg-white border border-gray-200 rounded-2xl p-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center space-x-[#4F46E5] font-heading font-extrabold text-sm text-[#0F172A]">
          <Lock className="w-5 h-5 text-[#059669] mr-2" />
          <span>CHECKOUT</span>
        </div>

        <div className="flex items-center space-x-2 text-xs font-bold">
          <span className="px-3 py-1 rounded-xl bg-[#4F46E5] text-white">01 DELIVERY</span>
          <span className="text-[#64748B]">➔</span>
          <span className="px-3 py-1 rounded-xl bg-indigo-50 text-[#4F46E5] border border-indigo-200">02 PAYMENT</span>
          <span className="text-[#64748B]">➔</span>
          <span className="px-3 py-1 rounded-xl bg-gray-100 text-[#64748B]">03 CONFIRMATION</span>
        </div>
      </div>

      {errorMsg && (
        <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 text-xs font-bold flex items-center space-x-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Shipping & Payment Method Options */}
        <div className="lg:col-span-2 space-y-6">

          {/* 1. Delivery Shipping Address */}
          <div className="p-6 rounded-3xl bg-white border border-gray-200 text-left space-y-4 shadow-sm">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#059669] animate-pulse" />
              <h3 className="text-sm font-extrabold uppercase tracking-wider text-[#0F172A] font-heading">1. DELIVERY SHIPPING ADDRESS</h3>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase text-[#64748B] mb-1.5">
                Full Street Address, Landmark & Pincode
              </label>
              <textarea
                rows={3}
                value={shippingAddress}
                onChange={(e) => setShippingAddress(e.target.value)}
                placeholder="Enter complete delivery address..."
                className="w-full p-3.5 rounded-2xl bg-gray-50 border border-gray-200 text-xs font-semibold text-[#0F172A] focus:outline-none focus:border-[#4F46E5] focus:bg-white cursor-text"
                required
              />
            </div>
          </div>

          {/* 2. Select Payment Method (COD vs ONLINE) */}
          <div className="p-6 rounded-3xl bg-white border border-gray-200 text-left space-y-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#4F46E5] animate-pulse" />
                <h3 className="text-sm font-extrabold uppercase tracking-wider text-[#0F172A] font-heading">2. SELECT PAYMENT METHOD</h3>
              </div>
              <span className="text-[10px] font-bold text-[#64748B] uppercase">Step 2 of 2</span>
            </div>

            {/* 2-Option Payment Cards Selector */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Option A: Cash on Delivery (COD) */}
              <button
                type="button"
                onClick={() => {
                  setPaymentMethod('COD');
                  setErrorMsg('');
                }}
                className={`p-4 rounded-2xl border transition-all text-left cursor-pointer flex flex-col justify-between space-y-3 ${
                  paymentMethod === 'COD'
                    ? 'bg-emerald-50/80 border-[#059669] ring-2 ring-emerald-200 shadow-md'
                    : 'bg-gray-50 hover:bg-gray-100 border-gray-200'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="p-2.5 rounded-xl bg-emerald-100 text-[#059669] border border-emerald-200">
                    <Banknote className="w-5 h-5" />
                  </div>
                  {paymentMethod === 'COD' && (
                    <span className="w-5 h-5 rounded-full bg-[#059669] text-white flex items-center justify-center">
                      <Check className="w-3.5 h-3.5" />
                    </span>
                  )}
                </div>

                <div>
                  <h4 className="text-sm font-bold text-[#0F172A] font-heading">Cash on Delivery (COD)</h4>
                  <p className="text-[10px] text-[#64748B] mt-1 leading-relaxed font-medium">
                    Pay in cash upon delivery. No payment proof or screenshot required.
                  </p>
                </div>

                <span className="px-2.5 py-1 rounded-full text-[9px] font-extrabold uppercase tracking-wider bg-emerald-100 text-[#059669] border border-emerald-200 self-start">
                  Instant Confirmation
                </span>
              </button>

              {/* Option B: Online Payment (UPI / QR Code) */}
              <button
                type="button"
                onClick={() => {
                  setPaymentMethod('ONLINE');
                  setErrorMsg('');
                }}
                className={`p-4 rounded-2xl border transition-all text-left cursor-pointer flex flex-col justify-between space-y-3 ${
                  paymentMethod === 'ONLINE'
                    ? 'bg-indigo-50/80 border-[#4F46E5] ring-2 ring-indigo-200 shadow-md'
                    : 'bg-gray-50 hover:bg-gray-100 border-gray-200'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="p-2.5 rounded-xl bg-indigo-100 text-[#4F46E5] border border-indigo-200">
                    <QrCode className="w-5 h-5" />
                  </div>
                  {paymentMethod === 'ONLINE' && (
                    <span className="w-5 h-5 rounded-full bg-[#4F46E5] text-white flex items-center justify-center">
                      <Check className="w-3.5 h-3.5" />
                    </span>
                  )}
                </div>

                <div>
                  <h4 className="text-sm font-bold text-[#0F172A] font-heading">Online Payment (UPI / QR)</h4>
                  <p className="text-[10px] text-[#64748B] mt-1 leading-relaxed font-medium">
                    Scan store QR code using GPay/PhonePe &amp; upload payment screenshot.
                  </p>
                </div>

                <span className="px-2.5 py-1 rounded-full text-[9px] font-extrabold uppercase tracking-wider bg-indigo-100 text-[#4F46E5] border border-indigo-200 self-start">
                  Requires Screenshot Upload
                </span>
              </button>

            </div>

            {/* Detailed View per Payment Method */}
            <AnimatePresence mode="wait">
              {paymentMethod === 'COD' ? (
                <motion.div
                  key="cod-view"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-3 text-left"
                >
                  <div className="flex items-center space-x-2 text-[#059669] text-xs font-bold">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>COD Workflow Enabled</span>
                  </div>
                  <p className="text-xs text-[#475569] leading-relaxed font-medium">
                    You have selected <strong className="text-[#059669]">Cash on Delivery</strong>. You only need to verify your delivery address. No payment screenshot or online transfer is needed right now.
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  key="online-view"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6 pt-2 text-left"
                >
                  {/* Store Management QR Code Payment Box */}
                  <div className="p-6 rounded-2xl bg-slate-50 border border-gray-200 flex flex-col sm:flex-row items-center gap-6">
                    <div className="p-3 bg-white rounded-2xl shadow-md border border-gray-200 shrink-0 text-center">
                      <img
                        src={adminQrCode}
                        alt="Store Payment QR Code"
                        className="w-44 h-44 object-contain mx-auto rounded-xl"
                      />
                      <span className="text-[10px] font-extrabold text-[#059669] block mt-2">
                        ✓ Store QR Code
                      </span>
                    </div>

                    <div className="space-y-3 text-left flex-1">
                      <span className="px-2.5 py-1 rounded-full text-[9px] font-extrabold uppercase tracking-wider bg-indigo-100 text-[#4F46E5] border border-indigo-200 inline-block">
                        STORE UPI QR PAYMENT
                      </span>
                      <h4 className="text-base font-bold text-[#0F172A] font-heading">Scan QR Code to Pay</h4>
                      <p className="text-xs text-[#64748B] font-medium leading-relaxed">
                        Please scan the official store QR code using any UPI application to complete your payment of <strong className="text-[#0F172A]">₹{totalAmount.toLocaleString('en-IN')}</strong>.
                      </p>
                      <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-[#059669] font-bold flex items-center justify-between">
                        <span>Total Amount to Transfer:</span>
                        <span className="text-sm font-extrabold">₹{totalAmount.toLocaleString('en-IN')}</span>
                      </div>
                      <p className="text-[11px] text-[#64748B] font-medium leading-relaxed pt-1">
                        After completing the transaction in your UPI app, upload the payment screenshot below to confirm your order.
                      </p>
                    </div>
                  </div>

                  {/* Payment Screenshot Upload Box */}
                  <div className="space-y-3">
                    <label className="block text-xs font-extrabold uppercase tracking-wider text-[#4F46E5]">
                      3. UPLOAD PAYMENT SCREENSHOT PROOF <span className="text-red-500">* (REQUIRED)</span>
                    </label>

                    {screenshotPreview ? (
                      <div className="relative p-4 rounded-2xl bg-emerald-50 border border-emerald-300 flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <img
                            src={screenshotPreview}
                            alt="Uploaded Payment Screenshot"
                            className="w-16 h-16 rounded-xl object-cover border border-emerald-200 shadow-md"
                          />
                          <div>
                            <div className="flex items-center space-x-1.5 text-[#059669] text-xs font-bold">
                              <FileCheck className="w-4 h-4" />
                              <span>Screenshot Ready for Verification</span>
                            </div>
                            <p className="text-[10px] text-[#64748B] mt-0.5">
                              {uploadedScreenshotUrl ? 'Uploaded & verified by server' : 'Processing image payload...'}
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={handleRemoveScreenshot}
                          className="p-2 rounded-xl bg-rose-100 text-rose-600 hover:bg-rose-200 transition cursor-pointer"
                          title="Remove Screenshot"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <label className="border-2 border-dashed border-gray-300 hover:border-indigo-400 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition bg-gray-50 hover:bg-indigo-50/50 group">
                        <UploadCloud className="w-8 h-8 text-[#4F46E5] group-hover:scale-110 transition-transform mb-2" />
                        <span className="text-xs font-bold text-[#0F172A]">
                          {uploadingScreenshot ? 'Uploading Screenshot...' : 'Click to Upload Payment Screenshot Proof'}
                        </span>
                        <span className="text-[10px] text-[#64748B] mt-1">Supports PNG, JPG, JPEG (Max 10MB)</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleScreenshotFileChange}
                          className="hidden"
                          disabled={uploadingScreenshot}
                        />
                      </label>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Right Column: Order Summary & Action Button */}
        <div className="space-y-6">

          <div className="p-6 rounded-3xl bg-white border border-gray-200 text-left space-y-6 shadow-sm sticky top-24">
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-[#0F172A] font-heading">ORDER SUMMARY</h3>

            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {cartItems.map((item) => (
                <div key={`${item.id}-${item.selectedSize}`} className="flex items-center justify-between text-xs py-1 border-b border-gray-100">
                  <div className="truncate pr-2">
                    <p className="font-bold text-[#0F172A] truncate">{item.name}</p>
                    <span className="text-[10px] text-[#64748B]">{item.selectedSize} × {item.quantity}</span>
                  </div>
                  <span className="font-mono font-bold text-[#0F172A] shrink-0">
                    ₹{((item.price_inr || item.price) * item.quantity).toLocaleString('en-IN')}
                  </span>
                </div>
              ))}
            </div>

            {/* Promo Code Input */}
            <form onSubmit={handleApplyPromo} className="flex gap-2">
              <div className="relative flex-1">
                <Tag className="w-3.5 h-3.5 text-[#64748B] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="PROMO CODE"
                  value={promoCodeInput}
                  onChange={(e) => setPromoCodeInput(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-xs font-bold uppercase text-[#0F172A] placeholder-[#64748B] focus:outline-none focus:border-[#4F46E5] cursor-text"
                />
              </div>
              <button
                type="submit"
                className="px-3.5 py-2 rounded-xl bg-[#4F46E5] hover:bg-[#3730A3] text-white text-xs font-bold transition cursor-pointer"
              >
                APPLY
              </button>
            </form>

            {appliedCoupon && (
              <div className="px-3 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-[#059669] text-xs font-bold flex justify-between items-center">
                <span>Applied: {appliedCoupon.code} ({appliedCoupon.discount_type === 'percent' ? `${appliedCoupon.discount_value}% OFF` : `₹${appliedCoupon.discount_value} OFF`})</span>
                <span>-₹{discountAmount.toLocaleString('en-IN')}</span>
              </div>
            )}

            <div className="space-y-2 pt-2 border-t border-gray-200 text-xs">
              <div className="flex justify-between text-[#64748B]">
                <span>Subtotal</span>
                <span className="text-[#0F172A] font-bold">₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-[#64748B]">
                <span>Shipping</span>
                <span className="text-[#059669] font-bold">FREE (India)</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-[#059669]">
                  <span>Coupon Discount</span>
                  <span>-₹{discountAmount.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-extrabold text-[#0F172A] pt-2 border-t border-gray-200">
                <span>Total Amount</span>
                <span className="text-[#059669] font-mono">₹{totalAmount.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Action Submit Order Button */}
            <button
              onClick={handleOrderSubmit}
              disabled={processing || (paymentMethod === 'ONLINE' && !uploadedScreenshotUrl)}
              className={`w-full py-4 rounded-2xl text-xs font-extrabold uppercase tracking-widest transition-all duration-300 flex items-center justify-center space-x-2 shadow-md ${
                paymentMethod === 'ONLINE' && !uploadedScreenshotUrl
                  ? 'bg-gray-200 text-gray-400 border border-gray-200 cursor-not-allowed'
                  : 'bg-[#4F46E5] hover:bg-[#3730A3] text-white cursor-pointer shadow-indigo-500/20'
              }`}
            >
              {processing ? (
                <span>PROCESSING ORDER...</span>
              ) : paymentMethod === 'COD' ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>CONFIRM ORDER (COD)</span>
                </>
              ) : !uploadedScreenshotUrl ? (
                <>
                  <Lock className="w-4 h-4" />
                  <span>UPLOAD SCREENSHOT TO CONFIRM</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>CONFIRM PAYMENT &amp; PLACE ORDER</span>
                </>
              )}
            </button>

            <div className="flex items-center justify-center space-x-2 text-[10px] text-[#64748B]">
              <ShieldCheck className="w-3.5 h-3.5 text-[#059669]" />
              <span>100% Purchase Protection &amp; SSL Encryption</span>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
