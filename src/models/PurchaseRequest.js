const mongoose = require('mongoose');

const prItemSchema = new mongoose.Schema({
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
  remarks: {
    type: String,
    trim: true,
    default: '',
  },
}, { _id: false });

const timelineSchema = new mongoose.Schema({
  status: {
    type: String,
    default: 'Submitted',
  },
  user: {
    type: String,
    default: 'System',
  },
  timestamp: {
    type: String,
    default: () => new Date().toISOString(),
  },
  remarks: {
    type: String,
    trim: true,
    default: '',
  },
}, { _id: false });

const purchaseRequestSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      trim: true,
    },
    prNumber: {
      type: String,
      required: true,
      unique: true,
    },
    requestDate: {
      type: String,
      default: () => new Date().toISOString().split('T')[0],
    },
    projectId: {
      type: String,
      trim: true,
    },
    projectName: {
      type: String,
      trim: true,
      default: '',
    },
    project: {
      type: mongoose.Schema.Types.Mixed,
    },
    requestedBy: {
      type: String,
      trim: true,
    },
    requesterName: {
      type: String,
      trim: true,
      default: '',
    },
    requiredDate: {
      type: String,
      trim: true,
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Urgent'],
      default: 'Medium',
    },
    items: [prItemSchema],
    status: {
      type: String,
      default: 'Submitted',
    },
    rejectionReason: {
      type: String,
      trim: true,
      default: '',
    },
    attachmentUrl: {
      type: String,
      trim: true,
      default: '',
    },
    history: [timelineSchema],
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

purchaseRequestSchema.pre('save', function () {
  if (!this.id && this._id) {
    this.id = this._id.toString();
  }
});

const PurchaseRequest = mongoose.model('PurchaseRequest', purchaseRequestSchema);

module.exports = PurchaseRequest;

