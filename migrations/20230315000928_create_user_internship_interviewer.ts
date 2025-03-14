import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
    return knex.schema.alterTable('user_internship', table => {
        table.string('schedule_id').nullable().references('id').inTable('schedule');
        table.string('schedule_session_id').nullable().references('id').inTable('schedule_session');
    });
  }
  
export async function down(knex: Knex): Promise<void> {
  return knex.schema.alterTable('user_internship', table => {
    table.dropColumn('schedule_id');
    table.dropColumn('schedule_session_id');
  });
}
