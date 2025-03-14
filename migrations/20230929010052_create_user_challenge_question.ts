import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
    return knex.schema.createTable('user_challenge_answer', table => {
        table.string('id').notNullable().unique().primary();
        table.string('challenge_question_id').references('id').inTable('challenge_question');
        table.string('user_internship_id').references('id').inTable('user_internship');
        table.string('user_id').references('id').inTable('user');
        table.string('format').nullable();
        table.string('file').nullable();
        table.text('notes').nullable();
        table.timestamps(true, true);
        table.timestamp('deleted_at').nullable();
    });
  }
  
export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('user_challenge_answer');
}
