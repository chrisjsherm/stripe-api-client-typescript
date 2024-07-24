import { MigrationInterface, QueryRunner } from "typeorm";

export class Initial1721833505708 implements MigrationInterface {
    name = 'Initial1721833505708'

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
            CREATE TABLE "botulinum_toxin" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "createdDateTime" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updatedDateTime" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "deletedDateTime" TIMESTAMP WITH TIME ZONE,
                "version" integer NOT NULL,
                "name" character varying NOT NULL,
                "vialSizeInUnits" integer NOT NULL,
                "pricePerUnitInBaseCurrencyUnits" integer NOT NULL,
                "organizationId" uuid NOT NULL,
                CONSTRAINT "PK_a542f0c3acc07cec3f3cd8b9f04" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "botulinum_toxin_join_botulinum_toxin_pattern" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "createdDateTime" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updatedDateTime" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "deletedDateTime" TIMESTAMP WITH TIME ZONE,
                "version" integer NOT NULL,
                "toxinId" uuid NOT NULL,
                "patternId" uuid NOT NULL,
                "referenceDoseInToxinUnits" integer NOT NULL,
                CONSTRAINT "PK_1e77eecfdccec01c55508af4b5f" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "botulinum_toxin_pattern" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "createdDateTime" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updatedDateTime" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "deletedDateTime" TIMESTAMP WITH TIME ZONE,
                "version" integer NOT NULL,
                "name" character varying NOT NULL,
                "locations" jsonb NOT NULL,
                "organizationId" uuid NOT NULL,
                CONSTRAINT "PK_60af485d5aa57fb2ab7de88a70e" PRIMARY KEY ("id")
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
                "productId" uuid NOT NULL,
                "organizationId" uuid NOT NULL,
                CONSTRAINT "PK_fc755d7d5d176a18497ed222dc7" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            ALTER TABLE "botulinum_toxin"
            ADD CONSTRAINT "FK_eba3c68e1ca15b22106d705c0fa" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "botulinum_toxin_join_botulinum_toxin_pattern"
            ADD CONSTRAINT "FK_3854c4b801652e4fd97b007480c" FOREIGN KEY ("toxinId") REFERENCES "botulinum_toxin"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "botulinum_toxin_join_botulinum_toxin_pattern"
            ADD CONSTRAINT "FK_59eeefdbbded432e9477696d7a6" FOREIGN KEY ("patternId") REFERENCES "botulinum_toxin_pattern"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "botulinum_toxin_pattern"
            ADD CONSTRAINT "FK_4a6add44fbf1b8f8dbb6df1f867" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
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
            ALTER TABLE "botulinum_toxin_pattern" DROP CONSTRAINT "FK_4a6add44fbf1b8f8dbb6df1f867"
        `);
        await queryRunner.query(`
            ALTER TABLE "botulinum_toxin_join_botulinum_toxin_pattern" DROP CONSTRAINT "FK_59eeefdbbded432e9477696d7a6"
        `);
        await queryRunner.query(`
            ALTER TABLE "botulinum_toxin_join_botulinum_toxin_pattern" DROP CONSTRAINT "FK_3854c4b801652e4fd97b007480c"
        `);
        await queryRunner.query(`
            ALTER TABLE "botulinum_toxin" DROP CONSTRAINT "FK_eba3c68e1ca15b22106d705c0fa"
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
            DROP TABLE "botulinum_toxin_pattern"
        `);
        await queryRunner.query(`
            DROP TABLE "botulinum_toxin_join_botulinum_toxin_pattern"
        `);
        await queryRunner.query(`
            DROP TABLE "botulinum_toxin"
        `);
        await queryRunner.query(`
            DROP TABLE "organization"
        `);
        await queryRunner.query(`
            DROP TYPE "public"."organization_mailingaddressstreetaddresstype_enum"
        `);
    }

}
