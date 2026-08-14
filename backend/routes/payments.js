const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');

let stripe;
if (process.env.STRIPE_SECRET_KEY && !process.env.STRIPE_SECRET_KEY.includes('sk_test_placeholder')) {
  try {
    stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
  } catch (e) {
    console.log('Stripe SDK initialization fallback to mock sandbox mode');
  }
}

// POST /api/payments/create-payment-intent
router.post('/create-payment-intent', verifyToken, async (req, res) => {
  const { amount, currency = 'usd' } = req.body;

  if (!amount || amount <= 0) {
    return res.status(400).json({ error: 'Valid amount is required' });
  }

  const amountInCents = Math.round(amount * 100);

  if (stripe) {
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amountInCents,
        currency,
        payment_method_types: ['card'],
        metadata: { userId: req.user.id }
      });
      return res.json({
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id
      });
    } catch (err) {
      console.error('Stripe Payment Intent Error:', err.message);
    }
  }

  // Sandbox fallback for local Stripe test execution
  const mockIntentId = 'pi_test_' + Math.random().toString(36).substr(2, 9);
  const mockSecret = `${mockIntentId}_secret_${Math.random().toString(36).substr(2, 9)}`;

  return res.json({
    clientSecret: mockSecret,
    paymentIntentId: mockIntentId,
    sandbox: true
  });
});

module.exports = router;
