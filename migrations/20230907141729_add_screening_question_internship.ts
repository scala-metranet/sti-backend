import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
    return knex.schema.createTable('screening_question', table => {
        table.string('id').notNullable().unique().primary();
        table.string('internship_id').references('id').inTable('internship');
        table.string('question').nullable();
        table.boolean('is_required').defaultTo(false);
        // table.integer('score').defaultTo(10);
        table.timestamps(true, true);
        table.timestamp('deleted_at').nullable();
    });
  }
  
export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('screening_question');
}
