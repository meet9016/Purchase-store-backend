const mongoose = require('mongoose');

const vendorBillSchema = new mongoose.Schema(
  {
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vendor',
      required: true,
    },
    poId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PurchaseOrder',
      required: true,
    },
    poNumber: {
      type: String,
      required: true,
    },
    billNumber: {
      type: String,
      required: true,
      unique: true,
    },
    billDate: {
      type: Date,
      required: true,
    },
    billAmount: {
      type: Number,
      required: true,
      min: [0, 'Bill amount cannot be negative'],
    },
    creditPeriod: {
      type: Number, // In days
      required: true,
    },
    dueDate: {
      type: Date,
      required: true,
    },
    paidAmount: {
      type: Number,
      default: 0,
      min: [0, 'Paid amount cannot be negative'],
    },
    outstandingAmount: {
      type: Number,
      required: true,
      min: [0, 'Outstanding amount cannot be negative'],
    },
    paymentStatus: {
      type: String,
      enum: [
        'Upcoming',
        'Due',
        'Payment Request Pending',
        'Payment Requested',
        'Partially Paid',
        'Paid',
        'Overdue',
      ],
      default: 'Upcoming',
    },
  },
  {
    timestamps: true,
  }
);

const VendorBill = mongoose.model('VendorBill', vendorBillSchema);

module.exports = VendorBill;
