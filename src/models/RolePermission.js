const mongoose = require('mongoose');

const actionCapabilitySchema = new mongoose.Schema({
  viewGlobal: { type: Boolean, default: false },
  viewOwn: { type: Boolean, default: false },
  create: { type: Boolean, default: false },
  update: { type: Boolean, default: false },
  delete: { type: Boolean, default: false },
}, { _id: false });

const rolePermissionSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      required: [true, 'Role identifier is required'],
      unique: true,
      trim: true,
    },
    name: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    isSystemRole: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ['Active', 'Inactive'],
      default: 'Active',
    },
    modules: [
      {
        type: String,
      },
    ],
    // Granular feature-wise capability permissions matrix
    permissions: {
      type: Map,
      of: actionCapabilitySchema,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save hook to ensure name matches role if not explicitly provided
rolePermissionSchema.pre('save', function () {
  if (!this.name && this.role) {
    this.name = this.role;
  }
});

const RolePermission = mongoose.model('RolePermission', rolePermissionSchema);

module.exports = RolePermission;

