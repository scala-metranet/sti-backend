import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('internship', table => {
    table.string('position');
    table.string('competence');
    table.string('criteria');
    table.string('requirements');
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.alterTable('internship', table => {
    table.dropColumn('position');
    table.dropColumn('competence');
    table.dropColumn('criteria');
    table.dropColumn('requirements');
  });
}