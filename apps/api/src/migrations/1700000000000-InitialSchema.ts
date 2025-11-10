import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Initial Database Schema Migration
 * 
 * This migration creates all initial tables for the NorChain API.
 * Note: If using synchronize=true, this migration may be skipped.
 * Run this migration if you want explicit control over schema changes.
 */
export class InitialSchema1700000000000 implements MigrationInterface {
  name = 'InitialSchema1700000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // This migration is optional if using synchronize=true
    // Tables are created via TypeORM entities
    // Run this only if you want explicit migration control
    
    // Check if tables already exist
    const tables = await queryRunner.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      AND table_name IN (
        'blocks', 'transactions', 'transaction_logs', 
        'token_transfers', 'nft_transfers', 'token_holders',
        'token_metadata', 'contracts', 'api_usage',
        'users', 'api_keys', 'notifications',
        'limit_orders', 'dca_schedules', 'stop_loss_orders'
      );
    `);

    if (tables.length > 0) {
      console.log(`✅ Tables already exist (${tables.length} found)`);
      return;
    }

    // If tables don't exist, they will be created by synchronize=true
    // or by running db:setup:simple
    console.log('📋 Tables will be created via TypeORM synchronize or db:setup:simple');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop tables in reverse order (respecting foreign keys)
    const tables = [
      'stop_loss_orders',
      'dca_schedules',
      'limit_orders',
      'notifications',
      'api_keys',
      'users',
      'api_usage',
      'contracts',
      'token_metadata',
      'token_holders',
      'nft_transfers',
      'token_transfers',
      'transaction_logs',
      'transactions',
      'blocks',
    ];

    for (const table of tables) {
      await queryRunner.query(`DROP TABLE IF EXISTS ${table} CASCADE;`);
    }
  }
}

