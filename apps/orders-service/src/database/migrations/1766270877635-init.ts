import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1766270877635 implements MigrationInterface {
    name = 'Init1766270877635'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "orders" ADD "ticketId" character varying`);
        await queryRunner.query(`ALTER TABLE "orders" ADD CONSTRAINT "UQ_2ab3bb650a5c45f6ed47cf2b32a" UNIQUE ("ticketId")`);
        await queryRunner.query(`ALTER TABLE "orders" ADD CONSTRAINT "FK_2ab3bb650a5c45f6ed47cf2b32a" FOREIGN KEY ("ticketId") REFERENCES "tickets"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "orders" DROP CONSTRAINT "FK_2ab3bb650a5c45f6ed47cf2b32a"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP CONSTRAINT "UQ_2ab3bb650a5c45f6ed47cf2b32a"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "ticketId"`);
    }

}
