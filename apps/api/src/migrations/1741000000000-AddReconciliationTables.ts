import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddReconciliationTables1741000000000 implements MigrationInterface {
  name = 'AddReconciliationTables1741000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE "reconciliation_status_enum" AS ENUM('pending', 'in_progress', 'matched', 'partial', 'completed');
      CREATE TYPE "reconciliation_type_enum" AS ENUM('bank', 'wallet', 'crypto_exchange');
      CREATE TYPE "reconciliation_match_match_type_enum" AS ENUM('exact', 'fuzzy', 'manual');

      CREATE TABLE "reconciliations" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "org_id" uuid NOT NULL,
        "type" "reconciliation_type_enum" NOT NULL,
        "account_code" character varying(50),
        "external_account_id" character varying(255),
        "period" character varying(20) NOT NULL,
        "start_date" TIMESTAMP NOT NULL,
        "end_date" TIMESTAMP NOT NULL,
        "status" "reconciliation_status_enum" NOT NULL DEFAULT 'pending',
        "opening_balance" numeric(36,18) NOT NULL DEFAULT '0',
        "closing_balance" numeric(36,18) NOT NULL DEFAULT '0',
        "ledger_total" numeric(36,18) NOT NULL DEFAULT '0',
        "external_total" numeric(36,18) NOT NULL DEFAULT '0',
        "difference" numeric(36,18) NOT NULL DEFAULT '0',
        "matched_count" integer NOT NULL DEFAULT 0,
        "unmatched_ledger_count" integer NOT NULL DEFAULT 0,
        "unmatched_external_count" integer NOT NULL DEFAULT 0,
        "metadata" jsonb,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_reconciliations" PRIMARY KEY ("id")
      );

      CREATE INDEX "idx_reconciliations_org_type_status" ON "reconciliations" ("org_id", "type", "status");
      CREATE INDEX "idx_reconciliations_org_period" ON "reconciliations" ("org_id", "period");

      CREATE TABLE "reconciliation_matches" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "reconciliation_id" uuid NOT NULL,
        "ledger_entry_id" uuid,
        "external_transaction_id" character varying(255),
        "amount" numeric(36,18) NOT NULL,
        "transaction_date" TIMESTAMP NOT NULL,
        "match_type" "reconciliation_match_match_type_enum" NOT NULL DEFAULT 'exact',
        "confidence_score" numeric(10,2),
        "metadata" jsonb,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_reconciliation_matches" PRIMARY KEY ("id"),
        CONSTRAINT "FK_reconciliation_matches_reconciliation" FOREIGN KEY ("reconciliation_id") REFERENCES "reconciliations"("id") ON DELETE CASCADE
      );

      CREATE INDEX "idx_reconciliation_matches_reconciliation" ON "reconciliation_matches" ("reconciliation_id");
      CREATE INDEX "idx_reconciliation_matches_ledger_entry" ON "reconciliation_matches" ("ledger_entry_id");
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP TABLE "reconciliation_matches";
      DROP TABLE "reconciliations";
      DROP TYPE "reconciliation_match_match_type_enum";
      DROP TYPE "reconciliation_type_enum";
      DROP TYPE "reconciliation_status_enum";
    `);
  }
}

