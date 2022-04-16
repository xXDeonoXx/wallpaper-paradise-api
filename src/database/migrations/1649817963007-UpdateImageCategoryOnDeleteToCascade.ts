import {MigrationInterface, QueryRunner} from "typeorm";

export class UpdateImageCategoryOnDeleteToCascade1649817963007 implements MigrationInterface {
    name = 'UpdateImageCategoryOnDeleteToCascade1649817963007'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`images\` DROP FOREIGN KEY \`image_user_fk\``);
        await queryRunner.query(`ALTER TABLE \`image_categories\` DROP FOREIGN KEY \`category_fk\``);
        await queryRunner.query(`ALTER TABLE \`image_categories\` DROP FOREIGN KEY \`image_fk\``);
        await queryRunner.query(`ALTER TABLE \`user_roles\` DROP FOREIGN KEY \`role_user_fk\``);
        await queryRunner.query(`ALTER TABLE \`user_roles\` DROP FOREIGN KEY \`user_role_fk\``);
        await queryRunner.query(`ALTER TABLE \`image_categories\` CHANGE \`id\` \`id\` int NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`image_categories\` DROP PRIMARY KEY`);
        await queryRunner.query(`ALTER TABLE \`image_categories\` DROP COLUMN \`id\``);
        await queryRunner.query(`ALTER TABLE \`user_roles\` CHANGE \`id\` \`id\` int NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`user_roles\` DROP PRIMARY KEY`);
        await queryRunner.query(`ALTER TABLE \`user_roles\` DROP COLUMN \`id\``);
        await queryRunner.query(`ALTER TABLE \`image_categories\` ADD PRIMARY KEY (\`image_id\`, \`category_id\`)`);
        await queryRunner.query(`ALTER TABLE \`user_roles\` ADD PRIMARY KEY (\`user_id\`, \`role_id\`)`);
        await queryRunner.query(`ALTER TABLE \`images\` CHANGE \`uploader_id\` \`uploader_id\` int NULL`);
        await queryRunner.query(`CREATE INDEX \`IDX_2d9a324ff5ed85a4347f10d3a5\` ON \`image_categories\` (\`image_id\`)`);
        await queryRunner.query(`CREATE INDEX \`IDX_8797c10fb35f56eb1351dcd383\` ON \`image_categories\` (\`category_id\`)`);
        await queryRunner.query(`CREATE INDEX \`IDX_87b8888186ca9769c960e92687\` ON \`user_roles\` (\`user_id\`)`);
        await queryRunner.query(`CREATE INDEX \`IDX_b23c65e50a758245a33ee35fda\` ON \`user_roles\` (\`role_id\`)`);
        await queryRunner.query(`ALTER TABLE \`images\` ADD CONSTRAINT \`FK_d403a53c490da4b1437275bf721\` FOREIGN KEY (\`uploader_id\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`image_categories\` ADD CONSTRAINT \`FK_2d9a324ff5ed85a4347f10d3a54\` FOREIGN KEY (\`image_id\`) REFERENCES \`images\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`image_categories\` ADD CONSTRAINT \`FK_8797c10fb35f56eb1351dcd3834\` FOREIGN KEY (\`category_id\`) REFERENCES \`categories\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`user_roles\` ADD CONSTRAINT \`FK_87b8888186ca9769c960e926870\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`user_roles\` ADD CONSTRAINT \`FK_b23c65e50a758245a33ee35fda1\` FOREIGN KEY (\`role_id\`) REFERENCES \`roles\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`user_roles\` DROP FOREIGN KEY \`FK_b23c65e50a758245a33ee35fda1\``);
        await queryRunner.query(`ALTER TABLE \`user_roles\` DROP FOREIGN KEY \`FK_87b8888186ca9769c960e926870\``);
        await queryRunner.query(`ALTER TABLE \`image_categories\` DROP FOREIGN KEY \`FK_8797c10fb35f56eb1351dcd3834\``);
        await queryRunner.query(`ALTER TABLE \`image_categories\` DROP FOREIGN KEY \`FK_2d9a324ff5ed85a4347f10d3a54\``);
        await queryRunner.query(`ALTER TABLE \`images\` DROP FOREIGN KEY \`FK_d403a53c490da4b1437275bf721\``);
        await queryRunner.query(`DROP INDEX \`IDX_b23c65e50a758245a33ee35fda\` ON \`user_roles\``);
        await queryRunner.query(`DROP INDEX \`IDX_87b8888186ca9769c960e92687\` ON \`user_roles\``);
        await queryRunner.query(`DROP INDEX \`IDX_8797c10fb35f56eb1351dcd383\` ON \`image_categories\``);
        await queryRunner.query(`DROP INDEX \`IDX_2d9a324ff5ed85a4347f10d3a5\` ON \`image_categories\``);
        await queryRunner.query(`ALTER TABLE \`images\` CHANGE \`uploader_id\` \`uploader_id\` int NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`user_roles\` DROP PRIMARY KEY`);
        await queryRunner.query(`ALTER TABLE \`image_categories\` DROP PRIMARY KEY`);
        await queryRunner.query(`ALTER TABLE \`user_roles\` ADD \`id\` int NOT NULL AUTO_INCREMENT`);
        await queryRunner.query(`ALTER TABLE \`user_roles\` ADD PRIMARY KEY (\`id\`)`);
        await queryRunner.query(`ALTER TABLE \`user_roles\` CHANGE \`id\` \`id\` int NOT NULL AUTO_INCREMENT`);
        await queryRunner.query(`ALTER TABLE \`image_categories\` ADD \`id\` int NOT NULL AUTO_INCREMENT`);
        await queryRunner.query(`ALTER TABLE \`image_categories\` ADD PRIMARY KEY (\`id\`)`);
        await queryRunner.query(`ALTER TABLE \`image_categories\` CHANGE \`id\` \`id\` int NOT NULL AUTO_INCREMENT`);
        await queryRunner.query(`ALTER TABLE \`user_roles\` ADD CONSTRAINT \`user_role_fk\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`user_roles\` ADD CONSTRAINT \`role_user_fk\` FOREIGN KEY (\`role_id\`) REFERENCES \`roles\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`image_categories\` ADD CONSTRAINT \`image_fk\` FOREIGN KEY (\`image_id\`) REFERENCES \`images\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`image_categories\` ADD CONSTRAINT \`category_fk\` FOREIGN KEY (\`category_id\`) REFERENCES \`categories\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`images\` ADD CONSTRAINT \`image_user_fk\` FOREIGN KEY (\`uploader_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
    }

}
