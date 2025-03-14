import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('squad', table => {
    table.string('id').notNullable().unique().primary();
    table.string('name').notNullable();
    table.string('color').notNullable();
    table.string('internship_id').notNullable().references('id').inTable('internship').onDelete('cascade');
    table.timestamps(true, true);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('squad');
}
