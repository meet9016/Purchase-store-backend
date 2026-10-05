const mongoose = require('mongoose');

const grnItemSchema = new mongoose.Schema({
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
  orderedQty: {
    type: Number,
    default: 0,
  },
  receivedQty: {
    type: Number,
    default: 0,
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
    default: 'Pcs',
  },
  batchNumber: {
    type: String,
    trim: true,
    default: '',
  },
}, { _id: false });

const grnSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      trim: true,
    },
    grnNumber: {
      type: String,
      required: true,
      unique: true,
    },
    grnDate: {
      type: String,
      default: () => new Date().toISOString().split('T')[0],
    },
    receivedDate: {
      type: String,
      trim: true,
      default: '',
    },
    poId: {
      type: String,
      trim: true,
      default: '',
    },
    poNumber: {
      type: String,
      trim: true,
      default: '',
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
    items: [grnItemSchema],
    vehicleNumber: {
      type: String,
      trim: true,
      default: '',
    },
    challanNumber: {
      type: String,
      trim: true,
      default: '',
    },
    vendorInvoiceNumber: {
      type: String,
      trim: true,
      default: '',
    },
    remarks: {
      type: String,
      trim: true,
      default: '',
    },
    attachmentUrl: {
      type: String,
      trim: true,
      default: '',
    },
    status: {
      type: String,
      default: 'Verified',
    },
    receivedBy: {
      type: String,
      trim: true,
      default: '',
    },
    receiverName: {
      type: String,
      trim: true,
      default: '',
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

grnSchema.pre('save', function () {
  if (!this.id && this._id) {
    this.id = this._id.toString();
  }
});

const GRN = mongoose.model('GRN', grnSchema);

module.exports = GRN;

