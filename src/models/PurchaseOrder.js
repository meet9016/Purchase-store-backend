const mongoose = require('mongoose');

const poItemSchema = new mongoose.Schema({
  itemId: {
    type: String,
    trim: true,
  },
  itemName: {
    type: String,
    trim: true,
  },
  item: {
    type: mongoose.Schema.Types.Mixed,
  },
  quantity: {
    type: Number,
    required: true,
    min: [0, 'Quantity cannot be negative'],
  },
  unit: {
    type: String,
    default: 'Pcs',
  },
  rate: {
    type: Number,
    default: 0,
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
  amount: {
    type: Number,
    default: 0,
  },
  totalAmount: {
    type: Number,
    default: 0,
  },
}, { _id: false });

const purchaseOrderSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      trim: true,
    },
    poNumber: {
      type: String,
      required: true,
      unique: true,
    },
    poDate: {
      type: String,
      default: () => new Date().toISOString().split('T')[0],
    },
    prNumber: {
      type: String,
      trim: true,
      default: '',
    },
    prId: {
      type: String,
      trim: true,
      default: '',
    },
    projectId: {
      type: String,
      trim: true,
      default: '',
    },
    projectName: {
      type: String,
      trim: true,
      default: '',
    },
    project: {
      type: mongoose.Schema.Types.Mixed,
    },
    vendorId: {
      type: String,
      trim: true,
      default: '',
    },
    vendorName: {
      type: String,
      trim: true,
      default: '',
    },
    vendor: {
      type: mongoose.Schema.Types.Mixed,
    },
    items: [poItemSchema],
    creditPeriod: {
      type: Number,
      default: 30,
    },
    expectedDeliveryDate: {
      type: String,
      trim: true,
      default: '',
    },
    deliveryLocation: {
      type: String,
      trim: true,
      default: '',
    },
    termsConditions: {
      type: String,
      trim: true,
      default: '',
    },
    remarks: {
      type: String,
      trim: true,
      default: '',
    },
    status: {
      type: String,
      default: 'Approved',
    },
    totalPOAmount: {
      type: Number,
      default: 0,
    },
    totalAmount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.id = ret.id || ret._id.toString();
        delete ret.__v;
        return ret;
      },
    },
    toObject: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.id = ret.id || ret._id.toString();
        delete ret.__v;
        return ret;
      },
    },
  }
);

purchaseOrderSchema.pre('save', function () {
  if (!this.id && this._id) {
    this.id = this._id.toString();
  }
});

const PurchaseOrder = mongoose.model('PurchaseOrder', purchaseOrderSchema);

module.exports = PurchaseOrder;

