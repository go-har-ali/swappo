const express = require("express");
const router = express.Router();
const Trade = require("../models/Trade");
const Product = require("../models/Product");
const { verifyToken } = require("../middlewares/authMiddleware");

// GET /api/trade-requests/received
router.get("/received", verifyToken, async (req, res) => {
  try {
    //const { userId } = req.params;
    // const userId = req.user.id;
    const userId = req.user.userId; // 🔧 Corrected here
    console.log("Received trade requests for:", req.user.userId);

    // Find all trades where the requested product is owned by this user
    const trades = await Trade.find({
      toUserId: userId,
    })
      // .populate({
      //   path: "requestedProduct",
      //   populate: { path: "owner", model: "User" },
      // })
      // .populate({
      //   path: "offeredProduct",
      //   populate: { path: "owner", model: "User" }, // optional but useful
      // })
      // .populate("fromUserId")
      // .populate("toUserId")
      // .exec();

      .populate("offeredProduct")
      .populate("requestedProduct");

    console.log("Trade requests found:", trades);

    // Filter only the ones where the logged-in user owns the requested product
    const myRequests = trades.filter(
      (trade) => trade.requestedProduct?.owner?.toString() === userId
    );

    console.log("Matching trade requests:", myRequests);

    res.json(myRequests);
  } catch (err) {
    console.error("Error fetching received trade requests:", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
