import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('okr', table => {
    table.string('mentor_notes').nullable();
    table.string('mentor_lesson').nullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.alterTable('okr', table => {
    table.dropColumn('mentor_notes');
    table.dropColumn('mentor_lesson');
  });
}