/**
 * Migration Runner Script
 * 
 * This script can be used to manually run migrations if TypeORM CLI has issues.
 * Usage: npm run migration:run:direct
 */

import { MigrationDataSource } from './data-source';

async function runMigrations() {
  try {
    console.log('🔄 Initializing database connection...');
    await MigrationDataSource.initialize();

    console.log('📦 Running pending migrations...');
    const migrations = await MigrationDataSource.runMigrations();

    if (migrations.length === 0) {
      console.log('✅ No pending migrations found.');
    } else {
      console.log(`✅ Successfully ran ${migrations.length} migration(s):`);
      migrations.forEach((migration) => {
        console.log(`   - ${migration.name}`);
      });
    }

    await MigrationDataSource.destroy();
    console.log('✅ Migration process completed.');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

runMigrations();

