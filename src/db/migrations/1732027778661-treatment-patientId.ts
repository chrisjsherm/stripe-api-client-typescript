import { MigrationInterface, QueryRunner } from "typeorm";

export class TreatmentPatientId1732027778661 implements MigrationInterface {
    name = 'TreatmentPatientId1732027778661'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "botulinum_toxin_treatment"
            ADD "patientId" uuid
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "botulinum_toxin_treatment" DROP COLUMN "patientId"
        `);
    }

}
