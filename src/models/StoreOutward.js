const mongoose = require('mongoose');

const storeOutwardItemSchema = new mongoose.Schema({
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
    default: 0,
    min: [0, 'Quantity cannot be negative'],
  },
  issueQuantity: {
    type: Number,
    default: 0,
  },
  unit: {
    type: String,
    default: 'Pcs',
  },
}, { _id: false });

const storeOutwardSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      trim: true,
    },
    outwardNumber: {
      type: String,
      trim: true,
      default: '',
    },
    issueNumber: {
      type: String,
      required: true,
      unique: true,
    },
    issueDate: {
      type: String,
      default: () => new Date().toISOString().split('T')[0],
    },
    date: {
      type: String,
      default: () => new Date().toISOString().split('T')[0],
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
    items: [storeOutwardItemSchema],
    issuedTo: {
      type: String,
      required: true,
      trim: true,
    },
    department: {
      type: String,
      trim: true,
      default: '',
    },
    purpose: {
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
      default: 'Issued',
    },
    issuedBy: {
      type: String,
      trim: true,
      default: '',
    },
    issuerName: {
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

storeOutwardSchema.pre('save', function () {
  if (!this.id && this._id) {
    this.id = this._id.toString();
  }
  if (!this.outwardNumber && this.issueNumber) {
    this.outwardNumber = this.issueNumber;
  }
});

const StoreOutward = mongoose.model('StoreOutward', storeOutwardSchema);

module.exports = StoreOutward;

