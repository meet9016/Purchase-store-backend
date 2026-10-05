const mongoose = require('mongoose');

const paymentEntrySchema = new mongoose.Schema(
  {
    id: {
      type: String,
      trim: true,
    },
    paymentId: {
      type: String,
      required: true,
      unique: true,
    },
    paymentNumber: {
      type: String,
      trim: true,
      default: '',
    },
    paymentDate: {
      type: String,
      default: () => new Date().toISOString().split('T')[0],
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
    paymentAmount: {
      type: Number,
      required: true,
      min: [0, 'Payment amount must be greater than 0'],
    },
    paymentMode: {
      type: String,
      default: 'Bank Transfer/NEFT/RTGS',
    },
    transactionNumber: {
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
    enteredBy: {
      type: String,
      trim: true,
      default: '',
    },
    enteredByName: {
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

paymentEntrySchema.pre('save', function () {
  if (!this.id && this._id) {
    this.id = this._id.toString();
  }
  if (!this.paymentNumber && this.paymentId) {
    this.paymentNumber = this.paymentId;
  }
});

const PaymentEntry = mongoose.model('PaymentEntry', paymentEntrySchema);

module.exports = PaymentEntry;

