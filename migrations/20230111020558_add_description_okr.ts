import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('okr', table => {
    table.string('description').nullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.alterTable('okr', table => {
    table.dropColumn('description');
  });
}