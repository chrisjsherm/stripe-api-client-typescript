import { MigrationInterface, QueryRunner } from "typeorm";

export class BotulinumToxinEntity1718130790731 implements MigrationInterface {
    name = 'BotulinumToxinEntity1718130790731'

    public async up(queryRunner: QueryRunner): Promise<void> {
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
                "organizationId" uuid,
                CONSTRAINT "PK_a542f0c3acc07cec3f3cd8b9f04" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            ALTER TABLE "organization" DROP COLUMN "botulinumToxins"
        `);
        await queryRunner.query(`
            ALTER TABLE "botulinum_toxin"
            ADD CONSTRAINT "FK_eba3c68e1ca15b22106d705c0fa" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "botulinum_toxin" DROP CONSTRAINT "FK_eba3c68e1ca15b22106d705c0fa"
        `);
        await queryRunner.query(`
            ALTER TABLE "organization"
            ADD "botulinumToxins" jsonb
        `);
        await queryRunner.query(`
            DROP TABLE "botulinum_toxin"
        `);
    }

}
