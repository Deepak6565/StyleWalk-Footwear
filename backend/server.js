const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Trigger DB init & seeding
require('./database');

const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const couponRoutes = require('./routes/coupons');
const paymentRoutes = require('./routes/payments');
const orderRoutes = require('./routes/orders');
const uploadRoutes = require('./routes/upload');
const adminRoutes = require('./routes/admin');

const app = express();
const PORT = process.env.PORT || 5000;

// CORS configuration to support local development and production deployment dynamically
app.use(cors({
  origin: true,
  credentials: true
}));

app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Serve static uploads directory for payment screenshots and QR codes
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes mounted with dual prefixes (/api/* and /*) to handle Vercel rewrites and direct requests dynamically
app.use(['/api/auth', '/auth'], authRoutes);
app.use(['/api/products', '/products'], productRoutes);
app.use(['/api/coupons', '/coupons'], couponRoutes);
app.use(['/api/payments', '/payments'], paymentRoutes);
app.use(['/api/orders', '/orders'], orderRoutes);
app.use(['/api/upload', '/upload'], uploadRoutes);
app.use(['/api/admin', '/admin'], adminRoutes);

app.get(['/api/health', '/health'], (req, res) => {
  res.json({ status: 'ok', service: 'Style Walk API', timestamp: new Date().toISOString() });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[UNHANDLED EXPRESS ERROR]:', err);
  res.status(500).json({
    error: err.message || 'Internal Server Error',
    path: req.path
  });
});

if (process.env.NODE_ENV !== 'test' && !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`⚡ Style Walk Backend API server running on port ${PORT}`);
  });
}

module.exports = app;
