const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true },
  images: [{ type: String }], // Array to store multiple image URLs
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Reference to User
  status: { type: String, enum: ["available", "traded"], default: "available" }, // Status of product
  tradeRequests: [
    {
      requester: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Who requested the trade
      status: {
        type: String,
        enum: ["pending", "accepted", "rejected"],
        default: "pending",
      },
      offeredProduct: { type: mongoose.Schema.Types.ObjectId, ref: "Product" }, // Optional: what they are offering in return
    },
  ],
  createdAt: { type: Date, default: Date.now },
});

const Product = mongoose.model("Product", ProductSchema);
module.exports = Product;
