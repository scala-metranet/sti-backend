import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
    return knex.schema.createTable('leaderboard', table => {
        table.string('id').notNullable().unique().primary();
        table.string('user_internship_id').nullable().references('id').inTable('user_internship');
        table.float('okr_done').defaultTo(0);
        table.float('okr_total').defaultTo(0);
        table.float('okr_score').defaultTo(0);
        table.float('scoring_score').defaultTo(0);
        table.float('final_score').defaultTo(0);
        table.timestamps(true, true);
        table.timestamp('deleted_at').nullable();
    });
  }
  
export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('leaderboard');
}
