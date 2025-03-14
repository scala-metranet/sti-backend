import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('user', table => {
    table.string('campus_id').nullable().references('id').inTable('campus').onDelete('cascade');
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.alterTable('user', table => {
    table.dropColumn('campus_id');
  });
}