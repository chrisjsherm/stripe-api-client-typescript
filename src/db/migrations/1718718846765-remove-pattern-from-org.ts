import { MigrationInterface, QueryRunner } from "typeorm";

export class RemovePatternFromOrg1718718846765 implements MigrationInterface {
    name = 'RemovePatternFromOrg1718718846765'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "organization" DROP COLUMN "btxPatternConfiguration"
        `);
        await queryRunner.query(`
            ALTER TABLE "botulinum_toxin_pattern"
            ADD "organizationId" uuid NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE "botulinum_toxin_pattern"
            ADD CONSTRAINT "FK_4a6add44fbf1b8f8dbb6df1f867" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "botulinum_toxin_pattern" DROP CONSTRAINT "FK_4a6add44fbf1b8f8dbb6df1f867"
        `);
        await queryRunner.query(`
            ALTER TABLE "botulinum_toxin_pattern" DROP COLUMN "organizationId"
        `);
        await queryRunner.query(`
            ALTER TABLE "organization"
            ADD "btxPatternConfiguration" jsonb
        `);
    }

}
