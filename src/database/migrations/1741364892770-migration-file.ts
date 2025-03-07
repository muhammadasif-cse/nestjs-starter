import { MigrationInterface, QueryRunner } from "typeorm";

export class MigrationFile1741364892770 implements MigrationInterface {
    name = 'MigrationFile1741364892770'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`file\` DROP COLUMN \`filename\``);
        await queryRunner.query(`ALTER TABLE \`file\` DROP COLUMN \`version\``);
        await queryRunner.query(`ALTER TABLE \`file\` DROP COLUMN \`isCurrent\``);
        await queryRunner.query(`ALTER TABLE \`file\` DROP COLUMN \`createdAt\``);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`file\` ADD \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)`);
        await queryRunner.query(`ALTER TABLE \`file\` ADD \`isCurrent\` tinyint NOT NULL DEFAULT '1'`);
        await queryRunner.query(`ALTER TABLE \`file\` ADD \`version\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`file\` ADD \`filename\` varchar(255) NULL`);
    }

}
