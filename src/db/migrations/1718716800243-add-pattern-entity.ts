import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPatternEntity1718716800243 implements MigrationInterface {
    name = 'AddPatternEntity1718716800243'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "botulinum_toxin_pattern" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "createdDateTime" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updatedDateTime" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "deletedDateTime" TIMESTAMP WITH TIME ZONE,
                "version" integer NOT NULL,
                "name" character varying NOT NULL,
                "locations" jsonb NOT NULL,
                CONSTRAINT "PK_60af485d5aa57fb2ab7de88a70e" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "botulinum_toxin_pattern_toxins_botulinum_toxin" (
                "botulinumToxinPatternId" uuid NOT NULL,
                "botulinumToxinId" uuid NOT NULL,
                CONSTRAINT "PK_567ff5e7f86a2c86accf27374c5" PRIMARY KEY ("botulinumToxinPatternId", "botulinumToxinId")
            )
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_cea8928ba153e5c80118284248" ON "botulinum_toxin_pattern_toxins_botulinum_toxin" ("botulinumToxinPatternId")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_05b27c983abb92d6a2975b9bb4" ON "botulinum_toxin_pattern_toxins_botulinum_toxin" ("botulinumToxinId")
        `);
        await queryRunner.query(`
            ALTER TABLE "botulinum_toxin_pattern_toxins_botulinum_toxin"
            ADD CONSTRAINT "FK_cea8928ba153e5c801182842480" FOREIGN KEY ("botulinumToxinPatternId") REFERENCES "botulinum_toxin_pattern"("id") ON DELETE CASCADE ON UPDATE CASCADE
        `);
        await queryRunner.query(`
            ALTER TABLE "botulinum_toxin_pattern_toxins_botulinum_toxin"
            ADD CONSTRAINT "FK_05b27c983abb92d6a2975b9bb46" FOREIGN KEY ("botulinumToxinId") REFERENCES "botulinum_toxin"("id") ON DELETE CASCADE ON UPDATE CASCADE
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "botulinum_toxin_pattern_toxins_botulinum_toxin" DROP CONSTRAINT "FK_05b27c983abb92d6a2975b9bb46"
        `);
        await queryRunner.query(`
            ALTER TABLE "botulinum_toxin_pattern_toxins_botulinum_toxin" DROP CONSTRAINT "FK_cea8928ba153e5c801182842480"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_05b27c983abb92d6a2975b9bb4"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_cea8928ba153e5c80118284248"
        `);
        await queryRunner.query(`
            DROP TABLE "botulinum_toxin_pattern_toxins_botulinum_toxin"
        `);
        await queryRunner.query(`
            DROP TABLE "botulinum_toxin_pattern"
        `);
    }

}
