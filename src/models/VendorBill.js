const mongoose = require('mongoose');

const vendorBillSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      trim: true,
    },
    billNumber: {
      type: String,
      required: true,
      unique: true,
    },
    vendorInvoiceNumber: {
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
    billDate: {
      type: String,
      default: () => new Date().toISOString().split('T')[0],
    },
    billAmount: {
      type: Number,
      required: true,
      min: [0, 'Bill amount cannot be negative'],
    },
    creditPeriod: {
      type: Number,
      default: 30,
    },
    dueDate: {
      type: String,
      trim: true,
      default: '',
    },
    paidAmount: {
      type: Number,
      default: 0,
    },
    outstandingAmount: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      default: 'Pending',
    },
    paymentStatus: {
      type: String,
      default: 'Upcoming',
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

vendorBillSchema.pre('save', function () {
  if (!this.id && this._id) {
    this.id = this._id.toString();
  }
});

const VendorBill = mongoose.model('VendorBill', vendorBillSchema);

module.exports = VendorBill;

