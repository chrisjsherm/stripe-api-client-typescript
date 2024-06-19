import { MigrationInterface, QueryRunner } from "typeorm";

export class SubscriptionExplicitColumns1718820192140 implements MigrationInterface {
    name = 'SubscriptionExplicitColumns1718820192140'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "product_subscription" DROP CONSTRAINT "FK_f8f0360e203c93d18a2158d1d02"
        `);
        await queryRunner.query(`
            ALTER TABLE "product_subscription" DROP CONSTRAINT "FK_e7c584c0e8f44cec00977f2f102"
        `);
        await queryRunner.query(`
            ALTER TABLE "product_subscription"
            ALTER COLUMN "productId"
            SET NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE "product_subscription"
            ALTER COLUMN "organizationId"
            SET NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE "product_subscription"
            ADD CONSTRAINT "FK_f8f0360e203c93d18a2158d1d02" FOREIGN KEY ("productId") REFERENCES "product"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "product_subscription"
            ADD CONSTRAINT "FK_e7c584c0e8f44cec00977f2f102" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "product_subscription" DROP CONSTRAINT "FK_e7c584c0e8f44cec00977f2f102"
        `);
        await queryRunner.query(`
            ALTER TABLE "product_subscription" DROP CONSTRAINT "FK_f8f0360e203c93d18a2158d1d02"
        `);
        await queryRunner.query(`
            ALTER TABLE "product_subscription"
            ALTER COLUMN "organizationId" DROP NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE "product_subscription"
            ALTER COLUMN "productId" DROP NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE "product_subscription"
            ADD CONSTRAINT "FK_e7c584c0e8f44cec00977f2f102" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "product_subscription"
            ADD CONSTRAINT "FK_f8f0360e203c93d18a2158d1d02" FOREIGN KEY ("productId") REFERENCES "product"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    }

}
