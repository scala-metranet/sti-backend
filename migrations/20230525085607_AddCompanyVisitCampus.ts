import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
    return knex.schema.createTable('company_visit_campus', table => {
        table.string('id').notNullable().unique().primary();
        table.string('campus_id').nullable().references('id').inTable('campus');
        table.string('company_visit_id').nullable().references('id').inTable('company_visit');
        table.timestamps(true, true);
        table.timestamp('deleted_at').nullable();
    });
  }
  
export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('company_visit_campus');
}
