import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class AddCouponTable1739000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'coupons',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'org_id',
            type: 'uuid',
          },
          {
            name: 'code',
            type: 'varchar',
            length: '50',
          },
          {
            name: 'name',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'type',
            type: 'enum',
            enum: ['percentage', 'fixed_amount'],
            default: "'percentage'",
          },
          {
            name: 'discount_value',
            type: 'decimal',
            precision: 10,
            scale: 2,
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['active', 'inactive', 'expired'],
            default: "'active'",
          },
          {
            name: 'max_redemptions',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'times_redeemed',
            type: 'int',
            default: 0,
          },
          {
            name: 'valid_from',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'valid_until',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'minimum_amount',
            type: 'decimal',
            precision: 10,
            scale: 2,
            isNullable: true,
          },
          {
            name: 'applies_to_subscriptions',
            type: 'boolean',
            default: false,
          },
          {
            name: 'applies_to_products',
            type: 'boolean',
            default: false,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // Create unique index on code + org_id
    await queryRunner.createIndex(
      'coupons',
      new TableIndex({
        name: 'IDX_coupons_code_org_id',
        columnNames: ['code', 'org_id'],
        isUnique: true,
      }),
    );

    // Create index on org_id for faster lookups
    await queryRunner.createIndex(
      'coupons',
      new TableIndex({
        name: 'IDX_coupons_org_id',
        columnNames: ['org_id'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('coupons');
  }
}

