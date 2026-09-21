const mongoose = require('mongoose');

const unitSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, 'Unit code is required (e.g. MT, Pcs, Bag, Kg)'],
      unique: true,
      trim: true,
    },
    name: {
      type: String,
      required: [true, 'Unit name is required (e.g. Metric Ton, Pieces, Bags)'],
      trim: true,
    },
    status: {
      type: String,
      enum: ['Active', 'Inactive'],
      default: 'Active',
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.id = ret._id.toString();
        delete ret.__v;
        return ret;
      },
    },
    toObject: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.id = ret._id.toString();
        delete ret.__v;
        return ret;
      },
    },
  }
);

const Unit = mongoose.model('Unit', unitSchema);

module.exports = Unit;
