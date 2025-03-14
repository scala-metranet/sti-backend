import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
    return knex.schema.createTable('scoring_master', table => {
        table.string('id').notNullable().unique().primary();
        table.string('name').nullable();
        table.string('description').nullable();
        table.date('start_date').nullable();
        table.date('end_date').nullable();
        table.string('company_id').nullable().references('id').inTable('company');
        table.string('internship_program_id').nullable().references('id').inTable('internship_program');
        table.string('role_id').nullable().references('id').inTable('role');
        table.timestamps(true, true);
        table.timestamp('deleted_at').nullable();
    });
  }
  
export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('scoring_master');
}
