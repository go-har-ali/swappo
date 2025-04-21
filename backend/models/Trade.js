const mongoose = require("mongoose");

const TradeSchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  fromUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  toUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  requestedProduct: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
  offeredProduct: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
  status: { type: String, default: "pending" },
  priceDifference: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

const Trade = mongoose.model("Trade", TradeSchema);
module.exports = Trade;

// const mongoose = require("mongoose");

// const TradeSchema = new mongoose.Schema({
//   user1: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
//   user2: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
//   user1Product: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "Product",
//     required: true,
//   },
//   user2Product: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "Product",
//     required: true,
//   },
//   amountToPay: { type: Number, default: 0 },
//   payer: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
//   status: {
//     type: String,
//     enum: ["pending", "completed", "cancelled"],
//     default: "pending",
//   },
//   createdAt: { type: Date, default: Date.now },
// });

// const Trade = mongoose.model("Trade", TradeSchema);
// module.exports = Trade;
