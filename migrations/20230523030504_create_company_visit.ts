import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
    return knex.schema.createTable('company_visit', table => {
        table.string('id').notNullable().unique().primary();
        table.string('campus_id').nullable().references('id').inTable('campus');
        table.string('type').nullable();
        table.string('title').nullable();
        table.text('description').nullable();
        table.string('date').nullable();
        table.string('poster').nullable();
        table.string('start_time').nullable();
        table.string('end_time').nullable();
        table.string('key_access').nullable();
        table.timestamps(true, true);
        table.timestamp('deleted_at').nullable();
    });
  }
  
export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('company_visit');
}
