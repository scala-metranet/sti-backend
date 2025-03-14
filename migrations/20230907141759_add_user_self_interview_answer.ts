import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
    return knex.schema.createTable('user_self_interview_answer', table => {
        table.string('id').notNullable().unique().primary();
        table.string('self_interview_question_id').references('id').inTable('self_interview_question');
        table.string('user_internship_id').references('id').inTable('user_internship');
        table.string('internship_id').references('id').inTable('internship');
        table.string('user_id').references('id').inTable('user');
        table.string('answer').nullable();
        table.timestamps(true, true);
        table.timestamp('deleted_at').nullable();
    });
  }
  
export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('user_self_interview_answer');
}
