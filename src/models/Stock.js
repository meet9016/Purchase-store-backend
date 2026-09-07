const mongoose = require('mongoose');

const stockSchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
    },
    item: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Item',
      required: true,
    },
    quantity: {
      type: Number,
      default: 0,
      min: [0, 'Available stock cannot be negative'],
    },
  },
  {
    timestamps: true,
  }
);

stockSchema.index({ project: 1, item: 1 }, { unique: true });

const Stock = mongoose.model('Stock', stockSchema);

module.exports = Stock;
