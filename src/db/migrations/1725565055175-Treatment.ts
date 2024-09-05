import { MigrationInterface, QueryRunner } from "typeorm";

export class Treatment1725565055175 implements MigrationInterface {
    name = 'Treatment1725565055175'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "botulinum_toxin_treatment" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "createdDateTime" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updatedDateTime" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "deletedDateTime" TIMESTAMP WITH TIME ZONE,
                "version" integer NOT NULL,
                "diluentMl" real NOT NULL,
                "priceChargedPerToxinUnitInBaseCurrencyUnits" integer NOT NULL,
                "productId" uuid NOT NULL,
                "organizationId" uuid NOT NULL,
                CONSTRAINT "PK_a9ba419b436dc39ab8b8ca7f5fb" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            ALTER TABLE "botulinum_toxin_treatment"
            ADD CONSTRAINT "FK_8ae224d62a7dab2f9085f5b5bef" FOREIGN KEY ("productId") REFERENCES "botulinum_toxin"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "botulinum_toxin_treatment"
            ADD CONSTRAINT "FK_57f176364bbed5f52711f305d12" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "botulinum_toxin_treatment" DROP CONSTRAINT "FK_57f176364bbed5f52711f305d12"
        `);
        await queryRunner.query(`
            ALTER TABLE "botulinum_toxin_treatment" DROP CONSTRAINT "FK_8ae224d62a7dab2f9085f5b5bef"
        `);
        await queryRunner.query(`
            DROP TABLE "botulinum_toxin_treatment"
        `);
    }

}
