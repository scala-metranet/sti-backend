import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
    return knex.schema.createTable('meet_schedule', table => {
        table.string('id').notNullable().unique().primary();
        table.string('user_id').references('id').inTable('user');
        table.string('date').nullable();
        table.string('start_hour').nullable();
        table.string('end_hour').nullable();
        table.string('information').nullable();
        table.timestamps(true, true);
        table.timestamp('deleted_at').nullable();
    });
  }
  
export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('meet_schedule');
}
