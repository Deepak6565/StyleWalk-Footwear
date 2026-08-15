import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
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
  Gift,
  Truck,
  Download,
  MapPin,
  Calendar,
  FileText,
  Star,
  Filter,
  ArrowUpDown,
  Layers,
  Info
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import GiftCardModal from '../components/GiftCardModal';
import { downloadInvoicePdf } from '../utils/generateInvoicePdf';

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

  // Fulfillment Orders search, filter & tracking state
  const [orderSearchQuery, setOrderSearchQuery] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('ALL');
  const [editingTrackingMap, setEditingTrackingMap] = useState({});

  // Inventory filters, sorting & detail inspection state
  const [inventoryCategoryFilter, setInventoryCategoryFilter] = useState('ALL');
  const [inventorySortBy, setInventorySortBy] = useState('id_desc');
  const [inspectingProduct, setInspectingProduct] = useState(null);

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
      const prodRes = await api.get('/products');
      setProducts(prodRes.data);

      const token = localStorage.getItem('stylewalk_token');
      if (token) {
        const orderRes = await api.get('/orders/all');
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
      const res = await api.get('/admin/qr-code');
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
      const payload = { action, rejection_reason: rejectionReason };

      const res = await api.post(
        `/admin/orders/${orderId}/verify-payment`,
        payload
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
      await api.post('/admin/qr-code', { qr_code: newQrInput.trim() });
      setAdminQrCode(newQrInput.trim());
      alert('Admin UPI QR Code updated successfully!');
    } catch (err) {
      alert('Failed to update QR Code URL.');
    }
  };

  const handleQrFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

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
        const res = await api.post('/upload/qr', { imageBase64: reader.result });
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
      await api.put(`/products/${productId}`, { stock_quantity: newStock });
      setProducts(prev =>
        prev.map(p => (p.id === productId ? { ...p, stock_quantity: newStock } : p))
      );
    } catch (err) {
      alert('Failed to update stock. Admin authentication required.');
    }
  };

  const handleOrderStatusUpdate = async (orderId, newStatus) => {
    try {
      const res = await api.put(`/orders/${orderId}/status`, { order_status: newStatus });
      setOrders(prev =>
        prev.map(o => (o.id === orderId ? { ...o, order_status: newStatus, status_history: res.data.status_history } : o))
      );
    } catch (err) {
      alert('Failed to update order status.');
    }
  };

  const handleSaveTracking = async (orderId, trackingNumber) => {
    try {
      const res = await api.put(`/orders/${orderId}/status`, { tracking_number: trackingNumber });
      setOrders(prev =>
        prev.map(o => (o.id === orderId ? { ...o, tracking_number: res.data.tracking_number } : o))
      );
      alert(`✅ Tracking number updated for Order #${orderId}`);
    } catch (err) {
      alert('Failed to update tracking number.');
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await api.delete(`/products/${productId}`);
      setProducts(prev => prev.filter(p => p.id !== productId));
    } catch (err) {
      alert('Failed to delete product.');
    }
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        await api.put(`/products/${editingProduct.id}`, formData);
      } else {
        await api.post('/products', formData);
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
          TAB 2: PRODUCT INVENTORY MANAGEMENT CENTER
          ═══════════════════════════════════════════════ */}
      {activeTab === 'inventory' && (
        <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-sm space-y-0">
          
          {/* Inventory Controls: Search, Category Filter & Sorting */}
          <div className="p-4 sm:p-6 bg-gray-50/80 border-b border-gray-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              
              {/* Search Bar */}
              <div className="relative flex-1 sm:w-64">
                <Search className="w-4 h-4 text-[#64748B] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search ID, Name, Brand, Material..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-white border border-gray-200 text-xs font-semibold text-[#0F172A] placeholder-[#64748B] focus:outline-none focus:border-[#4F46E5] shadow-sm"
                />
              </div>

              {/* Category Filter Dropdown */}
              <div className="flex items-center space-x-1 bg-white px-3 py-1.5 rounded-xl border border-gray-200 shadow-sm">
                <Filter className="w-3.5 h-3.5 text-[#4F46E5]" />
                <select
                  value={inventoryCategoryFilter}
                  onChange={(e) => setInventoryCategoryFilter(e.target.value)}
                  className="bg-transparent text-xs font-bold text-[#0F172A] focus:outline-none cursor-pointer"
                >
                  <option value="ALL">All Categories</option>
                  <option value="Sneakers">Sneakers</option>
                  <option value="Formal Shoes">Formal Shoes</option>
                  <option value="Crocs & Clogs">Crocs &amp; Clogs</option>
                  <option value="Slippers & Sandals">Slippers &amp; Sandals</option>
                  <option value="Boots">Boots</option>
                  <option value="Ethnic Footwear">Ethnic Footwear</option>
                  <option value="Bags">Bags</option>
                </select>
              </div>

              {/* Sorting Selector */}
              <div className="flex items-center space-x-1 bg-white px-3 py-1.5 rounded-xl border border-gray-200 shadow-sm">
                <ArrowUpDown className="w-3.5 h-3.5 text-[#4F46E5]" />
                <select
                  value={inventorySortBy}
                  onChange={(e) => setInventorySortBy(e.target.value)}
                  className="bg-transparent text-xs font-bold text-[#0F172A] focus:outline-none cursor-pointer"
                >
                  <option value="id_desc">Order by ID (Newest First)</option>
                  <option value="id_asc">Order by ID (Oldest First)</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="stock_low">Stock: Low Stock First</option>
                  <option value="rating_desc">Rating: Highest Rated</option>
                </select>
              </div>
            </div>

            {/* Models Counter */}
            <div className="text-xs font-extrabold text-[#4F46E5] bg-indigo-50 px-3.5 py-2 rounded-xl border border-indigo-200 shrink-0">
              Total Footwear Models: {products.length}
            </div>
          </div>

          {/* Detailed Inventory Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-100/70 text-[#64748B] uppercase tracking-widest font-extrabold text-[10px]">
                  <th className="p-4 w-16">ID</th>
                  <th className="p-4">Footwear Model &amp; Specifications</th>
                  <th className="p-4">Category &amp; Material</th>
                  <th className="p-4">Price (INR)</th>
                  <th className="p-4">Stock &amp; Availability</th>
                  <th className="p-4 text-center">Ordered Action Controls</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {products
                  .filter(p => {
                    const matchCategory = inventoryCategoryFilter === 'ALL' || p.category === inventoryCategoryFilter;
                    const q = searchQuery.toLowerCase();
                    const matchQuery = !q ||
                      String(p.id).includes(q) ||
                      (p.name && p.name.toLowerCase().includes(q)) ||
                      (p.brand && p.brand.toLowerCase().includes(q)) ||
                      (p.material_badge && p.material_badge.toLowerCase().includes(q));
                    return matchCategory && matchQuery;
                  })
                  .sort((a, b) => {
                    if (inventorySortBy === 'id_desc') return b.id - a.id;
                    if (inventorySortBy === 'id_asc') return a.id - b.id;
                    if (inventorySortBy === 'price_desc') return (b.price_inr || b.price) - (a.price_inr || a.price);
                    if (inventorySortBy === 'price_asc') return (a.price_inr || a.price) - (b.price_inr || b.price);
                    if (inventorySortBy === 'stock_low') return a.stock_quantity - b.stock_quantity;
                    if (inventorySortBy === 'rating_desc') return (b.rating || 0) - (a.rating || 0);
                    return b.id - a.id;
                  })
                  .map((p) => {
                    const priceInr = p.price_inr !== undefined ? p.price_inr : p.price;
                    const isOutOfStock = p.stock_quantity <= 0;
                    const isLowStock = p.stock_quantity > 0 && p.stock_quantity < 5;
                    const sizesList = Array.isArray(p.sizes) ? p.sizes : (p.sizes_json ? JSON.parse(p.sizes_json) : []);

                    return (
                      <tr key={p.id} className="hover:bg-gray-50/80 transition">
                        
                        {/* ID */}
                        <td className="p-4 font-mono font-black text-[#4F46E5] text-xs">
                          #{p.id}
                        </td>

                        {/* Product Model Details */}
                        <td className="p-4">
                          <div className="flex items-center space-x-3">
                            <img src={p.image_url} alt={p.name} className="w-12 h-12 object-contain rounded-xl bg-white p-1 border border-gray-200 shrink-0 shadow-sm" />
                            <div>
                              <h4 className="font-extrabold text-[#0F172A] text-xs">{p.name}</h4>
                              <div className="flex items-center space-x-2 mt-1">
                                <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-[#4F46E5] text-[10px] font-black border border-indigo-200">
                                  {p.brand}
                                </span>
                                <span className="text-[10px] font-bold text-amber-600 flex items-center gap-0.5">
                                  <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
                                  {p.rating || 4.8} ({p.review_count || 12} reviews)
                                </span>
                              </div>
                              <p className="text-[10px] text-[#64748B] mt-0.5 font-medium">
                                Sizes: {sizesList.join(', ')}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Category & Material Badge */}
                        <td className="p-4">
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase bg-gray-100 text-[#475569] block w-fit mb-1 border border-gray-200">
                            {p.category}
                          </span>
                          <span className="px-2.5 py-1 rounded-full text-[9px] font-extrabold uppercase bg-emerald-50 text-[#059669] border border-emerald-200 block w-fit">
                            {p.material_badge || 'Premium Craft'}
                          </span>
                        </td>

                        {/* Price */}
                        <td className="p-4 font-extrabold text-[#059669] font-mono text-sm">
                          ₹{priceInr.toLocaleString('en-IN')}
                        </td>

                        {/* Stock Quantity & Status */}
                        <td className="p-4">
                          <div className="space-y-1.5">
                            {/* Stock Badge */}
                            {isOutOfStock ? (
                              <span className="px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-rose-100 text-rose-700 border border-rose-200 inline-block">
                                ⚠️ Out of Stock
                              </span>
                            ) : isLowStock ? (
                              <span className="px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-amber-100 text-amber-800 border border-amber-200 inline-block animate-pulse">
                                ⚡ Low Stock ({p.stock_quantity})
                              </span>
                            ) : (
                              <span className="px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-emerald-100 text-[#059669] border border-emerald-200 inline-block">
                                In Stock
                              </span>
                            )}

                            {/* Stock Adjustment Increments */}
                            <div className="flex items-center space-x-1.5">
                              <button
                                onClick={() => handleStockUpdate(p.id, p.stock_quantity, -1)}
                                title="Decrease Stock"
                                className="p-1 rounded-lg bg-gray-100 hover:bg-gray-200 text-[#0F172A] border border-gray-200 transition cursor-pointer"
                              >
                                <Minus className="w-3.5 h-3.5" />
                              </button>
                              <span className="px-2.5 py-0.5 rounded-lg font-extrabold bg-indigo-50 text-[#4F46E5] border border-indigo-200 text-xs shadow-sm min-w-[28px] text-center font-mono">
                                {p.stock_quantity}
                              </span>
                              <button
                                onClick={() => handleStockUpdate(p.id, p.stock_quantity, 1)}
                                title="Increase Stock"
                                className="p-1 rounded-lg bg-gray-100 hover:bg-gray-200 text-[#0F172A] border border-gray-200 transition cursor-pointer"
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </td>

                        {/* Ordered Action Buttons Column */}
                        <td className="p-4 text-center">
                          <div className="flex items-center justify-center space-x-2">
                            {/* 1. Inspect Details Button */}
                            <button
                              onClick={() => setInspectingProduct(p)}
                              title="View Detailed Product Specs"
                              className="px-2.5 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-[#4F46E5] border border-indigo-200 text-xs font-bold transition flex items-center space-x-1 cursor-pointer shadow-sm"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Details</span>
                            </button>

                            {/* 2. Edit Model Button */}
                            <button
                              onClick={() => openEditModal(p)}
                              title="Edit Product Model"
                              className="px-2.5 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 text-xs font-bold transition flex items-center space-x-1 cursor-pointer shadow-sm"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                              <span>Edit</span>
                            </button>

                            {/* 3. Delete Model Button */}
                            <button
                              onClick={() => handleDeleteProduct(p.id)}
                              title="Delete Product Model"
                              className="px-2.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 text-xs font-bold transition flex items-center space-x-1 cursor-pointer shadow-sm"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Delete</span>
                            </button>
                          </div>
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
          TAB 3: FULFILLMENT ORDERS MANAGEMENT CENTER
          ═══════════════════════════════════════════════ */}
      {activeTab === 'orders' && (
        <div className="space-y-6">
          {/* Filter & Search Bar */}
          <div className="p-4 rounded-3xl bg-white border border-gray-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-[#64748B] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search Order ID, Customer, Product, Tracking #..."
                value={orderSearchQuery}
                onChange={(e) => setOrderSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-xs font-semibold text-[#0F172A] placeholder-[#64748B] focus:outline-none focus:border-[#4F46E5] focus:bg-white"
              />
            </div>

            {/* Status Filter Chips */}
            <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto max-w-full">
              {['ALL', 'Confirmed', 'Processing', 'Packed', 'Shipped', 'In Transit', 'Delivered', 'Cancelled'].map((st) => (
                <button
                  key={st}
                  onClick={() => setOrderStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer border ${
                    orderStatusFilter === st
                      ? 'bg-[#4F46E5] text-white border-[#4F46E5] shadow-sm'
                      : 'bg-gray-50 text-[#475569] hover:bg-gray-100 hover:text-[#0F172A] border-gray-200'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Orders List */}
          {orders.length === 0 ? (
            <div className="p-12 bg-white rounded-3xl text-center border border-gray-200 shadow-sm">
              <ShoppingBag className="w-10 h-10 text-[#64748B] mx-auto mb-3" />
              <h3 className="text-base font-bold text-[#0F172A]">No fulfillment orders found</h3>
              <p className="text-xs text-[#64748B] mt-1">Customer purchases will be displayed here for management.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {orders
                .filter(o => {
                  const matchStatus = orderStatusFilter === 'ALL' || o.order_status === orderStatusFilter;
                  const query = orderSearchQuery.toLowerCase();
                  const matchQuery = !query || 
                    String(o.id).includes(query) ||
                    (o.customer_name && o.customer_name.toLowerCase().includes(query)) ||
                    (o.customer_email && o.customer_email.toLowerCase().includes(query)) ||
                    (o.tracking_number && o.tracking_number.toLowerCase().includes(query)) ||
                    (o.items && o.items.some(it => it.name && it.name.toLowerCase().includes(query)));
                  return matchStatus && matchQuery;
                })
                .map((o) => {
                  const totalItemsQty = (o.items || []).reduce((acc, item) => acc + (item.quantity || 1), 0);
                  const isCOD = o.payment_method === 'COD';
                  const isApproved = o.payment_status === 'Payment Approved' || isCOD;
                  const currentTracking = editingTrackingMap[o.id] !== undefined ? editingTrackingMap[o.id] : (o.tracking_number || '');

                  return (
                    <div key={o.id} className="p-6 rounded-3xl bg-white border border-gray-200 shadow-sm space-y-4 text-left">
                      
                      {/* Order Metadata Header Bar */}
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 pb-4 border-b border-gray-200">
                        <div>
                          <div className="flex items-center space-x-3 flex-wrap gap-y-1">
                            <span className="text-base font-black text-[#0F172A] font-mono">ORDER #{o.id}</span>
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-indigo-50 text-[#4F46E5] border border-indigo-200">
                              Customer: {o.customer_name} ({o.customer_email})
                            </span>
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-gray-100 text-[#475569]">
                              {isCOD ? '💵 CASH ON DELIVERY' : '📱 ONLINE PAYMENT'}
                            </span>
                          </div>
                          <p className="text-[11px] text-[#64748B] mt-1 flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-[#4F46E5]" />
                            <span>Placed on {new Date(o.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                          </p>
                        </div>

                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => downloadInvoicePdf(o)}
                            className="px-3.5 py-2 rounded-xl bg-[#4F46E5] hover:bg-[#3730A3] text-white text-xs font-extrabold transition flex items-center space-x-1.5 cursor-pointer shadow-sm"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>DOWNLOAD PDF INVOICE</span>
                          </button>
                        </div>
                      </div>

                      {/* Main Fulfillment Grid */}
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                        {/* Product Details & Items List (Col 7) */}
                        <div className="lg:col-span-7 space-y-3">
                          <span className="text-[10px] font-extrabold uppercase text-[#4F46E5] tracking-wider block">
                            Product Details &amp; Quantity Breakdown ({totalItemsQty} items total):
                          </span>

                          <div className="space-y-2">
                            {(o.items || []).map((item, idx) => (
                              <div key={idx} className="p-3 rounded-2xl bg-gray-50 border border-gray-200 flex items-center justify-between gap-3 text-xs">
                                <div className="flex items-center space-x-3 overflow-hidden">
                                  <img
                                    src={item.image_url || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff'}
                                    alt={item.name}
                                    className="w-11 h-11 object-contain rounded-xl bg-white p-1 border border-gray-200 shrink-0"
                                  />
                                  <div className="overflow-hidden">
                                    <h5 className="font-bold text-[#0F172A] truncate">{item.name}</h5>
                                    <p className="text-[10px] text-[#64748B]">
                                      Brand: <strong className="text-[#0F172A]">{item.brand || 'StyleWalk'}</strong> | Size: <strong className="text-[#4F46E5]">{item.selectedSize || 'UK 8'}</strong>
                                    </p>
                                  </div>
                                </div>

                                <div className="text-right shrink-0">
                                  <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 text-[#4F46E5] text-[10px] font-black border border-indigo-200 block mb-0.5">
                                    Qty: {item.quantity}
                                  </span>
                                  <span className="text-xs font-extrabold text-[#059669] font-mono">
                                    ₹{((item.price_inr || item.price || 0) * item.quantity).toLocaleString('en-IN')}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Financial Summary */}
                          <div className="p-3 rounded-2xl bg-emerald-50/60 border border-emerald-200 flex justify-between items-center text-xs font-bold">
                            <span className="text-[#047857]">Grand Total Amount:</span>
                            <span className="text-sm font-black text-[#059669] font-mono">₹{(o.total_amount || 0).toLocaleString('en-IN')}</span>
                          </div>
                        </div>

                        {/* Order Management, Status & Tracking (Col 5) */}
                        <div className="lg:col-span-5 space-y-4">
                          
                          {/* Payment & Delivery Badges */}
                          <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-3 text-xs">
                            <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                              <span className="font-bold text-[#64748B]">Payment Status:</span>
                              <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                                o.payment_status === 'Payment Approved' || o.payment_status === 'Confirmed'
                                  ? 'bg-emerald-100 text-[#059669] border border-emerald-200'
                                  : o.payment_status === 'Payment Verification Pending'
                                  ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                  : 'bg-rose-100 text-rose-700 border border-rose-200'
                              }`}>
                                {o.payment_status}
                              </span>
                            </div>

                            {/* Fulfillment Status Selector */}
                            <div>
                              <label className="block text-[10px] font-extrabold uppercase text-[#475569] mb-1">
                                Fulfillment Order Status:
                              </label>
                              <select
                                value={o.order_status}
                                onChange={(e) => handleOrderStatusUpdate(o.id, e.target.value)}
                                className="w-full p-2 rounded-xl bg-white border border-gray-300 text-xs font-extrabold text-[#4F46E5] focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer shadow-sm"
                              >
                                <option value="Confirmed">Confirmed</option>
                                <option value="Payment Verification Pending">Payment Verification Pending</option>
                                <option value="Processing">Processing</option>
                                <option value="Packed">Packed</option>
                                <option value="Shipped">Shipped</option>
                                <option value="In Transit">In Transit</option>
                                <option value="Delivered">Delivered</option>
                                <option value="Cancelled">Cancelled</option>
                              </select>
                            </div>

                            {/* Tracking Number Input & Save */}
                            <div>
                              <label className="block text-[10px] font-extrabold uppercase text-[#475569] mb-1">
                                Logistics Tracking Number:
                              </label>
                              <div className="flex gap-2">
                                <input
                                  type="text"
                                  placeholder="e.g. SW-TRK-984712"
                                  value={currentTracking}
                                  onChange={(e) => setEditingTrackingMap({ ...editingTrackingMap, [o.id]: e.target.value })}
                                  className="flex-1 px-3 py-1.5 rounded-xl bg-white border border-gray-300 text-xs font-bold text-[#0F172A] placeholder-[#64748B] focus:outline-none focus:border-[#4F46E5]"
                                />
                                <button
                                  onClick={() => handleSaveTracking(o.id, currentTracking)}
                                  className="px-3 py-1.5 rounded-xl bg-[#4F46E5] hover:bg-[#3730A3] text-white text-xs font-extrabold transition cursor-pointer shadow-sm"
                                >
                                  Save
                                </button>
                              </div>
                            </div>

                            {/* Shipping Address */}
                            <div className="pt-2 border-t border-gray-200">
                              <span className="text-[10px] font-extrabold uppercase text-[#64748B] block mb-1">Shipping Address:</span>
                              <p className="text-[11px] text-[#0F172A] font-medium leading-snug bg-white p-2 rounded-xl border border-gray-200">
                                {o.shipping_address}
                              </p>
                            </div>

                            {/* Live Delivery Status Summary */}
                            <div className="pt-2 border-t border-gray-200 flex items-center justify-between text-[11px]">
                              <span className="text-[#64748B] font-semibold">Delivery Status:</span>
                              <span className="font-extrabold text-[#4F46E5]">
                                {o.order_status === 'Delivered'
                                  ? '✅ Delivered to Customer'
                                  : o.order_status === 'Shipped' || o.order_status === 'In Transit'
                                  ? '🚚 In Transit with Carrier'
                                  : o.order_status === 'Packed'
                                  ? '📦 Packed - Awaiting Pickup'
                                  : o.order_status === 'Cancelled'
                                  ? '❌ Order Cancelled'
                                  : '⚙️ Processing in Warehouse'}
                              </span>
                            </div>
                          </div>

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

      {/* DETAILED PRODUCT SPECS INSPECTION MODAL */}
      <AnimatePresence>
        {inspectingProduct && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-gray-950/60 backdrop-blur-md flex items-center justify-center p-4"
            onClick={() => setInspectingProduct(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-xl w-full bg-white border border-gray-200 rounded-3xl p-6 text-left shadow-2xl space-y-5 overflow-hidden"
            >
              {/* Header */}
              <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                <div className="flex items-center space-x-2 font-heading font-extrabold text-[#0F172A]">
                  <Package className="w-5 h-5 text-[#4F46E5]" />
                  <span className="uppercase text-sm">INVENTORY MODEL SPECS – #{inspectingProduct.id}</span>
                </div>
                <button
                  onClick={() => setInspectingProduct(null)}
                  className="p-1 rounded-full text-gray-400 hover:text-[#0F172A] hover:bg-gray-100 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body: Image & Specs Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-start">
                
                {/* Image Stage (5 cols) */}
                <div className="sm:col-span-5 p-3 rounded-2xl bg-gray-50 border border-gray-200 text-center">
                  <img
                    src={inspectingProduct.image_url}
                    alt={inspectingProduct.name}
                    className="w-full h-44 object-contain rounded-xl bg-white p-2 border border-gray-200 shadow-sm"
                  />
                  <span className="mt-2 inline-block px-3 py-1 rounded-full text-[9px] font-extrabold uppercase bg-emerald-50 text-[#059669] border border-emerald-200">
                    {inspectingProduct.material_badge || 'Premium Craft'}
                  </span>
                </div>

                {/* Specs Details (7 cols) */}
                <div className="sm:col-span-7 space-y-3 text-xs">
                  <div>
                    <span className="px-2.5 py-0.5 rounded-md bg-indigo-50 text-[#4F46E5] text-[10px] font-black border border-indigo-200 uppercase">
                      {inspectingProduct.brand}
                    </span>
                    <h3 className="text-lg font-black text-[#0F172A] font-heading mt-1">{inspectingProduct.name}</h3>
                    <p className="text-[#64748B] text-[11px] mt-0.5">Category: <strong>{inspectingProduct.category}</strong></p>
                  </div>

                  <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 grid grid-cols-2 gap-2 font-extrabold">
                    <div>
                      <span className="text-[10px] text-[#64748B] uppercase block font-semibold">Retail Price:</span>
                      <span className="text-emerald-600 font-mono text-base">₹{(inspectingProduct.price_inr || inspectingProduct.price || 0).toLocaleString('en-IN')}</span>
                    </div>

                    <div>
                      <span className="text-[10px] text-[#64748B] uppercase block font-semibold">Stock Quantity:</span>
                      <span className={`text-base font-mono ${
                        inspectingProduct.stock_quantity <= 0
                          ? 'text-rose-600'
                          : inspectingProduct.stock_quantity < 5
                          ? 'text-amber-600'
                          : 'text-[#4F46E5]'
                      }`}>
                        {inspectingProduct.stock_quantity} Units
                      </span>
                    </div>
                  </div>

                  {/* Rating & Review metrics */}
                  <div className="flex items-center space-x-2 text-amber-600 font-bold">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
                    <span>{inspectingProduct.rating || 4.8} / 5.0 Rating</span>
                    <span className="text-[#64748B] font-normal">({inspectingProduct.review_count || 12} customer reviews)</span>
                  </div>

                  {/* Available Sizes List */}
                  <div>
                    <span className="text-[10px] font-extrabold uppercase text-[#64748B] block mb-1">Available Size Variants:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {(Array.isArray(inspectingProduct.sizes)
                        ? inspectingProduct.sizes
                        : (inspectingProduct.sizes_json ? JSON.parse(inspectingProduct.sizes_json) : [])
                      ).map((sz, idx) => (
                        <span key={idx} className="px-2 py-0.5 rounded-lg bg-gray-100 border border-gray-200 text-[10px] font-bold text-[#0F172A]">
                          {sz}
                        </span>
                      ))}
                    </div>
                  </div>

                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-gray-200">
                <button
                  onClick={() => {
                    const prod = inspectingProduct;
                    setInspectingProduct(null);
                    openEditModal(prod);
                  }}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs transition cursor-pointer flex items-center space-x-1.5 shadow-sm"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>EDIT PRODUCT SPECS</span>
                </button>

                <button
                  onClick={() => setInspectingProduct(null)}
                  className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-[#475569] font-bold text-xs transition cursor-pointer"
                >
                  CLOSE
                </button>
              </div>

            </motion.div>
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
