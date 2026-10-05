const mongoose = require('mongoose');

const stockSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      trim: true,
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
    itemId: {
      type: String,
      trim: true,
    },
    itemName: {
      type: String,
      trim: true,
      default: '',
    },
    itemCode: {
      type: String,
      trim: true,
      default: '',
    },
    categoryName: {
      type: String,
      trim: true,
      default: '',
    },
    item: {
      type: mongoose.Schema.Types.Mixed,
    },
    unit: {
      type: String,
      default: 'Pcs',
    },
    currentStock: {
      type: Number,
      default: 0,
    },
    quantity: {
      type: Number,
      default: 0,
    },
    minStock: {
      type: Number,
      default: 0,
    },
    reorderLevel: {
      type: Number,
      default: 0,
    },
    location: {
      type: String,
      trim: true,
      default: 'Main Store',
    },
    lastUpdated: {
      type: String,
      default: () => new Date().toISOString(),
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

stockSchema.pre('save', function () {
  if (!this.id && this._id) {
    this.id = this._id.toString();
  }
  if (this.currentStock !== undefined && this.quantity === 0) {
    this.quantity = this.currentStock;
  }
});

const Stock = mongoose.model('Stock', stockSchema);

module.exports = Stock;

