const mongoose = require('mongoose');

const poItemSchema = new mongoose.Schema({
  item: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Item',
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, 'Quantity must be at least 1'],
  },
  rate: {
    type: Number,
    required: true,
    min: [0, 'Rate cannot be negative'],
  },
  tax: {
    type: Number,
    default: 0, // Tax percentage
  },
  discount: {
    type: Number,
    default: 0, // Discount amount
  },
  totalAmount: {
    type: Number,
    required: true,
  },
});

const purchaseOrderSchema = new mongoose.Schema(
  {
    poNumber: {
      type: String,
      required: true,
      unique: true,
    },
    poDate: {
      type: Date,
      default: Date.now,
    },
    prNumber: {
      type: String, // Keep reference string for quick viewing
      required: true,
    },
    prId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PurchaseRequest',
      required: true,
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
    },
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vendor',
      required: true,
    },
    items: [poItemSchema],
    creditPeriod: {
      type: Number, // In days
      required: true,
    },
    expectedDeliveryDate: {
      type: Date,
      required: true,
    },
    deliveryLocation: {
      type: String,
      required: true,
      trim: true,
    },
    termsConditions: {
      type: String,
      trim: true,
    },
    remarks: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: [
        'Draft',
        'Approved',
        'Order Placed',
        'Acknowledged',
        'Partially Supplied',
        'Fully Supplied',
        'Closed',
      ],
      default: 'Draft',
    },
    totalPOAmount: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const PurchaseOrder = mongoose.model('PurchaseOrder', purchaseOrderSchema);

module.exports = PurchaseOrder;
