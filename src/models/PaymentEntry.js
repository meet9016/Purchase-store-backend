const mongoose = require('mongoose');

const paymentEntrySchema = new mongoose.Schema(
  {
    paymentId: {
      type: String, // Auto-generated payment serial code
      required: true,
      unique: true,
    },
    paymentDate: {
      type: Date,
      default: Date.now,
    },
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
    paymentAmount: {
      type: Number,
      required: true,
      min: [1, 'Payment amount must be greater than 0'],
    },
    paymentMode: {
      type: String,
      enum: ['Bank Transfer/NEFT/RTGS', 'Cheque', 'UPI', 'Cash'],
      required: true,
    },
    transactionNumber: {
      type: String, // Transaction hash or UTR or Cheque Number
      required: true,
      trim: true,
    },
    remarks: {
      type: String,
      trim: true,
    },
    attachmentUrl: {
      type: String,
      trim: true,
    },
    enteredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const PaymentEntry = mongoose.model('PaymentEntry', paymentEntrySchema);

module.exports = PaymentEntry;
