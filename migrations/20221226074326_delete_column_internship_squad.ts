import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('squad', table => {
    table.dropColumn('internship_id');
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.alterTable('squad', table => {
    table.string('internship_id').notNullable().references('id').inTable('internship').onDelete('cascade');
  });
}