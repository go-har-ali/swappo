// routes/cartRoutes.js
const express = require("express");
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const { verifyToken } = require("../middlewares/authMiddleware");

const router = express.Router();

// Get current user's cart
router.get("/", verifyToken, async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id }).populate(
    "items.productId"
  );
  res.json(cart || { items: [] });
});

// Add to cart
router.post("/add", verifyToken, async (req, res) => {
  const { productId, quantity } = req.body;
  let cart = await Cart.findOne({ user: req.user._id });

  if (!cart) cart = new Cart({ user: req.user._id, items: [] });

  const existingItem = cart.items.find(
    (item) => item.productId.toString() === productId
  );
  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    cart.items.push({ productId, quantity });
  }

  await cart.save();
  res.json(cart);
});

// Update quantity
router.put("/update", verifyToken, async (req, res) => {
  const { productId, quantity } = req.body;

  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) return res.status(404).json({ error: "Cart not found" });

  const item = cart.items.find(
    (item) => item.productId.toString() === productId
  );
  if (item) item.quantity = quantity;

  await cart.save();
  res.json(cart);
});

// Remove item
router.delete("/remove/:productId", verifyToken, async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id });
  cart.items = cart.items.filter(
    (item) => item.productId.toString() !== req.params.productId
  );
  await cart.save();
  res.json(cart);
});

// Clear cart
router.delete("/clear", verifyToken, async (req, res) => {
  await Cart.findOneAndDelete({ user: req.user._id });
  res.json({ message: "Cart cleared" });
});

module.exports = Cart;
