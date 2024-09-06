import { MigrationInterface, QueryRunner } from "typeorm";

export class TreatmentJOINPattern1725632907196 implements MigrationInterface {
    name = 'TreatmentJOINPattern1725632907196'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "botulinum_toxin_treatment" DROP CONSTRAINT "FK_8ae224d62a7dab2f9085f5b5bef"
        `);
        await queryRunner.query(`
            CREATE TABLE "botulinum_toxin_treatment_join_botulinum_toxin_pattern" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "createdDateTime" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updatedDateTime" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "deletedDateTime" TIMESTAMP WITH TIME ZONE,
                "version" integer NOT NULL,
                "diluentMl" real NOT NULL,
                "priceChargedPerToxinUnitInBaseCurrencyUnits" integer NOT NULL,
                "productId" uuid NOT NULL,
                "patternId" uuid NOT NULL,
                "toxinUnits" integer NOT NULL,
                "treatmentId" uuid NOT NULL,
                CONSTRAINT "PK_5f8d6f1f5b587c08e227e172c32" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            ALTER TABLE "botulinum_toxin_treatment" DROP COLUMN "diluentMl"
        `);
        await queryRunner.query(`
            ALTER TABLE "botulinum_toxin_treatment" DROP COLUMN "priceChargedPerToxinUnitInBaseCurrencyUnits"
        `);
        await queryRunner.query(`
            ALTER TABLE "botulinum_toxin_treatment" DROP COLUMN "productId"
        `);
        await queryRunner.query(`
            ALTER TABLE "botulinum_toxin_treatment_join_botulinum_toxin_pattern"
            ADD CONSTRAINT "FK_a2ac3ace69d6454f657a5691df2" FOREIGN KEY ("productId") REFERENCES "botulinum_toxin"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "botulinum_toxin_treatment_join_botulinum_toxin_pattern"
            ADD CONSTRAINT "FK_23d572b355dc3476f26aef877c5" FOREIGN KEY ("patternId") REFERENCES "botulinum_toxin_pattern"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "botulinum_toxin_treatment_join_botulinum_toxin_pattern"
            ADD CONSTRAINT "FK_f1f6fbbe266c1d6acb3c46d1aca" FOREIGN KEY ("treatmentId") REFERENCES "botulinum_toxin_treatment"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "botulinum_toxin_treatment_join_botulinum_toxin_pattern" DROP CONSTRAINT "FK_f1f6fbbe266c1d6acb3c46d1aca"
        `);
        await queryRunner.query(`
            ALTER TABLE "botulinum_toxin_treatment_join_botulinum_toxin_pattern" DROP CONSTRAINT "FK_23d572b355dc3476f26aef877c5"
        `);
        await queryRunner.query(`
            ALTER TABLE "botulinum_toxin_treatment_join_botulinum_toxin_pattern" DROP CONSTRAINT "FK_a2ac3ace69d6454f657a5691df2"
        `);
        await queryRunner.query(`
            ALTER TABLE "botulinum_toxin_treatment"
            ADD "productId" uuid NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE "botulinum_toxin_treatment"
            ADD "priceChargedPerToxinUnitInBaseCurrencyUnits" integer NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE "botulinum_toxin_treatment"
            ADD "diluentMl" real NOT NULL
        `);
        await queryRunner.query(`
            DROP TABLE "botulinum_toxin_treatment_join_botulinum_toxin_pattern"
        `);
        await queryRunner.query(`
            ALTER TABLE "botulinum_toxin_treatment"
            ADD CONSTRAINT "FK_8ae224d62a7dab2f9085f5b5bef" FOREIGN KEY ("productId") REFERENCES "botulinum_toxin"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    }

}
