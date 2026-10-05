const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      trim: true,
    },
    user: {
      type: mongoose.Schema.Types.Mixed,
    },
    userId: {
      type: String,
      trim: true,
      default: '',
    },
    userName: {
      type: String,
      trim: true,
      default: '',
    },
    userRole: {
      type: String,
      trim: true,
      default: '',
    },
    action: {
      type: String,
      required: true,
      trim: true,
    },
    oldValue: {
      type: String,
      trim: true,
      default: '',
    },
    newValue: {
      type: String,
      trim: true,
      default: '',
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    module: {
      type: String,
      required: true,
      trim: true,
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

auditLogSchema.pre('save', function () {
  if (!this.id && this._id) {
    this.id = this._id.toString();
  }
});

const AuditLog = mongoose.model('AuditLog', auditLogSchema);

module.exports = AuditLog;

