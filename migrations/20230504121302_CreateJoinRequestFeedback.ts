import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
    return knex.schema.createTable('join_request_feedback', table => {
        table.string('id').notNullable().unique().primary();
        table.string('join_request_id').nullable().references('id').inTable('join_request');
        table.text('feedback').nullable();
        table.string('user_id').nullable();
        table.timestamps(true, true);
        table.timestamp('deleted_at').nullable();
    });
  }
  
export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('join_request_feedback');
}
