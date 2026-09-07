const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

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
  { key: 'rolePermissions', dbName: 'rolepermissions' }
];

// GET /api/sync - Fetch all collections from MongoDB
exports.getSyncState = async (req, res) => {
  try {
    const db = mongoose.connection.db;
    if (!db) {
      return res.status(503).json({ status: 'error', message: 'Database connection not ready' });
    }

    const state = {};
    for (const item of collectionKeys) {
      const col = db.collection(item.dbName);
      const docs = await col.find({}).toArray();
      state[item.key] = docs.map(d => {
        const { _id, ...rest } = d;
        return rest;
      });
    }

    // Check if the database has any seeded users, otherwise return empty so the frontend can seed default parameters
    if (!state.users || state.users.length === 0) {
      return res.status(200).json({ status: 'empty', message: 'Seed required' });
    }

    res.status(200).json({ status: 'success', data: state });
  } catch (error) {
    console.error('getSyncState Error:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// POST /api/sync - Overwrite and synchronize MongoDB collections with updated frontend state
exports.saveSyncState = async (req, res) => {
  try {
    const db = mongoose.connection.db;
    if (!db) {
      return res.status(503).json({ status: 'error', message: 'Database connection not ready' });
    }

    const dbState = req.body;
    if (!dbState || typeof dbState !== 'object') {
      return res.status(400).json({ status: 'error', message: 'Invalid database payload' });
    }

    for (const item of collectionKeys) {
      const col = db.collection(item.dbName);
      await col.deleteMany({});
      const docs = dbState[item.key];

      if (Array.isArray(docs) && docs.length > 0) {
        let cleanDocs = docs.map(d => {
          if (!d || typeof d !== 'object') return null;
          const { _id, ...rest } = d;
          return rest;
        }).filter(Boolean);

        // Special deduplication and password hashing for Users collection
        if (item.key === 'users') {
          const emailMap = new Map();
          for (const u of cleanDocs) {
            if (!u.email) continue;
            const emailKey = u.email.toLowerCase().trim();
            
            // Hash password if plain text or reset
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
              active: u.active !== undefined ? u.active : true
            });
          }
          cleanDocs = Array.from(emailMap.values());
        } else {
          // Deduplicate other collections by 'id' if present
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
            // Handle duplicate key or bulk write errors gracefully without crashing sync
            console.warn(`Sync warning on ${item.dbName}:`, insertErr.message);
          }
        }
      }
    }

    res.status(200).json({ status: 'success', message: 'Database state synchronized to MongoDB' });
  } catch (error) {
    console.error('saveSyncState Error:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
};
