import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
    return knex.schema.createTable('sprint_activity', table => {
        table.string('id').notNullable().unique().primary();
        table.string('sprint_id').references('id').inTable('sprint');
        table.string('user_id').references('id').inTable('user');
        table.string('message').nullable();
        table.timestamps(true, true);
        table.timestamp('deleted_at').nullable();
    });
  }
  
export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('sprint_activity');
}
