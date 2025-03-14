import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
    return knex.schema.createTable('graduation_event', table => {
        table.string('id').notNullable().unique().primary();
        table.string('company_id').nullable().references('id').inTable('company');
        table.string('batch_master_id').nullable().references('id').inTable('batch_master');
        table.date('period_start').nullable();
        table.date('period_end').nullable();
        table.string('type').nullable();
        table.string('title').nullable();
        table.string('date').nullable();
        table.string('start_hour').nullable();
        table.string('end_hour').nullable();
        table.string('location').nullable();
        table.string('poster').nullable();
        table.timestamps(true, true);
        table.timestamp('deleted_at').nullable();
    });
  }
  
export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('graduation_event');
}
