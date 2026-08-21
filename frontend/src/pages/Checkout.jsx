import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
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
  Check,
  Zap,
  Smartphone,
  Globe
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export default function Checkout() {
  const navigate = useNavigate();
  const { cartItems, subtotal, appliedCoupon, discountAmount, totalAmount, clearCart, applyCoupon } = useCart();
  const { user } = useAuth();

  const [paymentMethod, setPaymentMethod] = useState('RAZORPAY'); // 'RAZORPAY' | 'COD' | 'ONLINE'
  const [billingDetails, setBillingDetails] = useState({
    firstName: '',
    lastName: '',
    companyName: '',
    countryRegion: 'India',
    streetAddress: '',
    apartmentSuite: '',
    city: '',
    state: 'Tamil Nadu',
    zipCode: '',
    phone: '',
    email: '',
    orderNotes: ''
  });

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

  useEffect(() => {
    if (user) {
      const nameParts = (user.name || '').trim().split(' ');
      setBillingDetails(prev => ({
        ...prev,
        firstName: prev.firstName || nameParts[0] || '',
        lastName: prev.lastName || nameParts.slice(1).join(' ') || '',
        email: prev.email || user.email || ''
      }));
    }
  }, [user]);

  const handleBillingChange = (field, val) => {
    setBillingDetails(prev => ({ ...prev, [field]: val }));
  };

  const fetchAdminQrCode = async () => {
    try {
      const res = await api.get('/admin/qr-code');
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
          const res = await api.post(
            '/upload/screenshot',
            { imageBase64: base64Reader.result }
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

      if (
        !billingDetails.firstName.trim() ||
        !billingDetails.lastName.trim() ||
        !billingDetails.countryRegion.trim() ||
        !billingDetails.streetAddress.trim() ||
        !billingDetails.city.trim() ||
        !billingDetails.state.trim() ||
        !billingDetails.zipCode.trim() ||
        !billingDetails.phone.trim() ||
        !billingDetails.email.trim()
      ) {
        setErrorMsg('Please complete all required Billing Details (First name, Last name, Country, Street address, City, State, ZIP Code, Phone, Email).');
        setProcessing(false);
        return;
      }

      if (paymentMethod === 'ONLINE' && !uploadedScreenshotUrl) {
        setErrorMsg('Payment screenshot proof must be uploaded before confirming manual online payment.');
        setProcessing(false);
        return;
      }

      const formattedShippingAddress = [
        `${billingDetails.firstName.trim()} ${billingDetails.lastName.trim()}${billingDetails.companyName.trim() ? ` (${billingDetails.companyName.trim()})` : ''}`,
        `${billingDetails.streetAddress.trim()}${billingDetails.apartmentSuite.trim() ? `, ${billingDetails.apartmentSuite.trim()}` : ''}`,
        `${billingDetails.city.trim()}, ${billingDetails.state.trim()} ${billingDetails.zipCode.trim()}`,
        billingDetails.countryRegion,
        `Phone: ${billingDetails.phone.trim()} | Email: ${billingDetails.email.trim()}`,
        billingDetails.orderNotes.trim() ? `Order Notes: ${billingDetails.orderNotes.trim()}` : ''
      ].filter(Boolean).join('\n');

      if (paymentMethod === 'RAZORPAY') {
        const scriptLoaded = await loadRazorpayScript();

        if (!scriptLoaded || !window.Razorpay) {
          setErrorMsg('Failed to load Razorpay Checkout SDK. Please check your internet connection.');
          setProcessing(false);
          return;
        }

        const amountInPaise = Math.round(totalAmount * 100);

        const options = {
          key: 'rzp_test_TSNPovbfc4sfzF',
          amount: amountInPaise,
          currency: 'INR',
          name: 'StyleWalk Footwear',
          description: 'Footwear Purchase Payment',
          image: 'https://razorpay.com/favicon.png',
          prefill: {
            name: `${billingDetails.firstName.trim()} ${billingDetails.lastName.trim()}`,
            email: billingDetails.email.trim(),
            contact: billingDetails.phone.trim() || '9999999999'
          },
          theme: {
            color: '#4F46E5'
          },
          handler: async function (response) {
            console.log('[RAZORPAY SUCCESS] Payment ID received:', response.razorpay_payment_id);
            try {
              const orderPayload = {
                items: cartItems,
                subtotal,
                discount_amount: discountAmount,
                total_amount: totalAmount,
                coupon_used: appliedCoupon ? appliedCoupon.code : null,
                payment_method: 'RAZORPAY',
                razorpay_payment_id: response.razorpay_payment_id,
                shipping_address: formattedShippingAddress
              };

              await api.post('/orders', orderPayload);
              clearCart();
              navigate('/orders');
            } catch (orderErr) {
              console.error('Failed to create order after Razorpay payment:', orderErr);
              setErrorMsg(orderErr.response?.data?.error || 'Order placement failed after payment.');
              setProcessing(false);
            }
          },
          modal: {
            ondismiss: function () {
              console.log('Razorpay modal dismissed by customer.');
              setProcessing(false);
            }
          }
        };

        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', function (response) {
          console.error('[RAZORPAY FAILED]:', response.error);
          const failureReason = response.error?.description || response.error?.reason || 'Payment failed or cancelled.';
          setErrorMsg(`Razorpay Payment Failed: ${failureReason}`);
          setProcessing(false);
        });

        rzp.open();
        return;
      }

      // COD and Manual ONLINE payment paths
      const orderPayload = {
        items: cartItems,
        subtotal,
        discount_amount: discountAmount,
        total_amount: totalAmount,
        coupon_used: appliedCoupon ? appliedCoupon.code : null,
        payment_method: paymentMethod,
        payment_screenshot: paymentMethod === 'ONLINE' ? uploadedScreenshotUrl : null,
        shipping_address: formattedShippingAddress
      };

      await api.post('/orders', orderPayload);

      clearCart();
      navigate('/orders');
    } catch (err) {
      console.error('Order submission failed:', err);
      setErrorMsg(err.response?.data?.error || 'Order placement failed. Please verify login status.');
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

          {/* 1. BILLING DETAILS FORM */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white border border-gray-200 text-left space-y-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#059669] animate-pulse" />
                <h3 className="text-base font-extrabold uppercase tracking-wider text-[#0F172A] font-heading">
                  1. Billing details
                </h3>
              </div>
              <span className="text-[10px] font-extrabold text-indigo-600 bg-indigo-50 border border-indigo-100 px-2.5 py-1 rounded-full uppercase">
                Step 1 of 2
              </span>
            </div>

            <div className="space-y-4">
              
              {/* First Name & Last Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-[#475569] mb-1.5">
                    First name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={billingDetails.firstName}
                    onChange={(e) => handleBillingChange('firstName', e.target.value)}
                    placeholder="First name"
                    className="w-full p-3.5 rounded-xl bg-gray-50 border border-gray-200 text-xs font-semibold text-[#0F172A] focus:outline-none focus:border-[#4F46E5] focus:bg-white transition"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase text-[#475569] mb-1.5">
                    Last name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={billingDetails.lastName}
                    onChange={(e) => handleBillingChange('lastName', e.target.value)}
                    placeholder="Last name"
                    className="w-full p-3.5 rounded-xl bg-gray-50 border border-gray-200 text-xs font-semibold text-[#0F172A] focus:outline-none focus:border-[#4F46E5] focus:bg-white transition"
                    required
                  />
                </div>
              </div>

              {/* Company Name (optional) */}
              <div>
                <label className="block text-[11px] font-bold uppercase text-[#475569] mb-1.5">
                  Company name <span className="text-gray-400 font-normal lowercase">(optional)</span>
                </label>
                <input
                  type="text"
                  value={billingDetails.companyName}
                  onChange={(e) => handleBillingChange('companyName', e.target.value)}
                  placeholder="Company name (optional)"
                  className="w-full p-3.5 rounded-xl bg-gray-50 border border-gray-200 text-xs font-semibold text-[#0F172A] focus:outline-none focus:border-[#4F46E5] focus:bg-white transition"
                />
              </div>

              {/* Country / Region */}
              <div>
                <label className="block text-[11px] font-bold uppercase text-[#475569] mb-1.5">
                  Country / Region <span className="text-rose-500">*</span>
                </label>
                <select
                  value={billingDetails.countryRegion}
                  onChange={(e) => handleBillingChange('countryRegion', e.target.value)}
                  className="w-full p-3.5 rounded-xl bg-gray-50 border border-gray-200 text-xs font-bold text-[#0F172A] focus:outline-none focus:border-[#4F46E5] focus:bg-white transition cursor-pointer"
                  required
                >
                  <option value="India">India</option>
                  <option value="United States (US)">United States (US)</option>
                  <option value="United Kingdom (UK)">United Kingdom (UK)</option>
                  <option value="Canada">Canada</option>
                  <option value="Australia">Australia</option>
                  <option value="Germany">Germany</option>
                  <option value="France">France</option>
                  <option value="United Arab Emirates">United Arab Emirates</option>
                  <option value="Singapore">Singapore</option>
                  <option value="Japan">Japan</option>
                </select>
              </div>

              {/* Street Address */}
              <div>
                <label className="block text-[11px] font-bold uppercase text-[#475569] mb-1.5">
                  Street address <span className="text-rose-500">*</span>
                </label>
                <div className="space-y-2">
                  <input
                    type="text"
                    value={billingDetails.streetAddress}
                    onChange={(e) => handleBillingChange('streetAddress', e.target.value)}
                    placeholder="House number and street name"
                    className="w-full p-3.5 rounded-xl bg-gray-50 border border-gray-200 text-xs font-semibold text-[#0F172A] focus:outline-none focus:border-[#4F46E5] focus:bg-white transition"
                    required
                  />
                  <input
                    type="text"
                    value={billingDetails.apartmentSuite}
                    onChange={(e) => handleBillingChange('apartmentSuite', e.target.value)}
                    placeholder="Apartment, suite, unit, etc. (optional)"
                    className="w-full p-3.5 rounded-xl bg-gray-50 border border-gray-200 text-xs font-semibold text-[#0F172A] focus:outline-none focus:border-[#4F46E5] focus:bg-white transition"
                  />
                </div>
              </div>

              {/* Town / City & State & ZIP Code */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-[#475569] mb-1.5">
                    Town / City <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={billingDetails.city}
                    onChange={(e) => handleBillingChange('city', e.target.value)}
                    placeholder="Town / City"
                    className="w-full p-3.5 rounded-xl bg-gray-50 border border-gray-200 text-xs font-semibold text-[#0F172A] focus:outline-none focus:border-[#4F46E5] focus:bg-white transition"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase text-[#475569] mb-1.5">
                    State <span className="text-rose-500">*</span>
                  </label>
                  {billingDetails.countryRegion === 'India' ? (
                    <select
                      value={billingDetails.state}
                      onChange={(e) => handleBillingChange('state', e.target.value)}
                      className="w-full p-3.5 rounded-xl bg-gray-50 border border-gray-200 text-xs font-bold text-[#0F172A] focus:outline-none focus:border-[#4F46E5] focus:bg-white transition cursor-pointer"
                      required
                    >
                      <option value="Tamil Nadu">Tamil Nadu</option>
                      <option value="Maharashtra">Maharashtra</option>
                      <option value="Karnataka">Karnataka</option>
                      <option value="Delhi">Delhi</option>
                      <option value="Kerala">Kerala</option>
                      <option value="Gujarat">Gujarat</option>
                      <option value="Telangana">Telangana</option>
                      <option value="Andhra Pradesh">Andhra Pradesh</option>
                      <option value="Uttar Pradesh">Uttar Pradesh</option>
                      <option value="West Bengal">West Bengal</option>
                      <option value="Rajasthan">Rajasthan</option>
                      <option value="Punjab">Punjab</option>
                      <option value="Haryana">Haryana</option>
                      <option value="Bihar">Bihar</option>
                      <option value="Madhya Pradesh">Madhya Pradesh</option>
                      <option value="Odisha">Odisha</option>
                      <option value="Assam">Assam</option>
                      <option value="Goa">Goa</option>
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={billingDetails.state}
                      onChange={(e) => handleBillingChange('state', e.target.value)}
                      placeholder="State / Province"
                      className="w-full p-3.5 rounded-xl bg-gray-50 border border-gray-200 text-xs font-semibold text-[#0F172A] focus:outline-none focus:border-[#4F46E5] focus:bg-white transition"
                      required
                    />
                  )}
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase text-[#475569] mb-1.5">
                    PIN / ZIP Code <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={billingDetails.zipCode}
                    onChange={(e) => handleBillingChange('zipCode', e.target.value)}
                    placeholder="PIN / ZIP Code"
                    className="w-full p-3.5 rounded-xl bg-gray-50 border border-gray-200 text-xs font-semibold text-[#0F172A] focus:outline-none focus:border-[#4F46E5] focus:bg-white transition"
                    required
                  />
                </div>
              </div>

              {/* Phone & Email Address */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-[#475569] mb-1.5">
                    Phone <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={billingDetails.phone}
                    onChange={(e) => handleBillingChange('phone', e.target.value)}
                    placeholder="Phone number"
                    className="w-full p-3.5 rounded-xl bg-gray-50 border border-gray-200 text-xs font-semibold text-[#0F172A] focus:outline-none focus:border-[#4F46E5] focus:bg-white transition"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase text-[#475569] mb-1.5">
                    Email address <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={billingDetails.email}
                    onChange={(e) => handleBillingChange('email', e.target.value)}
                    placeholder="Email address"
                    className="w-full p-3.5 rounded-xl bg-gray-50 border border-gray-200 text-xs font-semibold text-[#0F172A] focus:outline-none focus:border-[#4F46E5] focus:bg-white transition"
                    required
                  />
                </div>
              </div>

              {/* Additional Information / Order Notes */}
              <div className="pt-3 border-t border-gray-100 space-y-2">
                <h4 className="text-xs font-black uppercase text-[#0F172A] font-heading tracking-wide">
                  Additional information
                </h4>
                <div>
                  <label className="block text-[11px] font-bold uppercase text-[#64748B] mb-1.5">
                    Order notes <span className="text-gray-400 font-normal lowercase">(optional)</span>
                  </label>
                  <textarea
                    rows={3}
                    value={billingDetails.orderNotes}
                    onChange={(e) => handleBillingChange('orderNotes', e.target.value)}
                    placeholder="Notes about your order, e.g. special notes for delivery."
                    className="w-full p-3.5 rounded-xl bg-gray-50 border border-gray-200 text-xs font-semibold text-[#0F172A] focus:outline-none focus:border-[#4F46E5] focus:bg-white transition"
                  />
                </div>
              </div>

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

            {/* 3-Option Payment Cards Selector */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              
              {/* Option A: Razorpay Gateway */}
              <button
                type="button"
                onClick={() => {
                  setPaymentMethod('RAZORPAY');
                  setErrorMsg('');
                }}
                className={`p-4 rounded-2xl border transition-all text-left cursor-pointer flex flex-col justify-between space-y-3 ${
                  paymentMethod === 'RAZORPAY'
                    ? 'bg-indigo-50/90 border-[#4F46E5] ring-2 ring-indigo-200 shadow-md'
                    : 'bg-gray-50 hover:bg-gray-100 border-gray-200'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="p-2.5 rounded-xl bg-indigo-100 text-[#4F46E5] border border-indigo-200">
                    <Zap className="w-5 h-5" />
                  </div>
                  {paymentMethod === 'RAZORPAY' && (
                    <span className="w-5 h-5 rounded-full bg-[#4F46E5] text-white flex items-center justify-center">
                      <Check className="w-3.5 h-3.5" />
                    </span>
                  )}
                </div>

                <div>
                  <h4 className="text-sm font-bold text-[#0F172A] font-heading">Razorpay Gateway</h4>
                  <p className="text-[10px] text-[#64748B] mt-1 leading-relaxed font-medium">
                    UPI (GPay/PhonePe), Cards, NetBanking.
                  </p>
                </div>

                <span className="px-2 py-0.5 rounded-full text-[8.5px] font-extrabold uppercase tracking-wider bg-indigo-100 text-[#4F46E5] border border-indigo-200 self-start">
                  ⚡ Auto Approved
                </span>
              </button>

              {/* Option B: Cash on Delivery (COD) */}
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
                  <h4 className="text-sm font-bold text-[#0F172A] font-heading">Cash on Delivery</h4>
                  <p className="text-[10px] text-[#64748B] mt-1 leading-relaxed font-medium">
                    Pay in cash upon delivery.
                  </p>
                </div>

                <span className="px-2 py-0.5 rounded-full text-[8.5px] font-extrabold uppercase tracking-wider bg-emerald-100 text-[#059669] border border-emerald-200 self-start">
                  Instant Confirmation
                </span>
              </button>

              {/* Option C: Manual Online Payment (UPI / QR Code) */}
              <button
                type="button"
                onClick={() => {
                  setPaymentMethod('ONLINE');
                  setErrorMsg('');
                }}
                className={`p-4 rounded-2xl border transition-all text-left cursor-pointer flex flex-col justify-between space-y-3 ${
                  paymentMethod === 'ONLINE'
                    ? 'bg-purple-50/80 border-purple-500 ring-2 ring-purple-200 shadow-md'
                    : 'bg-gray-50 hover:bg-gray-100 border-gray-200'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="p-2.5 rounded-xl bg-purple-100 text-purple-600 border border-purple-200">
                    <QrCode className="w-5 h-5" />
                  </div>
                  {paymentMethod === 'ONLINE' && (
                    <span className="w-5 h-5 rounded-full bg-purple-600 text-white flex items-center justify-center">
                      <Check className="w-3.5 h-3.5" />
                    </span>
                  )}
                </div>

                <div>
                  <h4 className="text-sm font-bold text-[#0F172A] font-heading">Manual UPI QR</h4>
                  <p className="text-[10px] text-[#64748B] mt-1 leading-relaxed font-medium">
                    Scan store QR code &amp; upload screenshot.
                  </p>
                </div>

                <span className="px-2 py-0.5 rounded-full text-[8.5px] font-extrabold uppercase tracking-wider bg-purple-100 text-purple-600 border border-purple-200 self-start">
                  Requires Screenshot
                </span>
              </button>

            </div>

            {/* Detailed View per Payment Method */}
            <AnimatePresence mode="wait">
              {paymentMethod === 'RAZORPAY' ? (
                <motion.div
                  key="razorpay-view"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="p-5 rounded-2xl bg-indigo-50/70 border border-indigo-200 space-y-4 text-left"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-[#4F46E5] text-xs font-extrabold">
                      <Zap className="w-4 h-4" />
                      <span>RAZORPAY INSTANT CHECKOUT</span>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-emerald-100 text-[#059669] border border-emerald-200">
                      Auto Approved
                    </span>
                  </div>

                  <p className="text-xs text-[#475569] leading-relaxed font-medium">
                    Pay securely using <strong className="text-[#0F172A]">Google Pay, PhonePe, Paytm, BHIM, Credit/Debit Cards, or NetBanking</strong>. Your order will be confirmed instantly.
                  </p>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                    <div className="p-2.5 bg-white rounded-xl border border-indigo-100 text-center shadow-xs">
                      <Smartphone className="w-4 h-4 text-indigo-600 mx-auto mb-1" />
                      <span className="text-[10px] font-bold text-[#0F172A] block">UPI Apps</span>
                      <span className="text-[9px] text-[#64748B]">GPay, PhonePe</span>
                    </div>
                    <div className="p-2.5 bg-white rounded-xl border border-indigo-100 text-center shadow-xs">
                      <CreditCard className="w-4 h-4 text-indigo-600 mx-auto mb-1" />
                      <span className="text-[10px] font-bold text-[#0F172A] block">Cards</span>
                      <span className="text-[9px] text-[#64748B]">Visa, RuPay, MC</span>
                    </div>
                    <div className="p-2.5 bg-white rounded-xl border border-indigo-100 text-center shadow-xs">
                      <Globe className="w-4 h-4 text-indigo-600 mx-auto mb-1" />
                      <span className="text-[10px] font-bold text-[#0F172A] block">NetBanking</span>
                      <span className="text-[9px] text-[#64748B]">50+ Indian Banks</span>
                    </div>
                    <div className="p-2.5 bg-white rounded-xl border border-indigo-100 text-center shadow-xs">
                      <ShieldCheck className="w-4 h-4 text-emerald-600 mx-auto mb-1" />
                      <span className="text-[10px] font-bold text-[#0F172A] block">Secure</span>
                      <span className="text-[9px] text-[#64748B]">256-Bit SSL</span>
                    </div>
                  </div>
                </motion.div>
              ) : paymentMethod === 'COD' ? (
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
              ) : paymentMethod === 'RAZORPAY' ? (
                <>
                  <Zap className="w-4 h-4 fill-current text-amber-300" />
                  <span>PAY ₹{totalAmount.toLocaleString('en-IN')} VIA RAZORPAY</span>
                </>
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
