import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('squad', table => {
    table.string('mentor_id').notNullable().references('id').inTable('user').onDelete('cascade');
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.alterTable('squad', table => {
    table.dropColumn('mentor_id');
  });
}