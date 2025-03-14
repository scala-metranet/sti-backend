import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
    return knex.schema.alterTable('login_logs', table => {
        table.string('impersonate_by').nullable().references('id').inTable('user');
        table.string('impersonate_reason').nullable();
    });
  }
  
export async function down(knex: Knex): Promise<void> {
  return knex.schema.alterTable('login_logs', table => {
    table.dropColumn('impersonate_by');
    table.dropColumn('impersonate_reason');
  });
}
