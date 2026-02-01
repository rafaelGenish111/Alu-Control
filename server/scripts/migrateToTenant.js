/**
 * Migration script: add tenantId to all existing documents.
 * Default tenant: "default_glass_dynamics".
 * Run once before using the multi-tenant app: node scripts/migrateToTenant.js
 */
require('dotenv').config();
const mongoose = require('mongoose');

const DEFAULT_TENANT_ID = 'default_glass_dynamics';

const collectionsWithTenantId = [
  'users',
  'orders',
  'suppliers',
  'products',
  'repairs'
];

async function migrateToTenant() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('🔌 Connected to MongoDB');

    const db = mongoose.connection.db;
    const results = { updated: 0, skipped: 0, errors: [] };

    for (const collName of collectionsWithTenantId) {
      try {
        const coll = db.collection(collName);
        const res = await coll.updateMany(
          { tenantId: { $exists: false } },
          { $set: { tenantId: DEFAULT_TENANT_ID } }
        );
        if (res.modifiedCount > 0) {
          console.log(`✅ ${collName}: updated ${res.modifiedCount} document(s)`);
          results.updated += res.modifiedCount;
        } else {
          const total = await coll.countDocuments();
          const withTenant = await coll.countDocuments({ tenantId: { $exists: true } });
          if (total === 0) {
            console.log(`⏭️  ${collName}: collection empty`);
          } else if (withTenant === total) {
            console.log(`⏭️  ${collName}: all ${total} document(s) already have tenantId`);
          } else {
            console.log(`⏭️  ${collName}: no documents needed update (matched: ${res.matchedCount})`);
          }
        }
      } catch (err) {
        console.error(`❌ ${collName}:`, err.message);
        results.errors.push({ collection: collName, message: err.message });
      }
    }

    console.log('\n📊 Migration summary:');
    console.log(`   Updated: ${results.updated} document(s)`);
    console.log(`   Tenant ID used: ${DEFAULT_TENANT_ID}`);
    if (results.errors.length > 0) {
      console.log(`   Errors: ${results.errors.length}`);
      results.errors.forEach(e => console.log(`      - ${e.collection}: ${e.message}`));
    }
    console.log('\n✅ Migration script finished.');
    process.exit(results.errors.length > 0 ? 1 : 0);
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

migrateToTenant();
