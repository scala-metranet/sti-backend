import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('okr', table => {
    table.string('squad_id').notNullable().references('id').inTable('squad').onDelete('cascade');
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.alterTable('okr', table => {
    table.dropColumn('squad_id');
  });
}