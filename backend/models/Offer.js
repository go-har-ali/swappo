// models/Offer.js
const mongoose = require("mongoose");

const offerSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // client
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  }, // vendor
  offeredProduct: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  }, // client product
  requestedProduct: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  }, // vendor product
  status: {
    type: String,
    enum: ["pending", "accepted", "declined"],
    default: "pending",
  },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Offer", offerSchema);
