import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('city', table => {
    table.string('id').notNullable().unique().primary();
    table.string('province_id').notNullable();
    table.string('name').notNullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('city');
}
