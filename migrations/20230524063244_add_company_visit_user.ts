import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('user', table => {
    table.string('company_visit_id').nullable().references('id').inTable('company_visit');
  });
}
  
export async function down(knex: Knex): Promise<void> {
  return knex.schema.alterTable('user', table => {
    table.dropColumn('company_visit_id');
  });
}
