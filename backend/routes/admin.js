const express = require('express');
const router = express.Router();
const db = require('../database');
const { verifyToken, requireAdmin } = require('../middleware/auth');

// GET /api/admin/qr-code - Fetch Store Admin UPI QR Code
router.get('/qr-code', (req, res) => {
  db.get("SELECT value FROM AdminSettings WHERE key = 'admin_qr_code'", (err, row) => {
    if (err || !row) {
      return res.json({
        qr_code: 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=upi://pay?pa=stylewalk@upi%26pn=StyleWalk%20Store%26cu=INR'
      });
    }
    res.json({ qr_code: row.value });
  });
});

// POST /api/admin/qr-code - Update Store Admin UPI QR Code URL / Text
router.post('/qr-code', verifyToken, requireAdmin, (req, res) => {
  const { qr_code } = req.body;
  if (!qr_code) {
    return res.status(400).json({ error: 'QR Code URL or image data is required.' });
  }

  db.run(
    "INSERT INTO AdminSettings (key, value) VALUES ('admin_qr_code', ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value",
    [qr_code],
    (err) => {
      if (err) return res.status(500).json({ error: 'Failed to update admin QR code.' });
      res.json({ message: 'Admin QR Code updated successfully!', qr_code });
    }
  );
});

// POST /api/admin/orders/:id/verify-payment - Accept or Reject Online Payment
router.post('/orders/:id/verify-payment', verifyToken, requireAdmin, (req, res) => {
  const orderId = req.params.id;
  const { action, rejection_reason } = req.body;

  if (!action || !['ACCEPT', 'REJECT'].includes(action)) {
    return res.status(400).json({ error: "Action must be either 'ACCEPT' or 'REJECT'." });
  }

  if (action === 'ACCEPT') {
    const nowIso = new Date().toISOString();
    db.get('SELECT status_history, created_at FROM Orders WHERE id = ?', [orderId], (errRow, row) => {
      let history = {};
      if (row && row.status_history) {
        try { history = JSON.parse(row.status_history); } catch (e) {}
      }
      if (!history.placed_at) history.placed_at = row?.created_at || nowIso;
      history.confirmed_at = nowIso;
      const historyJson = JSON.stringify(history);

      const sql = `
        UPDATE Orders
        SET payment_status = 'Payment Approved',
            order_status = 'Confirmed',
            status_history = ?,
            rejection_reason = NULL
        WHERE id = ?
      `;

      db.run(sql, [historyJson, orderId], function (err) {
        if (err) return res.status(500).json({ error: 'Failed to accept payment: ' + err.message });
        if (this.changes === 0) return res.status(404).json({ error: 'Order not found.' });

        res.json({
          message: 'Payment approved successfully! Order is now confirmed.',
          orderId,
          payment_status: 'Payment Approved',
          order_status: 'Confirmed',
          status_history: historyJson
        });
      });
    });
  } else if (action === 'REJECT') {
    if (!rejection_reason || !rejection_reason.trim()) {
      return res.status(400).json({ error: 'Mandatory rejection reason is required when rejecting payment.' });
    }

    const reasonClean = rejection_reason.trim();
    const sql = `
      UPDATE Orders
      SET payment_status = 'Payment Rejected',
          order_status = 'Cancelled',
          rejection_reason = ?
      WHERE id = ?
    `;

    db.run(sql, [reasonClean, orderId], function (err) {
      if (err) return res.status(500).json({ error: 'Failed to reject payment: ' + err.message });
      if (this.changes === 0) return res.status(404).json({ error: 'Order not found.' });

      res.json({
        message: 'Payment rejected. Order has been marked as Cancelled.',
        orderId,
        payment_status: 'Payment Rejected',
        order_status: 'Cancelled',
        rejection_reason: reasonClean
      });
    });
  }
});

module.exports = router;
