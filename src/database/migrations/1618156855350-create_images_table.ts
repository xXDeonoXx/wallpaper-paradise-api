import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';

export class createImagesTable1618156855350 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    queryRunner.createTable(
      new Table({
        name: 'images',
        columns: [
          {
            name: 'id',
            type: 'int',
            generationStrategy: 'increment',
            isPrimary: true,
            isGenerated: true,
          },
          {
            name: 'title',
            type: 'varchar',
          },
          {
            name: 'url',
            type: 'varchar',
          },
          {
            name: 'uploader',
            type: 'int',
          },
        ],
        foreignKeys: [
          new TableForeignKey({
            name: 'image_user_fk',
            columnNames: ['uploader'],
            referencedColumnNames: ['id'],
            referencedTableName: 'users',
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE',
          }),
        ],
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    queryRunner.dropTable('images');
  }
}
