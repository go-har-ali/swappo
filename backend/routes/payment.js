// routes/payment.js
const express = require("express");
const router = express.Router();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

// POST /api/payment/checkout
router.post("/checkout", async (req, res) => {
  const { amount, product, connectedAccountId } = req.body;

  try {
    // Create PaymentIntent for Connected Account
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100, // convert to cents
      currency: "usd",
      payment_method_types: ["card"],
      application_fee_amount: Math.round(amount * 0.1 * 100), // 10% fee to platform
      transfer_data: {
        destination: connectedAccountId, // the seller's connected Stripe account
      },
    });

    res.send({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Payment failed" });
  }
});

module.exports = router;
