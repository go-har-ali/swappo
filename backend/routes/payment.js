const express = require("express");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const Trade = require("../models/Trade");

const router = express.Router();

router.post("/pay", async (req, res) => {
  const { tradeId, paymentMethodId } = req.body;

  try {
    const trade = await Trade.findById(tradeId);
    if (!trade || trade.status !== "pending") {
      return res.status(400).json({ error: "Invalid trade" });
    }

    if (trade.priceDifference > 0) {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: trade.priceDifference * 100, // Stripe accepts amounts in cents
        currency: "usd",
        payment_method: paymentMethodId,
        confirm: true,
      });

      trade.status = "completed";
      await trade.save();

      return res.status(200).json({ message: "Payment successful", trade });
    }

    res.status(400).json({ error: "No payment needed" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
