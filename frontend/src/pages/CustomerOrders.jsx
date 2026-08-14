import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Package, 
  Truck, 
  CheckCircle2, 
  Clock, 
  ArrowLeft, 
  RefreshCw, 
  AlertCircle, 
  XCircle, 
  Banknote, 
  QrCode, 
  Eye, 
  ShieldCheck,
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import OrderTracker from '../components/OrderTracker';

export default function CustomerOrders() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeImageModal, setActiveImageModal] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('stylewalk_token');
      if (!token) {
        setLoading(false);
        return;
      }

      const res = await axios.get('/api/orders/user', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrders(res.data);
    } catch (err) {
      console.error('Failed to fetch user orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusStep = (orderStatus, paymentStatus) => {
    if (orderStatus === 'Cancelled' || paymentStatus === 'Payment Rejected') return 0;
    if (paymentStatus === 'Payment Verification Pending') return 1;
    switch (orderStatus) {
      case 'Confirmed': return 2;
      case 'Processing': return 3;
      case 'Shipped':
      case 'In Transit': return 4;
      case 'Delivered': return 5;
      default: return 1;
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#0F172A] pt-8 pb-32 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto text-left">

      {/* Back Button */}
      <button
        onClick={() => navigate('/')}
        className="mb-6 inline-flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-white hover:bg-gray-100 text-[#475569] hover:text-[#0F172A] text-xs font-bold transition border border-gray-200 cursor-pointer shadow-sm"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>BACK TO GALLERY</span>
      </button>

      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold uppercase tracking-tight flex items-center gap-2 font-heading text-[#0F172A]">
            <Package className="w-7 h-7 text-[#4F46E5]" />
            MY ORDERS &amp; TRACKING
          </h1>
          <p className="text-xs text-[#64748B] mt-1">Real-time payment verification &amp; order tracking status</p>
        </div>

        <button
          onClick={fetchOrders}
          className="p-2 rounded-xl bg-white hover:bg-gray-100 text-[#475569] text-xs font-bold border border-gray-200 flex items-center space-x-1 cursor-pointer shadow-sm"
        >
          <RefreshCw className="w-4 h-4" />
          <span>REFRESH</span>
        </button>
      </div>

      {loading ? (
        <div className="py-20 text-center">
          <RefreshCw className="w-8 h-8 text-[#4F46E5] animate-spin mx-auto mb-3" />
          <p className="text-xs font-bold text-[#64748B] uppercase tracking-widest">
            Fetching your order history...
          </p>
        </div>
      ) : !user ? (
        <div className="py-16 text-center bg-white border border-gray-200 rounded-3xl p-8 max-w-md mx-auto shadow-sm">
          <AlertCircle className="w-10 h-10 text-amber-500 mx-auto mb-3" />
          <h3 className="text-lg font-bold font-heading text-[#0F172A]">Log in to view your orders</h3>
          <p className="text-xs text-[#64748B] mt-1">Use customer@stylewalk.com or your account.</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="py-16 text-center bg-white border border-gray-200 rounded-3xl p-8 max-w-md mx-auto shadow-sm">
          <Package className="w-10 h-10 text-[#64748B] mx-auto mb-3" />
          <h3 className="text-base font-bold text-[#0F172A] font-heading">No orders placed yet</h3>
          <button onClick={() => navigate('/')} className="mt-4 px-4 py-2.5 rounded-xl bg-[#4F46E5] text-white font-bold text-xs shadow-md">
            Start Shopping
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => {
            const currentStep = getStatusStep(order.order_status, order.payment_status);
            const isCOD = order.payment_method === 'COD';
            const isPending = order.payment_status === 'Payment Verification Pending';
            const isApproved = order.payment_status === 'Payment Approved';
            const isRejected = order.payment_status === 'Payment Rejected' || order.order_status === 'Cancelled';

            return (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 rounded-3xl bg-white border border-gray-200 space-y-6 text-left shadow-sm"
              >
                {/* Header Row: Order ID + Date + Badges */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-gray-200">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-base font-extrabold text-[#0F172A] font-mono">ORDER #{order.id}</span>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-gray-100 text-[#475569]">
                        {isCOD ? '💵 CASH ON DELIVERY' : '📱 ONLINE UPI'}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#64748B] mt-1">
                      Placed on {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {/* Payment Status Badge */}
                    {isPending ? (
                      <span className="px-3 py-1.5 rounded-full text-xs font-bold uppercase bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1.5 animate-pulse">
                        <Clock className="w-3.5 h-3.5" />
                        Verification Pending
                      </span>
                    ) : isApproved ? (
                      <span className="px-3 py-1.5 rounded-full text-xs font-bold uppercase bg-emerald-50 text-[#059669] border border-emerald-200 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Payment Approved
                      </span>
                    ) : isRejected ? (
                      <span className="px-3 py-1.5 rounded-full text-xs font-bold uppercase bg-rose-50 text-rose-600 border border-rose-200 flex items-center gap-1.5">
                        <XCircle className="w-3.5 h-3.5" />
                        Payment Rejected / Cancelled
                      </span>
                    ) : (
                      <span className="px-3 py-1.5 rounded-full text-xs font-bold uppercase bg-emerald-50 text-[#059669] border border-emerald-200 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        COD Confirmed
                      </span>
                    )}

                    {/* Order Fulfillment Status Badge */}
                    <span className="px-3 py-1.5 rounded-full text-xs font-bold uppercase bg-indigo-50 text-[#4F46E5] border border-indigo-200">
                      Order Status: {order.order_status}
                    </span>
                  </div>
                </div>

                {/* Status Alert Banners */}
                {isPending && (
                  <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold flex items-start space-x-3">
                    <Clock className="w-5 h-5 shrink-0 mt-0.5 text-amber-600" />
                    <div>
                      <h4 className="font-extrabold uppercase text-amber-900">Payment Verification Pending</h4>
                      <p className="text-amber-800 text-[11px] mt-0.5 leading-relaxed">
                        Your payment screenshot proof is under review by StyleWalk Admin. Once verified, your order will automatically advance to processing and fulfillment.
                      </p>
                    </div>
                  </div>
                )}

                {isRejected && (
                  <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs font-bold flex items-start space-x-3">
                    <XCircle className="w-5 h-5 shrink-0 mt-0.5 text-rose-600" />
                    <div>
                      <h4 className="font-extrabold uppercase text-rose-900">Order Cancelled – Payment Rejected</h4>
                      <p className="text-rose-900 text-xs mt-1 bg-white p-2.5 rounded-xl border border-rose-200 font-medium">
                        <strong>Rejection Reason:</strong> {order.rejection_reason || 'Invalid screenshot or unconfirmed payment transaction.'}
                      </p>
                    </div>
                  </div>
                )}

                {isApproved && (
                  <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-[#059669] text-xs font-bold flex items-center space-x-3">
                    <CheckCircle2 className="w-5 h-5 shrink-0 text-[#059669]" />
                    <div>
                      <h4 className="font-extrabold uppercase">Payment Approved &amp; Order Confirmed</h4>
                      <p className="text-[#059669] text-[11px] mt-0.5">
                        Your payment proof has been verified by the administrator. Your order is now confirmed!
                      </p>
                    </div>
                  </div>
                )}

                {/* REAL-TIME ORDER TRACKING SYSTEM STEP BAR */}
                <OrderTracker order={order} />

                {/* Order Items & Shipping Summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                  
                  {/* Items List */}
                  <div className="md:col-span-2 space-y-3">
                    <h4 className="text-xs font-extrabold uppercase text-[#4F46E5] tracking-wider">Product details &amp; specifications</h4>
                    <div className="space-y-2">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex items-center space-x-3 p-3 rounded-2xl bg-gray-50 border border-gray-200">
                          <img
                            src={item.image_url || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff'}
                            alt={item.name}
                            className="w-12 h-12 object-contain rounded-xl bg-white p-1 border border-gray-200 shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <h5 className="text-xs font-bold text-[#0F172A] truncate font-heading">{item.name}</h5>
                            <p className="text-[10px] text-[#64748B]">
                              Brand: {item.brand} | Size: {item.selectedSize} | Qty: {item.quantity}
                            </p>
                          </div>
                          <span className="text-xs font-mono font-bold text-[#059669] shrink-0">
                            ₹{((item.price_inr || item.price) * item.quantity).toLocaleString('en-IN')}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Shipping & Payment Proof Details */}
                  <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-3 text-xs">
                    <h4 className="font-extrabold uppercase text-[#4F46E5] tracking-wider">ORDER SUMMARY</h4>
                    
                    <div className="space-y-1.5 text-[11px]">
                      <div className="flex justify-between text-[#64748B]">
                        <span>Total Paid Amount</span>
                        <span className="text-[#0F172A] font-mono font-bold text-xs">₹{order.total_amount.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex justify-between text-[#64748B]">
                        <span>Payment Method</span>
                        <span className="text-[#059669] font-bold">{order.payment_method}</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-white/10">
                      <span className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Delivery Address:</span>
                      <p className="text-[11px] text-gray-200 leading-snug">{order.shipping_address}</p>
                    </div>

                    {/* Uploaded Screenshot Preview Button if Online Order */}
                    {order.payment_screenshot && (
                      <div className="pt-2 border-t border-white/10">
                        <span className="text-[10px] font-bold text-gray-400 uppercase block mb-1.5">Submitted Payment Screenshot:</span>
                        <button
                          onClick={() => setActiveImageModal(order.payment_screenshot)}
                          className="w-full p-2 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-[11px] font-bold transition flex items-center justify-center space-x-1.5 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5 text-indigo-400" />
                          <span>View Payment Proof Screenshot</span>
                        </button>
                      </div>
                    )}
                  </div>

                </div>

              </motion.div>
            );
          })}
        </div>
      )}

      {/* LIGHTBOX SCREENSHOT MODAL */}
      <AnimatePresence>
        {activeImageModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-2xl flex items-center justify-center p-4"
            onClick={() => setActiveImageModal(null)}
          >
            <button
              onClick={() => setActiveImageModal(null)}
              className="absolute top-6 right-6 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition cursor-pointer z-10"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="max-w-2xl w-full text-center relative" onClick={(e) => e.stopPropagation()}>
              <img
                src={activeImageModal}
                alt="Customer Payment Screenshot Proof"
                className="max-h-[80vh] w-auto mx-auto object-contain rounded-2xl shadow-2xl border border-white/20"
              />
              <p className="text-xs text-gray-400 mt-4 font-bold">Uploaded Customer Payment Proof Screenshot</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
