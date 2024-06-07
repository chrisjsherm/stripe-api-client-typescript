import { MigrationInterface, QueryRunner } from "typeorm";

export class Initial1717769515809 implements MigrationInterface {
  name = "Initial1717769515809";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TYPE "public"."organization_mailingaddressstreetaddresstype_enum" AS ENUM('mailing', 'physical')
        `);
    await queryRunner.query(`
            CREATE TABLE "organization" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "createdDateTime" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updatedDateTime" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "deletedDateTime" TIMESTAMP WITH TIME ZONE,
                "version" integer NOT NULL,
                "name" character varying NOT NULL,
                "btxPatternConfiguration" jsonb,
                "mailingAddressStreet1" character varying NOT NULL,
                "mailingAddressStreet2" character varying,
                "mailingAddressCity" character varying NOT NULL,
                "mailingAddressState" character varying NOT NULL,
                "mailingAddressPostalcode" character varying NOT NULL,
                "mailingAddressCountry" character varying NOT NULL,
                "mailingAddressStreetaddresstype" "public"."organization_mailingaddressstreetaddresstype_enum" NOT NULL DEFAULT 'mailing',
                CONSTRAINT "PK_472c1f99a32def1b0abb219cd67" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE TABLE "product" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "createdDateTime" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updatedDateTime" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "deletedDateTime" TIMESTAMP WITH TIME ZONE,
                "version" integer NOT NULL,
                "title" character varying NOT NULL,
                "subtitle" character varying NOT NULL,
                "priceInBaseUnits" integer NOT NULL,
                "currencyCode" character varying NOT NULL,
                "groupMembershipsCsv" character varying NOT NULL,
                "statementDescriptorSuffix" character varying NOT NULL,
                "adminCount" smallint,
                "userCount" smallint,
                "storageGb" real,
                CONSTRAINT "PK_bebc9158e480b949565b4dc7a82" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE TYPE "public"."product_subscription_paymentprocessor_enum" AS ENUM('Stripe')
        `);
    await queryRunner.query(`
            CREATE TABLE "product_subscription" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "createdDateTime" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updatedDateTime" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "deletedDateTime" TIMESTAMP WITH TIME ZONE,
                "version" integer NOT NULL,
                "expirationDateTime" TIMESTAMP WITH TIME ZONE NOT NULL,
                "paymentId" character varying NOT NULL,
                "paymentProcessor" "public"."product_subscription_paymentprocessor_enum" NOT NULL,
                "productId" uuid,
                "organizationId" uuid,
                CONSTRAINT "PK_fc755d7d5d176a18497ed222dc7" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            ALTER TABLE "product_subscription"
            ADD CONSTRAINT "FK_f8f0360e203c93d18a2158d1d02" FOREIGN KEY ("productId") REFERENCES "product"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "product_subscription"
            ADD CONSTRAINT "FK_e7c584c0e8f44cec00977f2f102" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "product_subscription" DROP CONSTRAINT "FK_e7c584c0e8f44cec00977f2f102"
        `);
    await queryRunner.query(`
            ALTER TABLE "product_subscription" DROP CONSTRAINT "FK_f8f0360e203c93d18a2158d1d02"
        `);
    await queryRunner.query(`
            DROP TABLE "product_subscription"
        `);
    await queryRunner.query(`
            DROP TYPE "public"."product_subscription_paymentprocessor_enum"
        `);
    await queryRunner.query(`
            DROP TABLE "product"
        `);
    await queryRunner.query(`
            DROP TABLE "organization"
        `);
    await queryRunner.query(`
            DROP TYPE "public"."organization_mailingaddressstreetaddresstype_enum"
        `);
  }
}
