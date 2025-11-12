import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableIndex,
  TableForeignKey,
} from 'typeorm';

export class AddUsageTables1740000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // API Usage table
    await queryRunner.createTable(
      new Table({
        name: 'api_usage',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'api_key_id',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'user_id',
            type: 'uuid',
          },
          {
            name: 'endpoint',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'method',
            type: 'varchar',
            length: '10',
            default: "'GET'",
          },
          {
            name: 'type',
            type: 'enum',
            enum: [
              'api_call',
              'rpc_call',
              'streaming_connection',
              'webhook_delivery',
            ],
            default: "'api_call'",
          },
          {
            name: 'count',
            type: 'int',
            default: 1,
          },
          {
            name: 'status_code',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'response_time',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'cost',
            type: 'decimal',
            precision: 10,
            scale: 6,
            default: '0',
          },
          {
            name: 'tier',
            type: 'varchar',
            length: '50',
            isNullable: true,
          },
          {
            name: 'metadata',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'timestamp',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // Create indexes for api_usage
    await queryRunner.createIndex(
      'api_usage',
      new TableIndex({
        name: 'IDX_api_usage_api_key_timestamp',
        columnNames: ['api_key_id', 'timestamp'],
      }),
    );

    await queryRunner.createIndex(
      'api_usage',
      new TableIndex({
        name: 'IDX_api_usage_user_timestamp',
        columnNames: ['user_id', 'timestamp'],
      }),
    );

    await queryRunner.createIndex(
      'api_usage',
      new TableIndex({
        name: 'IDX_api_usage_endpoint_timestamp',
        columnNames: ['endpoint', 'timestamp'],
      }),
    );

    // Foreign key to api_keys
    await queryRunner.createForeignKey(
      'api_usage',
      new TableForeignKey({
        columnNames: ['api_key_id'],
        referencedTableName: 'api_keys',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
      }),
    );

    // Usage Billing table
    await queryRunner.createTable(
      new Table({
        name: 'usage_billing',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'user_id',
            type: 'uuid',
          },
          {
            name: 'period',
            type: 'enum',
            enum: ['hourly', 'daily', 'monthly'],
            default: "'monthly'",
          },
          {
            name: 'period_start',
            type: 'timestamp',
          },
          {
            name: 'period_end',
            type: 'timestamp',
          },
          {
            name: 'total_calls',
            type: 'int',
            default: 0,
          },
          {
            name: 'total_rpc_calls',
            type: 'int',
            default: 0,
          },
          {
            name: 'total_streaming_minutes',
            type: 'int',
            default: 0,
          },
          {
            name: 'total_webhook_deliveries',
            type: 'int',
            default: 0,
          },
          {
            name: 'total_cost',
            type: 'decimal',
            precision: 10,
            scale: 6,
            default: '0',
          },
          {
            name: 'base_cost',
            type: 'decimal',
            precision: 10,
            scale: 6,
            default: '0',
          },
          {
            name: 'usage_cost',
            type: 'decimal',
            precision: 10,
            scale: 6,
            default: '0',
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['pending', 'processed', 'paid', 'failed'],
            default: "'pending'",
          },
          {
            name: 'invoice_id',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'payment_tx_hash',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'breakdown',
            type: 'jsonb',
            isNullable: true,
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

    // Create indexes for usage_billing
    await queryRunner.createIndex(
      'usage_billing',
      new TableIndex({
        name: 'IDX_usage_billing_user_period',
        columnNames: ['user_id', 'period', 'period_start'],
      }),
    );

    await queryRunner.createIndex(
      'usage_billing',
      new TableIndex({
        name: 'IDX_usage_billing_status_period',
        columnNames: ['status', 'period_start'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('usage_billing');
    await queryRunner.dropTable('api_usage');
  }
}
