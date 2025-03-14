import { Knex } from 'knex';
import { RoleName } from '../src/dtos/roles.dto';
export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('role', table => {
    table.string('id').notNullable().unique().primary();
    table.enu('name', Object.values(RoleName)).notNullable().unique();
    table.timestamps(true, true);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('role');
}
