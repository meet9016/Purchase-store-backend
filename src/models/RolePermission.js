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
      required: [true, 'Role name is required'],
      unique: true,
      trim: true,
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

const RolePermission = mongoose.model('RolePermission', rolePermissionSchema);

module.exports = RolePermission;
