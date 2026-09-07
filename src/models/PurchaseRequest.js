const mongoose = require('mongoose');

const prItemSchema = new mongoose.Schema({
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
  unit: {
    type: String,
    required: true,
  },
  remarks: {
    type: String,
    trim: true,
  },
});

const timelineSchema = new mongoose.Schema({
  status: {
    type: String,
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  remarks: {
    type: String,
    trim: true,
  },
});

const purchaseRequestSchema = new mongoose.Schema(
  {
    prNumber: {
      type: String,
      required: true,
      unique: true,
    },
    requestDate: {
      type: Date,
      default: Date.now,
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
    },
    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    requiredDate: {
      type: Date,
      required: true,
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Urgent'],
      default: 'Medium',
    },
    items: [prItemSchema],
    status: {
      type: String,
      enum: [
        'Draft',
        'Submitted',
        'Under Review',
        'Approved',
        'Rejected',
        'PO Generated',
        'Order Placed',
        'Partially Received',
        'Fully Received',
        'Closed',
      ],
      default: 'Draft',
    },
    rejectionReason: {
      type: String,
      trim: true,
      required: function () {
        return this.status === 'Rejected';
      },
    },
    attachmentUrl: {
      type: String,
      trim: true,
    },
    history: [timelineSchema],
  },
  {
    timestamps: true,
  }
);

const PurchaseRequest = mongoose.model('PurchaseRequest', purchaseRequestSchema);

module.exports = PurchaseRequest;
