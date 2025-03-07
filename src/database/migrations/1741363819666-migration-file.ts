import { MigrationInterface, QueryRunner } from "typeorm";

export class MigrationFile1741363819666 implements MigrationInterface {
    name = 'MigrationFile1741363819666'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`file\` ADD \`filename\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`file\` ADD \`version\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`file\` ADD \`isCurrent\` tinyint NOT NULL DEFAULT 1`);
        await queryRunner.query(`ALTER TABLE \`file\` ADD \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)`);
        await queryRunner.query(`ALTER TABLE \`user\` DROP FOREIGN KEY \`FK_c28e52f758e7bbc53828db92194\``);
        await queryRunner.query(`ALTER TABLE \`role\` DROP PRIMARY KEY`);
        await queryRunner.query(`ALTER TABLE \`role\` DROP COLUMN \`id\``);
        await queryRunner.query(`ALTER TABLE \`role\` ADD \`id\` int NOT NULL PRIMARY KEY AUTO_INCREMENT`);
        await queryRunner.query(`ALTER TABLE \`role\` CHANGE \`name\` \`name\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`user\` ADD CONSTRAINT \`FK_c28e52f758e7bbc53828db92194\` FOREIGN KEY (\`roleId\`) REFERENCES \`role\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`user\` DROP FOREIGN KEY \`FK_c28e52f758e7bbc53828db92194\``);
        await queryRunner.query(`ALTER TABLE \`role\` CHANGE \`name\` \`name\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`role\` DROP COLUMN \`id\``);
        await queryRunner.query(`ALTER TABLE \`role\` ADD \`id\` int NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`role\` ADD PRIMARY KEY (\`id\`)`);
        await queryRunner.query(`ALTER TABLE \`user\` ADD CONSTRAINT \`FK_c28e52f758e7bbc53828db92194\` FOREIGN KEY (\`roleId\`) REFERENCES \`role\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`file\` DROP COLUMN \`createdAt\``);
        await queryRunner.query(`ALTER TABLE \`file\` DROP COLUMN \`isCurrent\``);
        await queryRunner.query(`ALTER TABLE \`file\` DROP COLUMN \`version\``);
        await queryRunner.query(`ALTER TABLE \`file\` DROP COLUMN \`filename\``);
    }

}
