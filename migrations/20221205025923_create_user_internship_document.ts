import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('user_internship_document', table => {
    table.string('id').notNullable().unique().primary();
    table.string('user_internship_id').notNullable().references('id').inTable('user_internship').onDelete('cascade');
    table.string('key').notNullable();
    table.string('value').notNullable();
    table.timestamps(true, true);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('user_internship_document');
}
