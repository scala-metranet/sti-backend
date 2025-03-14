import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('user', table => {
    table.string('squad_id').nullable().references('id').inTable('squad').onDelete('cascade');
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.alterTable('user', table => {
    table.dropColumn('squad_id');
  });
}
