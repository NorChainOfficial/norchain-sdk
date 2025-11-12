import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddGroupMemberTable1742000000000 implements MigrationInterface {
  name = 'AddGroupMemberTable1742000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE "group_member_role_enum" AS ENUM('admin', 'moderator', 'member');

      CREATE TABLE "group_members" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "conversation_id" uuid NOT NULL,
        "member_did" character varying(255) NOT NULL,
        "role" "group_member_role_enum" NOT NULL DEFAULT 'member',
        "metadata" jsonb,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_group_members" PRIMARY KEY ("id"),
        CONSTRAINT "FK_group_members_conversation" FOREIGN KEY ("conversation_id") REFERENCES "conversations"("id") ON DELETE CASCADE,
        CONSTRAINT "UQ_group_members_conversation_member" UNIQUE ("conversation_id", "member_did")
      );

      CREATE INDEX "idx_group_members_conversation" ON "group_members" ("conversation_id");
      CREATE INDEX "idx_group_members_member" ON "group_members" ("member_did");
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP TABLE "group_members";
      DROP TYPE "group_member_role_enum";
    `);
  }
}

