const mongoose = require('mongoose');

const grnItemSchema = new mongoose.Schema({
  item: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Item',
    required: true,
  },
  orderedQty: {
    type: Number,
    required: true,
  },
  receivedQty: {
    type: Number,
    required: true,
    min: [0, 'Received quantity cannot be negative'],
  },
  shortQty: {
    type: Number,
    default: 0,
  },
  excessQty: {
    type: Number,
    default: 0,
  },
  damagedQty: {
    type: Number,
    default: 0,
  },
  unit: {
    type: String,
    required: true,
  },
  batchNumber: {
    type: String,
    trim: true,
  },
});

const grnSchema = new mongoose.Schema(
  {
    grnNumber: {
      type: String,
      required: true,
      unique: true,
    },
    grnDate: {
      type: Date,
      default: Date.now,
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
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vendor',
      required: true,
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
    },
    items: [grnItemSchema],
    vehicleNumber: {
      type: String,
      trim: true,
    },
    challanNumber: {
      type: String,
      trim: true,
    },
    vendorInvoiceNumber: {
      type: String,
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
    receivedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const GRN = mongoose.model('GRN', grnSchema);

module.exports = GRN;
