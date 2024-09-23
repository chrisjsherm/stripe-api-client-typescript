import { MigrationInterface, QueryRunner } from "typeorm";

export class TreatmentLocation1727104118401 implements MigrationInterface {
  name = "TreatmentLocation1727104118401";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "botulinum_toxin_treatment" ADD COLUMN "physicalLocationId" uuid
        `);
    await queryRunner.query(`
            CREATE TYPE "public"."physical_location_physicaladdressstreetaddresstype_enum" AS ENUM('mailing', 'physical')
        `);
    await queryRunner.query(`
            CREATE TABLE "physical_location" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "createdDateTime" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updatedDateTime" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "deletedDateTime" TIMESTAMP WITH TIME ZONE,
                "version" integer NOT NULL,
                "name" character varying NOT NULL,
                "organizationId" uuid,
                "physicalAddressStreet1" character varying NOT NULL,
                "physicalAddressStreet2" character varying,
                "physicalAddressCity" character varying NOT NULL,
                "physicalAddressState" character varying NOT NULL,
                "physicalAddressPostalcode" character varying NOT NULL,
                "physicalAddressCountry" character varying NOT NULL,
                "physicalAddressStreetaddresstype" "public"."physical_location_physicaladdressstreetaddresstype_enum" NOT NULL DEFAULT 'mailing',
                CONSTRAINT "PK_e5a4127aea770adc83a6975041b" PRIMARY KEY ("id")
            )
        `);
    // Create a default location for existing organizations.
    await queryRunner.query(`
            INSERT INTO "physical_location" (
                "name",
                "organizationId",
                "physicalAddressStreet1",
                "physicalAddressStreet2",
                "physicalAddressCity",
                "physicalAddressState",
                "physicalAddressPostalcode",
                "physicalAddressCountry",
                "physicalAddressStreetaddresstype",
                "version"
            )
            SELECT
                "mailingAddressStreet1",
                "id",
                "mailingAddressStreet1",
                "mailingAddressStreet2",
                "mailingAddressCity",
                "mailingAddressState",
                "mailingAddressPostalcode",
                "mailingAddressCountry",
                'physical',
                0
            FROM "organization"
            WHERE NOT EXISTS (
                SELECT 1
                FROM "physical_location"
                WHERE "physical_location"."organizationId" = "organization"."id"
            )
        `);

    // Migrate existing treatments to reference physical location rather than organization.
    await queryRunner.query(`
            UPDATE "botulinum_toxin_treatment"
            SET "physicalLocationId" = "physical_location"."id"
            FROM "physical_location"
            WHERE "botulinum_toxin_treatment"."organizationId" = "physical_location"."organizationId"
        `);
    await queryRunner.query(`
        ALTER TABLE "botulinum_toxin_treatment" DROP CONSTRAINT "FK_57f176364bbed5f52711f305d12"
    `);
    await queryRunner.query(`
        ALTER TABLE "botulinum_toxin_treatment" 
            DROP COLUMN "organizationId",
            ALTER COLUMN "physicalLocationId" SET NOT NULL
    `);
    await queryRunner.query(`
            ALTER TABLE "physical_location"
            ADD CONSTRAINT "FK_4b161236537887bfaecb3ebfae5" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "botulinum_toxin_treatment"
            ADD CONSTRAINT "FK_21649051a82416c768de9d5b31f" FOREIGN KEY ("physicalLocationId") REFERENCES "physical_location"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "botulinum_toxin_treatment" DROP CONSTRAINT "FK_21649051a82416c768de9d5b31f"
        `);
    await queryRunner.query(`
            ALTER TABLE "physical_location" DROP CONSTRAINT "FK_4b161236537887bfaecb3ebfae5"
        `);
    await queryRunner.query(`
            DROP TABLE "physical_location"
        `);
    await queryRunner.query(`
            DROP TYPE "public"."physical_location_physicaladdressstreetaddresstype_enum"
        `);
    await queryRunner.query(`
            ALTER TABLE "botulinum_toxin_treatment"
                RENAME COLUMN "physicalLocationId" TO "organizationId"
        `);
    await queryRunner.query(`
            ALTER TABLE "botulinum_toxin_treatment"
            ADD CONSTRAINT "FK_57f176364bbed5f52711f305d12" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
  }
}
