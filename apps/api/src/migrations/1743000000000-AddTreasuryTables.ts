import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTreasuryTables1743000000000 implements MigrationInterface {
  name = 'AddTreasuryTables1743000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE "revenue_distribution_type_enum" AS ENUM('validator_rewards', 'developer_grants', 'ai_fund', 'charity_esg', 'treasury_reserve');
      CREATE TYPE "revenue_distribution_status_enum" AS ENUM('pending', 'processing', 'completed', 'failed');
      CREATE TYPE "staking_reward_type_enum" AS ENUM('validator_staking', 'delegator_staking', 'liquidity_provider', 'governance_participation');
      CREATE TYPE "staking_reward_status_enum" AS ENUM('pending', 'claimed', 'expired');

      CREATE TABLE "revenue_distributions" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "period" character varying(20) NOT NULL,
        "type" "revenue_distribution_type_enum" NOT NULL,
        "amount" numeric(36,18) NOT NULL,
        "percentage" numeric(5,2) NOT NULL,
        "status" "revenue_distribution_status_enum" NOT NULL DEFAULT 'pending',
        "tx_hash" character varying(66),
        "block_no" bigint,
        "recipients" jsonb,
        "metadata" jsonb,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_revenue_distributions" PRIMARY KEY ("id")
      );

      CREATE INDEX "idx_revenue_distributions_period_type" ON "revenue_distributions" ("period", "type");
      CREATE INDEX "idx_revenue_distributions_status_created" ON "revenue_distributions" ("status", "created_at");

      CREATE TABLE "staking_rewards" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "validator_address" character varying(42),
        "delegator_address" character varying(42),
        "period" character varying(20) NOT NULL,
        "type" "staking_reward_type_enum" NOT NULL,
        "amount" numeric(36,18) NOT NULL,
        "staked_amount" numeric(36,18),
        "apy" numeric(5,2),
        "status" "staking_reward_status_enum" NOT NULL DEFAULT 'pending',
        "claimable_until" TIMESTAMP,
        "claim_tx_hash" character varying(66),
        "claim_block_no" bigint,
        "metadata" jsonb,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_staking_rewards" PRIMARY KEY ("id")
      );

      CREATE INDEX "idx_staking_rewards_validator_period" ON "staking_rewards" ("validator_address", "period");
      CREATE INDEX "idx_staking_rewards_delegator_period" ON "staking_rewards" ("delegator_address", "period");
      CREATE INDEX "idx_staking_rewards_status_claimable" ON "staking_rewards" ("status", "claimable_until");
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP TABLE "staking_rewards";
      DROP TABLE "revenue_distributions";
      DROP TYPE "staking_reward_status_enum";
      DROP TYPE "staking_reward_type_enum";
      DROP TYPE "revenue_distribution_status_enum";
      DROP TYPE "revenue_distribution_type_enum";
    `);
  }
}

