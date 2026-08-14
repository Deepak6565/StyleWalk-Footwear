import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Package,
  Plus,
  Minus,
  Trash2,
  Edit3,
  AlertTriangle,
  TrendingUp,
  DollarSign,
  ShoppingBag,
  ShieldCheck,
  RefreshCw,
  Search,
  CheckCircle,
  X,
  QrCode,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  UploadCloud,
  FileCheck,
  Banknote,
  Settings,
  BarChart3,
  Award,
  Gift
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import GiftCardModal from '../components/GiftCardModal';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [adminQrCode, setAdminQrCode] = useState('');
  const [newQrInput, setNewQrInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [isGiftCardOpen, setIsGiftCardOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('payments'); // 'payments' | 'inventory' | 'orders' | 'settings'
  const [searchQuery, setSearchQuery] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('PENDING'); // 'PENDING' | 'ALL' | 'APPROVED' | 'REJECTED'

  // Image Lightbox state
  const [activeScreenshotModal, setActiveScreenshotModal] = useState(null);

  // Rejection Modal state
  const [rejectingOrder, setRejectingOrder] = useState(null);
  const [rejectionReasonInput, setRejectionReasonInput] = useState('');
  const [rejectionError, setRejectionError] = useState('');
  const [verifyingOrder, setVerifyingOrder] = useState(false);

  // Add/Edit Product Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    brand: 'StyleWalk',
    category: 'Sneakers',
    price_inr: 2499,
    stock_quantity: 10,
    material_badge: 'Breathable Mesh',
    image_url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80'
  });

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/', { replace: true });
      return;
    }
    fetchData();
    fetchAdminQr();
  }, [user]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('stylewalk_token');
      const prodRes = await axios.get('/api/products');
      setProducts(prodRes.data);

      if (token) {
        const orderRes = await axios.get('/api/orders/all', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setOrders(orderRes.data);
      }
    } catch (err) {
      console.error('Failed to fetch admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAdminQr = async () => {
    try {
      const res = await axios.get('/api/admin/qr-code');
      if (res.data && res.data.qr_code) {
        setAdminQrCode(res.data.qr_code);
        setNewQrInput(res.data.qr_code);
      }
    } catch (err) {
      console.error('Failed to fetch admin QR code:', err);
    }
  };

  const handleVerifyPayment = async (orderId, action, rejectionReason = '') => {
    setVerifyingOrder(true);
    setRejectionError('');
    try {
      const token = localStorage.getItem('stylewalk_token');
      const payload = { action, rejection_reason: rejectionReason };

      const res = await axios.post(
        `/api/admin/orders/${orderId}/verify-payment`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setOrders(prev =>
        prev.map(o =>
          o.id === orderId
            ? {
                ...o,
                payment_status: res.data.payment_status,
                order_status: res.data.order_status,
                rejection_reason: res.data.rejection_reason || null
              }
            : o
        )
      );

      setRejectingOrder(null);
      setRejectionReasonInput('');
    } catch (err) {
      console.error('Payment verification failed:', err);
      const msg = err.response?.data?.error || 'Failed to update payment verification status.';
      if (action === 'REJECT') setRejectionError(msg);
      else alert(msg);
    } finally {
      setVerifyingOrder(false);
    }
  };

  const handleUpdateQrCode = async (e) => {
    e.preventDefault();
    if (!newQrInput.trim()) return;
    try {
      const token = localStorage.getItem('stylewalk_token');
      await axios.post(
        '/api/admin/qr-code',
        { qr_code: newQrInput.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAdminQrCode(newQrInput.trim());
      alert('Admin UPI QR Code updated successfully!');
    } catch (err) {
      alert('Failed to update QR Code URL.');
    }
  };

  const handleQrFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file size before upload (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File is too large. Please choose an image under 5MB.');
      e.target.value = '';
      return;
    }

    const token = localStorage.getItem('stylewalk_token');

    if (!token) {
      alert('Authentication token missing. Please log out and log in again as Admin.');
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const res = await axios.post(
          '/api/upload/qr',
          { imageBase64: reader.result },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setAdminQrCode(res.data.qrUrl);
        setNewQrInput(res.data.qrUrl);
        alert('✅ Custom QR code image uploaded and updated successfully!');
      } catch (err) {
        const errMsg = err.response?.data?.error || err.message || 'Unknown error';
        const errStatus = err.response?.status || 'No response';
        alert(`Failed to upload QR code image.\nStatus: ${errStatus}\nReason: ${errMsg}`);
        console.error('QR upload error details:', err.response?.data, err.message);
      }
    };
    reader.onerror = () => {
      alert('Failed to read image file. Please try a different image.');
    };
    reader.readAsDataURL(file);
  };

  const handleProductImageFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('Product image file is too large. Please select an image file under 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setFormData(prev => ({ ...prev, image_url: reader.result }));
    };
    reader.readAsDataURL(file);
  };


  const handleStockUpdate = async (productId, currentStock, delta) => {
    const newStock = Math.max(0, currentStock + delta);
    try {
      const token = localStorage.getItem('stylewalk_token');
      await axios.put(
        `/api/products/${productId}`,
        { stock_quantity: newStock },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setProducts(prev =>
        prev.map(p => (p.id === productId ? { ...p, stock_quantity: newStock } : p))
      );
    } catch (err) {
      alert('Failed to update stock. Admin authentication required.');
    }
  };

  const handleOrderStatusUpdate = async (orderId, newStatus) => {
    try {
      const token = localStorage.getItem('stylewalk_token');
      await axios.put(
        `/api/orders/${orderId}/status`,
        { order_status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setOrders(prev =>
        prev.map(o => (o.id === orderId ? { ...o, order_status: newStatus } : o))
      );
    } catch (err) {
      alert('Failed to update order status.');
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      const token = localStorage.getItem('stylewalk_token');
      await axios.delete(`/api/products/${productId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProducts(prev => prev.filter(p => p.id !== productId));
    } catch (err) {
      alert('Failed to delete product.');
    }
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('stylewalk_token');
      if (editingProduct) {
        await axios.put(`/api/products/${editingProduct.id}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post('/api/products', formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      setIsModalOpen(false);
      setEditingProduct(null);
      fetchData();
    } catch (err) {
      alert('Failed to save product. Ensure admin privileges.');
    }
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      brand: product.brand,
      category: product.category,
      price_inr: product.price_inr,
      stock_quantity: product.stock_quantity,
      material_badge: product.material_badge || 'Premium Craft',
      image_url: product.image_url
    });
    setIsModalOpen(true);
  };

  // Filtered orders for Payment Verification Tab
  const filteredOrders = orders.filter(o => {
    if (paymentFilter === 'PENDING') return o.payment_status === 'Payment Verification Pending';
    if (paymentFilter === 'APPROVED') return o.payment_status === 'Payment Approved' || (o.payment_method === 'COD' && o.payment_status === 'Confirmed');
    if (paymentFilter === 'REJECTED') return o.payment_status === 'Payment Rejected';
    return true;
  });

  const pendingVerificationCount = orders.filter(o => o.payment_status === 'Payment Verification Pending').length;
  const approvedCount = orders.filter(o => o.payment_status === 'Payment Approved' || (o.payment_method === 'COD' && o.payment_status === 'Confirmed')).length;

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#0F172A] pt-8 pb-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-left">

      {/* Admin Title Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-7 h-7 text-[#4F46E5]" />
            <h1 className="text-2xl sm:text-3xl font-extrabold uppercase tracking-tight font-heading text-[#0F172A]">STYLEWALK ADMIN PORTAL</h1>
          </div>
          <p className="text-xs text-[#64748B] mt-1">Payment Verification &amp; Inventory Management Suite</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/')}
            className="px-3.5 py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-[#059669] border border-emerald-200 text-xs font-extrabold transition flex items-center space-x-1.5 cursor-pointer shadow-sm"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>SWITCH TO CUSTOMER GALLERY</span>
          </button>

          {/* 🎁 Digital Gift Cards Button — Admin Only */}
          <button
            onClick={() => setIsGiftCardOpen(true)}
            className="px-3.5 py-2.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 text-xs font-extrabold transition flex items-center space-x-1.5 cursor-pointer shadow-sm"
          >
            <Gift className="w-4 h-4" />
            <span>GIFT CARDS</span>
          </button>

          <button
            onClick={fetchData}
            className="p-2.5 rounded-xl bg-white hover:bg-gray-100 text-[#475569] hover:text-[#0F172A] text-xs font-bold border border-gray-200 flex items-center space-x-1 cursor-pointer shadow-sm"
          >
            <RefreshCw className="w-4 h-4" />
            <span>REFRESH</span>
          </button>

          <button
            onClick={() => {
              setEditingProduct(null);
              setFormData({
                name: '',
                brand: 'StyleWalk',
                category: 'Sneakers',
                price_inr: 2499,
                stock_quantity: 10,
                material_badge: 'Breathable Mesh',
                image_url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80'
              });
              setIsModalOpen(true);
            }}
            className="px-4 py-2.5 rounded-xl bg-[#4F46E5] hover:bg-[#3730A3] text-white text-xs font-extrabold uppercase transition flex items-center space-x-1.5 cursor-pointer shadow-md shadow-indigo-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>ADD NEW MODEL</span>
          </button>
        </div>
      </div>

      {/* Top Stat Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
        <div className="p-5 rounded-2xl bg-white border border-amber-200 flex items-center justify-between shadow-sm">
          <div>
            <span className="text-[10px] font-extrabold uppercase text-amber-700 tracking-wider">VERIFICATION PENDING</span>
            <p className="text-2xl font-extrabold text-amber-700 mt-0.5">{pendingVerificationCount}</p>
          </div>
          <div className="p-3 rounded-xl bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-6 h-6 animate-pulse" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-emerald-200 flex items-center justify-between shadow-sm">
          <div>
            <span className="text-[10px] font-extrabold uppercase text-[#059669] tracking-wider">PAYMENTS APPROVED</span>
            <p className="text-2xl font-extrabold text-[#059669] mt-0.5">{approvedCount}</p>
          </div>
          <div className="p-3 rounded-xl bg-emerald-50 text-[#059669] border border-emerald-200">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-gray-200 flex items-center justify-between shadow-sm">
          <div>
            <span className="text-[10px] font-extrabold uppercase text-[#64748B] tracking-wider">FOOTWEAR MODELS</span>
            <p className="text-2xl font-extrabold text-[#0F172A] mt-0.5">{products.length}</p>
          </div>
          <div className="p-3 rounded-xl bg-indigo-50 text-[#4F46E5] border border-indigo-200">
            <Package className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-purple-200 flex items-center justify-between shadow-sm">
          <div>
            <span className="text-[10px] font-extrabold uppercase text-purple-700 tracking-wider">ADMIN QR CODE</span>
            <p className="text-xs font-extrabold text-[#059669] truncate mt-1">CONFIGURED</p>
          </div>
          <div className="p-3 rounded-xl bg-purple-50 text-purple-700 border border-purple-200">
            <QrCode className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Admin Mode Navigation Tabs */}
      <div className="flex items-center space-x-2 border-b border-gray-200 mb-8 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => setActiveTab('payments')}
          className={`px-5 py-3 rounded-2xl text-xs font-extrabold uppercase tracking-wider transition cursor-pointer border flex items-center space-x-2 ${
            activeTab === 'payments'
              ? 'bg-[#4F46E5] text-white border-[#4F46E5] shadow-md shadow-indigo-500/20'
              : 'bg-white text-[#475569] hover:text-[#0F172A] border-gray-200 hover:bg-gray-50'
          }`}
        >
          <Clock className="w-4 h-4 text-amber-300" />
          <span>PAYMENT VERIFICATION SUITE</span>
          {pendingVerificationCount > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-400 text-slate-900 font-black animate-pulse">
              {pendingVerificationCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('inventory')}
          className={`px-5 py-3 rounded-2xl text-xs font-extrabold uppercase tracking-wider transition cursor-pointer border flex items-center space-x-2 ${
            activeTab === 'inventory'
              ? 'bg-[#4F46E5] text-white border-[#4F46E5] shadow-md shadow-indigo-500/20'
              : 'bg-white text-[#475569] hover:text-[#0F172A] border-gray-200 hover:bg-gray-50'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>PRODUCT INVENTORY ({products.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          className={`px-5 py-3 rounded-2xl text-xs font-extrabold uppercase tracking-wider transition cursor-pointer border flex items-center space-x-2 ${
            activeTab === 'orders'
              ? 'bg-[#4F46E5] text-white border-[#4F46E5] shadow-md shadow-indigo-500/20'
              : 'bg-white text-[#475569] hover:text-[#0F172A] border-gray-200 hover:bg-gray-50'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>FULFILLMENT ORDERS ({orders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('analytics')}
          className={`px-5 py-3 rounded-2xl text-xs font-extrabold uppercase tracking-wider transition cursor-pointer border flex items-center space-x-2 ${
            activeTab === 'analytics'
              ? 'bg-[#4F46E5] text-white border-[#4F46E5] shadow-md shadow-indigo-500/20'
              : 'bg-white text-[#475569] hover:text-[#0F172A] border-gray-200 hover:bg-gray-50'
          }`}
        >
          <TrendingUp className="w-4 h-4 text-emerald-500" />
          <span>ANALYTICS & REVENUE CHARTS</span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`px-5 py-3 rounded-2xl text-xs font-extrabold uppercase tracking-wider transition cursor-pointer border flex items-center space-x-2 ${
            activeTab === 'settings'
              ? 'bg-[#4F46E5] text-white border-[#4F46E5] shadow-md shadow-indigo-500/20'
              : 'bg-white text-[#475569] hover:text-[#0F172A] border-gray-200 hover:bg-gray-50'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>STORE QR CODE CONFIG</span>
        </button>
      </div>

      {/* ═══════════════════════════════════════════════
          TAB 1: PAYMENT VERIFICATION SUITE
          ═══════════════════════════════════════════════ */}
      {activeTab === 'payments' && (
        <div className="space-y-6">

          {/* Sub-Filters: PENDING | APPROVED | REJECTED | ALL */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-gray-200 shadow-sm">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-extrabold uppercase text-[#0F172A]">Filter By Verification Status:</span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {[
                { key: 'PENDING', label: `Pending Verification (${pendingVerificationCount})` },
                { key: 'APPROVED', label: 'Approved & Confirmed' },
                { key: 'REJECTED', label: 'Rejected Payments' },
                { key: 'ALL', label: 'All Orders' }
              ].map(f => (
                <button
                  key={f.key}
                  onClick={() => setPaymentFilter(f.key)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer border ${
                    paymentFilter === f.key
                      ? 'bg-[#4F46E5] text-white border-[#4F46E5] shadow-sm'
                      : 'bg-gray-100 text-[#475569] hover:bg-gray-200 hover:text-[#0F172A] border-gray-200'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Orders Verification Cards Grid */}
          {filteredOrders.length === 0 ? (
            <div className="p-12 bg-white rounded-3xl text-center border border-gray-200 shadow-sm">
              <CheckCircle2 className="w-10 h-10 text-[#059669] mx-auto mb-3" />
              <h3 className="text-base font-bold text-[#0F172A]">No payment verifications matching filter</h3>
              <p className="text-xs text-[#64748B] mt-1">All online customer payments have been processed.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredOrders.map((o) => {
                const isPending = o.payment_status === 'Payment Verification Pending';
                const isApproved = o.payment_status === 'Payment Approved';
                const isRejected = o.payment_status === 'Payment Rejected';
                const isCOD = o.payment_method === 'COD';

                return (
                  <div
                    key={o.id}
                    className={`p-6 rounded-3xl bg-white border transition-all text-left space-y-4 shadow-sm ${
                      isPending ? 'border-amber-300 bg-amber-50/40' : 'border-gray-200'
                    }`}
                  >
                    {/* Header Row */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-gray-200">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-base font-extrabold text-[#0F172A] font-mono">ORDER #{o.id}</span>
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-gray-100 text-[#475569]">
                            {isCOD ? '💵 CASH ON DELIVERY' : '📱 ONLINE UPI'}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#64748B] mt-0.5">
                          Customer: <strong className="text-[#0F172A]">{o.customer_name}</strong> ({o.customer_email})
                        </p>
                      </div>

                      <div className="flex items-center space-x-3">
                        <span className="text-base font-mono font-bold text-[#059669]">
                          ₹{(o.total_amount || 0).toLocaleString('en-IN')}
                        </span>

                        {isPending ? (
                          <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-amber-100 text-amber-800 border border-amber-200 flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            Pending Verification
                          </span>
                        ) : isApproved ? (
                          <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-emerald-100 text-[#059669] border border-emerald-200 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Approved
                          </span>
                        ) : isRejected ? (
                          <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-rose-100 text-rose-700 border border-rose-200 flex items-center gap-1">
                            <XCircle className="w-3.5 h-3.5" />
                            Rejected / Cancelled
                          </span>
                        ) : (
                          <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-emerald-100 text-[#059669] border border-emerald-200">
                            COD Confirmed
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Details & Screenshot Section */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                      {/* Delivery Address & Items */}
                      <div className="md:col-span-2 space-y-2 text-xs">
                        <p className="text-[11px] text-[#475569]">
                          <strong className="text-[#0F172A] uppercase">Delivery Address:</strong> {o.shipping_address}
                        </p>

                        <div className="pt-2">
                          <span className="text-[10px] font-extrabold uppercase text-[#4F46E5] tracking-wider block mb-1.5">
                            Items Ordered ({o.items.length}):
                          </span>
                          <div className="flex flex-wrap gap-2">
                            {o.items.map((it, idx) => (
                              <span key={idx} className="px-2.5 py-1 rounded-xl bg-gray-100 border border-gray-200 text-[10px] font-bold text-[#0F172A]">
                                {it.name} ({it.selectedSize} × {it.quantity})
                              </span>
                            ))}
                          </div>
                        </div>

                        {o.rejection_reason && (
                          <div className="mt-3 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold">
                            <strong>Mandatory Rejection Reason:</strong> {o.rejection_reason}
                          </div>
                        )}
                      </div>

                      {/* Submitted Screenshot Proof & Verification Actions */}
                      <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 flex flex-col justify-between space-y-4">
                        <div>
                          <span className="text-[10px] font-extrabold uppercase text-[#4F46E5] tracking-wider block mb-2">
                            Payment Screenshot Proof:
                          </span>

                          {o.payment_screenshot ? (
                            <div className="relative group">
                              <img
                                src={o.payment_screenshot}
                                alt="Customer Payment Screenshot"
                                className="w-full h-28 object-cover rounded-xl border border-gray-200 shadow-sm group-hover:brightness-105 transition cursor-pointer"
                                onClick={() => setActiveScreenshotModal(o.payment_screenshot)}
                              />
                              <button
                                onClick={() => setActiveScreenshotModal(o.payment_screenshot)}
                                className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white text-xs font-bold gap-1 rounded-xl cursor-pointer"
                              >
                                <Eye className="w-4 h-4" />
                                <span>Inspect Screenshot</span>
                              </button>
                            </div>
                          ) : (
                            <div className="p-4 rounded-xl bg-gray-100 border border-gray-200 text-center text-[10px] text-gray-500 font-bold">
                              No screenshot required (COD Order)
                            </div>
                          )}
                        </div>

                        {/* Accept / Reject Buttons for Pending Online Orders */}
                        {isPending && (
                          <div className="flex items-center gap-2 pt-2 border-t border-gray-200">
                            <button
                              onClick={() => handleVerifyPayment(o.id, 'ACCEPT')}
                              disabled={verifyingOrder}
                              className="flex-1 py-2.5 rounded-xl bg-[#059669] hover:bg-emerald-700 text-white font-extrabold text-xs transition cursor-pointer flex items-center justify-center space-x-1 shadow-sm"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                              <span>ACCEPT PAYMENT</span>
                            </button>

                            <button
                              onClick={() => {
                                setRejectingOrder(o);
                                setRejectionReasonInput('');
                                setRejectionError('');
                              }}
                              disabled={verifyingOrder}
                              className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs transition cursor-pointer flex items-center justify-center space-x-1 shadow-sm"
                            >
                              <XCircle className="w-4 h-4" />
                              <span>REJECT PAYMENT</span>
                            </button>
                          </div>
                        )}
                      </div>

                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ═══════════════════════════════════════════════
          TAB 2: PRODUCT INVENTORY
          ═══════════════════════════════════════════════ */}
      {activeTab === 'inventory' && (
        <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-sm">
          <div className="p-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
            <div className="relative w-64">
              <Search className="w-4 h-4 text-[#64748B] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-white border border-gray-200 text-xs font-semibold text-[#0F172A] placeholder-[#64748B] focus:outline-none focus:border-[#4F46E5]"
              />
            </div>
            <span className="text-xs text-[#64748B] font-bold">Total Models: {products.length}</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50 text-[#64748B] uppercase tracking-widest font-extrabold text-[10px]">
                  <th className="p-4">Product</th>
                  <th className="p-4">Brand</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Price (₹)</th>
                  <th className="p-4">Stock Qty</th>
                  <th className="p-4">Badge</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {products
                  .filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.brand.toLowerCase().includes(searchQuery.toLowerCase()))
                  .map((p) => {
                    const priceInr = p.price_inr !== undefined ? p.price_inr : p.price;
                    return (
                      <tr key={p.id} className="hover:bg-gray-50/80 transition">
                        <td className="p-4 flex items-center space-x-3">
                          <img src={p.image_url} alt={p.name} className="w-10 h-10 object-contain rounded-lg bg-white p-1 border border-gray-200" />
                          <span className="font-bold text-[#0F172A] line-clamp-1">{p.name}</span>
                        </td>
                        <td className="p-4 font-extrabold text-[#4F46E5]">{p.brand}</td>
                        <td className="p-4 text-[#475569]">{p.category}</td>
                        <td className="p-4 font-extrabold text-[#059669]">₹{priceInr.toLocaleString('en-IN')}</td>
                        <td className="p-4">
                          <div className="flex items-center space-x-2">
                            <button onClick={() => handleStockUpdate(p.id, p.stock_quantity, -1)} className="p-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-[#0F172A] border border-gray-200 transition cursor-pointer">
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="px-3 py-1 rounded-lg font-extrabold bg-indigo-50 text-[#4F46E5] border border-indigo-200 text-xs shadow-sm min-w-[32px] text-center">
                              {p.stock_quantity}
                            </span>
                            <button onClick={() => handleStockUpdate(p.id, p.stock_quantity, 1)} className="p-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-[#0F172A] border border-gray-200 transition cursor-pointer">
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="px-2.5 py-1 rounded-full text-[9px] font-extrabold uppercase bg-emerald-50 text-[#059669] border border-emerald-200">
                            {p.material_badge || 'Premium Craft'}
                          </span>
                        </td>
                        <td className="p-4 text-right space-x-2">
                          <button onClick={() => openEditModal(p)} className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-[#4F46E5] transition cursor-pointer border border-gray-200">
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDeleteProduct(p.id)} className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-rose-600 transition cursor-pointer border border-gray-200">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════
          TAB 3: FULFILLMENT ORDERS
          ═══════════════════════════════════════════════ */}
      {activeTab === 'orders' && (
        <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-4">
          {orders.length === 0 ? (
            <p className="text-xs text-[#64748B] p-8 text-center">No orders recorded yet.</p>
          ) : (
            <div className="space-y-4">
              {orders.map((o) => (
                <div key={o.id} className="p-4 rounded-2xl bg-gray-50 border border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-extrabold text-[#4F46E5] text-sm font-mono">Order #{o.id}</span>
                      <span className="text-xs text-[#64748B] font-bold">• Customer ID: #{o.user_id} ({o.customer_name})</span>
                    </div>
                    <p className="text-xs text-[#059669] font-extrabold mt-1">
                      Total: ₹{(o.total_amount || 0).toLocaleString('en-IN')} | Method: {o.payment_method} | Verification: {o.payment_status}
                    </p>
                    <p className="text-[10px] text-[#64748B] font-semibold mt-0.5">{o.shipping_address}</p>
                  </div>

                  <div className="flex items-center space-x-3">
                    <label className="text-xs font-bold text-[#475569]">Order Status:</label>
                    <select
                      value={o.order_status}
                      onChange={(e) => handleOrderStatusUpdate(o.id, e.target.value)}
                      className="py-1.5 px-3 rounded-xl bg-white border border-gray-200 text-xs font-extrabold text-[#4F46E5] focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer shadow-sm"
                    >
                      <option value="Confirmed">Confirmed</option>
                      <option value="Payment Verification Pending">Payment Verification Pending</option>
                      <option value="Processing">Processing</option>
                      <option value="Packed">Packed</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ═══════════════════════════════════════════════
          TAB 4: STORE QR CODE CONFIG
          ═══════════════════════════════════════════════ */}
      {/* ═══════════════════════════════════════════════
          TAB 4: STORE QR CODE CONFIG
          ═══════════════════════════════════════════════ */}
      {activeTab === 'settings' && (
        <div className="max-w-2xl mx-auto p-6 sm:p-8 rounded-3xl bg-white border border-gray-200 space-y-6 text-left shadow-sm">
          <div className="flex items-center space-x-3 pb-4 border-b border-gray-200">
            <QrCode className="w-6 h-6 text-[#4F46E5]" />
            <div>
              <h3 className="text-lg font-extrabold uppercase text-[#0F172A] font-heading">STORE UPI QR CODE MANAGEMENT</h3>
              <p className="text-xs text-[#64748B]">Configure the payment QR code displayed to customers during checkout.</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-6 p-4 rounded-2xl bg-gray-50 border border-gray-200">
            <div className="p-3 bg-white rounded-2xl shadow-sm border border-gray-200 shrink-0">
              <img src={adminQrCode} alt="Current Admin QR Code" className="w-36 h-36 object-contain" />
            </div>

            <div className="space-y-2 flex-1">
              <span className="px-2.5 py-1 rounded-full text-[9px] font-extrabold uppercase bg-emerald-50 text-[#059669] border border-emerald-200">
                ACTIVE CHECKOUT QR
              </span>
              <p className="text-xs text-[#0F172A] font-mono break-all bg-white p-2.5 rounded-xl border border-gray-200">
                {adminQrCode}
              </p>
            </div>
          </div>

          {/* Form to update URL */}
          <form onSubmit={handleUpdateQrCode} className="space-y-3 pt-2">
            <label className="block text-xs font-bold text-[#475569]">
              Set Custom QR Code URL / UPI Payment String:
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={newQrInput}
                onChange={(e) => setNewQrInput(e.target.value)}
                placeholder="https://api.qrserver.com/... or image URL"
                className="flex-1 p-3 rounded-xl bg-gray-50 border border-gray-200 text-xs font-bold text-[#0F172A] focus:outline-none focus:border-[#4F46E5] focus:bg-white"
              />
              <button
                type="submit"
                className="px-4 py-3 rounded-xl bg-[#4F46E5] hover:bg-[#3730A3] text-white font-extrabold text-xs transition cursor-pointer shadow-sm"
              >
                UPDATE QR
              </button>
            </div>
          </form>

          {/* File Upload Option */}
          <div className="pt-4 border-t border-gray-200 space-y-2">
            <label className="block text-xs font-bold text-[#475569]">
              Or Upload Custom QR Code Image File:
            </label>
            <label className="p-4 rounded-xl border border-dashed border-gray-300 hover:border-indigo-400 transition flex items-center justify-center space-x-2 cursor-pointer bg-gray-50 hover:bg-gray-100">
              <UploadCloud className="w-4 h-4 text-[#4F46E5]" />
              <span className="text-xs font-bold text-[#0F172A]">Click to Upload Image File</span>
              <input type="file" accept="image/*" onChange={handleQrFileUpload} className="hidden" />
            </label>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════
          TAB 5: ANALYTICS & REVENUE CHARTS
          ═══════════════════════════════════════════════ */}
      {activeTab === 'analytics' && (
        <div className="space-y-8">
          {/* Top Performance Analytics Row */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="p-6 rounded-3xl bg-white border border-gray-200 shadow-sm text-left">
              <span className="text-[10px] font-extrabold uppercase text-[#64748B] tracking-wider block">TOTAL REVENUE GENERATED</span>
              <div className="text-3xl font-black text-[#059669] font-heading mt-1">
                ₹{orders.reduce((sum, o) => sum + (o.payment_status === 'VERIFIED' ? o.total_amount : 0), 0).toLocaleString('en-IN')}
              </div>
              <span className="text-[11px] text-[#059669] font-bold mt-2 inline-flex items-center space-x-1">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Verified Payment Orders</span>
              </span>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-gray-200 shadow-sm text-left">
              <span className="text-[10px] font-extrabold uppercase text-[#64748B] tracking-wider block">TOTAL ORDERS PLACED</span>
              <div className="text-3xl font-black text-[#0F172A] font-heading mt-1">
                {orders.length}
              </div>
              <span className="text-[11px] text-[#4F46E5] font-bold mt-2 inline-flex items-center space-x-1">
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Customer Transactions</span>
              </span>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-gray-200 shadow-sm text-left">
              <span className="text-[10px] font-extrabold uppercase text-[#64748B] tracking-wider block">AVERAGE ORDER VALUE (AOV)</span>
              <div className="text-3xl font-black text-[#4F46E5] font-heading mt-1">
                ₹{orders.length > 0 ? Math.round(orders.reduce((sum, o) => sum + o.total_amount, 0) / orders.length).toLocaleString('en-IN') : 0}
              </div>
              <span className="text-[11px] text-[#475569] font-bold mt-2 inline-flex items-center space-x-1">
                <DollarSign className="w-3.5 h-3.5" />
                <span>Per Customer Basket</span>
              </span>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-gray-200 shadow-sm text-left">
              <span className="text-[10px] font-extrabold uppercase text-[#64748B] tracking-wider block">FOOTWEAR CATALOG MODELS</span>
              <div className="text-3xl font-black text-[#0F172A] font-heading mt-1">
                {products.length}
              </div>
              <span className="text-[11px] text-[#059669] font-bold mt-2 inline-flex items-center space-x-1">
                <Package className="w-3.5 h-3.5" />
                <span>Active Inventory Items</span>
              </span>
            </div>
          </div>

          {/* Sales Trends Chart & Category Breakdown Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Visual Sales & Revenue Bar Chart (2 cols) */}
            <div className="lg:col-span-2 bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 text-left shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-lg font-extrabold text-[#0F172A] font-heading uppercase tracking-tight">SALES & REVENUE TRENDS</h3>
                  <p className="text-xs text-[#64748B] font-medium">Monthly revenue performance overview</p>
                </div>
                <div className="px-3 py-1 rounded-full bg-indigo-50 text-[#4F46E5] text-xs font-extrabold border border-indigo-200">
                  2026 Analytics
                </div>
              </div>

              {/* Visual Bar Chart */}
              <div className="h-64 flex items-end justify-between gap-3 pt-8 pb-2 px-4 border-b border-gray-200">
                {[
                  { month: 'Jan', val: 65, amount: '₹1,24,000' },
                  { month: 'Feb', val: 45, amount: '₹89,500' },
                  { month: 'Mar', val: 80, amount: '₹1,68,000' },
                  { month: 'Apr', val: 55, amount: '₹1,12,000' },
                  { month: 'May', val: 90, amount: '₹1,95,000' },
                  { month: 'Jun', val: 70, amount: '₹1,45,000' },
                  { month: 'Jul', val: 85, amount: '₹1,78,000' },
                  { month: 'Aug', val: 95, amount: '₹2,10,000' },
                ].map((item, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-black bg-[#0F172A] text-white px-2 py-1 rounded-lg whitespace-nowrap shadow-md">
                      {item.amount}
                    </div>
                    <div
                      className="w-full max-w-[36px] rounded-t-xl bg-gradient-to-t from-[#4F46E5] to-indigo-400 group-hover:to-emerald-400 transition-all duration-300 shadow-sm"
                      style={{ height: `${item.val}%` }}
                    />
                    <span className="text-xs font-extrabold text-[#64748B] uppercase">{item.month}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between items-center mt-4 text-xs font-bold text-[#64748B]">
                <span>Gross Revenue Growth Rate: <strong className="text-[#059669]">+24.8% YoY</strong></span>
                <span>Peak Sales Month: <strong className="text-[#4F46E5]">August 2026</strong></span>
              </div>
            </div>

            {/* Category Distribution Breakdown (1 col) */}
            <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 text-left shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-extrabold text-[#0F172A] font-heading uppercase tracking-tight mb-1">CATEGORY SALES</h3>
                <p className="text-xs text-[#64748B] font-medium mb-6">Distribution across footwear styles</p>

                <div className="space-y-4">
                  {[
                    { cat: 'Sneakers', pct: 45, color: 'bg-[#4F46E5]' },
                    { cat: 'Formal Shoes', pct: 25, color: 'bg-emerald-500' },
                    { cat: 'Crocs & Clogs', pct: 15, color: 'bg-amber-500' },
                    { cat: 'Boots & Sandals', pct: 15, color: 'bg-purple-500' },
                  ].map((c, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between text-xs font-bold text-[#0F172A]">
                        <span>{c.cat}</span>
                        <span>{c.pct}%</span>
                      </div>
                      <div className="w-full h-2.5 rounded-full bg-gray-100 overflow-hidden">
                        <div className={`h-full ${c.color} rounded-full transition-all duration-500`} style={{ width: `${c.pct}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-200 text-center">
                <span className="text-[11px] font-extrabold text-[#059669] bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200">
                  ⚡ Highest Demand Category: Sneakers (45%)
                </span>
              </div>
            </div>
          </div>

          {/* Top Selling Footwear Leaderboard */}
          <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 text-left shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-lg font-extrabold text-[#0F172A] font-heading uppercase tracking-tight">BEST SELLING FOOTWEAR LEADERBOARD</h3>
                <p className="text-xs text-[#64748B] font-medium">Top performing models ranked by sales volume</p>
              </div>
              <Award className="w-6 h-6 text-amber-500" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {products.slice(0, 3).map((p, idx) => (
                <div key={p.id} className="p-4 rounded-2xl bg-gray-50 border border-gray-200 flex items-center space-x-4">
                  <div className="relative w-16 h-16 rounded-xl bg-white p-1 border border-gray-200 shrink-0">
                    <img src={p.image_url} alt={p.name} className="w-full h-full object-contain" />
                    <span className="absolute -top-2 -left-2 w-6 h-6 rounded-full bg-[#4F46E5] text-white text-[10px] font-black flex items-center justify-center shadow-md">
                      #{idx + 1}
                    </span>
                  </div>

                  <div className="overflow-hidden">
                    <h4 className="text-xs font-bold text-[#0F172A] truncate">{p.name}</h4>
                    <p className="text-[10px] text-[#64748B] font-medium">{p.category}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-xs font-extrabold text-[#059669]">₹{(p.price_inr || p.price || 2499).toLocaleString('en-IN')}</span>
                      <span className="text-[10px] font-bold text-[#4F46E5] bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">
                        {38 - idx * 7} Pairs Sold
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* REJECTION REASON MODAL */}
      <AnimatePresence>
        {rejectingOrder && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-gray-950/60 backdrop-blur-md flex items-center justify-center p-4"
            onClick={() => setRejectingOrder(null)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="max-w-md w-full bg-white border border-gray-200 rounded-3xl p-6 text-left space-y-4 shadow-2xl"
            >
              <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                <div className="flex items-center space-x-2 text-rose-600 font-extrabold font-heading">
                  <XCircle className="w-5 h-5" />
                  <span className="uppercase text-sm">REJECT PAYMENT – ORDER #{rejectingOrder.id}</span>
                </div>
                <button onClick={() => setRejectingOrder(null)} className="text-gray-400 hover:text-[#0F172A]">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {rejectionError && (
                <div className="p-3 rounded-xl bg-rose-50 text-rose-700 text-xs font-bold border border-rose-200">
                  {rejectionError}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-[#475569] mb-1.5">
                  Mandatory Rejection Reason <span className="text-rose-600">*</span>
                </label>
                <textarea
                  rows={3}
                  value={rejectionReasonInput}
                  onChange={(e) => setRejectionReasonInput(e.target.value)}
                  placeholder="Enter clear rejection reason (e.g., Fake screenshot, transaction ID missing, amount mismatch)..."
                  className="w-full p-3 rounded-xl bg-gray-50 border border-gray-200 text-xs font-bold text-[#0F172A] focus:outline-none focus:border-rose-500 focus:bg-white"
                  required
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  onClick={() => setRejectingOrder(null)}
                  className="px-4 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-[#475569] text-xs font-bold transition"
                >
                  CANCEL
                </button>

                <button
                  onClick={() => handleVerifyPayment(rejectingOrder.id, 'REJECT', rejectionReasonInput)}
                  disabled={!rejectionReasonInput.trim() || verifyingOrder}
                  className={`px-5 py-2.5 rounded-xl text-xs font-extrabold uppercase transition shadow-sm ${
                    !rejectionReasonInput.trim() || verifyingOrder
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-rose-600 hover:bg-rose-700 text-white cursor-pointer'
                  }`}
                >
                  CONFIRM REJECTION
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SCREENSHOT LIGHTBOX MODAL */}
      <AnimatePresence>
        {activeScreenshotModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-gray-950/80 backdrop-blur-xl flex items-center justify-center p-4"
            onClick={() => setActiveScreenshotModal(null)}
          >
            <button
              onClick={() => setActiveScreenshotModal(null)}
              className="absolute top-6 right-6 p-3 rounded-full bg-white/20 hover:bg-white/30 text-white transition cursor-pointer z-10"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="max-w-2xl w-full text-center relative" onClick={(e) => e.stopPropagation()}>
              <img
                src={activeScreenshotModal}
                alt="Payment Screenshot Inspection"
                className="max-h-[80vh] w-auto mx-auto object-contain rounded-2xl shadow-2xl border border-white/20"
              />
              <p className="text-xs text-white mt-4 font-bold">Admin Inspection: Submitted Payment Screenshot Proof</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CREATE / EDIT PRODUCT MODAL */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-gray-950/60 backdrop-blur-md flex items-center justify-center p-4"
            onClick={() => setIsModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-lg w-full bg-white border border-gray-200 rounded-3xl p-6 text-left shadow-2xl"
            >
              <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-200">
                <h3 className="text-xl font-extrabold text-[#0F172A] uppercase tracking-tight font-heading">
                  {editingProduct ? 'EDIT FOOTWEAR MODEL' : 'ADD NEW FOOTWEAR MODEL'}
                </h3>
                <button onClick={() => setIsModalOpen(false)} className="p-1 text-[#64748B] hover:text-[#0F172A]">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveProduct} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#475569] mb-1">Model Name:</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-gray-50 border border-gray-200 text-xs font-bold text-[#0F172A] focus:outline-none focus:border-[#4F46E5] focus:bg-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#475569] mb-1">Brand Name:</label>
                    <input
                      type="text"
                      required
                      placeholder="Type your custom brand name..."
                      value={formData.brand}
                      onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                      className="w-full p-2.5 rounded-xl bg-gray-50 border border-gray-200 text-xs font-bold text-[#0F172A] placeholder-[#64748B] focus:outline-none focus:border-[#4F46E5] focus:bg-white cursor-text"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#475569] mb-1">Category:</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full p-2.5 rounded-xl bg-gray-50 border border-gray-200 text-xs font-bold text-[#0F172A] focus:outline-none focus:border-[#4F46E5] focus:bg-white"
                    >
                      <option value="Sneakers">Sneakers</option>
                      <option value="Formal Shoes">Formal Shoes</option>
                      <option value="Crocs & Clogs">Crocs &amp; Clogs</option>
                      <option value="Slippers & Sandals">Slippers &amp; Sandals</option>
                      <option value="Boots">Boots</option>
                      <option value="Ethnic Footwear">Ethnic Footwear</option>
                      <option value="Boys Footwear">Boys Footwear</option>
                      <option value="Girls Sandals">Girls Sandals</option>
                      <option value="School Shoes">School Shoes</option>
                      <option value="Bags">Bags</option>
                      <option value="Laptop Backpacks">Laptop Backpacks</option>
                      <option value="Sport & Duffle Bags">Sport &amp; Duffle Bags</option>
                      <option value="Trekking Backpacks">Trekking Backpacks</option>
                      <option value="Rider Bike Bags">Rider Bike Bags</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#475569] mb-1">Price (₹ INR):</label>
                    <input
                      type="number"
                      required
                      value={formData.price_inr}
                      onChange={(e) => setFormData({ ...formData, price_inr: parseFloat(e.target.value) })}
                      className="w-full p-2.5 rounded-xl bg-gray-50 border border-gray-200 text-xs font-bold text-[#0F172A] focus:outline-none focus:border-[#4F46E5] focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#475569] mb-1">Initial Stock:</label>
                    <input
                      type="number"
                      required
                      value={formData.stock_quantity}
                      onChange={(e) => setFormData({ ...formData, stock_quantity: parseInt(e.target.value) })}
                      className="w-full p-2.5 rounded-xl bg-gray-50 border border-gray-200 text-xs font-bold text-[#0F172A] focus:outline-none focus:border-[#4F46E5] focus:bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#475569] mb-1">Material Badge:</label>
                  <input
                    type="text"
                    value={formData.material_badge}
                    onChange={(e) => setFormData({ ...formData, material_badge: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-gray-50 border border-gray-200 text-xs font-bold text-[#0F172A] focus:outline-none focus:border-[#4F46E5] focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#475569] mb-1.5">Product Image (Upload File or Enter URL):</label>
                  
                  {/* Upload Image File Button */}
                  <label className="p-3.5 rounded-2xl border border-dashed border-gray-300 hover:border-[#4F46E5] transition flex items-center justify-center space-x-2 cursor-pointer bg-gray-50 hover:bg-gray-100 mb-2">
                    <UploadCloud className="w-4 h-4 text-[#4F46E5]" />
                    <span className="text-xs font-bold text-[#0F172A]">Click to Upload Shoe Image File</span>
                    <input type="file" accept="image/*" onChange={handleProductImageFileUpload} className="hidden" />
                  </label>

                  {/* Or Enter Image URL Input & Thumbnail Preview */}
                  <div className="flex gap-2 items-center">
                    <input
                      type="text"
                      placeholder="Or paste Image URL (https://...)"
                      value={formData.image_url}
                      onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                      className="flex-1 p-2.5 rounded-xl bg-gray-50 border border-gray-200 text-xs font-bold text-[#0F172A] focus:outline-none focus:border-[#4F46E5] focus:bg-white"
                    />

                    {formData.image_url && (
                      <div className="w-10 h-10 rounded-xl bg-white border border-gray-200 p-1 shrink-0 shadow-sm overflow-hidden flex items-center justify-center">
                        <img src={formData.image_url} alt="Preview" className="w-full h-full object-contain" />
                      </div>
                    )}
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl bg-[#4F46E5] hover:bg-[#3730A3] text-white font-extrabold text-xs transition cursor-pointer shadow-md shadow-indigo-500/20"
                >
                  SAVE FOOTWEAR MODEL
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* 🎁 Digital Gift Card Modal — Admin Only */}
      <GiftCardModal
        isOpen={isGiftCardOpen}
        onClose={() => setIsGiftCardOpen(false)}
      />

    </div>
  );
}
