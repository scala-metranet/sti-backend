import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('token', table => {
    table.string('id').notNullable().unique().primary();
    table.string('user_id').notNullable().references('id').inTable('user').onDelete('cascade');
    table.string('access_key').notNullable().unique();
    table.string('refresh_key').notNullable().unique();
    table.timestamps(true, true);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('token');
}
