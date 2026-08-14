const express = require('express');
const router = express.Router();
const db = require('../database');

// POST /api/coupons/validate
router.post('/validate', (req, res) => {
  const { code, subtotal } = req.body;

  if (!code || typeof code !== 'string') {
    return res.status(400).json({ error: 'Coupon code is required.' });
  }

  const cleanCode = code.trim().toUpperCase();

  db.get('SELECT * FROM Coupons WHERE code = ? AND active = 1', [cleanCode], (err, coupon) => {
    if (err) return res.status(500).json({ error: 'Database error while checking coupon' });

    if (!coupon) {
      return res.status(404).json({ valid: false, error: 'Invalid coupon code. Use DESI10 or FESTIVE20' });
    }

    const sub = Number(subtotal) || 0;
    let discountAmount = 0;

    if (coupon.discount_type === 'percent' || coupon.discount_type === 'percentage') {
      discountAmount = (sub * coupon.discount_value) / 100;
    } else if (coupon.discount_type === 'flat' || coupon.discount_type === 'fixed') {
      discountAmount = coupon.discount_value;
    }

    discountAmount = Math.min(discountAmount, sub); // Cannot exceed subtotal

    res.json({
      valid: true,
      code: coupon.code,
      discount_type: coupon.discount_type,
      discount_value: coupon.discount_value,
      discount_amount: Math.round(discountAmount * 100) / 100
    });
  });
});

module.exports = router;
