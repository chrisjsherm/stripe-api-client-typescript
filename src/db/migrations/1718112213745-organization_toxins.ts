import { MigrationInterface, QueryRunner } from "typeorm";

export class OrganizationToxins1718112213745 implements MigrationInterface {
    name = 'OrganizationToxins1718112213745'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "organization"
            ADD "botulinumToxins" jsonb
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "organization" DROP COLUMN "botulinumToxins"
        `);
    }

}
