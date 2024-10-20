const mongoose = require("mongoose");
const Product = require("../models/Product");
const User = require("../models/Users");

const orderSchema = new mongoose.Schema(
  {
    trackingNumber: {
      type: String,
      default: () => new mongoose.Types.ObjectId().toString(),
      unique: true,
      required: true,
    },
    products: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
          id: true,
        },
        color: { type: String, required: true },
        size: { type: String, required: true },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true },
      },
    ],
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["payée", "expédiée", "reçue"],
      default: "payée",
    },
    statusHistory: [
      {
        status: {
          type: String,
          enum: ["payée", "expédiée", "reçue"],
        },
        startDate: { type: Date, default: new Date() },
      },
    ],
    total: { type: Number, required: true },
    billingAddress: { type: String },
    shippingAddress: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

const Order = mongoose.model("Order", orderSchema);

module.exports = Order;
