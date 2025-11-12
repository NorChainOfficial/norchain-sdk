import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTravelRulePartnerTable1744000000000
  implements MigrationInterface
{
  name = 'AddTravelRulePartnerTable1744000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE "travel_rule_partner_status_enum" AS ENUM('active', 'inactive', 'suspended', 'pending_verification');
      CREATE TYPE "travel_rule_partner_type_enum" AS ENUM('vasp', 'bank', 'exchange', 'wallet_provider', 'other');

      CREATE TABLE "travel_rule_partners" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "name" character varying(255) NOT NULL,
        "type" "travel_rule_partner_type_enum" NOT NULL,
        "jurisdiction" character varying(10),
        "api_endpoint" character varying(255),
        "public_key" character varying(255),
        "contact_email" character varying(255),
        "contact_phone" character varying(50),
        "status" "travel_rule_partner_status_enum" NOT NULL DEFAULT 'pending_verification',
        "metadata" jsonb,
        "supported_protocols" jsonb,
        "transactions_count" integer NOT NULL DEFAULT 0,
        "success_rate" numeric(5,2),
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_travel_rule_partners" PRIMARY KEY ("id")
      );

      CREATE INDEX "idx_travel_rule_partners_status_type" ON "travel_rule_partners" ("status", "type");
      CREATE INDEX "idx_travel_rule_partners_jurisdiction" ON "travel_rule_partners" ("jurisdiction");
      CREATE INDEX "idx_travel_rule_partners_api_endpoint" ON "travel_rule_partners" ("api_endpoint");
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP TABLE "travel_rule_partners";
      DROP TYPE "travel_rule_partner_type_enum";
      DROP TYPE "travel_rule_partner_status_enum";
    `);
  }
}
