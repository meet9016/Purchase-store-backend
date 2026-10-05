const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      trim: true,
    },
    recipientRole: {
      type: String,
      default: 'All',
    },
    recipientUser: {
      type: String,
      trim: true,
      default: '',
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    read: {
      type: Boolean,
      default: false,
    },
    readBy: [
      {
        type: String,
      },
    ],
    referenceModule: {
      type: String,
      trim: true,
      default: '',
    },
    referenceId: {
      type: String,
      trim: true,
      default: '',
    },
    timestamp: {
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

notificationSchema.pre('save', function () {
  if (!this.id && this._id) {
    this.id = this._id.toString();
  }
});

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;

