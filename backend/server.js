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

app.use(cors());
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));


// Serve static uploads directory for payment screenshots and QR codes
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/admin', adminRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'Style Walk API', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`⚡ Style Walk Backend API server running on port ${PORT}`);
});
