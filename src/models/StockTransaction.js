const mongoose = require('mongoose');

const stockTransactionSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      trim: true,
    },
    date: {
      type: String,
      default: () => new Date().toISOString().split('T')[0],
    },
    transactionDate: {
      type: String,
      default: () => new Date().toISOString().split('T')[0],
    },
    itemId: {
      type: String,
      trim: true,
      default: '',
    },
    itemName: {
      type: String,
      trim: true,
      default: '',
    },
    item: {
      type: mongoose.Schema.Types.Mixed,
    },
    projectId: {
      type: String,
      trim: true,
      default: '',
    },
    project: {
      type: mongoose.Schema.Types.Mixed,
    },
    type: {
      type: String,
      default: 'IN',
    },
    transactionType: {
      type: String,
      default: 'Inward',
    },
    referenceId: {
      type: String,
      trim: true,
      default: '',
    },
    referenceNumber: {
      type: String,
      trim: true,
      default: '',
    },
    referenceType: {
      type: String,
      trim: true,
      default: 'GRN',
    },
    quantity: {
      type: Number,
      default: 0,
    },
    inwardQty: {
      type: Number,
      default: 0,
    },
    outwardQty: {
      type: Number,
      default: 0,
    },
    balanceQty: {
      type: Number,
      default: 0,
    },
    user: {
      type: mongoose.Schema.Types.Mixed,
    },
    createdBy: {
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

stockTransactionSchema.pre('save', function () {
  if (!this.id && this._id) {
    this.id = this._id.toString();
  }
});

const StockTransaction = mongoose.model('StockTransaction', stockTransactionSchema);

module.exports = StockTransaction;

