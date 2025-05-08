// routes/users.js
const express = require("express");
const router = express.Router();
const User = require("../models/User");

// GET /api/users/:userId/stripe-account
router.get("/:userId/stripe-account", async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select(
      "stripeAccountId"
    );
    if (!user) return res.status(404).json({ error: "User not found" });

    res.json({ stripeAccountId: user.stripeAccountId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
