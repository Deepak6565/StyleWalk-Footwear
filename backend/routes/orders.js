const express = require('express');
const router = express.Router();
const db = require('../database');
const { verifyToken, requireAdmin } = require('../middleware/auth');

// POST /api/orders - Create Order (COD or ONLINE)
router.post('/', verifyToken, (req, res) => {
  const {
    items,
    subtotal,
    discount_amount,
    total_amount,
    coupon_used,
    payment_method,
    payment_screenshot,
    shipping_address
  } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Order must contain at least one product.' });
  }

  if (total_amount === undefined || !shipping_address) {
    return res.status(400).json({ error: 'Total amount and delivery address are required.' });
  }

  const method = (payment_method || 'COD').toUpperCase();
  if (!['COD', 'ONLINE'].includes(method)) {
    return res.status(400).json({ error: "Payment method must be 'COD' or 'ONLINE'." });
  }

  let paymentStatus = 'Confirmed';
  let orderStatus = 'Confirmed';
  let screenshotUrl = null;

  if (method === 'ONLINE') {
    if (!payment_screenshot || !payment_screenshot.trim()) {
      return res.status(400).json({ error: 'Payment screenshot upload proof is required for Online Payment.' });
    }
    paymentStatus = 'Payment Verification Pending';
    orderStatus = 'Payment Verification Pending';
    screenshotUrl = payment_screenshot.trim();
  }

  const userId = req.user.id;
  const itemsJson = JSON.stringify(items);
  const sub = Number(subtotal) || Number(total_amount);
  const disc = Number(discount_amount) || 0;
  const coupon = coupon_used || null;

  // Decrement stock for ordered products
  items.forEach(item => {
    const pId = item.productId || item.id;
    const qty = item.quantity || 1;
    if (pId) {
      db.run(
        'UPDATE Products SET stock_quantity = MAX(0, stock_quantity - ?) WHERE id = ?',
        [qty, pId],
        (err) => {
          if (err) console.error(`Failed to update stock for product ${pId}:`, err.message);
        }
      );
    }
  });

  const nowIso = new Date().toISOString();
  const initialHistory = JSON.stringify({
    placed_at: nowIso,
    confirmed_at: method === 'COD' ? nowIso : null,
    packed_at: null,
    shipped_at: null,
    delivered_at: null
  });

  const sql = `
    INSERT INTO Orders (
      user_id, items_json, subtotal, discount_amount, total_amount, coupon_used,
      payment_method, payment_status, payment_screenshot, rejection_reason, order_status, status_history, shipping_address
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NULL, ?, ?, ?)
  `;

  db.run(
    sql,
    [userId, itemsJson, sub, disc, Number(total_amount), coupon, method, paymentStatus, screenshotUrl, orderStatus, initialHistory, shipping_address],
    function (err) {
      if (err) return res.status(500).json({ error: 'Failed to record order: ' + err.message });

      res.status(201).json({
        message: method === 'COD' 
          ? 'COD Order confirmed successfully!' 
          : 'Online Order submitted! Payment Verification Pending.',
        orderId: this.lastID,
        payment_method: method,
        payment_status: paymentStatus,
        payment_screenshot: screenshotUrl,
        order_status: orderStatus,
        status_history: initialHistory,
        subtotal: sub,
        discount_amount: disc,
        total_amount: Number(total_amount),
        coupon_used: coupon
      });
    }
  );
});

// GET /api/orders/user - Customer Order History
router.get('/user', verifyToken, (req, res) => {
  const sql = `
    SELECT id, items_json, subtotal, discount_amount, total_amount, coupon_used,
           payment_method, payment_status, payment_screenshot, rejection_reason, order_status, status_history, shipping_address, created_at
    FROM Orders
    WHERE user_id = ?
    ORDER BY created_at DESC
  `;

  db.all(sql, [req.user.id], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Error fetching user orders' });

    const formatted = rows.map(r => ({
      ...r,
      items: JSON.parse(r.items_json || '[]')
    }));

    res.json(formatted);
  });
});

// GET /api/orders/all - Admin View All Orders
router.get('/all', verifyToken, requireAdmin, (req, res) => {
  const sql = `
    SELECT o.id, o.user_id, u.name as customer_name, u.email as customer_email,
           o.items_json, o.subtotal, o.discount_amount, o.total_amount, o.coupon_used,
           o.payment_method, o.payment_status, o.payment_screenshot, o.rejection_reason,
           o.order_status, o.status_history, o.shipping_address, o.created_at
    FROM Orders o
    JOIN Users u ON o.user_id = u.id
    ORDER BY o.created_at DESC
  `;

  db.all(sql, [], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Error fetching all orders' });

    const formatted = rows.map(r => ({
      ...r,
      items: JSON.parse(r.items_json || '[]')
    }));

    res.json(formatted);
  });
});

// PUT /api/orders/:id/status - Admin Update Order Fulfillment Status
router.put('/:id/status', verifyToken, requireAdmin, (req, res) => {
  const { order_status } = req.body;
  const validStatuses = ['Confirmed', 'Payment Verification Pending', 'Processing', 'Packed', 'In Transit', 'Shipped', 'Delivered', 'Cancelled'];

  if (!validStatuses.includes(order_status)) {
    return res.status(400).json({ error: 'Invalid order status.' });
  }

  db.get('SELECT status_history, created_at FROM Orders WHERE id = ?', [req.params.id], (errRow, row) => {
    let history = {};
    if (row && row.status_history) {
      try { history = JSON.parse(row.status_history); } catch (e) {}
    }

    const nowIso = new Date().toISOString();
    if (!history.placed_at) history.placed_at = row?.created_at || nowIso;

    if (['Confirmed', 'Processing', 'Packed', 'Shipped', 'In Transit', 'Delivered'].includes(order_status)) {
      if (!history.confirmed_at) history.confirmed_at = nowIso;
    }
    if (['Processing', 'Packed', 'Shipped', 'In Transit', 'Delivered'].includes(order_status)) {
      if (!history.packed_at) history.packed_at = nowIso;
    }
    if (['Shipped', 'In Transit', 'Delivered'].includes(order_status)) {
      if (!history.shipped_at) history.shipped_at = nowIso;
    }
    if (order_status === 'Delivered') {
      if (!history.delivered_at) history.delivered_at = nowIso;
    }

    const updatedHistoryJson = JSON.stringify(history);

    db.run(
      'UPDATE Orders SET order_status = ?, status_history = ? WHERE id = ?',
      [order_status, updatedHistoryJson, req.params.id],
      function (err) {
        if (err) return res.status(500).json({ error: 'Error updating order status' });
        if (this.changes === 0) return res.status(404).json({ error: 'Order not found' });

        res.json({ message: 'Order status updated successfully', orderId: req.params.id, order_status, status_history: updatedHistoryJson });
      }
    );
  });
});

module.exports = router;
