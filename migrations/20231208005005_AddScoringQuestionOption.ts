import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
    return knex.schema.createTable('scoring_question_option', table => {
        table.string('id').notNullable().unique().primary();
        table.string('scoring_question_id').nullable().references('id').inTable('scoring_question');
        table.string('name').nullable();
        table.boolean('is_true').defaultTo(true);
        table.timestamps(true, true);
        table.timestamp('deleted_at').nullable();
    });
  }
  
export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('scoring_question_option');
}
