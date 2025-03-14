import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
    return knex.schema.createTable('batch_master', table => {
        table.string('id').notNullable().unique().primary();
        table.string('company_id').nullable().references('id').inTable('company');
        table.string('internship_program_id').nullable().references('id').inTable('internship_program');
        table.string('name').nullable();
        table.string('period_start').nullable();
        table.string('period_end').nullable();
        table.string('created_by').nullable().references('id').inTable('user');
        table.timestamps(true, true);
        table.timestamp('deleted_at').nullable();
    });
  }
  
export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('batch_master');
}
