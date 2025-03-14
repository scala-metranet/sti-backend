import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('user', table => {
    table.string('nik').nullable();
    table.string('banner').nullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.alterTable('user', table => {
    table.dropColumn('nik');
    table.dropColumn('banner');
  });
}