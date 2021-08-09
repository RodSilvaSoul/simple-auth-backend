import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTestDatabase1628518078521 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createDatabase('auth_api_test');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropDatabase('auth_api_test');
  }
}
