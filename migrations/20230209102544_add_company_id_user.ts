import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('user', table => {
    table.string('company_id').nullable().references('id').inTable('company').onDelete('cascade');
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.alterTable('user', table => {
    table.dropColumn('company_id');
  });
}