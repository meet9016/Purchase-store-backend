const mongoose = require('mongoose');

const paymentRequestSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      trim: true,
    },
    requestId: {
      type: String,
      trim: true,
      default: '',
    },
    requestNumber: {
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
    billId: {
      type: String,
      trim: true,
      default: '',
    },
    billNumber: {
      type: String,
      trim: true,
      default: '',
    },
    poNumber: {
      type: String,
      trim: true,
      default: '',
    },
    billAmount: {
      type: Number,
      default: 0,
    },
    dueDate: {
      type: String,
      trim: true,
      default: '',
    },
    outstandingAmount: {
      type: Number,
      default: 0,
    },
    requestedAmount: {
      type: Number,
      required: true,
      min: [0, 'Requested amount must be positive'],
    },
    requestDate: {
      type: String,
      default: () => new Date().toISOString().split('T')[0],
    },
    requestedBy: {
      type: String,
      trim: true,
      default: '',
    },
    requesterName: {
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
      default: 'Pending',
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

paymentRequestSchema.pre('save', function () {
  if (!this.id && this._id) {
    this.id = this._id.toString();
  }
});

const PaymentRequest = mongoose.model('PaymentRequest', paymentRequestSchema);

module.exports = PaymentRequest;

