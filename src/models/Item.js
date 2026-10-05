const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      trim: true,
    },
    itemCode: {
      type: String,
      required: [true, 'Item code is required'],
      unique: true,
      trim: true,
    },
    name: {
      type: String,
      required: [true, 'Item name is required'],
      trim: true,
    },
    categoryId: {
      type: String,
      trim: true,
    },
    categoryName: {
      type: String,
      trim: true,
    },
    category: {
      type: mongoose.Schema.Types.Mixed,
    },
    subCategory: {
      type: String,
      trim: true,
      default: '',
    },
    unit: {
      type: String,
      required: [true, 'Unit of measurement is required'],
      trim: true,
      default: 'Pcs',
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    minStock: {
      type: Number,
      default: 0,
    },
    reorderLevel: {
      type: Number,
      default: 0,
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

itemSchema.pre('save', function () {
  if (!this.id && this._id) {
    this.id = this._id.toString();
  }
});

const Item = mongoose.model('Item', itemSchema);

module.exports = Item;

