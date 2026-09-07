const mongoose = require('mongoose');

const paymentRequestSchema = new mongoose.Schema(
  {
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vendor',
      required: true,
    },
    billId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'VendorBill',
      required: true,
    },
    billNumber: {
      type: String,
      required: true,
    },
    poNumber: {
      type: String,
      required: true,
    },
    billAmount: {
      type: Number,
      required: true,
    },
    dueDate: {
      type: Date,
      required: true,
    },
    outstandingAmount: {
      type: Number,
      required: true,
    },
    requestedAmount: {
      type: Number,
      required: true,
      min: [1, 'Requested amount must be positive'],
    },
    requestDate: {
      type: Date,
      default: Date.now,
    },
    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    remarks: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected'],
      default: 'Pending',
    },
  },
  {
    timestamps: true,
  }
);

const PaymentRequest = mongoose.model('PaymentRequest', paymentRequestSchema);

module.exports = PaymentRequest;
