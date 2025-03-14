import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
    return knex.schema.createTable('screening_answer', table => {
        table.string('id').notNullable().unique().primary();
        table.string('screening_question_id').references('id').inTable('screening_question');
        table.string('internship_id').references('id').inTable('internship');
        table.string('answer').nullable();
        table.boolean('is_correct').defaultTo(false);
        table.integer('score').defaultTo(10);
        table.timestamps(true, true);
        table.timestamp('deleted_at').nullable();
    });
  }
  
export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('screening_answer');
}
