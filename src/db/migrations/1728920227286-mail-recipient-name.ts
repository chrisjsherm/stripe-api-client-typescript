import { MigrationInterface, QueryRunner } from "typeorm";

export class MailRecipientName1728920227286 implements MigrationInterface {
    name = 'MailRecipientName1728920227286'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "organization"
            ADD "mailRecipientName" character varying
        `);
        await queryRunner.query(`
            ALTER TABLE "physical_location" DROP CONSTRAINT "FK_4b161236537887bfaecb3ebfae5"
        `);
        await queryRunner.query(`
            ALTER TABLE "physical_location"
            ALTER COLUMN "organizationId"
            SET NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE "physical_location"
            ADD CONSTRAINT "FK_4b161236537887bfaecb3ebfae5" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "physical_location" DROP CONSTRAINT "FK_4b161236537887bfaecb3ebfae5"
        `);
        await queryRunner.query(`
            ALTER TABLE "physical_location"
            ALTER COLUMN "organizationId" DROP NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE "physical_location"
            ADD CONSTRAINT "FK_4b161236537887bfaecb3ebfae5" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "organization" DROP COLUMN "mailRecipientName"
        `);
    }

}
