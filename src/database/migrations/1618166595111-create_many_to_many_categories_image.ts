import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class createManyToManyCategoriesImage1618166595111
  implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    queryRunner.createTable(
      new Table({
        name: 'image_categories',
        columns: [
          {
            name: 'id',
            type: 'int',
            generationStrategy: 'increment',
            isPrimary: true,
            isGenerated: true,
          },
          {
            name: 'image_id',
            type: 'int',
          },
          {
            name: 'category_id',
            type: 'int',
          },
        ],
        foreignKeys: [
          {
            name: 'image_fk',
            columnNames: ['image_id'],
            referencedColumnNames: ['id'],
            referencedTableName: 'images',
          },
          {
            name: 'category_fk',
            columnNames: ['category_id'],
            referencedColumnNames: ['id'],
            referencedTableName: 'categories',
          },
        ],
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    queryRunner.dropTable('image_categories');
  }
}
