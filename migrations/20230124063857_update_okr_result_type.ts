import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('okr_task', table => {
    table.string('attachment');
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.alterTable('okr_task', table => {
    table.dropColumn('attachment');
  });
}