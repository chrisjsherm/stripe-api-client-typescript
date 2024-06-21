import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateToxinPatternEntity1718997422718 implements MigrationInterface {
    name = 'CreateToxinPatternEntity1718997422718'

    public async up(queryRunner: QueryRunner): Promise<void> {
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
            ALTER TABLE "botulinum_toxin_join_botulinum_toxin_pattern"
            ADD CONSTRAINT "FK_3854c4b801652e4fd97b007480c" FOREIGN KEY ("toxinId") REFERENCES "botulinum_toxin"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "botulinum_toxin_join_botulinum_toxin_pattern"
            ADD CONSTRAINT "FK_59eeefdbbded432e9477696d7a6" FOREIGN KEY ("patternId") REFERENCES "botulinum_toxin_pattern"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "botulinum_toxin_join_botulinum_toxin_pattern" DROP CONSTRAINT "FK_59eeefdbbded432e9477696d7a6"
        `);
        await queryRunner.query(`
            ALTER TABLE "botulinum_toxin_join_botulinum_toxin_pattern" DROP CONSTRAINT "FK_3854c4b801652e4fd97b007480c"
        `);
        await queryRunner.query(`
            DROP TABLE "botulinum_toxin_join_botulinum_toxin_pattern"
        `);
    }

}
