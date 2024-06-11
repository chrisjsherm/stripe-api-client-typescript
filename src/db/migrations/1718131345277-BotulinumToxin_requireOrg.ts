import { MigrationInterface, QueryRunner } from "typeorm";

export class BotulinumToxinRequireOrg1718131345277 implements MigrationInterface {
    name = 'BotulinumToxinRequireOrg1718131345277'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "botulinum_toxin" DROP CONSTRAINT "FK_eba3c68e1ca15b22106d705c0fa"
        `);
        await queryRunner.query(`
            ALTER TABLE "botulinum_toxin"
            ALTER COLUMN "organizationId"
            SET NOT NULL
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
            ALTER TABLE "botulinum_toxin"
            ALTER COLUMN "organizationId" DROP NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE "botulinum_toxin"
            ADD CONSTRAINT "FK_eba3c68e1ca15b22106d705c0fa" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    }

}
