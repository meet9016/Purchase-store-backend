const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const ApiResponse = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');

const collectionKeys = [
  { key: 'users', dbName: 'users' },
  { key: 'projects', dbName: 'projects' },
  { key: 'vendors', dbName: 'vendors' },
  { key: 'categories', dbName: 'categories' },
  { key: 'items', dbName: 'items' },
  { key: 'purchaseRequests', dbName: 'purchaserequests' },
  { key: 'purchaseOrders', dbName: 'purchaseorders' },
  { key: 'grns', dbName: 'grns' },
  { key: 'stock', dbName: 'stock' },
  { key: 'stockTransactions', dbName: 'stocktransactions' },
  { key: 'storeOutwards', dbName: 'storeoutwards' },
  { key: 'vendorBills', dbName: 'vendorbills' },
  { key: 'paymentRequests', dbName: 'paymentrequests' },
  { key: 'paymentEntries', dbName: 'paymententries' },
  { key: 'auditLogs', dbName: 'auditlogs' },
  { key: 'notifications', dbName: 'notifications' },
  { key: 'rolePermissions', dbName: 'rolepermissions' },
];

// GET /api/sync - Fetch all collections from MongoDB
exports.getSyncState = asyncHandler(async (req, res) => {
  const db = mongoose.connection.db;
  if (!db || mongoose.connection.readyState !== 1) {
    return ApiResponse.error(res, 'Database connection is currently not ready', 503);
  }

  const state = {};
  for (const item of collectionKeys) {
    const col = db.collection(item.dbName);
    const docs = await col.find({}).toArray();
    state[item.key] = docs.map((d) => {
      const { _id, ...rest } = d;
      return rest;
    });
  }

  // If database is completely unseeded, return empty flag
  if (!state.users || state.users.length === 0) {
    return ApiResponse.success(res, null, 'Database is fresh and requires initial seed', 200);
  }

  return ApiResponse.success(res, state, 'Database state synchronized');
});

// POST /api/sync - Overwrite and synchronize MongoDB collections with updated frontend state
exports.saveSyncState = asyncHandler(async (req, res) => {
  const db = mongoose.connection.db;
  if (!db || mongoose.connection.readyState !== 1) {
    return ApiResponse.error(res, 'Database connection is currently not ready', 503);
  }

  const dbState = req.body;
  if (!dbState || typeof dbState !== 'object') {
    return ApiResponse.badRequest(res, 'Invalid database state payload');
  }

  for (const item of collectionKeys) {
    const col = db.collection(item.dbName);
    await col.deleteMany({});
    const docs = dbState[item.key];

    if (Array.isArray(docs) && docs.length > 0) {
      let cleanDocs = docs
        .map((d) => {
          if (!d || typeof d !== 'object') return null;
          const { _id, ...rest } = d;
          return rest;
        })
        .filter(Boolean);

      // Deduplication & password hashing for Users collection
      if (item.key === 'users') {
        const emailMap = new Map();
        for (const u of cleanDocs) {
          if (!u.email) continue;
          const emailKey = u.email.toLowerCase().trim();

          let userPassword = u.password;
          if (!userPassword) {
            userPassword = bcrypt.hashSync('123456', 10);
          } else if (!userPassword.startsWith('$2a$') && !userPassword.startsWith('$2b$')) {
            userPassword = bcrypt.hashSync(userPassword, 10);
          }

          emailMap.set(emailKey, {
            ...u,
            email: emailKey,
            password: userPassword,
            active: u.active !== undefined ? u.active : true,
          });
        }
        cleanDocs = Array.from(emailMap.values());
      } else {
        const idMap = new Map();
        for (const doc of cleanDocs) {
          if (doc.id) {
            idMap.set(doc.id, doc);
          } else {
            idMap.set(JSON.stringify(doc), doc);
          }
        }
        cleanDocs = Array.from(idMap.values());
      }

      if (cleanDocs.length > 0) {
        try {
          await col.insertMany(cleanDocs, { ordered: false });
        } catch (insertErr) {
          console.warn(`Sync warning on ${item.dbName}:`, insertErr.message);
        }
      }
    }
  }

  return ApiResponse.success(res, null, 'Database state synchronized to MongoDB successfully');
});
