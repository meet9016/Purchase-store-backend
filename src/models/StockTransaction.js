const mongoose = require('mongoose');

const stockTransactionSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      default: Date.now,
    },
    item: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Item',
      required: true,
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
    },
    transactionType: {
      type: String,
      enum: ['Inward', 'Outward'],
      required: true,
    },
    referenceNumber: {
      type: String, // GRN Number or Issue Number
      required: true,
    },
    inwardQty: {
      type: Number,
      default: 0,
    },
    outwardQty: {
      type: Number,
      default: 0,
    },
    balanceQty: {
      type: Number,
      required: true,
      min: [0, 'Balance quantity cannot be negative'],
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const StockTransaction = mongoose.model('StockTransaction', stockTransactionSchema);

module.exports = StockTransaction;
