import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('scoring', table => {
    table.string('id').notNullable().unique().primary();
    table.string('mentor_id').references('id').inTable('user');
    table.string('user_internship_id').references('id').inTable('user_internship');
    table.integer('score');
    table.timestamps(true, true);
    table.timestamp('deleted_at').nullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('scoring');
}
