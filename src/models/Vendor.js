const mongoose = require('mongoose');

const vendorSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      trim: true,
    },
    name: {
      type: String,
      required: [true, 'Vendor name is required'],
      trim: true,
    },
    contactPerson: {
      type: String,
      trim: true,
      default: '',
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: '',
    },
    phone: {
      type: String,
      trim: true,
      default: '',
    },
    gstNo: {
      type: String,
      trim: true,
      default: '',
    },
    panNo: {
      type: String,
      trim: true,
      default: '',
    },
    bankDetails: {
      bankName: { type: String, trim: true, default: '' },
      accountNo: { type: String, trim: true, default: '' },
      ifscCode: { type: String, trim: true, default: '' },
    },
    creditPeriod: {
      type: Number,
      default: 30,
    },
    address: {
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

vendorSchema.pre('save', function () {
  if (!this.id && this._id) {
    this.id = this._id.toString();
  }
});

const Vendor = mongoose.model('Vendor', vendorSchema);

module.exports = Vendor;

