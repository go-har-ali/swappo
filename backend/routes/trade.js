const express = require("express");
const Trade = require("../models/Trade");
const Product = require("../models/Product");
const router = express.Router();

// Request a trade
router.post("/", async (req, res) => {
  try {
    const { user1ProductId, user2ProductId } = req.body;

    const user1Product = await Product.findById(user1ProductId);
    const user2Product = await Product.findById(user2ProductId);

    if (!user1Product || !user2Product) {
      return res.status(404).json({ error: "One or both products not found" });
    }

    let amountToPay = 0;
    let payer = null;

    if (user1Product.price > user2Product.price) {
      amountToPay = user1Product.price - user2Product.price;
      payer = user2Product.owner; // User 2 needs to pay
    } else if (user2Product.price > user1Product.price) {
      amountToPay = user2Product.price - user1Product.price;
      payer = user1Product.owner; // User 1 needs to pay
    }

    const newTrade = new Trade({
      user1: user1Product.owner,
      user2: user2Product.owner,
      user1Product,
      user2Product,
      amountToPay,
      payer,
      status: "pending",
    });

    await newTrade.save();
    res.status(201).json(newTrade);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// Accept trade and update product status
router.put("/:tradeId/accept", async (req, res) => {
  try {
    const trade = await Trade.findById(req.params.tradeId);

    if (!trade) return res.status(404).json({ error: "Trade not found" });

    trade.status = "completed";
    await trade.save();

    await Product.findByIdAndUpdate(trade.user1Product, { status: "traded" });
    await Product.findByIdAndUpdate(trade.user2Product, { status: "traded" });

    res.json({ message: "Trade completed successfully" });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
