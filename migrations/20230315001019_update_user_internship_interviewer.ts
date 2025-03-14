import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('user_internship_interviewer', table => {
    table.string('id').notNullable().unique().primary();
    table.string('user_internship_id').nullable().references('id').inTable('user_internship');
    table.string('reviewer_id').nullable().references('id').inTable('user');
    table.timestamps(true, true);
    table.timestamp('deleted_at').nullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('user_internship_interviewer');
}
