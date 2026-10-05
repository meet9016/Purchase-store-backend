const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
  {
    id: {
      type: String,
      trim: true,
    },
    name: {
      type: String,
      required: [true, 'Category name is required'],
      unique: true,
      trim: true,
    },
    description: {
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

categorySchema.pre('save', function () {
  if (!this.id && this._id) {
    this.id = this._id.toString();
  }
});

const Category = mongoose.model('Category', categorySchema);

module.exports = Category;

