import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('internship_campus', table => {
    table.string('id').notNullable().unique().primary();
    table.string('internship_id').nullable().references('id').inTable('internship').onDelete('cascade');
    table.string('campus_id').nullable().references('id').inTable('campus').onDelete('cascade');
    table.string('quota').notNullable();
    table.timestamps(true, true);
    table.timestamp('deleted_at').nullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('internship_campus');
}
