import { MigrationInterface, QueryRunner } from "typeorm";

export class TreatmentClinicianId1725889970874 implements MigrationInterface {
    name = 'TreatmentClinicianId1725889970874'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "botulinum_toxin_treatment"
            ADD "clinicianId" uuid NOT NULL
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "botulinum_toxin_treatment" DROP COLUMN "clinicianId"
        `);
    }

}
